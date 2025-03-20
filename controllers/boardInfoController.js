const BoardInfo = require('../models/boardInfo');
const { ObjectId } = require('mongoose').Types;
const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseHelper');

// 회사 데이터 유효성 검사
const validateData = (data) => {
	const errors = [];
	
	// if (!data.name?.trim()) {
	// 	errors.push('게시판 이름은 필수입니다.');
	// }
	
	return errors;
};

exports.create = async (req, res, next) => {
	
	try {
		const {...createData } = req.body;

		const validationErrors = validateData(createData);
		if (validationErrors.length > 0) {
			return sendErrorResponse(res, 400, '입력값이 유효하지 않습니다.', validationErrors);
		}

		delete createData._id;

		createData["clientId"] = req.user.clientId;
		createData["user"] = [];

		const boardInfo = new BoardInfo(createData);
		const savedBoardInfo = await boardInfo.save();

		const boardInfoData = {
			...savedBoardInfo._doc,
		};

		return sendSuccessResponse(res, { info: boardInfoData }, "게시판 정보가 등록되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "게시판 정보 생성 중 오류가 발생했습니다.", error.message);
	}
};

exports.list = async (req, res) => {
	try {
		
		const {
			page = 1,
			limit = 10,
			search = '',
			sortBy = 'type',
			order = 'desc'
		} = req.query;

		// 검색 조건 구성
		const query = { used: { $ne: 'N' }, clientId: req.user.clientId };
		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ email: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } }
			];
		}
		// 정렬 조건
		const sort = { [sortBy]: order === 'desc' ? -1 : 1 };
		// 전체 데이터 수 조회
		const total = await BoardInfo.countDocuments(query);

		// 페이지네이션 적용하여 데이터 조회
		const boardInfos = await BoardInfo.find(query)
			.sort(sort)
			// .skip((page - 1) * limit)
			// .limit(Number(limit))
			.lean()
			.exec();

		const boardInfoList = boardInfos.map(boardInfo => ({
			...boardInfo,
			date: boardInfo.date.toISOString().substring(0,10)
		}));

		return sendSuccessResponse(res, {
			list: boardInfoList,
			pagination: {
				total,
				page: Number(page),
				limit: Number(limit),
				totalPages: Math.ceil(total / limit)
			}
		}, "게시판 목록을 조회했습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "게시판 목록 조회 중 오류가 발생했습니다.", error.message);
	}
};

exports.update = async (req, res) => {
	try {
		const { _id, ...updateData } = req.body;

		if (!_id) {
			return sendErrorResponse(res, 400, "게시판 ID가 필요합니다.");
		}

		// 데이터 유효성 검사
		const validationErrors = validateData(updateData);
		if (validationErrors.length > 0) {
			return sendErrorResponse(res, 400, '입력값이 유효하지 않습니다.', validationErrors);
		}

		const boardInfo = await BoardInfo.findById({_id, clientId: req.user.clientId});
		if (!boardInfo) {
			return sendErrorResponse(res, 404, "게시판 정보를 찾을 수 없습니다.");
		}

		// 변경된 필드만 업데이트
		const updatedFields = {};
		for (const [key, value] of Object.entries(updateData)) {
			if (boardInfo[key] !== value) {
				updatedFields[key] = value;
			}
		}
		updatedFields["clientId"] = req.user.clientId;

		// 사용자 정보인 경우만 처리
		if(updatedFields["user"])
		{
			const condition = (req.body.command === "ADD_USER") ? { $addToSet: { user: updatedFields["user"] } } : { $pull: { user: updatedFields["user"] } };
			const updateUser = await BoardInfo.findByIdAndUpdate(_id, condition, { new: true });
			return sendSuccessResponse(res, {info:updateUser}, "게시판 사용자 정보가 업데이트되었습니다.");
		}
		else
		{
			if (Object.keys(updatedFields).length === 0) {
				return sendSuccessResponse(res, { info: boardInfo }, "변경된 내용이 없습니다.");
			}

			Object.assign(boardInfo, updatedFields);
			const savedBoardInfo = await boardInfo.save();
			
			const boardInfoData = {
				...savedBoardInfo._doc,
			};
			return sendSuccessResponse(res, { info: boardInfoData }, "게시판 정보가 업데이트되었습니다.");

		}
	} catch(error) {
		console.log(error)
		return sendErrorResponse(res, 500, "게시판 정보 수정 중 오류가 발생했습니다.", error.message);
	}
};

exports.delete = async (req, res) => {
	try {
		const { _id, ...updateData } = req.body;

		if (!_id) {
			return sendErrorResponse(res, 400, "게시판 ID가 필요합니다.");
		}

		const boardInfo = await BoardInfo.findById({_id, clientId: req.user.clientId});
		if (!boardInfo) {
			return sendErrorResponse(res, 404, "게시판 정보를 찾을 수 없습니다.");
		}

		// 변경된 필드만 업데이트
		const updatedFields = {};
		for (const [key, value] of Object.entries(updateData)) {
			if (boardInfo[key] !== value) {
				updatedFields[key] = value;
			}
		}

		Object.assign(boardInfo, updatedFields);
		const savedBoardInfo = await boardInfo.save();
		
		const boardInfoData = {
			...savedBoardInfo._doc,
		};		

		return sendSuccessResponse(res, { info: boardInfoData }, "게시판 정보가 삭제되었습니다.");
	} catch(error) {
		console.log(error)
		return sendErrorResponse(res, 500, "게시판 정보 삭제 중 오류가 발생했습니다.", error.message);
	}
};

// 게시판 상세 정보 조회 추가
exports.get = async (req, res) => {
	try {
		const { id } = req.params;
		
		if (!id) {
			return sendErrorResponse(res, 400, "게시판 ID가 필요합니다.");
		}

		const boardInfo = await BoardInfo.findById(id)
			.lean()
			.exec();

		if (!boardInfo) {
			return sendErrorResponse(res, 404, "게시판 정보를 찾을 수 없습니다.");
		}

		const boardInfoData = {
			...boardInfo,
			date: boardInfo.date.toISOString().substring(0,10)
		};

		return sendSuccessResponse(res, { info: boardInfoData }, "게시판 정보를 조회했습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "게시판 정보 조회 중 오류가 발생했습니다.", error.message);
	}
};
