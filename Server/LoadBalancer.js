// Imports
const express = require('express');
const { all } = require('express/lib/application');
const http = require('http');
const {Server} = require('socket.io');
const {v4:uuidv4} = require('uuid');
//server object to represent a server
const ServerObject = require('./Server object/serverobject')

//mongoose
const mongoose = require('mongoose');
const Document = require('../models/document');
// mongoDB connection
const mongoURI = "mongodb+srv://doxegy:Tj64CVQDJF472wn2@doxcluster.bomjo.mongodb.net/DOX";
mongoose.connect(mongoURI, {useNewUrlParser:true, useUnifiedTopology: true})
    .then((result) => console.log("Connected to mongoDB") )
    .catch((err)=>console.log(err));

//Setting up Port Number
const PORTNUM = 3000 || process.env.PORT;
console.log("Connected to port: " + String(PORTNUM));


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
    const document = new Document({
        id: id,
        version:"1",
        content:"Hello from the loadbalancer",
        activeUsers:["user1","user2","user3","user4"]
    });
    // Saving document to the database 
    // 
    document.save().then((result) => {
            console.log("Added Successfully to the database!")
            console.log(result);
        }).catch((err)=> {
            console.log(err)
        });

    /*return results*/ 
    res.send({'id':id,'url':chosenServer.url});
   
   
 
    
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
        res.send({'url':url})
    }
    else{
        // check database (more database stuff)

        Document.find({id:req.query.docId})
            .then((doc)=>{
                        console.log("ARRIVED FROM DATABASE!")
                        console.log(doc);
                        let min = 100000000
                        let chosenServer = null

                        // determine server to assign document to
                        ServerDocumentMaping.forEach(async(server)=>
                            {
                                if (server.numberOfDocs < min){
                                    chosenServer = server
                                    min = server.numberOfDocs
                                }
                                chosenServer.numberOfDocs += 1
                                chosenServer.Documents.push(doc[0]['id'])
                            })
                        url = chosenServer.url;
                        console.log("url")
                        res.send({'url':url})

            })
            .catch((err)=>{
                        console.log("ERROR SAD")
                        url = "invalid"
                        res.send({'url':url})

            });
        }
    

})

// listen to a server connection
// regester the server to the balance loader 
io.on('connection',(socket)=>{
    console.log(`a server connectd ${socket.id}`)
    socket.on('Regsteration',(arg)=>{
        ServerDocumentMaping.push(new ServerObject(socket.id,arg.url,arg.port,0,[]))
    })

    socket.on('disconnect',(reason)=>{
        console.log(socket.id)
    })

    
})

//listiening to connections to server
server.listen(PORTNUM);