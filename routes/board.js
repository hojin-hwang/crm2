var express = require('express');
var router = express.Router();

const boardController = require('../controllers/boardController');
const LoginRequired = require('../utils/loginRequired');

router.post('/add', LoginRequired.messageIfNotLogin, boardController.create);

router.post('/get', LoginRequired.messageIfNotLogin, boardController.get);

router.post('/list', LoginRequired.messageIfNotLogin, boardController.list);

router.post('/update', LoginRequired.messageIfNotLogin, boardController.update);

router.post('/update/read', LoginRequired.messageIfNotLogin, boardController.updateRead);

router.post('/delete', LoginRequired.messageIfNotLogin, boardController.delete);
module.exports = router; 
