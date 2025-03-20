const Memo = require('../models/memo');
const { ObjectId } = require('mongoose').Types;

const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseHelper');

// 회사 데이터 유효성 검사
const validateCustomerData = (data) => {
	const errors = [];
	
	if (!data.memo?.trim()) {
		errors.push('내용은 필수입니다.');
	}
	
	return errors;
};

exports.create = async (req, res, next) => {
	
	try {
		const {...createData } = req.body;

		const validationErrors = validateCustomerData(createData);
		if (validationErrors.length > 0) {
			return sendErrorResponse(res, 400, '입력값이 유효하지 않습니다.', validationErrors);
		}

		delete createData._id;
		
		createData["clientId"] = req.user.clientId;
		createData["user"] = ObjectId.createFromHexString(createData.user);

		const memo = new Memo(createData);
		const savedMemo = await memo.save();

		const memoData = {
			...savedMemo._doc,
			userId: savedMemo.user,
			userName:createData.userName,
			date: savedMemo.date.toISOString().substring(0,10)
		};

		return sendSuccessResponse(res, { info: memoData }, "메모 정보가 등록되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "메모 정보 생성 중 오류가 발생했습니다.", error.message);
	}
};

exports.list = async (req, res) => {
	try {
		
		const {
			page = 1,
			limit = 10,
			search = '',
			sortBy = 'date',
			order = 'asc'
		} = req.query;

		// 검색 조건 구성
		const query = { used: { $ne: 'N' }, clientId: req.user.clientId, sheet: req.body.sheet };
	
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
		const total = await Memo.countDocuments(query);

		// 페이지네이션 적용하여 데이터 조회
		const memos = await Memo.find(query)
			.populate('user', 'name')
			.sort(sort)
			// .skip((page - 1) * limit)
			// .limit(Number(limit))
			.lean()
			.exec();

		const memoList = memos.map(memo => ({
			...memo,
			userName: memo.user?.name || '',
			userId: memo.user?._id || '',
			date: memo.date.toISOString().substring(0,10)
		}));

		return sendSuccessResponse(res, {
			list: memoList,
			pagination: {
				total,
				page: Number(page),
				limit: Number(limit),
				totalPages: Math.ceil(total / limit)
			}
		}, "메모 목록을 조회했습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "메모 목록 조회 중 오류가 발생했습니다.", error.message);
	}
};


exports.delete = async (req, res) => {
	try {
		const { _id } = req.body;
		
		await Memo.deleteOne({_id, clientId: req.user.clientId});
		
		return sendSuccessResponse(res, { info: null }, "메모 정보가 삭제 되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "메모 정보 삭제 중 오류가 발생했습니다.", error.message);
	}
};

