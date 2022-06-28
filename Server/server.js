// Imports
const express = require('express');
const { all } = require('express/lib/application');
const http = require('http');
const { Server } = require('socket.io');
const { io } = require('socket.io-client');
const mongoose = require('mongoose');
const Delta = require('quill-delta')
const Document = require('../models/document');
const cors = require('cors')
const fetch = require('node-fetch')
    //Setting up Port Number
const PORTNUM = parseInt(process.argv[2]) || 3001;
// Document Object to reprsent Document
const DocumentObject = require('./Document object/documentobject')




//Seting up express
const app = express();
app.set('view engine', 'ejs');
app.use(cors())
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
const sock = io("http://3.64.126.0:3000")
    //regester the server on connection
sock.on('connect', () => {
    sock.emit('Regsteration', { 'port': PORTNUM, 'url': `http://3.64.126.0:${PORTNUM}` })
})


// if load balancer failed
sock.on('disconnect', () => {
    console.log('load balancer disconnected')
})



app.get('/RegesterDocument', async(req, res) => {
    let doc = await Document.find({ id: req.query.docId })
    Documents.push(new DocumentObject(req.query.docId, 1, [], new Delta(doc[0]['content'].ops), []))
    console.log('respond to open')
    console.log(Documents)
    res.send({ 'data': 'OK' })
})

app.get('/:documentId', (req, res) => {
    // get document if t=it matches
    // const index = allDocuments.findIndex((doc)=>req.params.documentId === doc.docId) ;
    // const users = index === -1 ? [] :allDocuments[index].curUsers; 
    res.render('./document/document.ejs', {});
});


app.get('/down', (req, res) => {
    res.send('NO')
})



// handle connections
ioc.on('connection', (socket) => {
    socket.connected = true
    const deleteUser = (docId, userId) => {
        if (socket.connected === true)
            return
        const index = Documents.findIndex((doc) => doc.id === docId);
        if (index < 0)
            return
            //remove from database
        Document.findOneAndUpdate({ id: docId }, { "$pull": { activeUsers: userId } }).exec()
        if (Documents[index].curUsers.length - 1 === 0) {
            console.log('document is empty should remove it')
            Documents[index].curUsers = [];
            Documents.splice(index, 1);
            sock.emit('Document_Empty', { 'docId': docId })
        } else {
            const userIndex = Documents[index].curUsers.findIndex((id) => id === userId);
            Documents[index].curUsers.splice(userIndex, 1);
            // emiting new list of users
            socket.nsp.to(socket.docId).emit('Users_list', Documents[index].curUsers);
        }
    }

    const addUser = async(docId, userId) => {
        let index = Documents.findIndex((document) => document.id === docId)
        if (index === -1) {
            let res = await fetch(`http://3.64.126.0:3000/makeSure?docId=${docId}`)
            let data = await res.json()
            if (data.response != 'OK') {
                socket.emit('invalidDoc')
                return -1
            }
            const delta = new Delta().insert('\n')
            Documents.push(new DocumentObject(docId, 1, [userId], delta, []))
                //save in dataBase
            const document = new Document({
                id: docId,
                version: 1,
                content: delta,
                activeUsers: [userId]
            });
            // Saving document to the database 
            document.save().then((result) => {
                console.log("Added Successfully to the database!")
                console.log(result);
            }).catch((err) => {
                console.log(err)
            });
        } else {
            Documents[index].curUsers.push(userId)
            console.log('updated database')

            Document.findOneAndUpdate({ id: docId }, { "$push": { activeUsers: userId } }).exec()

        }
        socket.join(docId);
        socket.docId = docId
        socket.userId = userId
    }


    socket.on('Regetier_client', async(docId, userId) => {

        let res = await addUser(docId, userId);
        if (res === -1) {
            return
        }
        // emiting the users active on the current document
        index = Documents.findIndex((document) => document.id === docId)
        socket.nsp.in(docId).emit('Users_list', Documents[index].curUsers)
            //send content to user
        socket.emit('DocContent', Documents[index].curVersion, Documents[index].content)
    });


    socket.on('Text_Update', (docId, userId, docVersion, newDelta) => {
            console.log(newDelta)
            const index = Documents.findIndex((document) => document.id === docId)
            const newDeltaConv = new Delta(newDelta.ops)
            if (docVersion === Documents[index].curVersion) {
                //keep track of history
                console.log('index')
                console.log(index)
                Documents[index].history.push({ 'currentState': Documents[index].content, 'newDelta': newDeltaConv, 'version': Documents[index].curVersion })
                Documents[index].content = Documents[index].content.compose(newDeltaConv)
                Documents[index].curVersion += 1
                Document.findOneAndUpdate({ id: docId }, { content: Documents[index].content }).exec()
                socket.nsp.in(docId).emit('Update_DocContent', Documents[index].curVersion, Documents[index].content)
            } else {
                let counter = docVersion
                const histIndex = Documents[index].history.findIndex((doc) => doc.version === counter)
                const doc = Documents[index].history[histIndex]

                const updatedOp = doc.newDelta.transform(newDeltaConv, true)
                let newRule = doc.newDelta.compose(updatedOp)
                Documents[index].history[histIndex].newDelta = newRule
                let newState = doc.currentState.compose(newRule)
                if (counter + 1 === Documents[index].curVersion) {
                    Documents[index].content = newState
                    socket.nsp.in(docId).emit('Update_DocContent', Documents[index].curVersion, Documents[index].content)
                } else {
                    counter += 1
                    while (counter < Documents[index].curVersion) {

                        let histIndexInLoop = Documents[index].history.findIndex((doc) => doc.version === counter)
                        let docInLopp = Documents[index].history[histIndexInLoop]
                        docInLopp.currentState = newState

                        newRule = newDeltaConv.transform(docInLopp.newDelta, false)
                        docInLopp.newDelta = newRule
                        newState = docInLopp.currentState.compose(newRule)
                        if (counter + 1 === Documents[index].curVersion) {
                            Documents[index].content = newState
                            socket.nsp.in(docId).emit('Update_DocContent', Documents[index].curVersion, Documents[index].content)

                        }
                        counter += 1
                    }
                }
            }
            // Documents[index].content = newDoc
            // 
        })
        //fires when user disconnects OR I discoonectd from user
    socket.on('error', () => {
        console.log('error')
    })
    socket.on('Re-connection', () => {
        socket.connected = true
    })
    socket.on('disconnect', () => {
        console.log('user disconnected');
        // deleteUser(socket.docId,socket.userId);
        sock.emit('User_disconnected', { 'docId': socket.docId, 'userId': socket.userId })
        socket.connected = false
        setTimeout(() => { deleteUser(socket.docId, socket.userId) }, 60000)



    });
})



//listiening to connections to server
server.listen(PORTNUM);