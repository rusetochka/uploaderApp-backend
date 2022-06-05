const express = require('express');
const router = express.Router();
const fs = require('fs');

router.get('/', function (req, res, next) {
    res.send('API is working properly');
});

//single file upload
router.post('/upload', function (req, res) {
    let sampleFile;
    let uploadPath;
    let mimetype;
    const allowedFiles = ['image', 'pdf', 'text', 'msword', 'wordprocessingml', 'ms-excel', 'spreadsheetml'];

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    sampleFile = req.files.inputGroupFile02;
    mimetype = req.files.inputGroupFile02.mimetype;
    console.log(mimetype);
    console.log(req.files.inputGroupFile02.size);
    for (let i = 0; i < allowedFiles.length; i++) {
        if (mimetype.indexOf(allowedFiles[i]) !== -1) {
            uploadPath = './public/uploads/' + sampleFile.name;
            
            // Use the mv() method to place the file somewhere on server
            return sampleFile.mv(uploadPath, function (err) {
                if (err) {
                    return res.status(500).send(err);
                }
                if (req.hostname === 'localhost') {
                    console.log('enter condition');
                    return res.redirect('http://localhost:3000');
                    
                } else {
                    return res.status(204).redirect(`${req.protocol}://${req.hostname}/`);
                }
                
            });
  
        }
        
    }
    return res.status(403).send('This type of file is not allowed.');

});

//load all uploaded files
router.get('/uploads', (req, res) => {

    const dirPath = './public/uploads';
    let fileNames = [];
    //passsing dirPath and callback function
    fs.readdir(dirPath, function (err, files) {
        //handling error
        if (err) {
            console.log('Unable to scan directory: ' + err);
            return res.status(500).send(err);
        }
        return res.status(200).send(files);
    });

});

router.get('/uploads/:name/:extention', (req, res) => {
    console.log('Entering get request');
    res.download(`./public/uploads/${req.params.name}.${req.params.extention}`);
})

module.exports = router;