var express = require('express');
var router = express.Router();

const userController = require('../controllers/userController');

router.get('/register', (request,response)=>{
	response.render('register.ejs');
})

router.get('/login', (request,response)=>{
	response.render('login.ejs');
})

router.post('/add', userController.createUser);

router.post('/passUser', userController.loginUser);

// router.post('/add', async(request, response, next)=> {
//   try{
// 		const username = request.body.username;
// 		const password = await bcrypt.hash(request.body.password, 10)
// 		const data = {username:username, password:password};
// 		await db.collection("user").insertOne(data);
		
// 		response.redirect('/');
// 	}
// 	catch(e){
// 		console.log(e)
// 		response.redirect('/error');
// 	}
// });


module.exports = router; 
