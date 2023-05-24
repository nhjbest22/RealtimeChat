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
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const ios = require('express-socket.io-session'); //socket.io 에서 session 을 사용하기 위해 선언

const authRouter = require('./Router/auth.js');
const chatRouter = require('./Router/chat.js');
const dataRouter = require('./Router/data.js');

/** mysql 파일 스토어 설정 */
const sessionStore = new MySQLStore({
    host: process.env.db_host,
    user: process.env.db_user,
    port: 3306,
    password: process.env.db_password,
    database: process.env.db_database,
})

const Session = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {maxAge: 86400000},
});

try{
    fs.readFileSync(filePath);
}catch(err){
    console.error("파일이 없습니다.");
    fs.writeFileSync(filePath, '');
}//채팅 데이터 저장을 위한 임시 파일 확인 및 생성

//파싱을 위한 미들웨어 사용
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(Session) //접속 정보 저장을 위한 mysql-session 사용
io.use(ios(Session, {autoSave: true}));

app.use('/auth', authRouter);

app.use('/chat', express.static( 'dist'));
app.use('/chat', chatRouter);

app.use('/data', dataRouter);

app.get('/', (req, res) =>{
    if(req.session.user){
        res.redirect('/chat');
    }
    else res.redirect('/auth/login');
})

io.on('connection', (socket)=>{
    let chatData = fs.readFileSync(filePath, "utf8");
    console.log("new user come!");
    const user = socket.handshake.session.user;
    socket.emit('new user', chatData, user.username);
    io.emit('update', user.username + '님이 접속하였습니다.'); //모두에게 이벤트 발생

    socket.on('disconnect', ()=>{
        const user = socket.handshake.session.user;
        socket.broadcast.emit('update', user.username + '님이 퇴장하였습니다.');
        console.log('user disconnected!');
    })
    socket.on('chat message', (msg)=>{
        console.log("chat message!");
        const user = socket.handshake.session.user;
        const data = {
            sender: user,
            msg: msg
        }
        fs.appendFileSync(filePath, `${user.username}: ` + msg+ '\n');
        socket.broadcast.emit('chat message', data); //모든 클라이언트에게 이벤트 발생
    })

    socket.on('typing', (name)=>{
        socket.broadcast.emit('typing', name);
    })

    socket.on('untyping', (name)=>{
        socket.broadcast.emit('untyping', name);
    })
})

server.listen(port, ()=>{
    console.log(`server listening on ${port}`);
})