const User = require('../models/user');
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
		return sendErrorResponse(res, 500, "사용자 생성 중 오류가 발생했습니다."+error.message, error.message);
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
