var express = require('express');
var bodyParser = require('body-parser');
var app = express();


//app.use(bodyParser.json());
var jsonParser = bodyParser.json()

//Send all Datastations
app.get('/allDatastations', function(req, res){
	
	var sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database('database.db');
	
	var resultObj = [];
	db.each("SELECT * FROM Datastations", 
			function (err, row){
				//console.log(row);
				resultObj.push(row);
			},
			function(err, numberOfRows){
				//console.log(resultObj);
				//res.send(resultObj);
				res.send(JSON.stringify(resultObj));
			});

})

//Send all Sensortypes
app.get('/allSensortypes', function(req, res){
	
	var sqlite3 = require('sqlite3').verbose();
	var db = new sqlite3.Database('database.db');
	
	var resultObj = [];
	db.each("SELECT * FROM Sensortype", 
			function (err, row){
				//console.log(row);
				resultObj.push(row);
			},
			function(err, numberOfRows){
				//console.log(resultObj);
				//res.send(resultObj);
				res.send(JSON.stringify(resultObj));
			});

})

//Execute a received query and send the result back 
app.post('/query', jsonParser, function(req, res){
    
    
    	/*
    		Expect POST-Request with properties:
    		{
  				"Areas":[],
  				"Sensortype":"",
  				"StartDate":"",
  				"EndDate":"",
			  	"Aggregation":""
			}
    		
    	*/
    	
    	var areas, sensortype, startDate, endDate, aggregation;
    	
    	//console.log(req.body);
        if("Areas" in req.body)
        {
        	areas = req.body.Areas;
        }
        else
        {
        	console.log("Missing parameter Areas");
         	res.sendStatus(500);
         	return;
        }
        if("Sensortype" in req.body)
        {
        	sensortype = req.body.Sensortype;
        }
        else
        {
        	console.log("Missing parameter Sensortype");
         	res.sendStatus(500);
        }
        if("StartDate" in req.body)
        {
        	startDate = req.body.StartDate;
        }
        else
        {
        	console.log("Missing parameter StartDate");
         	res.sendStatus(500);
         	return;
        }
        if("EndDate" in req.body)
        {
        	endDate = req.body.EndDate;
        }
        else
        {
        	console.log("Missing parameter EndDate");
         	res.sendStatus(500);
         	return;
        }
        if("Aggregation" in req.body)
        {
        	aggregation = req.body.Aggregation;
        }
        else
        {
        	console.log("Missing parameter Aggregation");
         	res.sendStatus(500);
         	return;
        }
        
        //Get the queried values from database
        var sqlite3 = require('sqlite3').verbose();
		var db = new sqlite3.Database('database.db'); 
		
		var areaStr = "D.Area = \""+areas[0]+"\"";
		//console.log("areastring: "+ areaStr);
		for (var i = 1; i <areas.length; i++){
			areaStr = areaStr + " OR ";
			areaStr = areaStr + "D.Area = \""+areas[i]+"\"";
		}
		//console.log("areastring: "+ areaStr);
		
		var query = "SELECT D.Area, avg(M.Value) AS Average, min(M.Value)AS Minimum, "+
					"max(M.Value) AS Maximum, strftime(\"%"+aggregation+"\",M.Timestamp) AS Timestamp "+
					"FROM Data AS M "+
					"JOIN Sensors AS SE ON SE.ID = M.SensorID "+
					"JOIN Datastations AS D ON SE.DatastationID = D.ID "+
					"JOIN Sensortype AS ST ON SE.SensortypeID = ST.ID "+
					"WHERE strftime(\"%Y-%m-%d\", M.Timestamp) "+
					"BETWEEN \""+startDate+"\" "+ 
					"AND \""+endDate+"\" "+
					"AND (" + areaStr + ") "+
					"AND ST.Name = \""+sensortype+"\" "+
					"GROUP BY D.Area, "+
					"strftime(\"%"+aggregation+"\", M.Timestamp)";
		
		//console.log(query);
		
		var resultObj = [];
		db.each(query, 
				function (err, row){
					//console.log(row);
					resultObj.push(row);
				},
				function(err, numberOfRows){
					//console.log(resultObj);
					//res.send(resultObj);
					res.send(JSON.stringify(resultObj));
				});
})

//Global variables
var timestamp;
var value;

