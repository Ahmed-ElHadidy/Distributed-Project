const  ServerObject = function (id,url,port,numberOfDocs,Documents,){
    this.id = id;
    this.url = url;
    this.port = port;
    this.numberOfDocs = numberOfDocs;
    this.Documents = Documents;
}

module.exports = ServerObject;