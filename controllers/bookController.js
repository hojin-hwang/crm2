const Book = require('../models/book');

exports.createBook = async (req, res) =>{
	try{
		
		console.log(req.body)
		const book = new Book(req.body);
		const saveBook = await book.save();
		res.status(201).json(saveBook);
	}
	catch(error){
		res.status(500).json({message: error.message});
	}
};

exports.getAllBooks = async (req, res) =>{
	try{
		const books = await Book.find();
		res.status(200).json(books);
	}
	catch(error){
		res.status(500).json({message: error.message});
	}
};