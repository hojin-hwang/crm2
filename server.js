const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');
const passportConfig = require('./passport/config');
const cookieParser = require('cookie-parser');
//const methodOverride = require('method-override')
const crmRouter = require('./routes/crm'); 
const authRouter = require('./routes/auth'); 
const userRouter = require('./routes/user');
const clientRouter = require('./routes/client');
const companyRouter = require('./routes/company');
const fileRouter = require('./routes/file');
const messageRouter = require('./routes/message');
const excelRouter = require('./routes/excel');
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

passportConfig();
/*secret : 각 세션이 클라이언트에서 암호화되도록함. 쿠키해킹방지
resave : 미들웨어 옵션, true하면 세션이 수정되지 않은 경우에도 세션 업데이트
saveUninitialized : 미들웨어 옵션, 초기화되지 않은 세션 재설정*/

app.use(cookieParser());
app.use(passport.initialize());
app.use(session({
	secret : process.env.SECRET, 
	resave : true, 
	saveUninitialized: false,
	 //cookie : {maxAge: 1000*60},
		cookie : {maxAge: 1000*60*60*24},
	store : MongoStore.create({
		mongoUrl: process.env.MONGO_URI,
		dbName: process.env.DBNAME
	})
}));
app.use(passport.session());


const url = process.env.MONGO_URI;
mongoose.connect(url);

const LoginRequired = require('./utils/loginRequired');

app.use('/crm', crmRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter );
app.use('/client', clientRouter);
app.use('/company', companyRouter);
app.use('/upload', fileRouter);
app.use('/message', messageRouter);
app.use('/excel', excelRouter);

// app.listen -> server.listen 으로 변경(소켓 사용을 위해)
app.listen(process.env.PORT,()=>{
	console.log("starting Server port 8080??!!")
})


app.get('/',  async(request,response)=>{
	response.render('index.ejs');
});


app.use((req, res, next) => { 
	res.status(404).render('404.ejs');
})



