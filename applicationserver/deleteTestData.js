var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database.db');

db.run("DELETE FROM Data", function(err){if(err!=null)console.log(err)});
db.run("DELETE FROM Sensors", function(err){if(err!=null)console.log(err)});
db.run("DELETE FROM Sensortype", function(err){if(err!=null)console.log(err)});
db.run("DELETE FROM Datastations", function(err){if(err!=null)console.log(err)});

db.close();