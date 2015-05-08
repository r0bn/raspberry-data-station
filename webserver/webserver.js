var express = require('express');
var app = express();
var jsonfile= require(__dirname + "/dummydata.json");
var dataFile= require(__dirname + "/dataFile.json");
var path = require('path')

var server = app.listen(7085, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

app.use(express.static(path.resolve(__dirname +'/../PVCWebsite')));

app.get('/init', function (req, res) {
	
	var request = require('request');
	var jsonresponse = {};
	
	request('http://localhost:3000/allDatastations', function (error, response, body) {
	if (!error && response.statusCode == 200) {
		var datastations = JSON.parse(body);
		jsonresponse.datastations = datastations;
		
		request('http://localhost:3000/allSensortypes', function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var sensortypes = JSON.parse(body);
			jsonresponse.sensortypes = sensortypes;
			
			res.json(jsonresponse);
		}
	});
	}
	});
});


app.get('/data', function (req, res) {
	
	console.log("sensortype: " + req.query.sensortype);	
	console.log("areas: " + req.query.areas);
	console.log("aggregation: " + req.query.aggregation);
	console.log("startdate: " + req.query.startdate+"\n");
	
	var finerAggregation;
	var dateParts = req.query.startdate.split("/");
	var str = dateParts[2]+"-"+dateParts[1]+"-"+dateParts[0]+" 00:00:00";
	var startDate = new Date(str);
	var endDate = new Date(startDate);
	req.query.areas = req.query.areas.split(",");
	var areas = req.query.areas;   
	var sensortype = req.query.sensortype;
	
	switch(req.query.aggregation) {
    	case "year":
			title = "Monthly "+ sensortype;
        	finerAggregation = "m";
        	endDate.setFullYear(startDate.getFullYear() + 1); 
        	break;
    	case "month":
			title = "Daily "+ sensortype;
        	finerAggregation = "d";
        	endDate.setMonth(startDate.getMonth() + 1);
        	break;
        case "week":
			title = "Daily "+sensortype;
        	finerAggregation = "d";
        	endDate.setDate(startDate.getDate() + 7);
        	break;
        case "day":
			title = "Hourly "+sensortype;
        	finerAggregation = "H";
        	endDate.setDate(startDate.getDate() + 1);
        	break;
	}
	
	console.log("startDate: " + startDate);
	console.log("endDate: " + endDate);
	console.log("finerAggregation: " + finerAggregation);

	var request = require('request');
	request({
    	url: 'http://localhost:3000/query', //URL to hit
    	method: 'POST',
    	json: {
        	Areas : areas,
			Sensortype : sensortype,
			StartDate : startDate,
			EndDate : endDate,
			Aggregation : finerAggregation
    	}
	}, function(error, response, body){
    		if(error) {
        		console.log(error);
    		} else {
				
        		console.log(response.statusCode, body);
				
				var rows = body;
				
				console.log("starttime: " + startDate);
				console.log("endtime: " + endDate);
				var timeframes = [];
				var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
				for (var time = new Date (startDate); time < endDate; ) {
					var timestring = "";
					switch(finerAggregation) {
					case "m":
						timestring = monthNames[time.getMonth()] + " " + time.getFullYear();
						time.setMonth(time.getMonth() +1);
						break;
					case "d":
						timestring = time.getDate() + ". " + monthNames[time.getMonth()] + " " + time.getFullYear();
						time.setDate(time.getDate() +1);
						break;
					case "H":
						timestring = time.getHours() + ":" + time.getMinutes() + " " + time.getDate() + ". " + monthNames[time.getMonth()] + " " + time.getFullYear();
						time.setHours(time.getHours () +1);
						break;
					}
					timeframes.push(timestring);
				};
				
				var areaDictionary = [];
				var length = timeframes.length;
				areas.forEach(function(item) {
					areaDictionary[item] = [length];
					for (var i = 0; i < length; i++){
						areaDictionary[item][i]=null;
					}
				});
				
				rows.forEach(function(item) {
					var difference = 0;
					switch(finerAggregation) {
					case "m": 
						difference =  new Date(item.Timestamp).getMonth() - (startDate.getMonth());
						difference = (difference < 0)?difference + 12 : difference;
						break;
					case "d":
						difference =  new Date(item.Timestamp).getDate() - startDate.getDate();
						var monthDays = new Date(startDate.getFullYear(), startDate.getMonth()+1, 0).getDate();
						difference = (difference < 0)?difference + monthDays : difference;
						break;
					case "H":
						difference =  new Date(item.Timestamp).getHours() - startDate.getHours();
						difference = (difference < 0)?difference + 24 : difference;
						break;
					}
					
					var dataObject = {};
					dataObject.y = Number(item["Average"].toPrecision(4));
					dataObject.low = Number(item["Minimum"].toPrecision(4));
					dataObject.high = Number(item["Maximum"].toPrecision(4));
					areaDictionary[item.Area][difference] = dataObject;
				});
				
				var data = {};
				data.title = title;
				data.timeframes = timeframes;
				data.dataPerArea = [];
				areas.forEach(function(item) {
					var areasData = {}
					areasData.name = item;
					areasData.data = areaDictionary[item];
					data.dataPerArea.push(areasData);
				});
				var jsonresponse = {};
				jsonresponse.request = req.query;
				jsonresponse.data = data;
				res.json(jsonresponse);
			}
		});
		
	});				