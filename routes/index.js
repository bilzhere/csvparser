var express = require('express');
const format = require('string-format');
const { Pool, Client } = require('pg')
var router = express.Router();

var QUERY1 = "INSERT INTO test_schema.participants(drive_id,participant_id,participant_name,exam_id,test_center_code,test_center_name,lan_name,city,state,country,subject) VALUES ('{0}','{1}','{2}','{3}','{4}','{5}','{6}','{7}','{8}','{9}','{10}')"
var QUERY2 = "INSERT INTO test_schema.questions(question_id,question_type,section_id,section_name,subsection_id) VALUES ('{}','{}','{}','{}','{}')"
var QUERY3 = "INSERT INTO test_schema.responses(participant_id,question_id,response,option_id) VALUES ('{}','{}','{}','{}')"
var extracted_values = []
function generate_query1(contents){
  var lines = contents.split('\n');
  filtered_lines = lines.slice(5);
  for(var row in filtered_lines) {
      if(row % 2 == 0){
        x = filtered_lines[row].split(",").slice(0,11);
        extracted_values.push(format(QUERY1,x[0],x[1],x[2],x[3],x[4],x[5],x[6],x[7],x[8],x[9],x[10])+";\n");
      }
  }
  return;
}
function generate_query2(contents){
  var lines = contents.split('\n');
  filtered_lines = lines.slice(0,5);
  var q_row = [];
  var fl = null;
  for(var row in filtered_lines) {
      fl = filtered_lines[row].split(',').slice(11);
      q_row.push(fl);
  }
  for(var i=0; i<fl.length; i++){
    x=q_row
    extracted_values.push(format(QUERY2,x[0][i],x[1][i],x[2][i],x[3][i],x[4][i])+";\n");
  }
 return; 
}
function generate_query3(contents){
  var lines = contents.split('\n');
  q_ids = lines[0].split(',').slice(12); //ALL QUESTION
  var q_row = [];
  var fl = null;
  var fl_lines = lines.slice(5);
  for(var i = 0;  i<fl_lines.length;i+=2) {
      var response =  fl_lines[i].split(',').slice(12);
      var option =  fl_lines[i+1].split(',').slice(12);
      var part_id = fl_lines[i].split(',')[1];
      for(var j=0; j<response.length;j++){
          //console.log(format(QUERY3,part_id,q_ids[j],response[j],option[j]))
          extracted_values.push(format(QUERY3,part_id,q_ids[j],response[j],option[j])+";\n");
      }
  }
 return; 
}
      
               
/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/csbuploads', function(req,res,next){
  let sampleFile = req.files.myFile;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('./bin/'+sampleFile.name, function(err) {
    console.log(err);
    
    if (err)
      return res.status(500).send(err);

    const csv = require('csv-parser')
      const fs = require('fs')
     
      const results = [];
      fs.readFile('./bin/'+sampleFile.name, 'utf8', function(err, contents) {
          //console.log(contents.split('\n')[0]);
          generate_query1(contents)
          generate_query2(contents);
          generate_query3(contents);
          const pool = new Pool({
            user: req.body.user,
            host: req.body.connection,
            database: req.body.name,
            password: req.body.password,
            port: req.body.port,
          })
          var allqueries = '';
          for(query in extracted_values){
            allqueries += extracted_values[query].replace('\n','');
          }
          fs.writeFile('./bin/output',allqueries,function(err){
            console.log(err);
          });
          //console.log(allqueries)
          pool.query(allqueries, (errr, resr) => {
            console.log(errr);
            
            if(!errr){
              res.status(200).send(errr)
            } 
            pool.end()
          }) 
      });  
  });
});
module.exports = router;
