const loginRequired = (req, res, next) =>{
	if (!req.user) {
			res.redirect('/user/login');
			return;
	}
	next();
}

module.exports = loginRequired; 