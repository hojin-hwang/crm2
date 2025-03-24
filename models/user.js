const mongooes = require('mongoose');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const userSchema = new mongooes.Schema({
		clientId:{type: String, required: true, default: "demo"},
		username: {type: String, required: true},
		password: {type: String, required: false, default: "ddaee32#@@dsd"},
		name: {type: String, required: true, default: "no Name"},
		degree:{type: String, required: true, default: "대기"},
		code:{type: String, required: false, default: ""},
		department:{type: String, required: true, default: "기타"},
		position:{type: String, required: true, default: "사원"},
		used:{type: String, required: true, default: 'Y'},
		snsId: {type: String, required: false},
		provider: {type: String, required: false},
		email: {type: String, required: false},
		profile: {type: String, required: false, default: "/assets/img/profile/default.jpg"},
		date:{type: Date, required: true, default: Date.now},
});

userSchema.pre('save', async function(next){
	if(!this.isModified('password')){
		return next();
	}
	try{
		const salt = await bcrypt.genSalt(saltRounds);
		this.password = await bcrypt.hash(this.password, salt);
	}
	catch(error){
		next(error);
	}
});

userSchema.methods.comparePassword = async function(plainPassword){
	return await bcrypt.compare(plainPassword, this.password);
}

module.exports = mongooes.model('User', userSchema);