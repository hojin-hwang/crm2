const Client = require('../models/client');
const User = require('../models/user');
const Company = require('../models/company');
const Customer = require('../models/customer');
const Product = require('../models/product');
const Sheet = require('../models/sheet');	
const Work = require('../models/work');
const BoardInfo = require('../models/boardInfo');
const Board = require('../models/board');
const fs = require('fs');
const fileConfig = require('../config/fileConfig');
const generator = require("password-generator");

const sendEmail = require('../utils/sendMail');
const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseHelper');

//데이터 유효성 검사
const validateData = (data) => {
	const errors = [];	
	
	if (!data.clientId?.trim()) {
		errors.push('ID는 필수입니다.');
	}

	const protectClientId = ["client", "admin", "excel"];
	if(protectClientId.includes(data.clientId))
	{
		errors.push('사용할 수 없는 ID입니다.');
	}

	return errors;
};

exports.apply = async (req, res) => {
	try {
		const {...createData } = req.body;
		const validationErrors = validateData(createData);
		if (validationErrors.length > 0) {
			return sendErrorResponse(res, 400, validationErrors[0], validationErrors);
		}
		createData["authCode"] = generator(12, false);
		createData["clientId"] = (createData.clientId).toLowerCase();
		createData["config"] = (createData.config)? JSON.parse(createData.config) : {color:"white"};
		const findInfo = await Client.findOne({ clientId: createData.clientId }).exec();
		if (findInfo) {
			return sendErrorResponse(res, 400, "중복된 아이디입니다.");
		}

		const findUser = await Client.findOne({ email: createData.email }).exec();
		if (findUser) {
			return sendErrorResponse(res, 400, "이미 신청한 사용자 입니다.");
		}

		const client = new Client(createData);
		const savedClient = await client.save();

		const infoData = {
			...savedClient._doc,
			date: savedClient.date.toISOString().substring(0,10)
		};
		
		//send email
		sendEmailApplyUser(infoData)
			
		delete infoData.authCode;
		return sendSuccessResponse(res, infoData, "정상등록되었습니다.");
	} catch(error) {
		console.log(error);
		return sendErrorResponse(res, 500, "Client 신청중 오류가 발생했습니다.", error.message);
	}
};

