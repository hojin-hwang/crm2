const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const User = require('../models/user');

module.exports = () => {
   passport.use(
      new GoogleStrategy(
         {
            clientID: process.env.GOOGLE_CLIENT_ID, // 구글 로그인에서 발급받은 REST API 키
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback', 
            scope: ['profile', 'email']
         },
         async ( accessToken, refreshToken, profile, done) => {
            try {
               const exUser = await User.findOne({ snsId: profile.id, provider: 'google' }).exec();
               // 이미 가입된 구글 프로필이면 성공
               if (exUser) {
                  done(null, exUser); // 로그인 인증 완료
               } else {
                  // 가입되지 않는 유저면 회원가입 시키고 로그인을 시킨다
                  const newUser = await User.create({
                     username: profile?.emails[0].value,
                     email: profile?.emails[0].value,
                     name: profile.displayName,
                     snsId: profile.id,
                     provider: 'google',
							password:process.env.DEFAULT_PASSWORD
                  });
                  done(null, newUser); // 회원가입하고 로그인 인증 완료
               }
            } catch (error) {
               console.error(error);
               done(error);
            }
         },
      ),
   );
};