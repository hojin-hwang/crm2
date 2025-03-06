var express = require('express');
var router = express.Router();


router.get('/',  async(request,response)=>{
  //  if(!request.params.clientId){
  //     response.redirect('/');
	// 	return;
	// }
   if(!request.user){
      response.redirect('/user/login');
		return;
	}
	response.render('crm.ejs', {"userInfo":request.user});
});


module.exports = router; 
