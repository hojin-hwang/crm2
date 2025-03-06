var express = require('express');
var router = express.Router();

const clientController = require('../controllers/clientController');

router.get('/register-client', (request,response)=>{
	response.render('register-client.ejs');
})

router.post('/add',  clientController.createClient);



module.exports = router; 
