const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const {addUser, removeUser, getUser, getUserInRoom} = require('./users');
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const socketio = require('socket.io');
const router = require('./router');
app.use(cors());
const io = socketio(server,{
    cors: {
        origin: "https://60886460dfabad0095a526cd--youthful-curran-84aa63.netlify.app",
        methods: ["GET", "POST"]
    }
});

io.on('connection',(socket)=>{
    console.log("A user connected");
    socket.on('join',({name,room},callback)=>{
      //  console.log(name,room);
      //console.log(socket.id);
      const {error, user} = addUser({id:socket.id,name,room});
      if(error) return callback(error);
      socket.emit('message',{user:'admin',text:`${user.name},Welcome to the room:${user.room}`});
      socket.broadcast.to(user.room).emit('message',{user:'admin',text:`${user.name}, has joined!`})
      socket.join(user.room);

      io.to(user.room).emit('roomData',{room:user.room,users:getUserInRoom(user.room)});
      callback();
    });

    socket.on('sendMessage',(message,callback)=>{
        //console.log(socket.id);
        const user = getUser(socket.id);
        //console.log(user);
        io.to(user.room).emit('message',{user:user.name,text:message});
        io.to(user.room).emit('roomData',{room:user.room,users:getUserInRoom(user.room)});
        callback();
    });
    socket.on('disconnect',()=>{
        console.log('User had left..!');
        const user = removeUser(socket.id);
        if(user)
        {
            io.to(user.room).emit('message',{user:'admin',text:`${user.name} has left.`})
        }
    })
});
app.use(router);
server.listen(PORT,()=>{
    console.log(`Server Started on port ${PORT}`);
})