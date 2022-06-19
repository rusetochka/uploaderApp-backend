const express = require('express');
const router = express.Router();
const methodOverride = require('method-override');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
//module for creating thumbnails
const thumb = require('node-thumbnail').thumb;


//connect to mongoose
mongoose.connect('mongodb://localhost/uploader-db')
    .then(() => console.log('MongoDB connected.'))
    .catch(err => console.log(err));
//Load Document Model
require('../models/Document');
const Document = mongoose.model('documents')

//Body-parser middleware
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

//Method override middleware
router.use(methodOverride('_method'));

router.get('/', function (req, res, next) {
    res.send('API is working properly');
});


//single file upload
router.post('/upload', async function (req, res) {
      
    let sampleFile;

    let mimetype;
    const allowedFiles = ['image', 'pdf', 'text', 'msword', 'wordprocessingml', 'ms-excel', 'spreadsheetml'];

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    console.log(req.files.path);
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    sampleFile = req.files.inputGroupFile02;
    mimetype = req.files.inputGroupFile02.mimetype;
    for (let i = 0; i < allowedFiles.length; i++) {
        if (mimetype.indexOf(allowedFiles[i]) !== -1) {

                //get the extention of a file
                const arr = sampleFile.name.split('.');
                const ext = arr[arr.length - 1];
                thumb({
                    source: path.join(sampleFile.name), 
                    destination: './public/uploads',
                  }).then(() => console.log('Preview created.'))
                  .catch(e => console.log(e.toString()));

                const newUser = {
                    filename: sampleFile.name,
                    file: sampleFile,
                    extention: ext,
                    size: sampleFile.size,
                    downloaded: 0
                }
                await new Document(newUser)
                    .save()
                    .then(doc => {
                        if (req.hostname === 'localhost') {
                        return res.redirect('http://localhost:3000')
                        } else {
                            return res.status(204).redirect(`${req.protocol}://${req.hostname}/`);
                        }
                    })
                
  
        }
        
    }
    return res.status(403).send('This type of file is not allowed.');

});

//load all uploaded files
router.get('/uploads', async (req, res) => {

    Document.find({})
        .sort({dateOfUpload: 'desc'})
        .then(docs => {
            res.status(200).send({
                documents: docs
            })
        })

});

//Delete a Document
router.delete('/uploads/:id', (req, res) => {
    Document.deleteOne({"_id": req.params.id})
        .then(() => {
            return res.status(200).redirect('http://localhost:3000');
        }, () => {
            return res.status(500).send();
        })
})

//Download a document
router.get('/uploads/:id', (req, res) => {
    console.log();
    Document.find({"_id": req.params.id})
    .then(result => {

        res.download(result[0].filename);
    })
})

module.exports = router;