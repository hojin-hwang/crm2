const mongooes = require('mongoose');

const companySchema = new mongooes.Schema({
		clientId:{type: String, required: true, default: ""},
		name: {type: String, required: true},
		address:{type: String, required: true, default: ""},
		user: {type: mongooes.Schema.Types.ObjectId, ref: 'User', required: true},
		code:{type: String, required: false, default: ""},
		fax:{type: String, required: false, default: ""},
		tel:{type: String, required: false, default: ""},
		website:{type: String, required: false, default: ""},
		memo:{type: String, required: false, default: ""},
		used:{type: String, required: true, default: 'Y'},
		date:{type: Date, required: true, default: Date.now},
});


module.exports = mongooes.model('Company', companySchema);