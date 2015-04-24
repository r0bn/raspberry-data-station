var express = require('express');
var bodyParser = require('body-parser');
var app = express();


//app.use(bodyParser.json());
var jsonParser = bodyParser.json()

app.get('/get', function(req, res){
        res.send('Got a Get-Request');
        
})

//Global variables
var Zeitstempel;
var Messwert;

app.post('/insert', jsonParser, function(req, res){
         
         var DatenstationID;
         var Sensortyp; 
         
         //console.log(req.body);
         
         //Check if required values are available
         if("DatenstationID" in req.body)
         {
         	DatenstationID = req.body.DatenstationID;
         }
         else
         {
         	console.log("Fehlender Parameter DatenstationID");
         	res.sendStatus(500);
         }
         if("Zeitstempel" in req.body)
         {
         	Zeitstempel = req.body.Zeitstempel;
         }
         else
         {
         	console.log("Fehlender Parameter Zeitstempel");
         	res.sendStatus(500);
         }
         if("Messwert" in req.body)
         {
         	Messwert = req.body.Messwert;
         	//console.log(Messwert);
         }
         else
         {
         	console.log("Fehlender Parameter Messwert");
         	res.sendStatus(500);
         }
         // if("SensorID" in req.body)
//          {
//          	SensorID = req.body.SensorID;
//          }
//          else
//          {
//          	console.log("Fehlender Parameter SensorID");
//          	res.sendStatus(500);
//          }
         if("Sensortyp" in req.body)
         {
         	Sensortyp = req.body.Sensortyp;
         }
         else
         {
         	console.log("Fehlender Parameter Sensortyp");
         	res.sendStatus(500);
         }
         
        //Insert the new values into the database
        var sqlite3 = require('sqlite3').verbose();
		var db = new sqlite3.Database('database.db');   
         
        //Insert data into database and begin with the datastation
        insertDatastation(db, DatenstationID, Sensortyp);
        
        //Send status code 200
        res.sendStatus(200); 
})

function insertDatastation(db, DatenstationID, Sensortyp){
	//Check if the datastation exists 
	db.get("SELECT * FROM Datenstationen WHERE ID=?", DatenstationID, function(err, row) {
		if(row == undefined){
			//console.log(row);
			db.run("INSERT INTO Datenstationen (ID, Standort) VALUES (?, ?)", DatenstationID, "Hft",
			function(err){
				console.log("Insert datastation: "+this.lastID);
				insertSensortype(db, DatenstationID, Sensortyp);
			});
		}
		else{
			insertSensortype(db, DatenstationID, Sensortyp);
		}
	});
}

function insertSensortype(db, DatenstationID, Sensortyp){
	//Check if sensortype exists
	db.get("SELECT * FROM Sensortyp WHERE Name=?", Sensortyp, function(err, row) {
		if(row == undefined){
			db.get("SELECT max(ID) AS ID FROM Sensortyp", function(err, row){
				if(row.ID == null) row.ID = 0;
					var ID = parseInt(row.ID)+1; 
					db.run("INSERT INTO Sensortyp (ID, Name, Einheit) VALUES (?, ?, ?)", ID, 
					Sensortyp, "Einheit", function(err){
						console.log("Insert sensortype: "+this.lastID)
						insertSensor(db, DatenstationID, this.lastID);
					});
			});	
		}
		else{
			insertSensor(db, DatenstationID, row.ID);
		}
	});
}

function insertSensor(db, DatenstationID, SensortypID){
	//Check if sensor exists
	db.get("SELECT * FROM Sensoren WHERE DatenstationID=? AND SensortypID=?", DatenstationID, SensortypID,
		function(err, row) {
			if(row == undefined){
				db.get("SELECT max(ID) AS ID FROM Sensoren", function(err, row){
					if(row.ID == null) row.ID = 0;
					var ID = parseInt(row.ID)+1; 
					db.run("INSERT INTO Sensoren (ID, DatenstationID, SensortypID) VALUES (?, ?, ?)", 
					ID, DatenstationID, SensortypID, function(err){
						console.log("Insert sensor: "+this.lastID);
						insertMeasuredData(db, Zeitstempel, this.lastID, Messwert)
					});
				});	
			}
			else{
				insertMeasuredData(db, Zeitstempel, row.ID, Messwert)
			}		
		});
}

function insertMeasuredData(db, Zeitstempel, SensorID, Messwert){
	//Insert values into Table Messwerte 
	db.get("SELECT * FROM Messwerte WHERE Zeitstempel=? AND SensorID=? AND Messwert=?", Zeitstempel, SensorID, Messwert, function(err, row) {
		if(row == undefined){
			db.get("SELECT max(ID) AS ID FROM Messwerte", function(err, row){
				if(row.ID == null) row.ID = 0; 
				var ID = parseInt(row.ID)+1; 
				db.run("INSERT INTO Messwerte (ID, Zeitstempel, SensorID, Messwert) VALUES (?, ?, ?, ?)", 
				ID, Zeitstempel, SensorID, Messwert, function(err){
					console.log("Insert measure data: "+this.lastID);
				});
			});	
		}
	}); 
}

var server = app.listen(3000, function(){
                        
    var host = server.address().address;
    var port = server.address().port;
                        
    console.log('db.js listening at http://%s:%s', host, port);
});
