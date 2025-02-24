const User = require('../models/user');

exports.createUser = async (req, res) =>{
	try{
		const user = new User(req.body);
		const saveUser = await user.save();
		res.status(201).json(saveUser);
	}
	catch(error){
		res.status(500).json({message: error.message});
	}
};

exports.loginUser = async (req, res) =>{
	try{
		const userInfo = await User.findOne({ username: req.body.username }).exec();
		if(!userInfo._id){
			return res.json({
				loginSuccess: false,
				message: "등록되지 않은 이메일입니다."
			})
		}

		const pass = userInfo.comparePassword(req.body.password);
		if(!pass){
			return res.json({
				loginSuccess: false,
				message: "비밀번호가 틀렸습니다."
			})
		}
		else
		{
			req.session.user_id = userInfo._id;
			return res.json({
				loginSuccess: true,
				message: "비밀번호가 맞습니다.",
				sessionId : userInfo._id
			})
		}
	}
	catch(error){
		res.status(500).json({message: error.message});
	}	
}
