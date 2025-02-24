const mongooes = require('mongoose');
const bcrypt = require('bcrypt');

const saltRounds = 10;

const userSchema = new mongooes.Schema({
		username: {type: String, required: true},
		password: {type: String, required: true},
		degree:{type: Number, required: true, default: 0},
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