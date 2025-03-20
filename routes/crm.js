var express = require('express');
var router = express.Router();

const clientController = require('../controllers/clientController');

router.get('/:clientId',  async(request,response)=>{
   if(!request.user){
      response.redirect('/user/login/'+request.params.clientId);
		return;
	}
	clientController.get(request).then(data=>{
		response.render('crm.ejs', {"userInfo":request.user, "clientInfo":data});
	})
});




module.exports = router; 
