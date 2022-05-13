// Imports
const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const {v4:uuidv4} = require('uuid');

//Setting up Port Number
const PORTNUM = 3000 || process.env.PORT;

//Seting up express
const app = express();
app.set('view engine','ejs');
app.use(express.static('public'));

// Creating a server and socket
const server = http.createServer(app);
const io = new Server(server,{cors:{origin:'*'}});


//basic routes
app.get('/',(req,res)=>{
    res.render('./index/index.ejs',{name:'yousef'});
});

app.get('/:documentId',(req,res)=>{
    res.render('./document/document.ejs',{users:['user1','user2','user3']})
});
app.post('/',(req,res)=>{
    let id = uuidv4();
    res.redirect(`/${id}`);
});

// handle a connection 
io.on('connection',(socket)=>{
    socket.on('id',(id)=>{
        console.log(id);
    });
})



//listiening to connections to server
server.listen(PORTNUM);
