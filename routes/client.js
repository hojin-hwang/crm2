var express = require('express');
var router = express.Router();

const clientController = require('../controllers/clientController');
const LoginRequired = require('../utils/loginRequired');

	router.post('/apply', clientController.apply);
	router.post('/add', clientController.create);
	router.post('/addDoc', clientController.addDoc);
	router.post('/info',  clientController.info);
	router.post('/list', LoginRequired.messageIfNotLogin, clientController.list);
	router.post('/applylist', LoginRequired.messageIfNotLogin, clientController.applylist);
	router.post('/delete', LoginRequired.messageIfNotLogin, clientController.delete);
	router.post('/mail', LoginRequired.messageIfNotLogin, clientController.sendMail);

	router.get('/client-apply/:clientId/:authCode',  async(request,response)=>{
		 response.render('client-apply.ejs', {"clientId":request.params.clientId, "authCode":request.params.authCode});
	 });
	module.exports = router; 
