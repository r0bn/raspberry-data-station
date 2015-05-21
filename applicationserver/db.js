var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var config = require(__dirname +'/../config.json')



//app.use(bodyParser.json());
var jsonParser = bodyParser.json()

//Send all Datastations
app.get('/allDatastations', function(req, res){

	/*
		Return all datastations which are in the database:
		
		{
        	"ID": (Integer),
        	"Area": (String)
    	}
		
		For example:
		{
        	"ID": 1,
        	"Area": "1/111"
    	},
    	{
        	"ID": 2,
        	"Area": "1/112"
    	}
	*/
	
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

	/*
		Return all sensortypes which are in the database
		
		{
        	"ID": (Integer),
        	"Name": (String),
        	"Unit": (String)
    	}
		
		For example:
		{
        	"ID": 1,
        	"Name": "Temperature",
        	"Unit": "Celsius"
    	},
    	{
        	"ID": 2,
        	"Name": "Pressure",
        	"Unit": "Bar"
    	}
	*/
	
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
  				"DatastationID": [String-Array],
  				"SensortypeID": (String),
  				"StartDate": (String),
  				"EndDate": (String),
			  	"Aggregation": (String)
			}
    		
    		Time-Format: 	YYYY-MM-DD HH:mm:ss
    		Example:		2015-05-06 00:00:00 (for StartDate and EndDate)
    		
    		Aggregation-Format: "Y" (Year) or "m" (Month) or "d" (Day) 
    							or H" (Hour) or "M" (Minute) or "S" (Millisecond)
    							
    		Return JSON-Object with properties:
    		{
        		"ID": (Integer),
        		"Average": (Integer),
        		"Minimum": (Integer),
        		"Maximum": (Integer),
        		"Timestamp": (String)
    		}
    		
    		for example:
    		{
        		"ID": 1,
        		"Average": 1,
        		"Minimum": 1,
        		"Maximum": 1,
        		"Timestamp": "2015-04-01 00:00:00"
    		},
    	*/
    	
    	var datastationID, sensortypeID, startDate, endDate, aggregation;
    	
    	//console.log(req.body);
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
        if("SensortypeID" in req.body)
        {
        	sensortypeID = req.body.SensortypeID;
        }
        else
        {
        	console.log("Missing parameter SensortypeID");
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
		
		var datastationsIdString = "(D.ID = \""+datastationID[0]+"\"";
		//console.log("areastring: "+ areaStr);
		for (var i = 1; i <datastationID.length; i++){
			datastationsIdString = datastationsIdString + " OR ";
			datastationsIdString = datastationsIdString + "D.ID = \""+datastationID[i]+"\"";
		}
		datastationsIdString = datastationsIdString +")";
		//console.log("datastationsIdString: "+ datastationsIdString);
		
		var query = "SELECT D.ID, avg(M.Value) AS Average, min(M.Value)AS Minimum, "+
					"max(M.Value) AS Maximum, strftime(\"%Y-%m-%d %H:%M:%S\",M.Timestamp) AS Timestamp "+
					"FROM Data AS M "+
					"JOIN Sensors AS SE ON SE.ID = M.SensorID "+
					"JOIN Datastations AS D ON SE.DatastationID = D.ID "+
					"JOIN Sensortype AS ST ON SE.SensortypeID = ST.ID "+
					"WHERE strftime(\"%Y-%m-%d %H%M%S\", M.Timestamp) "+
					"BETWEEN \""+startDate+"\" "+ 
					"AND \""+endDate+"\" "+
					"AND " + datastationsIdString + " "+
					"AND ST.ID = \""+sensortypeID+"\" "+
					"GROUP BY D.ID, "+
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
  				"DatastationID": (Integer),
  				"Timestamp": (String),
	  			"Value": (String),
  				"Sensortype": (String),
  				"Area": (String),
  				"Unit": (String)
			}
    		
    		Timestamp-Format: 	YYYY-MM-DD HH:mm:ss
    		Example:			2015-04-01 00:00:00
    		
    		Return status code 200 if insert was succesfull
    		Return status code 500 if insert failed
    	*/
         
         var datastationID;
         var area;
         var unit;
         var sensortype; 
         
         console.log(req.body);
         
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

            if(parseInt(value) === 0) {
                console.log("Parameter Value is 0");
                res.sendStatus(500);
                return;
            }
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

         inserQuery.push({
             datastationID : datastationID,
             sensortype : sensortype,
             area : area,
             unit : unit
         })
         handleQueue();
         
        //Send status code 200
        res.sendStatus(200); 
        
})

