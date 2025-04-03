const File = require('../models/file');
const multer = require('multer');
const uuid4 = require('uuid4');
const path = require("path");
const sharp = require('sharp');
const fs = require('fs');
const mime = require('mime-types');
const fileConfig = require('../config/fileConfig');
const FileValidator = require('../utils/fileValidator');
const RecordLimitValidator = require('../utils/recordLimitValidator');
const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseHelper');

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
		const query = { contentsId : req.body.contentsId, clientId: req.user.clientId };
		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ email: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } }
			];
		}
		// 정렬 조건
		const sort = { [sortBy]: order === 'desc' ? -1 : 1 };

		// 페이지네이션 적용하여 데이터 조회
		const files = await File.find(query)
			.sort(sort)
			.lean()
			.exec();

		const fileList = files.map(file => ({
			...file,
		}));

		return sendSuccessResponse(res, {
			list: fileList
		}, "파일 목록을 조회했습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "파일 목록 조회 중 오류가 발생했습니다.", error.message);
	}
};

const upload = multer({
	storage: multer.diskStorage({
		filename(req, file, done) {
			try {
				// 원본 파일명 유효성 검사
				FileValidator.validateFileName(file.originalname);
				
				const ext = path.extname(file.originalname);

				if (fileConfig.image.allowedTypes.includes(file.mimetype))
				{
					const randomID = uuid4();
					const filename = randomID + ext;
					done(null, filename);
				}
				else
				{
					file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8')
					const filename = file.originalname + '-' +  Date.now() + ext;
					done(null, filename);
				}
			} catch (error) {
				console.log(error)
				done(error, null);
			}
		},
		destination(req, file, done) {
			// 업로드 디렉토리 존재 확인
			const uploadDir = fileConfig.upload.destination + `/${req.user.clientId}`;
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
			console.log(error)
			done(error, false);
		}
	}
}).single('boardFile');

// Promise 기반 미들웨어 래퍼 함수
const uploadMiddlewarePromise = (req, res) => {
	return new Promise((resolve, reject) => {
		upload(req, res, (err) => {
			if (err) 
			{
				console.log(err)
				reject(err);
			}
			else resolve();
		});
	});
};

exports.uploadFile = async (req, res) => {
	try {

		const result = await RecordLimitValidator.validateFileSize(req);
		if(!result) return sendErrorResponse(res, 400, '용량을 초과했습니다.', '용량을 초과했습니다.')
		console.log(result)	

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

		try {
			const {...createData } = fileData;
	
			createData["clientId"] = req.user.clientId;
			createData["contentsId"] = req.body.contentsId;
			
			const file = new File(createData);
			const savedData = await file.save();
	
			const responseData = {
				...savedData._doc,
			};
	
			return sendSuccessResponse(res,responseData, "파일 정보가 등록되었습니다.");
		} catch(error) {
			return sendErrorResponse(res, 500, "파일 정보 생성 중 오류가 발생했습니다.", error.message);
		}		
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
		console.log(error.message)
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
		const filePath = path.join(fileConfig.upload.destination + `/${req.user.clientId}`, req.body.name);
		const normalizedPath = path.normalize(filePath);
		if (!normalizedPath.startsWith(path.normalize(fileConfig.upload.destination))) {
			return sendErrorResponse(res, 400, '잘못된 파일 경로입니다.');
		}

		try {
			const { name, boardId } = req.body;
			
			await File.deleteOne({name, boardId, clientId: req.user.clientId});
			
			const responseData = {};
			responseData.name = req.body.name;

			fs.stat(filePath, (err, stats) => {
				if (err) {
					console.error('파일을 찾을 수 없습니다.', err);
					return;
				}
				responseData.size = stats.size;
				responseData.mimetype = mime.lookup(filePath);
			});
			await fs.promises.unlink(filePath);

			return sendSuccessResponse(res, responseData, "파일 정보가 삭제 되었습니다.");
		} catch(error) {
			return sendErrorResponse(res, 500, "파일 정보 삭제 중 오류가 발생했습니다.", error.message);
		}
		//client정보 업데이트 하자
	} 
	catch(error) {
		if (error.code === 'ENOENT') {
			return sendErrorResponse(res, 404, '파일을 찾을 수 없습니다.');
		}
		return sendErrorResponse(res, 500, '서버 오류', error.message);
	}
};

exports.totalSize = async (req, res) => {
	try {
		const result = await File.aggregate([
			{ $match: { clientId: req.user.clientId } }, 
			{ 
				$group: { 
					_id: null, 
					totalSize: { $sum: "$size" } 
				} 
			}
		]);
		const size = result[0]?.totalSize || 0
		return sendSuccessResponse(res, { size }, "File Total Size 조회했습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "File Total Size 조회 중 오류가 발생했습니다.", error.message);
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