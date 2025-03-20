var express = require('express');
var router = express.Router();

const sheetController = require('../controllers/sheetController');
const LoginRequired = require('../utils/loginRequired');

router.post('/add', LoginRequired.messageIfNotLogin, sheetController.create);

router.post('/list', LoginRequired.messageIfNotLogin, sheetController.list);

router.post('/update', LoginRequired.messageIfNotLogin, sheetController.update);

router.post('/delete', LoginRequired.messageIfNotLogin, sheetController.delete);
module.exports = router; 
