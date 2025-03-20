var express = require('express');
var router = express.Router();

const authController = require('../controllers/authController');


router.get('/logout/:clientId', (request,response)=>{
	request.logout(()=>{
		response.redirect('/user/login/'+request.params.clientId);
	})
})

router.post('/login', authController.loginUser);

router.get('/google', authController.googleUser);

router.get('/google/callback', authController.googleCallback);

module.exports = router; 
