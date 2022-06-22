
const  DocumentObject = function (id,curVersion,curUsers,content){
    this.id = id;
    this.curVersion = curVersion;
    this.curUsers = curUsers; 
    this.content = content;
}

module.exports = DocumentObject;
