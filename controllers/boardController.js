const Board = require('../models/board');
const { ObjectId } = require('mongoose').Types;

const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseHelper');

// 회사 데이터 유효성 검사
const validateData = (data) => {
	const errors = [];	
	
	if (!data.title?.trim()) {
		errors.push('내용은 필수입니다.');
	}

	return errors;
};

exports.create = async (req, res, next) => {
	
	try {
		const {...createData } = req.body;

		const validationErrors = validateData(createData);
		if (validationErrors.length > 0) {
			return sendErrorResponse(res, 400, '입력값이 유효하지 않습니다.', validationErrors);
		}

		//delete createData._id;
		createData["_id"] = ObjectId.createFromHexString(createData._id);
		createData["clientId"] = req.user.clientId;
		createData["user"] = ObjectId.createFromHexString(createData.user);
		createData["company"] = (createData.company)? ObjectId.createFromHexString(createData.company) : null;
		createData["customer"] = (createData.customer)? ObjectId.createFromHexString(createData.customer) : null;
		createData["product"] = (createData.product)? JSON.parse(createData.product) : [];

		const board = new Board(createData);
		const savedData = await board.save();

		const responseData = {
			...savedData._doc,
			userId: savedData.user,
			userName:createData.userName,
			companyName:createData.companyName,
			customerName:createData.customerName,
			date: savedData.date.toISOString().substring(0,10),
			duedate: savedData.duedate.toISOString().substring(0,10)
		};

		return sendSuccessResponse(res, { info: responseData }, "게시판 정보가 등록되었습니다.");
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
			sortBy = 'date',
			order = 'desc'
		} = req.query;

		// 검색 조건 구성
		const query = { used: { $ne: 'N' }, clientId: req.user.clientId, boardId: req.body.boardId };
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
		const total = await Board.countDocuments(query);

		// 페이지네이션 적용하여 데이터 조회
		const findList = await Board.find(query)
			.populate('company', 'name')
			.populate('user', 'name')
			.populate('customer', 'name')
			.sort(sort)
			// .skip((page - 1) * limit)
			// .limit(Number(limit))
			.lean()
			.exec();

		const responseData = findList.map(board => ({
			...board,
			companyName: board.company?.name || '',
			userName: board.user?.name || '',
			userId: board.user?._id || '',
			companyId: board.company?._id || '',
			customerName: board.customer?.name || '',
			customerId: board.customer?._id || '',
			duedate: board.duedate.toISOString().substring(0,10),
		}));

		return sendSuccessResponse(res, {
			list: responseData,
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
			return sendErrorResponse(res, 400, "게시판 ID가 필요합니다");
		}

		// 데이터 유효성 검사
		const validationErrors = validateData(updateData);
		if (validationErrors.length > 0) {
			return sendErrorResponse(res, 400, '입력값이 유효하지 않습니다.', validationErrors);
		}

		const board = await Board.findById(_id);
		if (!board) {
			return sendErrorResponse(res, 404, "게시판 정보를 찾을 수 없습니다.");
		}

		// 변경된 필드만 업데이트
		const updatedFields = {};
		for (const [key, value] of Object.entries(updateData)) {
			if (board[key] !== value) {
				updatedFields[key] = value;
			}
		}
		updatedFields["clientId"] = req.user.clientId;
		updatedFields["user"] = ObjectId.createFromHexString(updatedFields.user);
		updatedFields["company"] = (updatedFields.company)? ObjectId.createFromHexString(updatedFields.company) : null;
		updatedFields["customer"] = (updatedFields.customer)? ObjectId.createFromHexString(updatedFields.customer) : null;
		updatedFields["product"] = (updatedFields.product)? JSON.parse(updatedFields.product) : [];

		if(updatedFields["read"]) updatedFields["read"] = board.read.push(updatedFields["read"])

		if (Object.keys(updatedFields).length === 0) {
			return sendSuccessResponse(res, { info: board }, "변경된 내용이 없습니다.");
		}

		Object.assign(board, updatedFields);
		const savedData = await board.save();
		const responseData = {
			...savedData._doc,
			userId: savedData.user,
			companyId: savedData.company,
			userName:updatedFields.userName,
			companyName:updatedFields.companyName,
			customerName:updatedFields.customerName,
			customerId:updatedFields.customer,
			duedate: savedData.duedate.toISOString().substring(0,10),
		};
		return sendSuccessResponse(res, { info: responseData }, "게시판 정보가 업데이트되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "게시판 정보 수정 중 오류가 발생했습니다.", error.message);
	}
};

exports.updateRead = async (req, res) => {
	try {
		const { _id, ...updateData } = req.body;

		if (!_id) {
			return sendErrorResponse(res, 400, "게시판 ID가 필요합니다");
		}

		const board = await Board.findById(_id);
		if (!board) {
			return sendErrorResponse(res, 404, "게시판 정보를 찾을 수 없습니다.");
		}
		

		const savedData =  await Board.findByIdAndUpdate(_id, {
			$addToSet: { read : updateData["read"] }
		}, { new: true });

		const responseData = {
			...savedData._doc,
		};

		return sendSuccessResponse(res, { info: responseData }, "읽기 정보가 업데이트되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "게시판 정보 수정 중 오류가 발생했습니다.", error.message);
	}
};

exports.delete = async (req, res) => {
	try {
		const { _id , boardId} = req.body;
		
		await Board.deleteOne({_id, clientId: req.user.clientId, boardId});
		
		return sendSuccessResponse(res, { info: null }, "게시판 정보가 삭제 되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "게시판 정보 삭제 중 오류가 발생했습니다.", error.message);
	}
};

// 게시판 상세 정보 조회 추가	
exports.get = async (req, res) => {
	try {
		const { _id} = req.body;
		
		if (!_id) {
			return sendErrorResponse(res, 400, "게시판 ID가 필요합니다.");
		}

		const board = await Board.findById({_id, clientId: req.user.clientId,})
			.populate('company', 'name')
			.populate('customer', 'name')
			.populate('user', 'name')
			.lean()
			.exec();

		if (!board) {
			return sendErrorResponse(res, 404, "게시판 정보를 찾을 수 없습니다.");
		}

		const responseData = {
			...board,
			companyName: board.company?.name || '',
			userName: board.user?.name || '',
			userId: board.user?._id || '',
			companyId: board.company?._id || '',
			customerName: board.customer?.name || '',
			customerId: board.customer?._id || '',
			duedate: board.duedate.toISOString().substring(0,10),
		};

		return sendSuccessResponse(res, { info: responseData }, "게시판 정보를 조회했습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "게시판 정보 조회 중 오류가 발생했습니다.", error.message);
	}
};
