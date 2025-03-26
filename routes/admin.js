var express = require('express');
var router = express.Router();

const clientController = require('../controllers/clientController');

router.get('/',  async(request,response)=>{
    if(!request.user || request.user.clientId !== 'client'){
        response.redirect('/');
        return;
    }
    response.render('admin.ejs', {"userInfo":request.user});
});




module.exports = router; 
