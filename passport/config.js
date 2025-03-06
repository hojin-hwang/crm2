const passport = require('passport');
const local = require('./localStrategy'); // 로컬서버로 로그인할때
const google = require('./googleStrategy'); // 구글서버로 로그인할때
const User = require('../models/user');

module.exports = () => {
   
   passport.serializeUser((user, done) => {
		process.nextTick(() => {
			done(null, { id: user._id, username: user.username });
		});
   });

   
   passport.deserializeUser(async (user, done) => {
		try {
			const userInfo = user ? await User.findById(user.id).select('-password').lean().exec() : null;
			process.nextTick(() => done(null, userInfo));
		} catch(error) {
			process.nextTick(() => done(error));
		}
   });
   local();
   google();
};

