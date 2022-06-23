const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const documentSchema = new Schema({
    id:{
        type:String,
        required:true
    },
    version: {
        type:String,
        required:true
    },
    content: {
        type:String,
        required:false
    },
    activeUsers: {
        type: [String],
        required:false
    }
}, {timestamps: true} );


const Document = mongoose.model("Document", documentSchema);
module.exports = Document;