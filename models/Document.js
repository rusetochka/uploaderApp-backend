const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const DocumentSchema = new Schema({
    filename: {
        type: String,
        required: true
    },
    file: {
        type: Object,
        required: true
    },
    extention: {
        type: String,
        required: true
    },
    dateOfUpload: {
        type: Date,
        default: Date.now
    }, 
    size: {
        type: Number
    }
});

mongoose.model('documents', DocumentSchema)