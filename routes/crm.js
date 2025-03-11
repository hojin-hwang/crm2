var express = require('express');
var router = express.Router();


router.get('/:clientId',  async(request,response)=>{
  console.log(request.params.clientId);
   if(!request.user){
      response.redirect('/user/login');
		return;
	}
	response.render('crm.ejs', {"userInfo":request.user});
});


module.exports = router; 
