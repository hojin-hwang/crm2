var express = require('express');
var router = express.Router();

const userController = require('../controllers/userController');
const LoginRequired = require('../utils/loginRequired');
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

router.post('/passUser', userController.loginUser);

router.post('/add',  userController.createUser);

router.post('/list', LoginRequired.messageIfNotLogin, userController.listUser);

router.post('/update', LoginRequired.messageIfNotLogin, userController.updateUser);

module.exports = router; 
