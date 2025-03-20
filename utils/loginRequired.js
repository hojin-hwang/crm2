class LoginRequired
{
	static redirectIfNotLogin = (req, res, next) =>{
		if (!req.isAuthenticated()) {
				res.redirect('/crm/login/'+req.params.clientId);
				return;
		}
		next();
	}
	
	static messageIfNotLogin = (req, res, next) =>{
		if (!req.isAuthenticated()) {
				res.status(401).json({
					code: 401,
					success: false,
					message: '로그인이 필요합니다.'
				});
				return;
		}
		next();
	}

	static isNotLogin = (req, res, next) =>{
		if (!req.isAuthenticated()) {
      next(); // 로그인 안되어있으면 다음 미들웨어
   } else {
      const message = encodeURIComponent('로그인한 상태입니다.');
      res.redirect(`/?error=${message}`);
   }
	}
}


module.exports = LoginRequired; 