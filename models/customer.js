const mongooes = require('mongoose');

const customerSchema = new mongooes.Schema({
		clientId:{type: String, required: true, default: ""},
		name: {type: String, required: true},
		company: {type: mongooes.Schema.Types.ObjectId, ref: 'Company', required: true},
		position:{type: String, required: false, default: "-"},
		address:{type: String, required: true, default: ""},
		tel:{type: String, required: false, default: ""},
		email:{type: String, required: false, default: ""},
		hp:{type: String, required: true, default: ""},
		user: {type: mongooes.Schema.Types.ObjectId, ref: 'User', required: true},
		memo:{type: String, required: false, default: ""},
		used:{type: String, required: true, default: 'Y'},
		date:{type: Date, required: true, default: Date.now},
});

module.exports = mongooes.model('Customer', customerSchema);