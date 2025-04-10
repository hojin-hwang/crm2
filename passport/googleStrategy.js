const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const User = require('../models/user');

module.exports = () => {
   passport.use(
      new GoogleStrategy(
         {
            clientID: process.env.GOOGLE_CLIENT_ID, // 구글 로그인에서 발급받은 REST API 키
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL, 
            scope: ['profile', 'email'],
            passReqToCallback: true // 요청 객체를 콜백 함수에 전달
         },
         async (req, accessToken, refreshToken, profile, done) => {
            try {
               const exUser = await User.findOne({ snsId: profile.id, provider: 'google' }).exec();
               // 이미 가입된 구글 프로필이면 성공
               if (exUser) {
                  done(null, exUser); // 로그인 인증 완료
               } else {
                  const state = req.query.state ? JSON.parse(req.query.state) : {};
                  // 가입되지 않은 사용자는 임시 프로필 정보와 함께 전달
                  const tempUser = {
                     isNewUser: true,
                     email: profile?.emails[0].value,
                     name: profile.displayName,
                     snsId: profile.id,
                     provider: "google",
                     clientId: state.clientId || "",
                     profileImage: profile.photos?.[0]?.value || "",
                  };
                  done(null, tempUser);
               }
            } catch (error) {
               console.error(error);
               done(error);
            }
         },
      ),
   );
};