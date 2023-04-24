const express = require('express')
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server);
const path = require('path');
const filePath = './chatdata.txt';
const fs = require('fs');
const dotenv = require('dotenv'); dotenv.config();
const port = process.env.PORT || 8080;
const crypto = require('crypto');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');

const authRouter = require('./Router/auth.js');

/** mysql 파일 스토어 설정 */
const sessionStore = new MySQLStore({
    host: process.env.db_host,
    user: process.env.db_user,
    port: 3306,
    password: process.env.db_password,
    database: process.env.db_database,
})

try{
    fs.readFileSync(filePath);
}catch(err){
    console.error("파일이 없습니다.");
    fs.writeFileSync(filePath, '');
}//채팅 데이터 저장을 위한 임시 파일 확인 및 생성

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false})); //파싱을 위한 미들웨어 사용
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {maxAge: 86400000},
}))

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'main.html'));
})

app.use('/auth', authRouter);

app.get('/chat', (req, res) =>{
    res.sendFile(path.join(__dirname, 'index.html'));
})

io.on('connection', (socket)=>{
    let chatData = fs.readFileSync(filePath, "utf8");
    console.log("user user come!");
    socket.emit('new user', chatData);

    socket.on('disconnect', ()=>{
        console.log('user disconnected!');
    })
    socket.on('chat message', (msg)=>{
        console.log("chat message!");
        fs.appendFileSync(filePath, msg+ '\n');
        io.emit('chat message', msg); //분석 필요
    })
})

server.listen(port, ()=>{
    console.log(`server listening on ${port}`);
})