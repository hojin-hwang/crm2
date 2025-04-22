const { GoogleGenerativeAI } = require("@google/generative-ai");
const { sendErrorResponse, sendSuccessResponse } = require('../utils/responseHelper');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
// 회사 데이터 유효성 검사
const validateCustomerData = (data) => {
	const errors = [];
	
	if (!data.talk?.trim()) {
		errors.push('내용은 필수입니다.');
	}
	
	return errors;
};

exports.talk = async (req, res, next) => {
	
	try {
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
		const chat = model.startChat({
			history: [
				{
					role: "user",
					parts: [{ text: "안녕!!" }],
				},
				{
					role: "model",
					parts: [{ text: "안녕하세요. 오늘자 일지를 작성하나요?" }],
				},
				
			],
			generationConfig: {
				maxOutputTokens: 100,
			},
		});
		const {...talkData } = req.body;

		const validationErrors = validateCustomerData(talkData);

		if (validationErrors.length > 0) {
			return sendSuccessResponse(res, { talk: "답변이 충분치 않습니다." }, "대화전송");;
		}

		const result = await chat.sendMessage(talkData.talk);
		const response = await result.response;
		const text = response.text();
		console.log(response.usageMetadata.promptTokensDetails[0]);
		console.log(response.usageMetadata.candidatesTokensDetails[0])
		console.log(chat.history)
		return sendSuccessResponse(res, { talk: text }, "대화전송");
	} catch(error) {
		return sendErrorResponse(res, 500, "대화 생성 중 오류가 발생했습니다.", error.message);
	}
};






