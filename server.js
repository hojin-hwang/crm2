
const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');
const cookieParser = require('cookie-parser');
//const methodOverride = require('method-override')
const userRouter = require('./routes/user');
const bookRouter = require('./routes/book');
const fileRouter = require('./routes/file');
const MongoStore = require('connect-mongo')
const mongoose = require('mongoose');

require('dotenv').config();

//use ejs 
app.set('view engin', 'ejx')

//폴더 접근 가능하게
app.use(express.static(__dirname + '/public'))

//request body 사용
app.use(express.json());
app.use(express.urlencoded({extended:true}));

/*secret : 각 세션이 클라이언트에서 암호화되도록함. 쿠키해킹방지
resave : 미들웨어 옵션, true하면 세션이 수정되지 않은 경우에도 세션 업데이트
saveUninitialized : 미들웨어 옵션, 초기화되지 않은 세션 재설정*/

app.use(cookieParser());
app.use(passport.initialize());
app.use(session({
	secret : process.env.SECRET, 
	resave : true, 
	saveUninitialized: false,
	// cookie : {maxAge: 1000*60*60*24},
	cookie : {maxAge: 1000*60*60*24},
	store : MongoStore.create({
		mongoUrl: process.env.MONGO_URI,
		dbName: process.env.DBNAME
	})
}));
app.use(passport.session());


const url = process.env.MONGO_URI;
mongoose.connect(url);

app.use('/user', userRouter );
app.use('/book', bookRouter);
app.use('/upload', fileRouter);


// app.listen -> server.listen 으로 변경(소켓 사용을 위해)
app.listen(process.env.PORT,()=>{
	console.log("starting Server port 8080!!")
})

const loginRequired = require('./util/login-required');

app.get('/', loginRequired, async(request,response)=>{
	if(!request.user){
		response.redirect('/user/login');
		return;
	}
	response.render('index2.ejs', {"userInfo":request.user});
})



