var express = require('express');
var router = express.Router();

const customerController = require('../controllers/customerController');
const LoginRequired = require('../utils/loginRequired');

router.post('/add', LoginRequired.messageIfNotLogin, customerController.create);

router.post('/list', LoginRequired.messageIfNotLogin, customerController.list);

router.post('/update', LoginRequired.messageIfNotLogin, customerController.update);

module.exports = router; 
