const mongooes = require('mongoose');

const productSchema = new mongooes.Schema({
		clientId:{type: String, required: true, default: ""},
		name: {type: String, required: true},
		code:{type: String, required: true, default: "원재료"},
		brand:{type: String, required: false, default: ""},
		memo:{type: String, required: false, default: ""},
		used:{type: String, required: true, default: 'Y'},
		date:{type: Date, required: true, default: Date.now},
});


module.exports = mongooes.model('Product', productSchema);