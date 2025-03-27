const mongooes = require('mongoose');

const applySchema = new mongooes.Schema({
		clientId:{type: String, required: true, default: ""},
		name: {type: String, required: true, default: ""},
		site:{type: String, required: false, default: ""},
		email:{type: String, required: true, default: ""},
		tel:{type: String, required: false, default: ""},
		used:{type: String, required: true, default: "Y"},
		date:{type: Date, required: true, default: Date.now},
});

module.exports = mongooes.model('Apply', applySchema);