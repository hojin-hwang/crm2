const mongooes = require('mongoose');

const boardSchema = new mongooes.Schema({
		clientId:{type: String, required: true, default: ""},
		boardId: {type: String, required: true},
		company: {type: mongooes.Schema.Types.ObjectId, ref: 'Company', required: false},
		customer: {type: mongooes.Schema.Types.ObjectId, ref: 'Customer', required: false},
		user: {type: mongooes.Schema.Types.ObjectId, ref: 'User', required: true},
		title:{type: String, required: false, default: "-"},
		contents:{type: String, required: true, default: ""},
		product:{type: Array, required: false, default: []},
		read:{type: Array, required: false, default: []},
		used:{type: String, required: true, default: 'Y'},
		duedate:{type: Date, required: false, default: Date.now},
		date:{type: Date, required: true, default: Date.now},
});

module.exports = mongooes.model('Board', boardSchema);