const mongooes = require('mongoose');

const contactSchema = new mongooes.Schema({
		user: {type: mongooes.Schema.Types.ObjectId, ref: 'User', required: false},
		clientId:{type: String, required: false, default: ""},
		name: {type: String, required: true, default: ""},
		status:{type: String, required: true, default: "N"}, // N: 신규, C: 답변
		email:{type: String, required: true, default: ""},
		memo:{type: String, required: true, default: ""},
		reply:{type: String, required: false, default: ""},
		date:{type: Date, required: true, default: Date.now},
});

module.exports = mongooes.model('Contact', contactSchema);