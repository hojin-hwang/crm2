var express = require('express');
var router = express.Router();

const userController = require('../controllers/userController');
const LoginRequired = require('../utils/loginRequired');
// router.get('/register', (request,response)=>{
// 	response.render('register.ejs');
// })

// router.get('/login', (request,response)=>{
	
// 	response.render('login.ejs');
// })



router.post('/add',  userController.create);

router.post('/list', LoginRequired.messageIfNotLogin, userController.list);

router.post('/update', LoginRequired.messageIfNotLogin, userController.update);

router.post('/delete', LoginRequired.messageIfNotLogin, userController.delete);
module.exports = router; 
