const express = require('express');
const router = express.Router();
const methodOverride = require('method-override');
const fs = require('fs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


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

//check type validity
function typeValidation(type) {
    const allowedFiles = ['image', 'pdf', 'text', 'msword', 'wordprocessingml', 'ms-excel', 'spreadsheetml'];
    for (let i = 0; i < allowedFiles.length; i++) {
        if (type.indexOf(allowedFiles[i]) !== -1) {
            console.log('valid file');
            return true;
        }
    }
    console.log('not valid file');
    return false;
}

//single file upload
router.post('/upload', async function (req, res) {

    let sampleFile;
    let uploadPath;
    let mimetype;
    

    //If no file attached, send 400 rsponse
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // Retrieving the file(s) from html input field
    sampleFile = req.files.inputGroupFile02;

    //Uploading a single file
    if (!sampleFile.length) {

        //check if the file with that name already exists in DB
        const existingFiles = fs.existsSync('./public/uploads/' + sampleFile.name);
        if (existingFiles) {
            return res.send('File with such name already exists. Please, choose different name.');
        }

        uploadPath = './public/uploads/' + sampleFile.name;
        mimetype = sampleFile.mimetype;

        //if filetype is valid
        if(typeValidation(mimetype)) {
                //get the extention of a file
                const arr = sampleFile.name.split('.');
                const ext = arr[arr.length - 1];

                //preparing a new data for db
                const newUser = {
                    filename: sampleFile.name,
                    file: sampleFile,
                    extention: ext,
                    size: sampleFile.size,
                    downloaded: 0
                }

                // Place the file in a folder on server
                await sampleFile.mv(uploadPath, function (err) {
                    if (err) {
                        return res.status(500).send(err);
                    }
                });

                //Place file info into database
                await new Document(newUser)
                    .save()
                    .then(() => {
                        if (req.hostname === 'localhost') {
                            return res.redirect('http://localhost:3000')
                        } else {
                            return res.redirect(`${req.protocol}://${req.hostname}/`);
                        }
                    });
        } else {
            //if filetype is not valid
            return res.status(403).send('This type of file is not allowed.');
        }
        
    } else {

        //uploading multiple files
        for(let i = 0; i < sampleFile.length; i++) {

            //check if the file with that name already exists in DB
            const existingFiles = fs.existsSync('./public/uploads/' + sampleFile[i].name);
            if (existingFiles) {
                return res.send('File with such name already exists. Please, choose different name.');
            }

            uploadPath = './public/uploads/' + sampleFile[i].name;
            mimetype = sampleFile[i].mimetype;

            //if type is valid
            if(typeValidation(mimetype)) {
              //get the extention of a file
              const arr = sampleFile[i].name.split('.');
              const ext = arr[arr.length - 1];

              //preparing a new data for db
              const newUser = {
                  filename: sampleFile[i].name,
                  file: sampleFile[i],
                  extention: ext,
                  size: sampleFile[i].size,
                  downloaded: 0
              }

              // Place the file in a folder on server
              sampleFile[i].mv(uploadPath, function (err) {
                  if (err) {
                      return res.status(500).send(err);
                  }
              });


              //Place file info into database
              new Document(newUser)
                  .save()  
            } else {
                //if filetype is not valid
                return res.status(403).send('This type of file is not allowed.');
            }
        }
        if (req.hostname === 'localhost') {
            return res.redirect('http://localhost:3000')
        } else {
            return res.status(204).redirect(`${req.protocol}://${req.hostname}/`);
        }
    }
});

//load all uploaded files
router.get('/uploads', async (req, res) => {

    Document.find({})
        .sort({ dateOfUpload: 'desc' })
        .then(docs => {
            res.status(200).send({
                documents: docs
            })
        })

});

//Delete a Document
router.delete('/uploads/:id', (req, res) => {
    let filename;
    //delete file from server
    Document.findOne({ "_id": req.params.id })
        .then(doc => {
            filename = doc.filename;
            fs.unlink(`./public/uploads/${filename}`, (err) => {
                if (err) throw err;
                console.log(`${filename} was deleted`);
            })
        });

    //delete file from the database
    Document.deleteOne({ "_id": req.params.id })
        .then(() => {
            return res.status(200).redirect('http://localhost:3000');
        }, () => {
            return res.status(500).send();
        })
})

//Download a document
router.get('/uploads/:id', (req, res) => {
    let filename;
    Document.findOne({ "_id": req.params.id })
        .then(doc => {
            filename = doc.filename;
            res.download(`./public/uploads/${filename}`);
            doc.downloaded += 1;
            doc.save();
        });

});

//Download a document from the shared link
router.get('/uploads/:id/:timestamp', (req, res) => {
    let timestamp = req.params.timestamp;
    let currentDate = new Date().getTime();
    const diff = (currentDate - timestamp) / 60000;
    if (diff > 5) {
        res.status(500).send('Your link is not available anymore.');
    } else {
        let filename;
        Document.findOne({ "_id": req.params.id })
            .then(doc => {
                filename = doc.filename;
                res.download(`./public/uploads/${filename}`);
                doc.downloaded += 1;
                doc.save();
            });
    }


})


module.exports = router;