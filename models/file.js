const mongooes = require('mongoose');

const fileSchema = new mongooes.Schema({
		clientId:{type: String, required: true, default: ""},
		contentsId: {type: String, required: true},
		name: {type: String, required: true},
		size:{type: Number, required: true},
		mimetype:{type: String, required: true},
		path:{type: String, required: true},
		date:{type: Date, required: true, default: Date.now},
});

module.exports = mongooes.model('File', fileSchema);