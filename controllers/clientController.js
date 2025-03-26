const Client = require('../models/client');
const User = require('../models/user');
const Company = require('../models/company');
const Customer = require('../models/customer');
const Product = require('../models/product');
const Sheet = require('../models/sheet');	
const Work = require('../models/work');
const BoardInfo = require('../models/boardInfo');
const Board = require('../models/board');
const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseHelper');

//데이터 유효성 검사
const validateData = (data) => {
	const errors = [];	
	
	if (!data.clientId?.trim()) {
		errors.push('ID는 필수입니다.');
	}

	return errors;
};

exports.create = async (req, res) => {
	try {
		const {...createData } = req.body;
		const validationErrors = validateData(createData);
		if (validationErrors.length > 0) {
			return sendErrorResponse(res, 400, '입력값이 유효하지 않습니다.', validationErrors);
		}

		createData["clientId"] = (createData.clientId).toLowerCase();
		createData["config"] = (createData.config)? JSON.parse(createData.config) : {color:"white"};

		const findInfo = await Client.findOne({ clientId: createData.clientId }).exec();
		if (findInfo) {
			return sendErrorResponse(res, 400, "중복된 아이디입니다.");
		}
		const client = new Client(createData);
		const savedClient = await client.save();

		const infoData = {
			...savedClient._doc,
			date: savedClient.date.toISOString().substring(0,10)
		};

		return sendSuccessResponse(res, infoData, "정상등록되었습니다.");
	} catch(error) {
		console.log(error);
		return sendErrorResponse(res, 500, "Client 생성 중 오류가 발생했습니다.", error.message);
	}
};

exports.addDoc = async(req, res) => {
	try {
		const {...createData } = req.body;
		const collection = getModel(createData)
		const savedDoc = await collection.save();

		const infoData = {
			...savedDoc._doc,
			date: savedDoc.date.toISOString().substring(0,10)
		};

		if(createData.model === "User") delete infoData.password;

		return sendSuccessResponse(res, {info :infoData}, "정상등록되었습니다.");
	}
	catch(error) {
		return sendErrorResponse(res, 500, "addDoc 생성 중 오류가 발생했습니다."+error.message, error.message);
	}
}; 

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
		const clients = await Client.find({ used: { $ne: 'N' } })
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
		const findInfo = await Client.findOne({ clientId: req.body.clientId }).exec();
		if (!findInfo) {
			return sendErrorResponse(res, 400, "없는 아이디입니다.");
		}
		return sendSuccessResponse(res, findInfo, "조회되었습니다.");

	} catch(error) {
		console.log(error);
		return {clientId:{}};
	}
};

exports.get = async (req, res) => {
	try {
		return {clientId:req.params.clientId};
	} catch(error) {
		console.log(error);
		return {clientId:{}};
	}
};