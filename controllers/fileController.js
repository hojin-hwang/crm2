const File = require('../models/file');
const multer = require('multer');
const uuid4 = require('uuid4');
const path = require("path");
const sharp = require('sharp');
const fs = require('fs');
const fileConfig = require('../config/fileConfig');
const FileValidator = require('../utils/fileValidator');
const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseHelper');

const upload = multer({
	storage: multer.diskStorage({
		filename(req, file, done) {
			try {
				// 원본 파일명 유효성 검사
				FileValidator.validateFileName(file.originalname);
				
				const randomID = uuid4();
				const ext = path.extname(file.originalname);
				const filename = randomID + ext;
				done(null, filename);
			} catch (error) {
				done(error, null);
			}
		},
		destination(req, file, done) {
			// 업로드 디렉토리 존재 확인
			const uploadDir = fileConfig.upload.destination;
			if (!fs.existsSync(uploadDir)) {
				fs.mkdirSync(uploadDir, { recursive: true });
			}
			done(null, uploadDir);
		},
	}),
	limits: { fileSize: fileConfig.upload.maxSize },
	fileFilter: (req, file, done) => {
		try {
			FileValidator.validateFileType(file.mimetype, file.originalname);
			done(null, true);
		} catch (error) {
			done(error, false);
		}
	}
}).single('myFile');

// Promise 기반 미들웨어 래퍼 함수
const uploadMiddlewarePromise = (req, res) => {
	return new Promise((resolve, reject) => {
		upload(req, res, (err) => {
			if (err) reject(err);
			else resolve();
		});
	});
};

exports.uploadFile = async (req, res) => {
	try {
		await uploadMiddlewarePromise(req, res);
		
		// 파일 크기 재검증
		FileValidator.validateFileSize(req.file.size);
		
		// 이미지인 경우 추가 검증
		if (fileConfig.image.allowedTypes.includes(req.file.mimetype)) {
			const metadata = await sharp(req.file.path).metadata();
			FileValidator.validateImageDimensions(metadata.width, metadata.height);
		}
		
		await resizeImage(req);
		
		const fileData = {
			name: req.file.filename,
			size: req.file.size,
			mimetype: req.file.mimetype,
			path: req.file.path,
		};
		
		return sendSuccessResponse(res, fileData);
	} catch (error) {
		// 업로드된 파일이 있다면 삭제
		if (req.file && req.file.path) {
			try {
				await fs.promises.unlink(req.file.path);
			} catch (unlinkError) {
				console.error('Failed to delete uploaded file:', unlinkError);
			}
		}
		
		if (error instanceof multer.MulterError) {
			return sendErrorResponse(res, 400, '파일 업로드 실패', error.message);
		}
		return sendErrorResponse(res, 400, error.message);
	}
};

exports.deleteFile = async (req, res) => {
	try {
		if (!req.body.name) {
			return sendErrorResponse(res, 400, '파일명이 필요합니다.');
		}
		
		// 파일명 유효성 검사
		FileValidator.validateFileName(req.body.name);
		
		// 파일 경로 검증
		const filePath = path.join(fileConfig.upload.destination, req.body.name);
		const normalizedPath = path.normalize(filePath);
		if (!normalizedPath.startsWith(path.normalize(fileConfig.upload.destination))) {
			return sendErrorResponse(res, 400, '잘못된 파일 경로입니다.');
		}
		
		await fs.promises.unlink(filePath);
		return sendSuccessResponse(res, { name: req.body.name });
	} catch(error) {
		if (error.code === 'ENOENT') {
			return sendErrorResponse(res, 404, '파일을 찾을 수 없습니다.');
		}
		return sendErrorResponse(res, 500, '서버 오류', error.message);
	}
};

function resizeImage(req) {
	return new Promise((resolve, reject) => {
		try {
			if(!fileConfig.image.allowedTypes.includes(req.file.mimetype)){
				return resolve(); // 이미지가 아닌 경우 바로 완료
			}
			
			sharp(req.file.path)
				.resize({ 
					width: fileConfig.image.resize.width,
					quality: fileConfig.image.resize.quality 
				})
				.withMetadata()
				.toBuffer()
				.then(buffer => {
					fs.promises.writeFile(req.file.path, buffer)
						.then(() => resolve())
						.catch(err => reject(err));
				})
				.catch(err => reject(err));
		} catch(error) {
			reject(error);
		}
	});
}