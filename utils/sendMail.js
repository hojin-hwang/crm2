require('dotenv').config();
const nodemailer = require("nodemailer");

async function sendEmail({ to, subject, html }) {

	// SMTP 설정
	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.GOOGLE_EMAIL,  // 본인 Gmail 주소
			pass: process.env.GOOGLE_EMAIL_PASS     // Gmail 앱 비밀번호
		}
	});

	// 이메일 옵션
	const mailOptions = {
		from: process.env.GOOGLE_EMAIL,
		to: to,
		subject: subject,
		html : html
	};

	// 이메일 전송
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log("Error:", error);
		} else {
			console.log("Email sent:", info.response);
		}
	});

}
module.exports = sendEmail;