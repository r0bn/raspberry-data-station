var express = require('express');
var app = express();
var jsonfile= require("./hello.json");

var server = app.listen(7085, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

app.use(express.static('../PVCWebsite'));


// respond with "Hello World!" on the homepage
app.get('/data', function (req, res) {
  //res.send('hallo.json');
    res.json(jsonfile);
});

