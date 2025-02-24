const mongooes = require('mongoose');

const bookSchema = new mongooes.Schema({
		title: {type: String, required: true},
		author:{type: String, required: true},
		publishedDate:{type: Date, required: true},
});

module.exports = mongooes.model('Book', bookSchema);