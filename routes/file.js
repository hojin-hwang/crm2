var express = require('express');
var router = express.Router();

const fileController = require('../controllers/fileController');


router.post('/', fileController.uploadFile);
router.post('/delete', fileController.deleteFile);

module.exports = router; 
