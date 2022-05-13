
const  Document = function (id,curVersion,allUsers,curUsers,text){
    this.id = id;
    this.curVersion = curVersion;
    this.allUsers = allUsers;
    this.curUsers = curUsers; 
    this.text = text;
}

module.exports = Document;
