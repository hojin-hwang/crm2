var express = require('express');
var router = express.Router();

const contactController = require('../controllers/contactController');
const LoginRequired = require('../utils/loginRequired');

router.post('/add', contactController.create);

router.post('/list', LoginRequired.messageIfNotLogin, contactController.list);

router.post('/update', LoginRequired.messageIfNotLogin, contactController.update);

router.post('/delete', LoginRequired.messageIfNotLogin, contactController.delete);

router.post('/info', LoginRequired.messageIfNotLogin, contactController.info);
module.exports = router; 
