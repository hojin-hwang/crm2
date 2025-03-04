const Message = require('../models/message');
const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseHelper');

exports.stream = async (req, res) => {
	
	res.writeHead(200, {
    "Connection": "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  })
	
	// const messageEventEmitter = Message.watch([
  //   { $match: { operationType: 'insert' } }
  // ])

	const messageEventEmitter = Message.watch();
	messageEventEmitter.on('change', change => {
		res.write('event: msg\n')
    res.write(`data: ${JSON.stringify(change.fullDocument)}\n\n`)
	})
}


exports.create = async (req, res, next) => {
	
	try {

		delete req.body._id;
		req.body.to = req.body.to.split(',');
		console.log(req.body);
		const message = new Message(req.body);
		const savedMessage = await message.save();

		const messageData = {
			...savedMessage._doc,
			date: savedMessage.date.toISOString().substring(0,10)
		};

		return sendSuccessResponse(res, { info: messageData }, "메시지가 등록되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "메시지 생성 중 오류가 발생했습니다.", error.message);
	}
};

exports.list = async (req, res) => {
	try {
		console.log(req.user);
		
		const {
			page = 1,
			limit = 10,
			search = '',
			sortBy = 'date',
			order = 'desc'
		} = req.query;

		// 검색 조건 구성
		const query = { used: { $ne: 'N' } };
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
		const total = await Message.countDocuments(query);

		// 페이지네이션 적용하여 데이터 조회
		const messages = await Message.find(query)
			.sort(sort)
			// .skip((page - 1) * limit)
			// .limit(Number(limit))
			.lean()
			.exec();

		const messageList = messages.map(message => ({
			...message,
			date: message.date.toISOString().substring(0,10)
		}));

		return sendSuccessResponse(res, {
			list: messageList,
			pagination: {
				total,
				page: Number(page),
				limit: Number(limit),
				totalPages: Math.ceil(total / limit)
			}
		}, "메시지 목록을 조회했습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "메시지 목록 조회 중 오류가 발생했습니다.", error.message);
	}
};

exports.update = async (req, res) => {
	try {
		const { _id, ...updateData } = req.body;

		if (!_id) {
			return sendErrorResponse(res, 400, "메시지 ID가 필요합니다.");
		}

		const message = await Message.findById(_id);
		if (!message) {
			return sendErrorResponse(res, 404, "메시지 정보를 찾을 수 없습니다.");
		}

		// 변경된 필드만 업데이트
		const updatedFields = {};
		for (const [key, value] of Object.entries(updateData)) {
			if (message[key] !== value) {
				updatedFields[key] = value;
			}
		}

		if (Object.keys(updatedFields).length === 0) {
			return sendSuccessResponse(res, { info: message }, "변경된 내용이 없습니다.");
		}

		Object.assign(message, updatedFields);
		const savedMessage = await message.save();
		
		return sendSuccessResponse(res, { info: savedMessage }, "메시지 정보가 업데이트되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "메시지 정보 수정 중 오류가 발생했습니다.", error.message);
	}
};

// 메시지 상세 정보 조회 추가
exports.getMessage = async (req, res) => {
	try {
		const { id } = req.params;
		
		if (!id) {
			return sendErrorResponse(res, 400, "메시지 ID가 필요합니다.");
		}

		const message = await Message.findById(id)
			.lean()
			.exec();

		if (!message) {
			return sendErrorResponse(res, 404, "메시지 정보를 찾을 수 없습니다.");
		}

		const messageData = {
			...message,
			date: message.date.toISOString().substring(0,10)
		};

		return sendSuccessResponse(res, { info: messageData }, "메시지 정보를 조회했습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "메시지 정보 조회 중 오류가 발생했습니다.", error.message);
	}
};
