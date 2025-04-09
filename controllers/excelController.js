const multer = require('multer');
const xlsx = require('xlsx');
const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseHelper');
const path = require('path');
const fs = require('fs');

const Company = require('../models/company');
const User = require('../models/user');
const Customer = require('../models/customer');
const Product = require('../models/product');

const collection = (model) => {
	switch(model){
		case 'company':
			return Company;
		case 'user':
			return User;
		case 'customer':
			return Customer;
        case 'product':
            return Product;    
	}
}
// Excel 파일 업로드를 위한 multer 설정
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'public/uploads/excel';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Excel 파일만 업로드 가능합니다.'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB 제한
    }
}).single('excelFile');

exports.uploadExcel = async (req, res) => {
    try {
        // 파일 업로드 처리
        upload(req, res, async (err) => {
            if (err) {
                return sendErrorResponse(res, 400, '파일 업로드 실패', err.message);
            }

            if (!req.file) {
                return sendErrorResponse(res, 400, '파일이 선택되지 않았습니다.');
            }

            try {
                // Excel 파일 읽기
                const workbook = xlsx.readFile(req.file.path);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const data = xlsx.utils.sheet_to_json(worksheet);

                // 데이터 유효성 검사 및 변환
                const validatedData = data.map(row => {
                    // 여기에 데이터 유효성 검사 및 변환 로직 추가
                    return {
                        ...row,
                        clientId: req.user.clientId,
                        user:req.user._id,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                });
                // MongoDB에 데이터 저장
                //const result = await req.model.insertMany(validatedData);
				const result = await collection(req.body.model).insertMany(validatedData);
                // 임시 파일 삭제
                fs.unlinkSync(req.file.path);
								
                return sendSuccessResponse(res, {
                   message: `${result.length}개의 데이터가 성공적으로 저장되었습니다.`,
                   count: result.length
                });
            } catch (error) {
                // 임시 파일 삭제
								
                if (req.file && fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }
                return sendErrorResponse(res, 500, 'Excel 파일 처리 중 오류가 발생했습니다.', error.message);
            }
        });
    } catch (error) {
        return sendErrorResponse(res, 500, '서버 오류가 발생했습니다.', error.message);
    }
}; 