const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', function(req, res, next) {
    res.send('API is working properly');
});

//single file upload
router.post('/upload', function(req, res) {
    let sampleFile;
    let uploadPath;
  
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
  
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    sampleFile = req.files.inputGroupFile02;
    uploadPath = './public/uploads/' + sampleFile.name;
  
    // Use the mv() method to place the file somewhere on server
    sampleFile.mv(uploadPath, function(err) {
      if (err) {
        return res.status(500).send(err);
      }
      console.log(res.send('File uploaded!'));
      
    });
  });

router.post('/uploud-multi', (req, res) => {
    let data = [];
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
      }
    
    _.forEach(_.keysIn(req.files.documents), (key) => {
        let doc = req.files.documents[key];
        
        //move file to uploads directory
        document.mv('./uploads/' + document.name);

        //push file details
        data.push({
            name: document.name,
            mimetype: document.mimetype,
            size: document.size
        }); 
    });

    //return response
    res.send({
        status: true,
        message: 'Files are uploaded',
        data: data
    });
})
module.exports = router;