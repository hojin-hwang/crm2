class LoginRequired
{
	static redirectIfNotLogin = (req, res, next) =>{
		if (!req.user) {
				res.redirect('/user/login');
				return;
		}
		next();
	}
	
	static messageIfNotLogin = (req, res, next) =>{
		if (!req.user) {
				res.status(401).json({
					code: 401,
					success: false,
					message: '로그인이 필요합니다.'
				});
				return;
		}
		next();
	}
}


module.exports = LoginRequired; 