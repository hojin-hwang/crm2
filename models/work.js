const mongooes = require('mongoose');

const workSchema = new mongooes.Schema({
		clientId:{type: String, required: true, default: ""},
		name: {type: String, required: true},
		company: {type: mongooes.Schema.Types.ObjectId, ref: 'Company', required: false},
		customer: {type: mongooes.Schema.Types.ObjectId, ref: 'Customer', required: false},
		user: {type: mongooes.Schema.Types.ObjectId, ref: 'User', required: true},
		sheet: {type: mongooes.Schema.Types.ObjectId, ref: 'Sheet', required: false},
		memo:{type: String, required: false, default: "-"},
		remark:{type: String, required: false, default: ""},
		status:{type: String, required: false, default: ""},
		imageFile:{type: String, required: false, default: ""},
		etcFiles:{type: String, required: false, default: ""},
		used:{type: String, required: true, default: 'Y'},
		date:{type: Date, required: true, default: Date.now},
		duedate:{type: Date, required: true, default: Date.now},
});

module.exports = mongooes.model('Work', workSchema);