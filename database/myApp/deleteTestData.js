var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database.db');

db.run("DELETE FROM Messwerte", function(err){if(err!=null)console.log(err)});
db.run("DELETE FROM Sensoren", function(err){if(err!=null)console.log(err)});
db.run("DELETE FROM Sensortyp", function(err){if(err!=null)console.log(err)});
db.run("DELETE FROM Datenstationen", function(err){if(err!=null)console.log(err)});

db.close();