
 var sqlite3 = require('sqlite3').verbose();
 var db = new sqlite3.Database('database.db');
 
 db.serialize(function() {

var stmt = db.prepare("INSERT INTO Datastations (ID, Area) VALUES (?, ?)");
    var area = "1/11";
    for (var i = 1; i <= 2; i++) {
        stmt.run(i, area+i);
    }
    stmt.finalize();
    
    db.all("SELECT * FROM Datastations", function(err, rows) {
    	console.log("TABLE Datastations (ID, Area)");
        for(var i=0;i<rows.length;i++){
        	console.log(rows[i].ID + " : "+rows[i].Area);
        }
    });
    
var stmt = db.prepare("INSERT INTO Data (ID, Timestamp, SensorID, Value) VALUES (?, ?, ?, ?)");
    var time = "2015-04-0";
    var sensorID = 1;
    for (var i = 1; i < 10; i++) {
        stmt.run(i, "2015-04-0"+i+" 00:00:00", sensorID, i);
        if(i%5 == 0){
        	sensorID = 2;
        }
    }
    stmt.finalize();
    
    db.all("SELECT * FROM Data", function(err, rows) {
    	console.log("TABLE Data (ID, Timestamp, SensorID, Value)");
        for(var i=0;i<rows.length;i++){
        	console.log(rows[i].ID + " : "+rows[i].Timestamp+ " : "+rows[i].SensorID+" : "+rows[i].Value);
        }
    });

var stmt = db.prepare("INSERT INTO Sensors (ID, DatastationID, SensortypeID) VALUES (?, ?, ?)");
    
    for (var i = 1; i <= 2; i++) {
        stmt.run(i, i, i);
    }
    stmt.finalize();
    
    db.all("SELECT * FROM Sensors", function(err, rows) {
    	console.log("TABLE Sensors (ID, DatastationID, SensortypeID)")
        for(var i=0;i<rows.length;i++){
        	console.log(rows[i].ID + " : "+rows[i].DatastationID+ " : "+rows[i].SensortypeID);
        }
    });
            
var stmt = db.prepare("INSERT INTO Sensortype (ID, Name, Unit) VALUES (?, ?, ?)");
    
	stmt.run(1, "Temperature", "Celsius");
	stmt.run(2, "Pressure", "Bar");
    
    stmt.finalize();
    
    db.all("SELECT * FROM Sensortype", function(err, rows) {
    	console.log("TABLE Sensortype (ID, Name, Unit)");
        for(var i=0;i<rows.length;i++){
        	console.log(rows[i].ID + " : "+rows[i].Name+ " : "+rows[i].Unit);
        }
    });
      
 });
 
 db.close();
