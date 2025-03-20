const mongooes = require('mongoose');

const sheetSchema = new mongooes.Schema({
		clientId:{type: String, required: true, default: ""},
		name: {type: String, required: true},
		company: {type: mongooes.Schema.Types.ObjectId, ref: 'Company', required: false},
		customer: {type: mongooes.Schema.Types.ObjectId, ref: 'Customer', required: false},
		user: {type: mongooes.Schema.Types.ObjectId, ref: 'User', required: true},
		memo:{type: String, required: false, default: "-"},
		item:{type: String, required: false, default: ""},
		product:{type: Array, required: false, default: []},
		step:{type: String, required: false, default: "제안"},
		used:{type: String, required: true, default: 'Y'},
		date:{type: Date, required: true, default: Date.now},
		duedate:{type: Date, required: true, default: Date.now},
});

module.exports = mongooes.model('Sheet', sheetSchema);