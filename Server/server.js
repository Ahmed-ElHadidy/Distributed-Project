// Imports
const express = require('express');
const { all } = require('express/lib/application');
const http = require('http');
const { Server } = require('socket.io');
const { io } = require('socket.io-client');
const mongoose = require('mongoose');
const Document = require('../models/document');
//Setting up Port Number
const PORTNUM = 3001 || process.env.PORT;
console.log("Connected to port: " + String(PORTNUM));
// Document Object to reprsent Document
const DocumentObject = require('./Document object/documentobject')




//Seting up express
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));



// mongoDB connection
const mongoURI = "mongodb+srv://doxegy:Tj64CVQDJF472wn2@doxcluster.bomjo.mongodb.net/DOX";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log("Connected to mongoDB"))
    .catch((err) => console.log(err));




// Creating a server and socket
const server = http.createServer(app);
const ioc = new Server(server, { cors: { origin: '*' } });


//All Documents that a server hosts
const Documents = []


// server as a client
//connect server to load balancer
const sock = io("http://localhost:3000")
//regester the server on connection
sock.on('connect', () => {
    sock.emit('Regsteration', { 'port': PORTNUM, 'url': `http://localhost:${PORTNUM}` })
})

sock.on('disconnect', () => {
    console.log('server disconnected')
})


app.get('/RegesterDocument', (req, res) => {
    console.log('Requested a document')
    Documents.push(new DocumentObject(req.query.docId, 1, [], ''))
    console.log(Documents)
    res.send({ 'data': 'OK' })
})

app.get('/:documentId', (req, res) => {
    // get document if t=it matches
    // const index = allDocuments.findIndex((doc)=>req.params.documentId === doc.docId) ;
    // const users = index === -1 ? [] :allDocuments[index].curUsers; 
    res.render('./document/document.ejs', {});
});






// handle connections
ioc.on('connection', (socket) => {

    // emit the number of active users
    const deleteUser = (docId, userId) => {
        const index = Documents.findIndex((doc) => doc.id === docId);
        console.log(index)
        if (index < 0)
            return
        //remove from database
        Document.findOneAndUpdate({ id: docId }, { "$pull": { activeUsers: userId } }).exec()
        if (Documents[index].curUsers.length-1 === 0) {
            console.log('document is empty should remove it')
            Documents[index].curUsers = [];
            Documents.splice(index, 1);
            sock.emit('Document_Empty', { 'docId': docId })
        }
        else {
            const userIndex = Documents[index].curUsers.findIndex((id) => id === userId);
            Documents[index].curUsers.splice(userIndex, 1);
            // emiting new list of users
            socket.nsp.to(socket.docId).emit('Users_list', Documents[index].curUsers);
        }
    }

    const addUser = async (docId, userId) => {
        let index = Documents.findIndex((document) => document.id === docId)
        if (index === -1) {
            Documents.push(new DocumentObject(docId, 1, [userId], ''))
            //save in dataBase
            const document = new Document({
                id: docId,
                version: "1",
                content: "",
                activeUsers: [userId]
            });
            // Saving document to the database 
            document.save().then((result) => {
                console.log("Added Successfully to the database!")
                console.log(result);
            }).catch((err) => {
                console.log(err)
            });
        }
        else {
            Documents[index].curUsers.push(userId)
            console.log('updated database')

            Document.findOneAndUpdate({ id: docId }, { "$push": { activeUsers: userId } }).exec()
        }
        console.log(Documents)
        socket.join(docId);
        socket.docId = docId
        socket.userId = userId
    }


    socket.on('Regetier_client', (docId, userId) => {
        addUser(docId, userId);


        // emiting the users active on the current document
        index = Documents.findIndex((document) => document.id === docId)
        socket.nsp.in(docId).emit('Users_list', Documents[index].curUsers)

    });

    //fires when user disconnects OR I discoonectd from user
    socket.on('disconnect', () => {
        console.log('user disconnected');
        // deleteUser(socket.docId,socket.userId);
        sock.emit('User_disconnected', { 'docId': socket.docId, 'userId': socket.userId })
        deleteUser(socket.docId, socket.userId)


    });
})



//listiening to connections to server
server.listen(PORTNUM);
