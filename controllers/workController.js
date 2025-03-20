const Work = require('../models/work');
const { ObjectId } = require('mongoose').Types;

const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseHelper');

// 회사 데이터 유효성 검사
const validateCustomerData = (data) => {
	const errors = [];
	
	if (!data.name?.trim()) {
		errors.push('일지이름은 필수입니다.');
	}
	
	if (!data.company?.trim()) {
		errors.push('일지사는 필수입니다.');
	}

	if (!data.name?.trim()) {
		errors.push('제목은 필수입니다.');
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
		createData["company"] = ObjectId.createFromHexString(createData.company);
		createData["sheet"] = ObjectId.createFromHexString(createData.sheet);
		createData["customer"] = ObjectId.createFromHexString(createData.customer);

		const work = new Work(createData);
		const savedWork = await work.save();

		const workData = {
			...savedWork._doc,
			userId: savedWork.user,
			userName:createData.userName,
			companyName:createData.companyName,
			customerName:createData.customerName,
			sheetName:createData.sheetName,
			date: savedWork.date.toISOString().substring(0,10)
		};

		return sendSuccessResponse(res, { info: workData }, "일지 정보가 등록되었습니다.");
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
			sortBy = 'duedate',
			order = 'desc'
		} = req.query;

		// 검색 조건 구성
		const query = { used: { $ne: 'N' }, clientId: req.user.clientId };
		if(req.body.sheet)
		{
			query.sheet = ObjectId.createFromHexString(req.body.sheet);
		}
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
		const total = await Work.countDocuments(query);

		// 페이지네이션 적용하여 데이터 조회
		const works = await Work.find(query)
			.populate('company', 'name')
			.populate('user', 'name')
			.populate('sheet', 'name')
			.populate('customer', 'name')
			.sort(sort)
			// .skip((page - 1) * limit)
			// .limit(Number(limit))
			.lean()
			.exec();

		const workList = works.map(work => ({
			...work,
			companyName: work.company?.name || '',
			userName: work.user?.name || '',
			userId: work.user?._id || '',
			companyId: work.company?._id || '',
			sheetName: work.sheet?.name || '',
			customerName: work.customer?.name || '',
			sheetId: work.sheet?._id || '',
			customerId: work.customer?._id || '',
			duedate: work.duedate.toISOString().substring(0,10)
		}));

		return sendSuccessResponse(res, {
			list: workList,
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

		const work = await Work.findById(_id);
		if (!work) {
			return sendErrorResponse(res, 404, "일지 정보를 찾을 수 없습니다.");
		}

		// 변경된 필드만 업데이트
		const updatedFields = {};
		for (const [key, value] of Object.entries(updateData)) {
			if (work[key] !== value) {
				updatedFields[key] = value;
			}
		}
		updatedFields["clientId"] = req.user.clientId;
		updatedFields["user"] = ObjectId.createFromHexString(updatedFields.user);
		updatedFields["company"] = ObjectId.createFromHexString(updatedFields.company);
		

		if (Object.keys(updatedFields).length === 0) {
			return sendSuccessResponse(res, { info: work }, "변경된 내용이 없습니다.");
		}

		Object.assign(work, updatedFields);
		const savedWork = await work.save();
		const workData = {
			...savedWork._doc,
			userId: savedWork.user,
			companyId: savedWork.company,
			customerId: savedWork.customer,
			sheetId: savedWork.sheet,
			userName:updatedFields.userName,
			companyName:updatedFields.companyName,
			customerName:updatedFields.customerName,
			sheetName:updatedFields.sheetName,
			duedate: savedWork.duedate.toISOString().substring(0,10)
		};
		return sendSuccessResponse(res, { info: workData }, "일지 정보가 업데이트되었습니다.");
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

		const work = await Work.findById({_id, clientId: req.user.clientId});
		if (!work) {
			return sendErrorResponse(res, 404, "일지 정보를 찾을 수 없습니다.");
		}

		// 변경된 필드만 업데이트
		const updatedFields = {};
		for (const [key, value] of Object.entries(updateData)) {
			if (work[key] !== value) {
				updatedFields[key] = value;
			}
		}

		if (Object.keys(updatedFields).length === 0) {
			return sendSuccessResponse(res, { info: work }, "변경된 내용이 없습니다.");
		}

		Object.assign(work, updatedFields);
		const savedWork = await work.save();
		const workData = {
			...savedWork._doc,
			duedate: savedWork.duedate.toISOString().substring(0,10)
		};
		return sendSuccessResponse(res, { info: workData }, "일지 정보가 삭제 되었습니다.");
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

		const work = await Work.findById(id)
			.lean()
			.exec();

		if (!work) {
			return sendErrorResponse(res, 404, "일지 정보를 찾을 수 없습니다.");
		}

		const workData = {
			...work,
			date: work.date.toISOString().substring(0,10)
		};

		return sendSuccessResponse(res, { info: workData }, "일지 정보를 조회했습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "일지 정보 조회 중 오류가 발생했습니다.", error.message);
	}
};
