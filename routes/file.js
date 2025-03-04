var express = require('express');
var router = express.Router();

const fileController = require('../controllers/fileController');
const LoginRequired = require('../utils/loginRequired');

router.post('/add', LoginRequired.messageIfNotLogin, fileController.uploadFile);
router.post('/delete', LoginRequired.messageIfNotLogin, fileController.deleteFile);

module.exports = router; 
