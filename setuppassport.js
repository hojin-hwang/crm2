return;
/*
var passport = require("passport"); 
var User = require("./models/user");
var LocalStrategy = require("passport-local").Strategy;

passport.use("login",new LocalStrategy(async(username,password,done)=>
{  
	const userInfo = await User.findOne({ username: username }).exec();
	if(!userInfo){      
		return done(null,false,{message:"No user has that username!"});    
	} 
	if(!userInfo._id){
		// return res.json({
		// 	loginSuccess: false,
		// 	message: "등록되지 않은 이메일입니다."
		// })
	}

	const pass = userInfo.comparePassword(password);
	if(!pass){
		return done(null,false,{message:"Invalid password."});
		// return res.json({
		// 	loginSuccess: false,
		// 	message: "비밀번호가 틀렸습니다."
		// })
	}
	else
	{
		return done(null,userInfo); 
		// return res.json({
		// 	loginSuccess: true,
		// 	message: "비밀번호가 맞습니다.",
		// 	sessionId : userInfo._id
		// })
	}

	User.findOne({username:username}, 
	function(err,user){    
		if(err){return done(err);}    
		   
		user.checkPassword(password,function(err,isMatch){      
			if(err){return done(err);}      
			if(isMatch){        
				return done(null,user);      
			}
			else{
				return done(null,false,{message:"Invalid password."});      
			}});  
		});
	})); 
	
	module.exports = function(){  
		//사용자 개체를 id로 전환  
		passport.serializeUser(function(user,done){    
			done(null,user._id);  });  //id를 사용자 개체로 전환  
		passport.deserializeUser(async(id,done)=>{   
			const userInfo = await User.findById(id).exec();
			userInfo ? done(null,userInfo) : done(null,false);
			// User.findById(id,function(err,user){      
			// 	done(err,user);    });  
			});
		};
		*/