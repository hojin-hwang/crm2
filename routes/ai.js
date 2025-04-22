var express = require('express');
var router = express.Router();

const aiController = require('../controllers/aiController');
const LoginRequired = require('../utils/loginRequired');

router.post('/talk',  aiController.talk);

//router.post('/delete', LoginRequired.messageIfNotLogin, memoController.delete);
module.exports = router; 
