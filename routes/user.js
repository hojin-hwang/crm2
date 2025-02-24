var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

router.post('/add', async(request, response, next)=> {
  try{
		const username = request.body.username;
		const password = await bcrypt.hash(request.body.password, 10)
		const data = {username:username, password:password};
		await db.collection("user").insertOne(data);
		
		response.redirect('/');
	}
	catch(e){
		console.log(e)
		response.redirect('/error');
	}
});


module.exports = router; 
