var express = require('express');
var router = express.Router();

const replyController = require('../controllers/replyController');
const LoginRequired = require('../utils/loginRequired');

router.post('/add', LoginRequired.messageIfNotLogin, replyController.create);

router.post('/list', LoginRequired.messageIfNotLogin, replyController.list);

router.post('/delete', LoginRequired.messageIfNotLogin, replyController.delete);
module.exports = router; 
