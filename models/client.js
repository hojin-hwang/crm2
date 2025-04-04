const mongooes = require('mongoose');

const clientSchema = new mongooes.Schema({
		clientId:{type: String, required: true, default: ""},
		authCode:{type: String, required: true, default: ""},
		name: {type: String, required: false, default: ""},
		email: {type: String, required: false, default: ""},
		site: {type: String, required: false, default: ""},
		address:{type: String, required: false, default: ""},
		tel:{type: String, required: false, default: ""},
		used:{type: String, required: true, default: 'N'},
		price:{type: String, required: true, default: 'basic'},
		config:{type:Object, required: false, default: {}},
		limit:{type:Object, required: false, default: {board:0,sheet:0,work:0,product:0,file:0}},
		date:{type: Date, required: true, default: Date.now},
});

module.exports = mongooes.model('Client', clientSchema);