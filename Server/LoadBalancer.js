// Imports
const express = require('express');
const { all } = require('express/lib/application');
const http = require('http');
const {Server} = require('socket.io');
const {v4:uuidv4} = require('uuid');
//server object to represent a server
const ServerObject = require('./Server object/serverobject')

//Setting up Port Number
const PORTNUM = 3000 || process.env.PORT;


//Seting up express
const app = express();
app.set('view engine','ejs');
app.use(express.static('public'));

// Creating a server and socket
const server = http.createServer(app);
const io = new Server(server,{cors:{origin:'*'}});


const ServerDocumentMaping = []


//basic routes
app.get('/',(req,res)=>{
    res.render('./index/index.ejs',{name:'yousef'});
});



// returns new Document Id and Url
app.get('/getId',(req,res)=>{
    let id = uuidv4();
    let min = 100000000
    let chosenServer = null

    // determine server to assign document to
    ServerDocumentMaping.forEach((server)=>{
        if (server.numberOfDocs < min){
            chosenServer = server
            min = server.numberOfDocs
        }
    })
    // assign it to the server
    chosenServer.numberOfDocs += 1
    chosenServer.Documents.push(id)

    //database stuff


    /*return results*/ 
    res.json({'id':id,'url':chosenServer.url});
});


app.get('/checkId',(req,res)=>{
    let exists = ServerDocumentMaping.findIndex((server)=>{
        let index = server.Documents.findIndex((document)=>{ return document === req.query.docId})
        return index !== -1 
    })
    let url = ''
    console.log(exists)
    console.log(ServerDocumentMaping)
    if (exists !== -1){
        url = ServerDocumentMaping[exists].url
    }
    else{
        // check database (more database stuff)
    }
    res.send({'url':url}) 

})

// listen to a server connection
// regester the server to the balance loader 
io.on('connection',(socket)=>{
    console.log('a server connectd')
    socket.on('Regsteration',(arg)=>{
        ServerDocumentMaping.push(new ServerObject(socket.id,arg.url,arg.port,0,[]))
    })

    
})

//listiening to connections to server
server.listen(PORTNUM);