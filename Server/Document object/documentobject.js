
const  DocumentObject = function (id,curVersion,curUsers,content,history){
    this.id = id;
    this.curVersion = curVersion;
    this.curUsers = curUsers; 
    this.content = content;
    this.history = history
}

module.exports = DocumentObject;
