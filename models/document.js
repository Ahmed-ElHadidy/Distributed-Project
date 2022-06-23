const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const documentSchema = new Schema({

    docTitle: {
        type:String,
        required:true
    },
    docVersion: {
        type:Number,
        required:true
    },
    docContent: {
        type:String,
        required:false
    }
}, {timestamps: true} );


const Document = mongoose.model("Document", documentSchema);
module.exports = Document;