exports.create = async (req, res) => {
	try {
		const { _id, ...updateData } = req.body;
		updateData.used = "Y";
		
		if (!_id) {
			return sendErrorResponse(res, 400, "ID가 필요합니다.");
		}

		const doc = await Client.findOne({_id, used:'N'}).exec();
		if (!doc) {
			return sendErrorResponse(res, 404, "대상을 찾을 수 없습니다.");
		}

		if(doc.authCode !== updateData.authCode) {
			return sendErrorResponse(res, 400, "인증코드가 일치하지 않습니다.");	
		}

		Object.assign(doc, updateData);
		const savedDoc = await doc.save();
		return sendSuccessResponse(res, { info: null }, "클라이언트가 생성되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "클라이언트가 생성 중 오류가 발생했습니다.", error.message);
	}
};

exports.addDoc = async(req, res) => {
	try {
		const {...createData } = req.body;
		if(createData.model === "User")
		{
			createData.password =  generator(12, false);
			createData.super = true;
		}

		const collection = getModel(createData)
		const savedDoc = await collection.save();

		const infoData = {
			...savedDoc._doc,
			date: savedDoc.date.toISOString().substring(0,10)
		};

		if(createData.model === "User") {
			
			if(createData.email)
			{
				sendEmailClientUser(createData)
				delete infoData.password;
			}
			
		}

		return sendSuccessResponse(res, {info :infoData}, "정상등록되었습니다.");
	}
	catch(error) {
		return sendErrorResponse(res, 500, "addDoc 생성 중 오류가 발생했습니다."+error.message, error.message);
	}
}; 

exports.sendMail = async(req, res) => {
	try{
		const {...mailInfo } = req.body;
		await sendEmail({
			to: mailInfo.to,
			subject: mailInfo.subject,
			html: mailInfo.content,
		});
		return sendSuccessResponse(res, {mailInfo}, "정상적으로 보내졌습니다.");
	}
	catch(e){
		return sendErrorResponse(res, 500, "Message발송 중 오류가 발생했습니다."+error.message, error.message);
	}
}

exports.delete = async(req, res) => {
	try {
		const { _id, ...deleteData } = req.body;
		const findInfo = await Client.findOne({ _id }).exec();
		if (findInfo) {
			await User.deleteMany({ clientId: deleteData.clientId});
			await Company.deleteMany({ clientId: deleteData.clientId});
			await Customer.deleteMany({ clientId: deleteData.clientId});
			await Product.deleteMany({ clientId: deleteData.clientId});
			await Sheet.deleteMany({ clientId: deleteData.clientId});
			await Work.deleteMany({ clientId: deleteData.clientId});
			await Board.deleteMany({ clientId: deleteData.clientId});
			await BoardInfo.deleteMany({ clientId: deleteData.clientId});
			await Client.deleteOne({ _id });
			const uploadDir = fileConfig.upload.destination + `/${deleteData.clientId}`;
			if (fs.existsSync(uploadDir)) {
				fs.rmdirSync(uploadDir, { recursive: true });
			}

		}
		else
		{
			return sendErrorResponse(res, 400, "해당 크라이언트가 없습니다.");
		}
		return sendSuccessResponse(res, {info :findInfo}, "정상 삭제 되었습니다.");
	}
	catch(error) {
		return sendErrorResponse(res, 500, "삭제 중 오류가 발생했습니다."+error.message, error.message);
	}
}; 

exports.cancle = async(req, res) => {
	try {
		const { _id, ...deleteData } = req.body;

		const findInfo = await Client.findOne({_id, used:'N', authCode:deleteData.authCode}).exec();
		if (findInfo) {
			await Client.deleteOne({ _id });
		}
		else
		{
			return sendErrorResponse(res, 400, "해당 크라이언트가 없습니다.");
		}
		return sendSuccessResponse(res, {info :findInfo}, "정상 삭제 되었습니다.");
	}
	catch(error) {
		return sendErrorResponse(res, 500, "삭제 중 오류가 발생했습니다."+error.message, error.message);
	}
}; 

const getModel = (data) => {
	switch(data.model) {
		case "User":
			return new User(data);
		case "Company":
			return new Company(data);
		case "Customer":
			return new Customer(data);
		case "Product":
			return new Product(data);
		case "Sheet":
			return new Sheet(data);
		case "Work":
			return new Work(data);
		case "Board":
			return new Board(data);
		case "BoardInfo":
			return new BoardInfo(data);
		default:
			return new User(data);
	}
}

exports.list = async (req, res) => {
	try {
		const clients = await Client.find({ used: { $ne: 'N' }, clientId: { $ne: 'client' } })
			.lean()
			.exec();

		const list = clients.map(client => ({
			...client,
			date: client.date.toISOString().substring(0,10)
		}));

		return sendSuccessResponse(res, {list: list});
	} catch(error) {
		return sendErrorResponse(res, 500, "사용자 목록 조회 중 오류가 발생했습니다.", error.message);
	}
};

exports.applylist = async (req, res) => {
	try {
		const clients = await Client.find({ used: 'N', clientId: { $ne: 'client' } })
			.lean()
			.exec();

		const list = clients.map(client => ({
			...client,
			date: client.date.toISOString().substring(0,10)
		}));

		return sendSuccessResponse(res, {list: list});
	} catch(error) {
		return sendErrorResponse(res, 500, "사용자 목록 조회 중 오류가 발생했습니다.", error.message);
	}
}

exports.update = async (req, res) => {
	try {
		const { _id, ...updateData } = req.body;
		
		if (!_id) {
			return sendErrorResponse(res, 400, "ID가 필요합니다.");
		}

		const doc = await Client.findById(_id);
		if (!doc) {
			return sendErrorResponse(res, 404, "대상을 찾을 수 없습니다.");
		}

		Object.assign(doc, updateData);
		const savedDoc = await doc.save();
		
		return sendSuccessResponse(res, { info: savedDoc }, "정보가 업데이트되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "정보 수정 중 오류가 발생했습니다.", error.message);
	}
};

exports.info = async (req, res) => {
	try {
		const clientId = (req.params.clientId)? req.params.clientId : req.body.clientId
		const findInfo = await Client.findOne({ clientId }).exec();
		if (!findInfo) {
			return sendErrorResponse(res, 400, "없는 클라이언트입니다.");
		}
		return sendSuccessResponse(res, findInfo, "조회되었습니다.");

	} catch(error) {
		console.log(error);
		return {clientId:{}};
	}
};

const sendEmailApplyUser = async (info) => {
	const subject = `${info.name}님! SS CRM 신청접수가 정상처리되었습니다.`
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
					<span style="font-size: 14px; font-weight: bold;">SS CRM 신청접수 완료</span>
				</div>
				<div style="padding: 12px 24px; color: #212529bf !important;">
					<p>
						SS CRM 서비스 신청이 접수되었습니다. 아래 URL 주소로 서비스 신청을 완료해주세요.
					</p>
					<p style="padding: 12px 0;">
						<a href="https://crm.todayground.com/client/client-apply/${info.clientId}/${info.authCode}" target="_blank">SS CRM 서비스 선청 완료 진행</a>
					</p>
					<span>*2주 내에 신청을 완료하지 않으면 서비스 신청이 취소됩니다.</span>
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

const sendEmailClientUser = async (info) => {
	const subject = `${info.name}님! SS CRM 신청이 정상처리되었습니다.`
	const html = 
	`
	<div style="max-width:100%;">
		<div style="border-radius: 10px;
		background-color: #fff;
		border: 0;
		width:90%;
		margin:auto;
		border-radius: 15px;
		border: 1px solid #eee;
		margin-bottom: 36px;
		margin-top: 36px; 
		">
			<div style="
			border-top-left-radius: 15px;
			border-top-right-radius: 15px;
			background: #1a2035 !important;
			color: white;
			padding: 12px 24px;
			">
				<span style="font-size: 14px; font-weight: bold;">SS CRM 가입완료</span>
			</div>
			<div style="padding: 12px 24px; color: #212529bf !important; font-size:14px;">
				<p>
					SS CRM 서비스 신청이 수락되었습니다. 아래 URL 주소로 서비스를 이용하실 수 있습니다.
				</p>
				<ul>
					<li> 관리자 아이디 : ${info.username}</li>
					<li> 관리자 비밀번호 : ${info.password}</li>
				</ul>
				<a href="https://crm.todayground.com/crm/${info.clientId}" target="_blank">https://crm.todayground.com/crm/${info.clientId}</a>
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