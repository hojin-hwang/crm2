const User = require('../models/user');
const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseHelper');

exports.create = async (req, res) => {
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
		return sendSuccessResponse(res, {info :userData}, "정상등록되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "사용자 생성 중 오류가 발생했습니다."+error.message, error.message);
	}
};



exports.list = async (req, res) => {
	try {
		const users = await User.find({ used: { $ne: 'N' },  clientId: req.user.clientId })
			.select('-password')
			.lean()
			.exec();

		const userList = users.map(user => ({
			...user,
			date: user.date.toISOString().substring(0,10)
		}));

		return sendSuccessResponse(res, {list: userList}, "사용자 목록을 조회했습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "사용자 목록 조회 중 오류가 발생했습니다.", error.message);
	}
};

exports.update = async (req, res) => {
	try {
		const { _id, ...updateData } = req.body;
		
		if (!_id) {
			return sendErrorResponse(res, 400, "사용자 ID가 필요합니다.");
		}

		const user = await User.findById({_id, clientId: req.user.clientId});
		if (!user) {
			return sendErrorResponse(res, 404, "사용자를 찾을 수 없습니다.");
		}

		Object.assign(user, updateData);
		const savedUser = await user.save();
		
		const userData = {
			...savedUser._doc,
			date: savedUser.date.toISOString().substring(0,10)
		};

		//const userData = savedUser.toObject();
		delete userData.password;

		return sendSuccessResponse(res, { info: userData }, "사용자 정보가 업데이트되었습니다.");
	} catch(error) {
		return sendErrorResponse(res, 500, "사용자 정보 수정 중 오류가 발생했습니다.", error.message);
	}
};

exports.delete = async (req, res) => {
	try {
		const { _id, ...updateData } = req.body;

		if (!_id) {
			return sendErrorResponse(res, 400, "사용자 ID가 필요합니다.");
		}

		const user = await User.findById({_id, clientId: req.user.clientId});
		if (!user) {
			return sendErrorResponse(res, 404, "사용자 정보를 찾을 수 없습니다.");
		}

		// 변경된 필드만 업데이트
		const updatedFields = {};
		for (const [key, value] of Object.entries(updateData)) {
			if (user[key] !== value) {
				updatedFields[key] = value;
			}
		}

		Object.assign(user, updatedFields);
		const savedUser = await user.save();
		
		const userData = {
			...savedUser._doc,
		};

		return sendSuccessResponse(res, { info: userData }, "사용자 정보가 삭제되었습니다.");
	} catch(error) {
		console.log(error)
		return sendErrorResponse(res, 500, "사용자 정보 삭제 중 오류가 발생했습니다.", error.message);
	}
};