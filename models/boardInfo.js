const mongooes = require('mongoose');

const boardInfoSchema = new mongooes.Schema({
		clientId:{type: String, required: true, default: ""},
		name: {type:String, required: true},
		type:{type: String, required: false, default: "custom"},
		tag:{type: String, required: false, default: "board"},
		user:{type: Array, required: false, default: []},
		used:{type: String, required: true, default: 'Y'},
		date:{type: Date, required: true, default: Date.now},
});

module.exports = mongooes.model('BoardInfo', boardInfoSchema);