// Imports
const express = require('express');
const { all } = require('express/lib/application');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
//server object to represent a server
const ServerObject = require('./Server object/serverobject')

//mongoose
const mongoose = require('mongoose');
const Document = require('../models/document');
// mongoDB connection
const mongoURI = "mongodb+srv://doxegy:Tj64CVQDJF472wn2@doxcluster.bomjo.mongodb.net/DOX";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => console.log("Connected to mongoDB"))
    .catch((err) => console.log(err));

//Setting up Port Number
const PORTNUM =  3000 
console.log("Connected to port: " + String(PORTNUM));


//Seting up express
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Creating a server and socket
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });


const ServerDocumentMaping = []


//basic routes
app.get('/', (req, res) => {
    res.render('./index/index.ejs', { name: 'yousef' });
});

app.get('/makeSure',(req,res)=>{
    let index = ServerDocumentMaping.findIndex((ser)=>{
        let docIndex = ser.Documents.findIndex((doc)=>doc === req.query.docId )
        return docIndex !== -1
    })
    if (index !== -1){
        res.send({'response':'OK'})
    }
    else{
        res.send({'response':'NO'})

    }
})

// returns new Document Id and Url
app.get('/getId', (req, res) => {
    let id = uuidv4();
    let min = 100000000
    let chosenServer = null

    // determine server to assign document to
    ServerDocumentMaping.forEach((server) => {
        if (server.numberOfDocs < min) {
            chosenServer = server
            min = server.numberOfDocs
        }
    })
    // assign it to the server
    chosenServer.numberOfDocs += 1
    chosenServer.Documents.push(id)
    console.log('new doc')
    /*return results*/
    res.send({ 'id': id, 'url': chosenServer.url });




});


app.get('/checkId', (req, res) => {
    let exists = ServerDocumentMaping.findIndex((server) => {
        let index = server.Documents.findIndex((document) => { return document === req.query.docId })
        return index !== -1
    })
    let url = ''
    console.log(exists)
    console.log(ServerDocumentMaping)
    if (exists !== -1) {
        url = ServerDocumentMaping[exists].url
        res.send({ 'url': url })
    }
    else {
        // check database (more database stuff)

        Document.find({ id: req.query.docId })
            .then((doc) => {
                console.log("ARRIVED FROM DATABASE!")
                console.log(doc);
                if (doc.length === 0) {
                    url = "invalid"
                }
                else {
                    let min = 100000000
                    let chosenServer = null

                    // determine server to assign document to
                    ServerDocumentMaping.forEach(async (server) => {
                        if (server.numberOfDocs < min) {
                            chosenServer = server
                            min = server.numberOfDocs
                        }
                        chosenServer.numberOfDocs += 1
                        chosenServer.Documents.push(doc[0]['id'])
                    })
                    url = chosenServer.url;
                }
                console.log(url)
                res.send({ 'url': url, 'firstConnect': true })

            })
            .catch((err) => {
                console.log("ERROR SAD")
                url = "invalid"
                res.send({ 'url': url })

            });
    }


})

// listen to a server connection
// regester the server to the balance loader 
io.on('connection', (socket) => {
    console.log(`a server connectd ${socket.id}`)
    socket.on('Regsteration', (arg) => {
        ServerDocumentMaping.push(new ServerObject(socket.id, arg.url, arg.port, 0, []))
    })

    // if a server fails or gets down
    socket.on('disconnect', (reason) => {
        console.log(socket.id)
    })

    // if a document is empty remove it from datastructure
    socket.on('Document_Empty', (arg) => {
        console.log('removing document from server')
        const docId = arg.docId
        const serverIndex = ServerDocumentMaping.findIndex((server) => {
            return server.id === socket.id
        })
        ServerDocumentMaping[serverIndex].numberOfDocs -= 1
        const documentIndex = ServerDocumentMaping[serverIndex].Documents.findIndex((document) => { document === docId })
        ServerDocumentMaping[serverIndex].Documents.splice(documentIndex, 1)
        console.log(ServerDocumentMaping)
    })

    //a user disconncetd from the document
    socket.on('User_disconnected', (arg) => {
        const docId = arg.docId
        const userId = arg.userId
        console.log(`${userId} disconncetd from document ${docId}`)
        console.log(ServerDocumentMaping)
    })
})

//listiening to connections to server
server.listen(PORTNUM);