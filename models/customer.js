const mongooes = require('mongoose');

const customerSchema = new mongooes.Schema({
		clientId:{type: String, required: true, default: ""},
		name: {type: String, required: true},
		address:{type: String, required: true, default: ""},
		phone:{type: String, required: true, default: ""},
		userName:{type: String, required: false, default: ""},
		used:{type: String, required: true, default: 'Y'},
		date:{type: Date, required: true, default: Date.now},
});

module.exports = mongooes.model('Customer', customerSchema);