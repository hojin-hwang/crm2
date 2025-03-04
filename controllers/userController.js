const User = require('../models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseHelper');



exports.createUser = async (req, res) => {
	try {
		const userInfo = await User.findOne({ username: req.body.username }).exec();
		if (userInfo) {
			return sendErrorResponse(res, 400, "중복된 아이디입니다.");
		}

		delete req.body._id;
		const user = new User(req.body);
		const savedUser = await user.save();

		const userData = {
			...savedUser._doc,
			date: savedUser.date.toISOString().substring(0,10)
		};
		delete userData.password;

		return sendSuccessResponse(res, userData, "정상등록되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "사용자 생성 중 오류가 발생했습니다.", error.message);
	}
};

exports.loginUser = async (req, res, next) => {
	try {
		passport.authenticate('local', (error, user, info) => {
			if (error) {
				return sendErrorResponse(res, 500, "로그인 처리 중 오류가 발생했습니다.", error);
			}
			if (!user) {
				return sendErrorResponse(res, 401, info.message);
			}
			
			req.logIn(user, (err) => {
				if (err) {
					return sendErrorResponse(res, 500, "세션 생성 중 오류가 발생했습니다.", err);
				}
				return sendSuccessResponse(res, { username: user.username, loginSuccess:true }, "로그인에 성공했습니다.");
			});
		})(req, res, next);
	} catch(error) {
		return sendErrorResponse(res, 500, "로그인 처리 중 오류가 발생했습니다.", error.message);
	}
};

exports.listUser = async (req, res) => {
	try {
		const users = await User.find({ used: { $ne: 'N' } })
			.select('-password')
			.lean()
			.exec();

		const userList = users.map(user => ({
			...user,
			date: user.date.toISOString().substring(0,10)
		}));

		return sendSuccessResponse(res, {list: userList});
	} catch(error) {
		return sendErrorResponse(res, 500, "사용자 목록 조회 중 오류가 발생했습니다.", error.message);
	}
};

exports.updateUser = async (req, res) => {
	try {
		const { _id, ...updateData } = req.body;
		
		if (!_id) {
			return sendErrorResponse(res, 400, "사용자 ID가 필요합니다.");
		}

		const user = await User.findById(_id);
		if (!user) {
			return sendErrorResponse(res, 404, "사용자를 찾을 수 없습니다.");
		}

		Object.assign(user, updateData);
		const savedUser = await user.save();
		
		const userData = savedUser.toObject();
		delete userData.password;

		return sendSuccessResponse(res, { userInfo: userData }, "사용자 정보가 업데이트되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "사용자 정보 수정 중 오류가 발생했습니다.", error.message);
	}
};

// Passport 설정
passport.use(new LocalStrategy(async (username, password, callback) => {
	try {
		const user = await User.findOne({ username }).exec();
		if (!user) {
			return callback(null, false, { message: '등록되지 않은 아이디입니다.' });
		}

		const isValidPassword = await user.comparePassword(password);
		if (isValidPassword) {
			return callback(null, user);
		} else {
			return callback(null, false, { message: '비밀번호가 일치하지 않습니다.' });
		}
	} catch(error) {
		return callback(error);
	}
}));

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