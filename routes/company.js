var express = require('express');
var router = express.Router();

const companyController = require('../controllers/companyController');
const LoginRequired = require('../utils/loginRequired');

router.post('/add', LoginRequired.messageIfNotLogin, companyController.create);

router.post('/list', LoginRequired.messageIfNotLogin, companyController.list);

router.post('/update', LoginRequired.messageIfNotLogin, companyController.update);

router.post('/delete', LoginRequired.messageIfNotLogin, companyController.delete);
module.exports = router; 
