const Client = require('../models/client');
const Apply = require('../models/apply');

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

		createData["clientId"] = (createData.clientId).toLowerCase().replace(/\s/g, "");

		const findInfo = await Client.findOne({ clientId: createData.clientId }).exec();
		if (findInfo) {
			return sendErrorResponse(res, 400, "중복된 Client ID("+createData["clientId"]+")입니다.");
		}
		else
		{
			const findApply = await Apply.findOne({ clientId: createData.clientId }).exec();
			if (findApply) {
				return sendErrorResponse(res, 400, "이미 신청한 Client ID 입니다.");
			}
		}

		const findUser = await Apply.findOne({ email: createData.email }).exec();
		if (findUser) {
			return sendErrorResponse(res, 400, "이미 신청한 사용자 입니다.");
		}

		const apply = new Apply(createData);
		const savedDocument = await apply.save();

		const infoData = {
			...savedDocument._doc,
			date: savedDocument.date.toISOString().substring(0,10)
		};

		return sendSuccessResponse(res, infoData, "정상등록되었습니다.");
	} catch(error) {
		console.log(error);
		return sendErrorResponse(res, 500, "Apply 생성 중 오류가 발생했습니다.", error.message);
	}
};

exports.delete = async(req, res) => {
	try {
			const { _id } = req.body;
			
			if (!_id) {
				return sendErrorResponse(res, 400, "ID가 필요합니다.");
			}
	
			const doc = await Apply.findById(_id);
			if (!doc) {
				return sendErrorResponse(res, 404, "대상을 찾을 수 없습니다.");
			}
			
			await Apply.updateOne(
				{ _id },  // 조건
				{ $set: { used: "N" } }  // 특정 필드만 업데이트
			);
			
			return sendSuccessResponse(res, { info: doc }, "정보가 업데이트되었습니다.");
		} catch(error) {
			return sendErrorResponse(res, 500, "정보 수정 중 오류가 발생했습니다.", error.message);
		}
}; 

exports.list = async (req, res) => {
	try {
		const query = { used: { $ne: 'N' }};
		const applies = await Apply.find(query)
			.lean()
			.exec();

		const list = applies.map(doc => ({
			...doc,
			date: doc.date.toISOString().substring(0,10)
		}));

		return sendSuccessResponse(res, {list: list});
	} catch(error) {
		return sendErrorResponse(res, 500, "목록 조회 중 오류가 발생했습니다.", error.message);
	}
};


exports.info = async (req, res) => {
	try {
		const findInfo = await Apply.findOne({ _id: req.body._id }).exec();
		if (!findInfo) {
			return sendErrorResponse(res, 400, "없는 아이디입니다.");
		}
		return sendSuccessResponse(res, findInfo, "조회되었습니다.");

	} catch(error) {
		console.log(error);
		return {clientId:{}};
	}
};