const mongooes = require('mongoose');

const replySchema = new mongooes.Schema({
		clientId:{type: String, required: true, default: ""},
		boardId:{type: String, required: true, default: ""},
		user: {type: mongooes.Schema.Types.ObjectId, ref: 'User', required: true},
		memo:{type: String, required: false, default: "-"},
		date:{type: Date, required: true, default: Date.now},
});

module.exports = mongooes.model('Reply', replySchema);