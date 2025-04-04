const Client = require('../models/client');

class clientApplyValidator
{
	static checkExistAndAuth = async (req, res, next) =>{
		
		const doc = await Client.findOne({clientId:req.params.clientId, used:'N'}).exec();
		if (!doc) {
			res.redirect('/404');
			return;
		}

		if (doc.authCode !== req.params.authCode) res.redirect('/404');	
		
		req.body.client = doc;
		next();
	}
}

module.exports = clientApplyValidator; 