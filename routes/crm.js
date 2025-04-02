var express = require('express');
var router = express.Router();

const clientController = require('../controllers/clientController');

router.get('/:clientId',  async(request,response)=>{
   if(!request.user){
      response.redirect('/user/login/'+request.params.clientId);
		return;
	}

	response.render('crm.ejs', {"userInfo":request.user, "clientId":request.params.clientId});
	// clientController.get(request, response).then(data=>{
	// 	response.render('crm.ejs', {"userInfo":request.user, "clientId":req.params.clientId});
	// });
	
	// clientController.get(request, response).then(data=>{
	// 	if(data)
	// 	{
	// 		response.render('crm.ejs', {"userInfo":request.user, "clientInfo":data});
	// 	}
	// 	////response.render('crm.ejs', {"userInfo":request.user, "clientInfo":data});
	// })
});




module.exports = router; 
