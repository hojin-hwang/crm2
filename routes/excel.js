const express = require('express');
const router = express.Router();
const excelController = require('../controllers/excelController');
const LoginRequired = require('../utils/loginRequired');

// Excel 파일 업로드 라우트
router.post('/upload', excelController.uploadExcel);

module.exports = router; 