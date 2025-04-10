const passport = require('passport');
//const LocalStrategy = require('passport-local').Strategy;
const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseHelper');

exports.loginUser = async (req, res, next) => {
	try {
		passport.authenticate('local', async (error, user, info) => {
			if (error) {
				return sendErrorResponse(res, 500, "로그인 처리 중 오류가 발생했습니다.", error);
			}
			if (!user) {
				return sendErrorResponse(res, 401, info.message);
			}

			req.logIn(user,  (err) => {
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
	const clientId = req.query.clientId;
	const state = JSON.stringify({clientId: clientId});
	passport.authenticate('google', { 
		scope: ['profile', 'email'],
		state 
	})(req, res, next);
};

exports.googleCallback = (req, res, next) => {
	console.log("google!!")
	passport.authenticate('google', { 
		failureRedirect: '/user/login' 
	}, (err, user, info) => {
		
		if (err) {
			return next(err);
		}
		if (!user) {
			return res.redirect('/user/login');
		}
		// 새로운 사용자인 경우 등록 페이지로 리다이렉트
		if (user.isNewUser && user.clientId) {
			const userInfo = encodeURIComponent(JSON.stringify(user));
			return res.redirect(`/user/register?userInfo=${userInfo}`);
		}
		else if(user.isNewUser && !user.clientId) {// 
			return res.redirect('/user/login/client');//클라이언트가 없으며 새로운 사용자인경우로 안내 하기
		}

		req.logIn(user, (err) => {
			if (err) {
				return next(err);
			}
			return res.redirect('/crm/' + user.clientId);
			// if(user.clientId !== 'client') {
			// 	
			// } 
		});
	})(req, res, next);
};