insertQuery = []
dbIsOpen = false

function handleQueue() {
    if(!dbIsOpen && insertQuery.length > 0) {
        dbIsOpen = true;
        data = insertQuery.shift() 

        //Insert the new values into the database
        var sqlite3 = require('sqlite3').verbose();
        var db = new sqlite3.Database('database.db', sqlite3.OPEN_READWRITE, function(err){
            if(err != null) {
                console.log(err);
                return;
            }
            //Insert data into database and begin with the datastation
            insertDatastation(db, data.datastationID, data.sensortype, data.area, data.unit, function(){
                db.close(function(err){
                if(err != null) {
                    console.log(err);
                }
                dbIsOpen = true;
                handleQueue();
                });
            });

        });   
    }
}

function insertDatastation(db, datastationID, sensortype, area, unit, cb){
	//Check if the datastation exists 
	db.get("SELECT * FROM Datastations WHERE ID=?", datastationID, function(err, row) {
        if(err != null) {
            console.log(err);
            cb();
            return;
        }
		if(row == undefined){
			//console.log(row);
			db.run("INSERT INTO Datastations (ID, Area) VALUES (?, ?)", datastationID, area,
			function(err){
                if(err != null) {
                    console.log(err);
                    cb();
                    return;
                }
				console.log("Insert Datastation: "+this.lastID);
				insertSensortype(db, datastationID, sensortype, unit, cb);
			});
		}
		else{
			insertSensortype(db, datastationID, sensortype, unit, cb);
		}
	});
}

function insertSensortype(db, datastationID, sensortype, unit, cb){
	//Check if sensortype exists
	db.get("SELECT * FROM Sensortype WHERE Name=?", sensortype, function(err, row) {
        if(err != null) {
            console.log(err);
            cb();
            return;
        }
		if(row == undefined){
            db.run("INSERT INTO Sensortype (Name, Unit) VALUES (?, ?)", 
            sensortype, unit, function(err){
                if(err != null) {
                    console.log(err);
                    cb();
                    return;
                }
                console.log("Insert Sensortype: "+this.lastID)
                insertSensor(db, datastationID, this.lastID,cb);
            });
		}
		else{
			insertSensor(db, datastationID, row.ID,cb);
		}
	});
}

function insertSensor(db, datastationID, sensortypID,cb){
	//Check if sensor exists
	db.get("SELECT * FROM Sensors WHERE DatastationID=? AND SensortypeID=?", datastationID, sensortypID,
		function(err, row) {
            if(err != null) {
                console.log(err);
                cb();
                return;
            }
			if(row == undefined){
                db.run("INSERT INTO Sensors (DatastationID, SensortypeID) VALUES (?, ?)", 
                datastationID, sensortypID, function(err){
                    if(err != null) {
                        console.log(err);
                        cb();
                        return;
                    }
                    console.log("Insert sensor: "+this.lastID);
                    insertMeasuredData(db, timestamp, this.lastID, value,cb)
                });
			}
			else{
				insertMeasuredData(db, timestamp, row.ID, value,cb)
			}		
		});
}

function insertMeasuredData(db, timestamp, sensorID, value, cb){

    console.log("Debug measure data: - Value: " + value + " - Sensor: " + sensorID);
	//Insert values into Table Data 
    db.run("INSERT INTO Data (Timestamp, SensorID, Value) VALUES (?, ?, ?)", timestamp, sensorID, value, function(err){
        if(err != null) {
            console.log(err);
        }
        console.log("Insert measure data: "+this.lastID + " - Value: " + value + " - Sensor: " + sensorID);
        cb()
    });
}

var server = app.listen(config.development.applicationserver.port, function(){
                        
    var host = server.address().address;
    var port = server.address().port;
                        
    console.log('db.js listening at http://%s:%s', host, port);
});
