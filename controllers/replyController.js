const Reply = require('../models/reply');
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

		const reply = new Reply(createData);
		const savedReply = await reply.save();

		const replyData = {
			...savedReply._doc,
			userId: savedReply.user,
			userName:createData.userName,
			date: savedReply.date.toISOString().substring(0,10)
		};

		return sendSuccessResponse(res, { info: replyData }, "댓글 정보가 등록되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "댓글 정보 생성 중 오류가 발생했습니다.", error.message);
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
		const query = { clientId: req.user.clientId, boardId: req.body.boardId };
	
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
		const total = await Reply.countDocuments(query);

		// 페이지네이션 적용하여 데이터 조회
		const replies = await Reply.find(query)
			.populate('user', 'name')
			.sort(sort)
			// .skip((page - 1) * limit)
			// .limit(Number(limit))
			.lean()
			.exec();

		const replyList = replies.map(reply => ({
			...reply,
			userName: reply.user?.name || '',
			userId: reply.user?._id || '',
			date: reply.date.toISOString().substring(0,10)
		}));

		return sendSuccessResponse(res, {
			list: replyList,
			pagination: {
				total,
				page: Number(page),
				limit: Number(limit),
				totalPages: Math.ceil(total / limit)
			}
		}, "댓글 목록을 조회했습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "댓글 목록 조회 중 오류가 발생했습니다.", error.message);
	}
};


exports.delete = async (req, res) => {
	try {
		const { _id } = req.body;
		
		await Reply.deleteOne({_id, clientId: req.user.clientId});
		
		return sendSuccessResponse(res, { info: null }, "댓글 정보가 삭제 되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "댓글 정보 삭제 중 오류가 발생했습니다.", error.message);
	}
};

