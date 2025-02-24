const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

router.post('/', bookController.createBook);
router.post('/list', bookController.getAllBooks);

module.exports = router;