const mongooes = require('mongoose');

const messageSchema = new mongooes.Schema({
		clientId:{type: String, required: true, default: ""},
		to: {type: Array, required: true, default: []},
		from: {type: String, required: true, default: "admin"},
		link:{type: String, required: true, default: ""},
		content:{type: String, required: true, default: ""},
		date:{type: Date, required: true, default: Date.now},
});


module.exports = mongooes.model('Message', messageSchema);