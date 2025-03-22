var express = require('express');
var router = express.Router();

const clientController = require('../controllers/clientController');

router.get('/',  async(request,response)=>{
    response.render('admin.ejs', {"userInfo":{}});
});




module.exports = router; 
