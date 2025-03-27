var express = require('express');
var router = express.Router();

const clientController = require('../controllers/clientController');
const LoginRequired = require('../utils/loginRequired');

	router.post('/add', LoginRequired.messageIfNotLogin, clientController.create);
	router.post('/addDoc', LoginRequired.messageIfNotLogin, clientController.addDoc);
	router.post('/info',  clientController.info);
	router.post('/list', LoginRequired.messageIfNotLogin, clientController.list);
	router.post('/delete', LoginRequired.messageIfNotLogin, clientController.delete);
	router.post('/mail', LoginRequired.messageIfNotLogin, clientController.sendMail);

	module.exports = router; 
