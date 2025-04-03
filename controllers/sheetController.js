const Sheet = require('../models/sheet');
const Client = require('../models/client');
const Work = require('../models/work');
const Memo = require('../models/memo');
const { ObjectId } = require('mongoose').Types;
const FileDelete = require('../utils/fileDelete');
const RecordLimitValidator = require('../utils/recordLimitValidator');

const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseHelper');

// 회사 데이터 유효성 검사
const validateCustomerData = (data) => {
	const errors = [];
	
	if (!data.customer?.trim()) {
		errors.push('고객 이름은 필수입니다.');
	}
	
	if (!data.company?.trim()) {
		errors.push('회사는 필수입니다.');
	}

	if (!data.name?.trim()) {
		errors.push('제목은 필수입니다.');
	}
	
	return errors;
};

exports.create = async (req, res, next) => {
	
	try {
		const {...createData } = req.body;

		const result = await RecordLimitValidator.validateCollectAmount(req, 'sheet');
		if(!result) return sendErrorResponse(res, 400, '용량을 초과했습니다.', '용량을 초과했습니다.')

		const validationErrors = validateCustomerData(createData);
		if (validationErrors.length > 0) {
			return sendErrorResponse(res, 400, '입력값이 유효하지 않습니다.', validationErrors);
		}
		//delete createData._id;
		createData["_id"] = ObjectId.createFromHexString(createData._id);
		createData["clientId"] = req.user.clientId;
		createData["user"] = ObjectId.createFromHexString(createData.user);
		createData["company"] = ObjectId.createFromHexString(createData.company);
		createData["customer"] = ObjectId.createFromHexString(createData.customer);
		createData["product"] = JSON.parse(createData.product);

		const sheet = new Sheet(createData);
		const savedSheet = await sheet.save();

		const sheetData = {
			...savedSheet._doc,
			userId: savedSheet.user,
			userName:createData.userName,
			companyName:createData.companyName,
			customerName:createData.customerName,
			date: savedSheet.date.toISOString().substring(0,10),
			duedate: savedSheet.duedate.toISOString().substring(0,10)
		};
		await Client.findOneAndUpdate({clientId:req.user.clientId}, { $inc: { "limit.sheet": 1 } })
		return sendSuccessResponse(res, { info: sheetData }, "일지 정보가 등록되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "일지 정보 생성 중 오류가 발생했습니다.", error.message);
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
		const total = await Sheet.countDocuments(query);

		// 페이지네이션 적용하여 데이터 조회
		const sheets = await Sheet.find(query)
			.populate('company', 'name')
			.populate('user', 'name')
			.populate('customer', 'name')
			.sort(sort)
			// .skip((page - 1) * limit)
			// .limit(Number(limit))
			.lean()
			.exec();

		const sheetList = sheets.map(sheet => ({
			...sheet,
			companyName: sheet.company?.name || '',
			userName: sheet.user?.name || '',
			userId: sheet.user?._id || '',
			companyId: sheet.company?._id || '',
			customerName: sheet.customer?.name || '',
			customerId: sheet.customer?._id || '',
			date: sheet.date.toISOString().substring(0,10),
			duedate: sheet.duedate.toISOString().substring(0,10)
		}));

		return sendSuccessResponse(res, {
			list: sheetList,
			pagination: {
				total,
				page: Number(page),
				limit: Number(limit),
				totalPages: Math.ceil(total / limit)
			}
		}, "일지 목록을 조회했습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "일지 목록 조회 중 오류가 발생했습니다.", error.message);
	}
};

exports.update = async (req, res) => {
	try {
		const { _id, ...updateData } = req.body;

		if (!_id) {
			return sendErrorResponse(res, 400, "일지 ID가 필요합니다.");
		}

		// 데이터 유효성 검사
		const validationErrors = validateCustomerData(updateData);
		if (validationErrors.length > 0) {
			return sendErrorResponse(res, 400, '입력값이 유효하지 않습니다.', validationErrors);
		}

		const sheet = await Sheet.findById(_id);
		if (!sheet) {
			return sendErrorResponse(res, 404, "일지 정보를 찾을 수 없습니다.");
		}

		// 변경된 필드만 업데이트
		const updatedFields = {};
		for (const [key, value] of Object.entries(updateData)) {
			if (sheet[key] !== value) {
				updatedFields[key] = value;
			}
		}
		updatedFields["clientId"] = req.user.clientId;
		updatedFields["user"] = ObjectId.createFromHexString(updatedFields.user);
		updatedFields["company"] = ObjectId.createFromHexString(updatedFields.company);
		updatedFields["product"] = JSON.parse(updatedFields.product);

		if (Object.keys(updatedFields).length === 0) {
			return sendSuccessResponse(res, { info: sheet }, "변경된 내용이 없습니다.");
		}

		Object.assign(sheet, updatedFields);
		const savedSheet = await sheet.save();
		const sheetData = {
			...savedSheet._doc,
			userId: savedSheet.user,
			companyId: savedSheet.company,
			userName:updatedFields.userName,
			companyName:updatedFields.companyName,
			customerName:updatedFields.customerName,
			customerId:updatedFields.customer,
			date: savedSheet.date.toISOString().substring(0,10),
			duedate: savedSheet.duedate.toISOString().substring(0,10)
		};
		return sendSuccessResponse(res, { info: sheetData }, "일지 정보가 업데이트되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "일지 정보 수정 중 오류가 발생했습니다.", error.message);
	}
};

exports.delete = async (req, res) => {
	try {
		const { _id, ...updateData } = req.body;

		if (!_id) {
			return sendErrorResponse(res, 400, "일지 ID가 필요합니다.");
		}

		//memo delete
		await Memo.deleteMany({sheet:_id, clientId: req.user.clientId});
		//work delete
		const works = await Work.find({sheet:_id, clientId: req.user.clientId}).exec();
		works.forEach(async work => {
			await FileDelete.removeFile(req, work._id);
		 })
		 
		await Work.deleteMany({sheet:_id, clientId: req.user.clientId});
		//sheet
		await Sheet.deleteOne({_id, clientId: req.user.clientId});
		
		await FileDelete.removeFile(req, _id);
		await Client.findOneAndUpdate({clientId:req.user.clientId}, { $inc: { "limit.sheet": -1 } }) 
		return sendSuccessResponse(res, { info: updateData }, "일지 정보가 삭제 되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "일지 정보 삭제 중 오류가 발생했습니다.", error.message);
	}
};

// 일지 상세 정보 조회 추가	
exports.get = async (req, res) => {
	try {
		const { id } = req.params;
		
		if (!id) {
			return sendErrorResponse(res, 400, "일지 ID가 필요합니다.");
		}

		const sheet = await Sheet.findById(id)
			.lean()
			.exec();

		if (!sheet) {
			return sendErrorResponse(res, 404, "일지 정보를 찾을 수 없습니다.");
		}

		const sheetData = {
			...sheet,
			date: sheet.date.toISOString().substring(0,10)
		};

		return sendSuccessResponse(res, { info: sheetData }, "일지 정보를 조회했습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "일지 정보 조회 중 오류가 발생했습니다.", error.message);
	}
};
