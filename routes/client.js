var express = require('express');
var router = express.Router();

const clientController = require('../controllers/clientController');
//const LoginRequired = require('../utils/loginRequired');

	
	//router.post('/add', LoginRequired.messageIfNotLogin, clientController.create);
	router.post('/add', clientController.create);
	router.post('/addDoc', clientController.addDoc);
	router.post('/get', clientController.info);
module.exports = router; 
