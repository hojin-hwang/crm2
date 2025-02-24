
const express = require('express');
const app = express();

//const methodOverride = require('method-override')
const userRouter = require('./routes/user');
const MongoStore = require('connect-mongo')
const {MongoClient} = require('mongodb');

require('dotenv').config();

//use ejs 
app.set('view engin', 'ejx')

//폴더 접근 가능하게
app.use(express.static(__dirname + '/public'))

//request body 사용
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//MongoDB Connect 
//const {ObjectId} = require('mongodb');
let connectDB = require('./database.js');
let db;

const condition = [{$match:{operationType:'insert'}}]
let changeStream;

connectDB.then((client)=>{
	console.log("Success Connection DB")
	db = client.db('crm');
	changeStream = db.collection('post').watch(condition);

}).catch((err)=>{
	console.log((err))
})

app.use('/user', userRouter );

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
	response.render('index.ejs');
})

app.get('/register', (request,response)=>{
	response.render('register.ejs');
})