//Insert new values into the database
app.post('/insert', jsonParser, function(req, res){
         
         /*
    		Expect POST-Request with properties:
    		{
  				"DatastationID":"",
  				"Timestamp":"",
	  			"Value":"",
  				"Sensortype":"",
  				"Area":"",
  				"Unit":""
			}
    		
    		Timestamp-Format: 	YYYY-MM-DD HH:mm:ss
    		Example:			2015-04-01 00:00:00
    	*/
         
         var datastationID;
         var area;
         var unit;
         var sensortype; 
         
         //console.log(req.body);
         
         //Check if required values are available
         if("DatastationID" in req.body)
         {
         	datastationID = req.body.DatastationID;
         }
         else
         {
         	console.log("Missing parameter DatastationID");
         	res.sendStatus(500);
         	return;
         	
         }
         if("Timestamp" in req.body)
         {
         	timestamp = req.body.Timestamp;
         }
         else
         {
         	console.log("Missing parameter Timestamp");
         	res.sendStatus(500);
         	return;
         }
         if("Value" in req.body)
         {
         	value = req.body.Value;
         }
         else
         {
         	console.log("Missing parameter Value");
         	res.sendStatus(500);
         	return;
         }
         if("Sensortype" in req.body)
         {
         	sensortype = req.body.Sensortype;
         }
         else
         {
         	console.log("Missing parameter Sensortype");
         	res.sendStatus(500);
         	return;
         }
         if("Area" in req.body)
         {
         	area = req.body.Area;
         }
         else
         {
         	console.log("Missing parameter Area");
         	res.sendStatus(500);
         	return;
         }
         if("Unit" in req.body)
         {
         	unit = req.body.Unit;
         }
         else
         {
         	console.log("Missing parameter Unit");
         	res.sendStatus(500);
         	return;
         }
         
        //Insert the new values into the database
        var sqlite3 = require('sqlite3').verbose();
		var db = new sqlite3.Database('database.db');   
         
        //Insert data into database and begin with the datastation
        insertDatastation(db, datastationID, sensortype, area, unit);
        
        //Send status code 200
        res.sendStatus(200); 
})

function insertDatastation(db, datastationID, sensortype, area, unit){
	//Check if the datastation exists 
	db.get("SELECT * FROM Datastations WHERE ID=?", datastationID, function(err, row) {
		if(row == undefined){
			//console.log(row);
			db.run("INSERT INTO Datastations (ID, Area) VALUES (?, ?)", datastationID, area,
			function(err){
				console.log("Insert Datastation: "+this.lastID);
				insertSensortype(db, datastationID, sensortype, unit);
			});
		}
		else{
			insertSensortype(db, datastationID, sensortype, unit);
		}
	});
}

function insertSensortype(db, datastationID, sensortype, unit){
	//Check if sensortype exists
	db.get("SELECT * FROM Sensortype WHERE Name=?", sensortype, function(err, row) {
		if(row == undefined){
			db.get("SELECT max(ID) AS ID FROM Sensortype", function(err, row){
				if(row.ID == null) row.ID = 0;
					var ID = parseInt(row.ID)+1; 
					db.run("INSERT INTO Sensortype (ID, Name, Unit) VALUES (?, ?, ?)", ID, 
					sensortype, unit, function(err){
						console.log("Insert Sensortype: "+this.lastID)
						insertSensor(db, datastationID, this.lastID);
					});
			});	
		}
		else{
			insertSensor(db, datastationID, row.ID);
		}
	});
}

function insertSensor(db, datastationID, sensortypID){
	//Check if sensor exists
	db.get("SELECT * FROM Sensors WHERE DatastationID=? AND SensortypeID=?", datastationID, sensortypID,
		function(err, row) {
			if(row == undefined){
				db.get("SELECT max(ID) AS ID FROM Sensors", function(err, row){
					if(row.ID == null) row.ID = 0;
					var ID = parseInt(row.ID)+1; 
					db.run("INSERT INTO Sensors (ID, DatastationID, SensortypeID) VALUES (?, ?, ?)", 
					ID, datastationID, sensortypID, function(err){
						console.log("Insert sensor: "+this.lastID);
						insertMeasuredData(db, timestamp, this.lastID, value)
					});
				});	
			}
			else{
				insertMeasuredData(db, timestamp, row.ID, value)
			}		
		});
}

function insertMeasuredData(db, timestamp, sensorID, value){
	//Insert values into Table Data 
	db.get("SELECT * FROM Data WHERE Timestamp=? AND SensorID=? AND Value=?", timestamp, sensorID, value, function(err, row) {
		if(row == undefined){
			db.get("SELECT max(ID) AS ID FROM Data", function(err, row){
				if(row.ID == null) row.ID = 0; 
				var ID = parseInt(row.ID)+1; 
				db.run("INSERT INTO Data (ID, Timestamp, SensorID, Value) VALUES (?, ?, ?, ?)", 
				ID, timestamp, sensorID, value, function(err){
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
