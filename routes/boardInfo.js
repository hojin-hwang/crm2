var express = require('express');
var router = express.Router();

const boardInfoController = require('../controllers/boardInfoController');
const LoginRequired = require('../utils/loginRequired');

router.post('/add', LoginRequired.messageIfNotLogin, boardInfoController.create);

router.post('/list', LoginRequired.messageIfNotLogin, boardInfoController.list);

router.post('/update', LoginRequired.messageIfNotLogin, boardInfoController.update);

router.post('/delete', LoginRequired.messageIfNotLogin, boardInfoController.delete);
module.exports = router; 
