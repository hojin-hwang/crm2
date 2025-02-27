const File = require('../models/file');
const multer = require('multer');
const uuid4 = require('uuid4');
const path = require("path");
const sharp = require('sharp');
const fs = require('fs');
const fileSize = 5 * 1024 * 1024;
const resize = 600;

exports.uploadFile = async (req, res) =>{
	try{
		const upload = multer({
			storage: multer.diskStorage({
      	filename(req, file, done) {
          const randomID = uuid4();
          const ext = path.extname(file.originalname);
          const filename = randomID + ext;
					done(null, filename);
        },
				destination(req, file, done) {
		    	done(null, 'public/uploads/');
	    	},
    	}),
			limits: { fileSize: fileSize },
		});
		
		const uploadMiddleware = upload.single('myFile');
		uploadMiddleware (req, res, async (err)=>{
			if(err){
				return res.status(500).json({message: err.message});
			}
			resizeImage(req);
			const file = new File({
				name: req.file.filename,
				size: req.file.size,
				mimetype: req.file.mimetype,
				path: req.file.path,
			});
			//const saveFile = await file.save();
			//res.status(201).json(saveFile);

			res.status(201).json(
				{
					code:100,
					data:{
						name: req.file.filename,
						size: req.file.size,
						mimetype: req.file.mimetype,
						path: req.file.path,
					}
				});
		});
		
	}
	catch(error){
		res.status(500).json({message: error.message});
	}
};

exports.deleteFile = async (req, res) =>{
	try{
		const path = `public/uploads/${req.body.name}`
		fs.unlink(path, (error) => {
			if (error) {
				console.error(error)
				res.status(500).json({code:500, message: error.message});
				return
			}
			res.status(201).json(
			{
				code:100,
				data:{
					name: req.body.name,
				}
			});
		})
		
	}
	catch(error){
		res.status(500).json({code:500, message: error.message});
	}
};

function resizeImage(req)
{
	try{
		if(req.file.mimetype !== 'image/jpeg' && req.file.mimetype !== 'image/png'){
			return;
		}
		sharp(req.file.path)  // 압축할 이미지 경로
		.resize({ width: resize }) // 비율을 유지하며 가로 크기 줄이기
		.withMetadata()	// 이미지의 exif데이터 유지
		.toBuffer((err, buffer) => {
			if (err) throw err;
			// 압축된 파일 새로 저장(덮어씌우기)
			fs.writeFile(req.file.path, buffer, (err) => {
				if (err) throw err;
			});
		});}
	catch(error){
		console.log(error);
	}
	
}