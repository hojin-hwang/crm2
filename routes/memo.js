var express = require('express');
var router = express.Router();

const memoController = require('../controllers/memoController');
const LoginRequired = require('../utils/loginRequired');

router.post('/add', LoginRequired.messageIfNotLogin, memoController.create);

router.post('/list', LoginRequired.messageIfNotLogin, memoController.list);

router.post('/delete', LoginRequired.messageIfNotLogin, memoController.delete);
module.exports = router; 
