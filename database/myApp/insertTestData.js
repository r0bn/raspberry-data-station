
 var sqlite3 = require('sqlite3').verbose();
 var db = new sqlite3.Database('database.db');
 
 db.serialize(function() {

var stmt = db.prepare("INSERT INTO Datenstationen (ID, Standort) VALUES (?, ?)");
    for (var i = 1; i <= 10; i++) {
        stmt.run(i, "Gebäude " + i);
    }
    stmt.finalize();
    
    db.all("SELECT * FROM Datenstationen", function(err, rows) {
    	console.log("TABLE Datenstationen (ID, Standort)");
        for(var i=0;i<rows.length;i++){
        	console.log(rows[i].ID + " : "+rows[i].Standort);
        }
    });
    
var stmt = db.prepare("INSERT INTO Messwerte (ID, Zeitstempel, SensorID, Messwert) VALUES (?, ?, ?, ?)");
    for (var i = 1; i <= 10; i++) {
        stmt.run(i, new Date().getTime(), i, i);
    }
    stmt.finalize();
    
    db.all("SELECT * FROM Messwerte", function(err, rows) {
    	console.log("TABLE Messwerte (ID, Zeitstempel, SensorID, Messwert)");
        for(var i=0;i<rows.length;i++){
        	console.log(rows[i].ID + " : "+rows[i].Zeitstempel+ " : "+rows[i].SensorID+" : "+rows[i].Messwert);
        }
    });

var stmt = db.prepare("INSERT INTO Sensoren (ID, DatenstationID, SensortypID) VALUES (?, ?, ?)");
    for (var i = 1; i <= 10; i++) {
        stmt.run(i, i, i);
    }
    stmt.finalize();
    
    db.all("SELECT * FROM Sensoren", function(err, rows) {
    	console.log("TABLE Sensoren (ID, DatenstationID, SensortypID)")
        for(var i=0;i<rows.length;i++){
        	console.log(rows[i].ID + " : "+rows[i].DatenstationID+ " : "+rows[i].SensortypID);
        }
    });
            
var stmt = db.prepare("INSERT INTO Sensortyp (ID, Name, Einheit) VALUES (?, ?, ?)");
    for (var i = 1; i <= 10; i++) {
        stmt.run(i, "Name "+1, "Einheit "+1);
    }
    stmt.finalize();
    
    db.all("SELECT * FROM Sensortyp", function(err, rows) {
    	console.log("TABLE Sensortyp (ID, Name, Einheit)");
        for(var i=0;i<rows.length;i++){
        	console.log(rows[i].ID + " : "+rows[i].Name+ " : "+rows[i].Einheit);
        }
    });
      
 });
 
 db.close();
