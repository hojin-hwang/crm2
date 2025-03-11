var express = require('express');
var router = express.Router();

const clientController = require('../controllers/clientController');

	router.get('/register', (request,response)=>{
		response.render('client/register.ejs');
	})

	router.get('/login', (request,response)=>{
		response.render('client/login.ejs');
	})
	
	router.post('/add',  clientController.createClient);



module.exports = router; 
