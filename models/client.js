const mongooes = require('mongoose');

const clientSchema = new mongooes.Schema({
		clientId:{type: String, required: true, default: ""},
		name: {type: String, required: true},
		address:{type: String, required: false, default: ""},
		phone:{type: String, required: false, default: ""},
		used:{type: String, required: true, default: 'Y'},
		date:{type: Date, required: true, default: Date.now},
});

module.exports = mongooes.model('Client', clientSchema);