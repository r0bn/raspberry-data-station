/*
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database.db');

db.serialize(function() {
     db.run("CREATE TABLE lorem (info TEXT)");
             
     var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
     for (var i = 0; i < 10; i++) {
     stmt.run("Ipsum " + i);
     }
     stmt.finalize();
     
     db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
             console.log(row.id + ": " + row.info);
             });
     });

db.close();
*/

var express = require('express');
var app = express();

app.get('/', function(req, res){
        res.send('Got a Get-Request');
        var sqlite3 = require('sqlite3').verbose();
        var db = new sqlite3.Database('database.db', sqlite3.OPEN_READONLY, function(error){
                                      if(error == null){
                                      console.log('Opening database succeded');
                                      }
            });
})

var server = app.listen(3000, function(){
                        
    var host = server.address().address;
    var port = server.address().port;
                        
    console.log('db.js listening at http://%s:%s', host, port);
});