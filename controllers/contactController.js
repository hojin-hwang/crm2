const Contact = require('../models/contact');
const { ObjectId } = require('mongoose').Types;

const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseHelper');
const sendEmail = require('../utils/sendMail');
// 회사 데이터 유효성 검사
const validateData = (data) => {
	const errors = [];
	
	if (!data.memo?.trim()) {
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

		delete createData._id;
		console.log(req.user);
		createData["clientId"] = (req.user && req.user.clientId)?(req.user.clientId): null;
		createData["user"] = (createData.user)? ObjectId.createFromHexString(createData.user) : null;

		const contact = new Contact(createData);
		const savedData = await contact.save();

		const infoData = {
			...savedData._doc,
			date: savedData.date.toISOString().substring(0,10)
		};

		return sendSuccessResponse(res, { info: infoData }, "문의 정보가 등록되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "문의 정보 생성 중 오류가 발생했습니다.", error.message);
	}
};

exports.update = async (req, res) => {
	try {
		const { _id, ...updateData } = req.body;

		if (!_id) {
			return sendErrorResponse(res, 400, "ID가 필요합니다");
		}

		const contact = await Contact.findById(_id);
		if (!contact) {
			return sendErrorResponse(res, 404, "문이 정보를 찾을 수 없습니다.");
		}

		// 변경된 필드만 업데이트
		const updatedFields = {};
		for (const [key, value] of Object.entries(updateData)) {
			if (contact[key] !== value) {
				updatedFields[key] = value;
			}
		}
		updatedFields["status"] = 'C';

		Object.assign(contact, updatedFields);
		const savedData = await contact.save();
		const responseData = {
			...savedData._doc,
		};

		//send email
		sendEmailContactUser(responseData)

		return sendSuccessResponse(res, { info: responseData }, "게시판 정보가 업데이트되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "게시판 정보 수정 중 오류가 발생했습니다.", error.message);
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
		const query = {  };
	
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
		const total = await Contact.countDocuments(query);

		// 페이지네이션 적용하여 데이터 조회
		const list = await Contact.find(query)
			.populate('user', 'name')
			.sort(sort)
			.lean()
			.exec();

		const _list = list.map(item => ({
			...item,
			userName: item.user?.name || '',
			userId: item.user?._id || '',
			date: item.date.toISOString().substring(0,10)
		}));

		return sendSuccessResponse(res, {
			list: _list,
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
		
		await Contact.deleteOne({_id});
		
		return sendSuccessResponse(res, { info: {_id} }, "문의 정보가 삭제 되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "문의 정보 삭제 중 오류가 발생했습니다.", error.message);
	}
};

exports.info = async (req, res) => {
	try {
		const { _id} = req.body;
		
		if (!_id) {
			return sendErrorResponse(res, 400, " ID가 필요합니다.");
		}

		const contact = await Contact.findById({_id})
			.populate('user', 'name')
			.lean()
			.exec();

		if (!contact) {
			return sendErrorResponse(res, 404, "문의사항 정보를 찾을 수 없습니다.");
		}

		const responseData = {
			...contact,
		};

		return sendSuccessResponse(res, { info: responseData }, "문의사항 정보를 조회했습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "문의사항 정보 조회 중 오류가 발생했습니다.", error.message);
	}
};

const sendEmailContactUser = async (info) => {
	const memo =  info.memo.replace(/\r\n|\n|\r/gm,"<br>");
	const reply =  info.reply.replace(/\r\n|\n|\r/gm,"<br>");
	const subject = `${info.name}님! 문의사항에 대한 답변입니다.`
	const html = 
		`<div style="max-width:100%;">
			<div style="border-radius: 10px;
			background-color: #fff;
			margin-bottom: 30px;
			border: 0;
			width:90%;
			margin:auto;
			border-radius: 15px;
			border: 1px solid #eee;
			margin-top: 24px; 
			">
				<div style="
				border-top-left-radius: 15px;
				border-top-right-radius: 15px;
				background: #1a2035 !important;
				color: white;
				padding: 12px 24px;
				">
					<span style="font-size: 14px; font-weight: bold;">SS CRM 문의사항 답변</span>
				</div>
				<div style="padding: 12px 24px; color: #212529bf !important;">
					<p>문의내용</p>
					<p>
						${memo}
					</p>
					<hr>
					<p>답변내용</p>
					<p style="padding: 12px 0;">
						${reply}<br>
					</p>
					<span>* 본 메일 주소는 보내기 전용 메일주소입니다.</span>
					<p style="text-align: right;">간단하면서 강력한 CRM - SS CRM </p>
				</div>
			</div>
		</div>
		
		`
	await sendEmail({
		to: info.email,
		subject: subject,
		html: html,
	});
}
