var express = require('express');
var router = express.Router();

const applyController = require('../controllers/applyController');
	
	router.post('/add', applyController.create);
	router.post('/info', applyController.info);
	router.post('/list', applyController.list);
	router.post('/delete', applyController.delete);
module.exports = router; 
