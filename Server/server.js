const express = require('express');
const http = require('http');
const {v4:uuidv4} = require('uuid');

const PORTNUM = 3000;

const app = express();
app.set('view engine','ejs');
app.use(express.static('public'));
const server = http.createServer(app);


app.get('/',(req,res)=>{
    res.render('./index/index.ejs',{name:'yousef'});
});

app.get('/:documentId',(req,res)=>{
    res.send('hello');
});
app.post('/',(req,res)=>{
    let id = uuidv4();
    res.redirect(`/${id}`);
});


server.listen(PORTNUM);
