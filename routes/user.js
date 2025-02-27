var express = require('express');
var router = express.Router();

const userController = require('../controllers/userController');

router.get('/register', (request,response)=>{
	response.render('register.ejs');
})

router.get('/login', (request,response)=>{
	
	response.render('login.ejs');
})

router.get('/logout', (request,response)=>{
	request.logout(()=>{
		response.redirect('/');
	})
})

router.post('/add', userController.createUser);

router.post('/passUser', userController.loginUser);

router.post('/list', userController.listUser);

router.post('/update', userController.updateUser);

module.exports = router; 
