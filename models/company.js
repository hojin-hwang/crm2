const mongooes = require('mongoose');

const companySchema = new mongooes.Schema({
		name: {type: String, required: true},
		address:{type: String, required: true, default: ""},
		userName:{type: String, required: false, default: ""},
		used:{type: String, required: true, default: 'Y'},
		date:{type: Date, required: true, default: Date.now},
});


module.exports = mongooes.model('Company', companySchema);