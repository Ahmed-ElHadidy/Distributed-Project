// Imports
const express = require('express');
const { all } = require('express/lib/application');
const http = require('http');
const {Server} = require('socket.io');
const {io} =  require('socket.io-client');
const mongoose = require('mongoose');

//Setting up Port Number
const PORTNUM = 3001 || process.env.PORT;
console.log("connected to : " + String(PORTNUM));
// Document Object to reprsent Document
const DocumentObject = require('./Document object/documentobject')

//Seting up express
const app = express();
app.set('view engine','ejs');
app.use(express.static('public'));



// mongoDB connection
const mongoURI = "mongodb+srv://doxegy:Tj64CVQDJF472wn2@doxcluster.bomjo.mongodb.net/DOX";
mongoose.connect(mongoURI, {useNewUrlParser:true, useUnifiedTopology: true})
    .then((result) => console.log("Connected to mongoDB") )
    .catch((err)=>console.log(err));



// Creating a server and socket
const server = http.createServer(app);
const ioc = new Server(server,{cors:{origin:'*'}});


//All Documents that a server hosts
const Documents = []


// server as a client
//connect server to load balancer
 const sock = io("http://localhost:3000")
//regester the server on connection
 sock.on('connect',()=>{
    sock.emit('Regsteration',{'port':PORTNUM,'url':`http://localhost:${PORTNUM}`})
 })


app.get('/:documentId',(req,res)=>{
    // get document if t=it matches
    // const index = allDocuments.findIndex((doc)=>req.params.documentId === doc.docId) ;
    // const users = index === -1 ? [] :allDocuments[index].curUsers; 
    res.render('./document/document.ejs',{});
});
 





// handle connections
ioc.on('connection',(socket)=>{

    // emit the number of active users
    const deleteUser = (docId,userId)=>{
        const index = allDocuments.findIndex((doc)=>doc.id === docId );
        if (index < 0) return ;
        if (allDocuments[index].curUsers.length - 1 <= 0){
            allDocuments[index].curUsers = [];
            allDocuments.splice(index,1);
        }
        else{
            const userIndex = allDocuments[index].curUsers.findIndex((id)=>id===userId);
            allDocuments[index].curUsers.splice(userIndex,1);
            // emiting new list of users
            socket.nsp.to(socket.docId).emit('users_changed',allDocuments[index].curUsers); 
        }
    }
 
    const addUser = (docId,userId)=>{   
        console.log(Documents)
        let index = Documents.findIndex((document)=>document.id === docId)
        if (index === -1){
            Documents.push(new DocumentObject(docId,1,[userId],''))
        }
        else{
            Documents[index].curUsers.push(userId)
        }
        console.log(Documents)
        socket.join(docId);
    }


    socket.on('Regetier_client',(docId,userId)=>{
        addUser(docId,userId); 
        // emiting the users active on the current document
        index = Documents.findIndex((document)=>document.id === docId)
        socket.nsp.in(docId).emit('Users_list',Documents[index].curUsers)

    });

    socket.on('disconnect',()=>{
        console.log('user disconnected');
        // deleteUser(socket.docId,socket.userId);
    });
})

 

//listiening to connections to server
server.listen(PORTNUM);
 