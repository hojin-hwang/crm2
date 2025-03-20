const Company = require('../models/company');
const { ObjectId } = require('mongoose').Types;
const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseHelper');

// 회사 데이터 유효성 검사
const validateCompanyData = (data) => {
	const errors = [];
	
	if (!data.name?.trim()) {
		errors.push('회사명은 필수입니다.');
	}
	
	if (data.email && !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
		errors.push('유효하지 않은 이메일 형식입니다.');
	}
	
	if (data.phone && !data.phone.match(/^[0-9-]+$/)) {
		errors.push('유효하지 않은 전화번호 형식입니다.');
	}
	
	return errors;
};

exports.create = async (req, res, next) => {
	
	try {
		const {...createData } = req.body;

		const validationErrors = validateCompanyData(createData);
		if (validationErrors.length > 0) {
			return sendErrorResponse(res, 400, '입력값이 유효하지 않습니다.', validationErrors);
		}

		delete createData._id;

		createData["clientId"] = req.user.clientId;
		createData["user"] = ObjectId.createFromHexString(createData.user);
		
		const company = new Company(createData);
		const savedCompany = await company.save();

		const companyData = {
			...savedCompany._doc,
			userId: company.user?._id || '',
			userName : createData.userName,
			date: savedCompany.date.toISOString().substring(0,10)
		};

		return sendSuccessResponse(res, { info: companyData }, "회사 정보가 등록되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "회사 정보 생성 중 오류가 발생했습니다.", error.message);
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
		const total = await Company.countDocuments(query);

		// 페이지네이션 적용하여 데이터 조회
		const companies = await Company.find(query)
			.sort(sort)
			.populate('user', 'name')
			// .skip((page - 1) * limit)
			// .limit(Number(limit))
			.lean()
			.exec();

		const companyList = companies.map(company => ({
			...company,
			userName: company.user?.name || '',
			userId: company.user?._id || '',
			date: company.date.toISOString().substring(0,10)
		}));

		return sendSuccessResponse(res, {
			list: companyList,
			pagination: {
				total,
				page: Number(page),
				limit: Number(limit),
				totalPages: Math.ceil(total / limit)
			}
		}, "회사 목록을 조회했습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "회사 목록 조회 중 오류가 발생했습니다.", error.message);
	}
};

exports.update = async (req, res) => {
	try {
		const { _id, ...updateData } = req.body;

		if (!_id) {
			return sendErrorResponse(res, 400, "회사 ID가 필요합니다.");
		}

		// 데이터 유효성 검사
		const validationErrors = validateCompanyData(updateData);
		if (validationErrors.length > 0) {
			return sendErrorResponse(res, 400, '입력값이 유효하지 않습니다.', validationErrors);
		}

		const company = await Company.findById({_id, clientId: req.user.clientId});
		if (!company) {
			return sendErrorResponse(res, 404, "회사 정보를 찾을 수 없습니다.");
		}

		// 변경된 필드만 업데이트
		const updatedFields = {};
		for (const [key, value] of Object.entries(updateData)) {
			if (company[key] !== value) {
				updatedFields[key] = value;
			}
		}
		updatedFields["clientId"] = req.user.clientId;
		updatedFields["user"] = ObjectId.createFromHexString(updatedFields.user);

		if (Object.keys(updatedFields).length === 0) {
			return sendSuccessResponse(res, { info: company }, "변경된 내용이 없습니다.");
		}

		Object.assign(company, updatedFields);
		const savedCompany = await company.save();
		
		const companyData = {
			...savedCompany._doc,
			userId: savedCompany.user,
			userName:updatedFields.userName,
		};


		return sendSuccessResponse(res, { info: companyData }, "회사 정보가 업데이트되었습니다.");
	} catch(error) {
		console.log(error)
		return sendErrorResponse(res, 500, "회사 정보 수정 중 오류가 발생했습니다.", error.message);
	}
};

exports.delete = async (req, res) => {
	try {
		const { _id, ...updateData } = req.body;

		if (!_id) {
			return sendErrorResponse(res, 400, "회사 ID가 필요합니다.");
		}

		const company = await Company.findById({_id, clientId: req.user.clientId});
		if (!company) {
			return sendErrorResponse(res, 404, "회사 정보를 찾을 수 없습니다.");
		}

		// 변경된 필드만 업데이트
		const updatedFields = {};
		for (const [key, value] of Object.entries(updateData)) {
			if (company[key] !== value) {
				updatedFields[key] = value;
			}
		}

		Object.assign(company, updatedFields);
		const savedCompany = await company.save();
		
		const companyData = {
			...savedCompany._doc,
		};

		return sendSuccessResponse(res, { info: companyData }, "회사 정보가 삭제되었습니다.");
	} catch(error) {
		console.log(error)
		return sendErrorResponse(res, 500, "회사 정보 삭제 중 오류가 발생했습니다.", error.message);
	}
};

// 회사 상세 정보 조회 추가
exports.get = async (req, res) => {
	try {
		const { id } = req.params;
		
		if (!id) {
			return sendErrorResponse(res, 400, "회사 ID가 필요합니다.");
		}

		const company = await Company.findById(id)
			.lean()
			.exec();

		if (!company) {
			return sendErrorResponse(res, 404, "회사 정보를 찾을 수 없습니다.");
		}

		const companyData = {
			...company,
			date: company.date.toISOString().substring(0,10)
		};

		return sendSuccessResponse(res, { info: companyData }, "회사 정보를 조회했습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "회사 정보 조회 중 오류가 발생했습니다.", error.message);
	}
};
