const User = require('../models/user');
const passport = require('passport');
//const LocalStrategy = require('passport-local').Strategy;
const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseHelper');

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
				return sendSuccessResponse(res, { username: user.username, clientId:user.clientId, loginSuccess:true }, "로그인에 성공했습니다.");
			});
		})(req, res, next);
	} catch(error) {
		return sendErrorResponse(res, 500, "로그인 처리 중 오류가 발생했습니다.", error.message);
	}
};

exports.googleUser = (req, res, next) => {
	passport.authenticate('google', { scope: ['profile', 'email']})(req, res, next);
};

exports.googleCallback = (req, res, next) => {
	passport.authenticate('google', { failureRedirect: '/user/login' })(req, res, next);
};
