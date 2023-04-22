const express = require('express')
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server);
const path = require('path');
const port = 8080
const filePath = 'chatdata.txt';
const fs = require('fs');
app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'index.html'));
})

// let data = fs.readFileSync(filePath, "utf8");
// data.split('\n').forEach((msg)=>{
//     console.log(msg);
// })

io.on('connection', (socket)=>{
    let chatData = fs.readFileSync(filePath, "utf8");
    console.log("user user come!");
    socket.emit('new user', chatData);

    socket.on('disconnect', ()=>{
        console.log('user disconnected!');
    })
    socket.on('chat message', (msg)=>{
        console.log("chat message!");
        fs.appendFileSync(filePath, '\n'+msg);
        io.emit('chat message', msg);
    })
})

server.listen(port, ()=>{
    console.log(`server listening on ${port}`);
})