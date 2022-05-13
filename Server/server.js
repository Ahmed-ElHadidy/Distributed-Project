// Imports
const express = require('express');
const { all } = require('express/lib/application');
const http = require('http');
const {Server} = require('socket.io');
const {v4:uuidv4} = require('uuid');
const Document = require('./Document object/Document')

//Setting up Port Number
const PORTNUM = 3000 || process.env.PORT;

//Seting up express
const app = express();
app.set('view engine','ejs');
app.use(express.static('public'));

// Creating a server and socket
const server = http.createServer(app);
const io = new Server(server,{cors:{origin:'*'}});


const allDocuments = []
 
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

    const deleteUser = (docId,userId)=>{
        const index = allDocuments.findIndex((doc)=>doc.id === docId );
        if (allDocuments[index].curUsers.length - 1 <= 0){
            allDocuments[index].curUsers = [];
            allDocuments.splice(index,1);
        }
        else{
            const userIndex = allDocuments[index].curUsers.findIndex((id)=>id===userId);
            allDocuments[index].curUsers.splice(userIndex,1);
            socket.emit('users_changed',allDocuments[index].curUsers);
        }
    }
 
    const addUser = (docId,userId)=>{
        //query my list for document first if it is there connect  to it else 
        // query database  for document if its there retrive it and add it to list else
        // create an new entry in database and  new entry in list for the new document

        const index = allDocuments.findIndex((doc)=>doc.id === docId);    
        if (index === -1){
        allDocuments.push(new Document(docId,0,[userId],[userId],''))
        }
        else{
            allDocuments[index].curUsers.push(userId);
            allDocuments[index].allUsers.push(userId);
        }
        socket.docId = docId;
        socket.userId = userId; 
        console.log(allDocuments);
        socket.join(docId);
    }

    
    socket.on('send_id',(docId,userId)=>{
        addUser(docId,socket.id); // change it to usersid
    });

    socket.on('disconnect',()=>{
        console.log('user disconnected');
        deleteUser(socket.docId,socket.userId);
    });
})

 

//listiening to connections to server
server.listen(PORTNUM);
 