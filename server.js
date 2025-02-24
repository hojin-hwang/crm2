
const express = require('express');
const app = express();
const session = require('express-session');
//const methodOverride = require('method-override')
const userRouter = require('./routes/user');
const bookRouter = require('./routes/book');
const MongoStore = require('connect-mongo')
const {MongoClient} = require('mongodb');
const mongoose = require('mongoose');

require('dotenv').config();

//use ejs 
app.set('view engin', 'ejx')

//폴더 접근 가능하게
app.use(express.static(__dirname + '/public'))

// 세션(session) 미들웨어를 추가, "secret" 옵션은 세션의 비밀 키를 지정하는데, 이 비밀 키는 세션 ID를 암호화하기 위해 사용
app.use(session({ secret: "loginsecret" }));  

//request body 사용
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//MongoDB Connect 
//const {ObjectId} = require('mongodb');
// let connectDB = require('./database.js');
// let db;

// const condition = [{$match:{operationType:'insert'}}]
// let changeStream;

// connectDB.then((client)=>{
// 	console.log("Success Connection DB")
// 	db = client.db('crm');
// 	changeStream = db.collection('post').watch(condition);

// }).catch((err)=>{
// 	console.log((err))
// })

const url = process.env.MONGO_URI;
mongoose.connect(url);

app.use('/user', userRouter );
app.use('/book', bookRouter);

// const url = process.env.MONGO_URI;
// let connectDB = new MongoClient(url).connect();

// let db;

// const condition = [{$match:{operationType:'insert'}}]
// let changeStream;

// connectDB.then((client)=>{
// 	console.log("Success Connection DB")
// 	db = client.db('crm');
// 	changeStream = db.collection('post').watch(condition);

// }).catch((err)=>{
// 	console.log((err))
// })

// app.listen -> server.listen 으로 변경(소켓 사용을 위해)
app.listen(process.env.PORT,()=>{
	console.log("starting Server port 8080")
})

app.get('/', async(request,response)=>{
	response.render('index.ejs', {response:response});
})

app.get('/register', (request,response)=>{
	response.render('register.ejs');
})


