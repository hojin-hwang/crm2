const mongooes = require('mongoose');

const fileSchema = new mongooes.Schema({
		name: {type: String, required: true},
		size:{type: String, required: true},
		mimetype:{type: String, required: true},
		path:{type: String, required: true},
		publishedDate:{type: Date, required: true, default: Date.now},
});

module.exports = mongooes.model('File', fileSchema);