var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/csbuploads', function(req,res,next){
  console.log('body '+ req.body.connection);
  let sampleFile = req.files.myFile;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('./bin/'+sampleFile.name, function(err) {
    console.log(err);
    
    if (err)
      return res.status(500).send(err);

      const csv = require('csv-parser')
      const fs = require('fs')
      const results = [];
      fs.createReadStream('./bin/'+sampleFile.name)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          console.log(results);
          //console.log(results[8]);
          var question = [];
          for(var i=1; i<=results.length;i++){
            if(i<5){
                //console.log(results[i]);
                Object.keys(results[i]).forEach(key=>{
                  //console.log(`${key} : ${results[i][key]}`);
                  if(i==1){
                    question.push(
                      {
                        key : {
                          'section_id' : results[i][key]
                        } 
                      }
                    )
                }
                if(i==2){
                  Object.keys(question).forEach(key1=>{
                      if(key1==key){
                        
                      }
                  });
                }
               });  
            }
          }
        });
  });
});
module.exports = router;
