var express = require('express');
var router = express.Router();

const messageController = require('../controllers/messageController');
const LoginRequired = require('../utils/loginRequired');

router.post('/send', LoginRequired.messageIfNotLogin, messageController.create);

router.post('/list', LoginRequired.messageIfNotLogin, messageController.list);

router.post('/update', LoginRequired.messageIfNotLogin, messageController.update);

router.get('/stream', LoginRequired.messageIfNotLogin, messageController.stream);

module.exports = router; 
