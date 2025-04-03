const Product = require('../models/product');
const { ObjectId } = require('mongoose').Types;
const RecordLimitValidator = require('../utils/recordLimitValidator');
const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseHelper');

// 제품 데이터 유효성 검사
const validateCompanyData = (data) => {
	const errors = [];
	
	if (!data.name?.trim()) {
		errors.push('제품명은 필수입니다.');
	}
	
	return errors;
};

exports.create = async (req, res, next) => {
	
	try {
		const {...createData } = req.body;

		const result = await RecordLimitValidator.validateCollectAmount(req, 'product');
		if(!result) return sendErrorResponse(res, 400, '용량을 초과했습니다.', '용량을 초과했습니다.')

		const validationErrors = validateCompanyData(createData);
		if (validationErrors.length > 0) {
			return sendErrorResponse(res, 400, '입력값이 유효하지 않습니다.', validationErrors);
		}

		delete createData._id;

		createData["clientId"] = req.user.clientId;
		
		const product = new Product(createData);
		const savedProduct = await product.save();

		const productData = {
			...savedProduct._doc,
			date: savedProduct.date.toISOString().substring(0,10)
		};

		return sendSuccessResponse(res, { info: productData }, "제품 정보가 등록되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "제품 정보 생성 중 오류가 발생했습니다.", error.message);
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
		if (req.body.code) {
			query.code = req.body.code;
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
		const total = await Product.countDocuments(query);

		// 페이지네이션 적용하여 데이터 조회
		const products = await Product.find(query)
			.sort(sort)
			// .skip((page - 1) * limit)
			// .limit(Number(limit))
			.lean()
			.exec();

		const productList = products.map(product => ({
			...product,
			date: product.date.toISOString().substring(0,10)
		}));

		return sendSuccessResponse(res, {
			list: productList,
			pagination: {
				total,
				page: Number(page),
				limit: Number(limit),
				totalPages: Math.ceil(total / limit)
			}
		}, "제품 목록을 조회했습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "제품 목록 조회 중 오류가 발생했습니다.", error.message);
	}
};

exports.update = async (req, res) => {
	try {
		const { _id, ...updateData } = req.body;

		if (!_id) {
			return sendErrorResponse(res, 400, "제품 ID가 필요합니다.");
		}

		// 데이터 유효성 검사
		const validationErrors = validateCompanyData(updateData);
		if (validationErrors.length > 0) {
			return sendErrorResponse(res, 400, '입력값이 유효하지 않습니다.', validationErrors);
		}

		const product = await Product.findById({_id, clientId: req.user.clientId});
		if (!product) {
			return sendErrorResponse(res, 404, "제품 정보를 찾을 수 없습니다.");
		}

		// 변경된 필드만 업데이트
		const updatedFields = {};
		for (const [key, value] of Object.entries(updateData)) {
			if (product[key] !== value) {
				updatedFields[key] = value;
			}
		}
		updatedFields["clientId"] = req.user.clientId;

		if (Object.keys(updatedFields).length === 0) {
			return sendSuccessResponse(res, { info: product }, "변경된 내용이 없습니다.");
		}

		Object.assign(product, updatedFields);
		const savedProduct = await product.save();
		
		const productData = {
			...savedProduct._doc,
		};

		return sendSuccessResponse(res, { info: productData }, "제품 정보가 업데이트되었습니다.");
	} catch(error) {
		console.log(error)
		return sendErrorResponse(res, 500, "제품 정보 수정 중 오류가 발생했습니다.", error.message);
	}
};

exports.delete = async (req, res) => {
	try {
		const { _id, ...updateData } = req.body;

		if (!_id) {
			return sendErrorResponse(res, 400, "제품 ID가 필요합니다.");
		}

		const product = await Product.findById({_id, clientId: req.user.clientId});
		if (!product) {
			return sendErrorResponse(res, 404, "제품 정보를 찾을 수 없습니다.");
		}

		// 변경된 필드만 업데이트
		const updatedFields = {};
		for (const [key, value] of Object.entries(updateData)) {
			if (product[key] !== value) {
				updatedFields[key] = value;
			}
		}

		Object.assign(product, updatedFields);
		const savedProduct = await product.save();
		
		const productData = {
			...savedProduct._doc,
		};

		return sendSuccessResponse(res, { info: productData }, "제품 정보가 삭제되었습니다.");
	} catch(error) {
		console.log(error)
		return sendErrorResponse(res, 500, "제품 정보 삭제 중 오류가 발생했습니다.", error.message);
	}
};



// 제품 상세 정보 조회 추가
exports.get = async (req, res) => {
	try {
		const { id } = req.params;
		
		if (!id) {
			return sendErrorResponse(res, 400, "제품 ID가 필요합니다.");
		}

		const product = await Product.findById(id)
			.lean()
			.exec();

		if (!product) {
			return sendErrorResponse(res, 404, "제품 정보를 찾을 수 없습니다.");
		}

		const productData = {
			...product,
			date: product.date.toISOString().substring(0,10)
		};

		return sendSuccessResponse(res, { info: productData }, "제품 정보를 조회했습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "제품 정보 조회 중 오류가 발생했습니다.", error.message);
	}
};
