var express = require('express');
var router = express.Router();

router.get('/:clientId',  async(request,response)=>{
   if(!request.user){
      response.redirect('/user/login/'+request.params.clientId);
		return;
	}

	response.render('crm.ejs', {"userInfo":request.user, "clientId":request.params.clientId});
});




module.exports = router; 
