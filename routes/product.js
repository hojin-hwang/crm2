var express = require('express');
var router = express.Router();

const productController = require('../controllers/productController');
const LoginRequired = require('../utils/loginRequired');

router.post('/add', LoginRequired.messageIfNotLogin, productController.create);

router.post('/list', LoginRequired.messageIfNotLogin, productController.list);

router.post('/update', LoginRequired.messageIfNotLogin, productController.update);

router.post('/delete', LoginRequired.messageIfNotLogin, productController.delete);
module.exports = router; 
