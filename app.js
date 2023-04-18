const express = require('express')
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server);
const path = require('path');
const port = 8080



app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'index.html'));
})

io.on('connection', (socket)=>{
    console.log("new user connect!");
    socket.on('disconnect', ()=>{
        console.log('user disconnected!');
    })
})

server.listen(port, ()=>{
    console.log(`server listening on ${port}`);
})