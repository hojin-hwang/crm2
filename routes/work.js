var express = require('express');
var router = express.Router();

const workController = require('../controllers/workController');
const LoginRequired = require('../utils/loginRequired');

router.post('/add', LoginRequired.messageIfNotLogin, workController.create);

router.post('/list', LoginRequired.messageIfNotLogin, workController.list);

router.post('/update', LoginRequired.messageIfNotLogin, workController.update);

router.post('/delete', LoginRequired.messageIfNotLogin, workController.delete);
module.exports = router; 
