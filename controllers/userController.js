const User = require('../models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

exports.createUser = async (req, res) =>{
	try{
		const userInfo = await User.findOne({ username: req.body.username }).exec();
		if(userInfo){
						return res.json({
							createSuccess: false,
							message: "중복된 아이디입니다.",
							user:null
						})
					}
		delete req.body._id;			
		const user = new User(req.body);
		const saveUser = await user.save();

		const _saveUser = {};
		Object.assign(_saveUser, saveUser._doc);
		_saveUser["date"] = _saveUser.date.toISOString().substring(0,10);
		delete _saveUser.password;

		res.status(201).json({
			code:100,
			createSuccess: true,
			message: "정상등록되었습니다.",
			user:_saveUser,
			info:_saveUser
		});
	}
	catch(error){
		res.status(500).json({message: error.message});
	}
};

// exports.loginUser = async (req, res) =>{
// 	try{
// 		const userInfo = await User.findOne({ username: req.body.username }).exec();
// 		if(!userInfo || !userInfo._id){
// 			return res.json({
// 				loginSuccess: false,
// 				message: "등록되지 않은 이메일입니다."
// 			})
// 		}
// 		const pass = userInfo.comparePassword(req.body.password);
// 		if(!pass){
// 			return res.json({
// 				loginSuccess: false,
// 				message: "비밀번호가 틀렸습니다."
// 			})
// 		}
// 		else
// 		{
// 			return res.json({
// 				loginSuccess: true,
// 				message: "비밀번호가 맞습니다.",
// 				sessionId : userInfo._id
// 			})
// 		}
// 	}
// 	catch(error){
// 		res.status(500).json({message: error.message});
// 	}	
// }

exports.loginUser = async (req, res, next) =>{
		try{
			passport.authenticate('local', (error, user, info) => {
				if (error) return res.status(500).json(error)
				if (!user) {
					return res.json({
						loginSuccess: false,
						message: info.message
						})
					}
					req.logIn(user, (err) => {
						if (err) return next(err)
						return res.json({
											loginSuccess: true,
											message: "비밀번호가 일치합니다."
										})
				})
				})(req, res, next)
		}
		catch(error){
			res.status(500).json({message: error.message});
		}	
	}

exports.listUser = async (req, res) =>{
	try{
		const list = await User.find({ used: { $ne: 'N' } }).select('-password').exec();
		
		const userList = list.reduce((acc, cur)=>{
			
			const tempObject = {};
			Object.assign(tempObject, cur._doc);
			tempObject["date"] = tempObject.date.toISOString().substring(0,10);
			acc.push(tempObject);
			return acc;
		},[]);
		
		res.status(200).json({
			code:100,
			list:userList
		});
	}
	catch(error){
		res.status(500).json({code:500, message: error.message});
	}
};

exports.updateUser = async (req, res) =>{
	try{
		const user = await User.findOne({ _id: req.body._id }).exec();
		for (const [key, value] of Object.entries(req.body)) {
			user[key] = value;
		}
		const saveUser = await user.save();
		saveUser.password = null;
		res.status(200).json({
			code:100,
			userInfo:saveUser
		});
	}
	catch(error){
		res.status(500).json({code:500, message: error.message});
	}
};

passport.use(new LocalStrategy(async (username, password, callback) => {
  const userInfo = await User.findOne({ username: username }).exec();
  if (!userInfo) {
    return callback(null, false, { message: '아이디 DB에 없음' })
  }
	const pass = await userInfo.comparePassword(password);
  if (pass) {
    return callback(null, userInfo)
  } else {
    return callback(null, false, { message: '비밀번호가 일치하지 않습니다.' });
  }
}))

passport.serializeUser((user, done) => {
  process.nextTick(() => {
    done(null, { id: user._id, username: user.username })
  })
})

passport.deserializeUser(async(user, done) => {
	const userInfo = (user)? await User.findById(user.id).exec() : null;
	if(userInfo) userInfo.password = null;
  process.nextTick(() => {
    return done(null, userInfo)
  })
})