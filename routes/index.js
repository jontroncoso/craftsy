var express = require('express'),
  fs = require('fs'),
  http = require('http');

String.prototype.stripSlashes = function(){
  return this.replace(/\\(.)/mg, "$1");
}

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/metrics', function(req, res, next) {

  //res.attachment('metrics.json');
  var file = fs.createWriteStream("tmp/metric.json");
  var url = 'http://s3.amazonaws.com/craftsy-yak/metrics.json';

  http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close();  // close() is async, call cb after close completes.
      //res.json(file.readFile());
      fs.readFile('tmp/metric.json', function read(err, data) {
        if (err) {
          throw err;
        }
        console.log(data.toString('utf8'));
        res.json(JSON.parse(data.toString('utf8')));
      });
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });

  //// transfer the file
  //http.get('http://s3.amazonaws.com/craftsy-yak/metrics.json')
  //  .pipe(file);
  //res.json();
});

module.exports = router;
