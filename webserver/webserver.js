var express = require('express');
var request = require('request');
var async = require('async');
var app = express();
var jsonfile= require(__dirname + "/dummydata.json");
var dataFile= require(__dirname + "/dataFile.json");
var path = require('path')
var config = require(__dirname +'/../config.json')

var server = app.listen(config.development.webserver.port, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

app.use(express.static(path.resolve(__dirname +'/../PVCWebsite')));

app.get('/init', function (req, res) {
	var jsonresponse = {};
	
	request('http://localhost:'+config.development.applicationserver.port+'/allDatastations', function (error, response, body) {
	if (!error && response.statusCode == 200) {
		var datastations = JSON.parse(body);
		jsonresponse.datastations = datastations;
		
		request('http://localhost:'+config.development.applicationserver.port+'/allSensortypes', function (error, response, body) {
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
	console.log("query:" + JSON.stringify(req.query));
	req.query.datastationID = req.query.datastationID.split(",");
	var startdates = req.query.startdate.split(",");
	var dataArray = [];
	var jsonresponse = {};
	jsonresponse.request = req.query;
	
	async.each(startdates,
		function(startdate, callback){
			req.query.startdate = startdate;
			requestData(req, function (data) {
				dataArray.push(data);
				callback()
			});
	},
		function(){
			if (dataArray.length == 1){
				jsonresponse.data = dataArray[0];
			} else  if (dataArray.length == 2){
				jsonresponse.data = mergeData(dataArray);
			}
			res.json(jsonresponse);
		}
	);
});
	
function mergeData(dataArray)
{
	var timeframes1 = dataArray[0].timeframes;
	var timeframes2 = dataArray[1].timeframes;
	
	var size = (timeframes1.length > timeframes2.length) ? timeframes1.length : timeframes2.length;
	var timeframesMerged = [];
	for (var i = 0; i< size; i++){
		var value1 = (i<timeframes1.length) ? timeframes1[i] : " - ";
		var value2 = (i<timeframes2.length) ? timeframes2[i] : " - ";
		timeframesMerged[i] = value1 +"/"+ value2;
	}
	
	var dataPerArea1 = dataArray[0].dataPerArea;
	var dataPerArea2 = dataArray[1].dataPerArea;
	var dataPerAreaMerged = dataPerArea1.concat(dataPerArea2);
	
	var dataMerged = {};
	dataMerged.title = dataArray[0].title;
	dataMerged.timeframes = timeframesMerged;
	dataMerged.dataPerArea = dataPerAreaMerged;
	return dataMerged;
}
	
var requestData = function(req, callback){
    var finerAggregation;
	var dateParts = req.query.startdate.split("/");
	var str = dateParts[2]+"-"+dateParts[1]+"-"+dateParts[0]+" 00:00:00";
	var startDate = new Date(str);
	var endDate = new Date(startDate);
	var datastationID = req.query.datastationID;   
	var sensortypeID = req.query.sensortypeID;
	sensortypeID = 1;
	datastationID = [1];
	
	switch(req.query.timespan) {
    	case "year":
			title = "Monthly ";
        	finerAggregation = "m";
        	endDate.setFullYear(startDate.getFullYear() + 1); 
        	break;
    	case "month":
			title = "Daily ";
        	finerAggregation = "d";
        	endDate.setMonth(startDate.getMonth() + 1);
        	break;
        case "week":
			title = "Daily ";
        	finerAggregation = "d";
        	endDate.setDate(startDate.getDate() + 7);
        	break;
        case "day":
			title = "Hourly ";
        	finerAggregation = "H";
        	endDate.setDate(startDate.getDate() + 1);
        	break;
	}
	
	request({
    	url: 'http://localhost:'+ config.development.applicationserver.port+'/query', //URL to hit
    	method: 'POST',
    	json: {
        	DatastationID : datastationID,
			SensortypeID : sensortypeID,
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
				var timeframes = createTimeframes(startDate, endDate, finerAggregation)
				
				var areaDictionary = createAreaDictionary(datastationID, timeframes.length);		
				areaDictionary = fillAreaDictionary (startDate, finerAggregation, areaDictionary, rows)
				
				var data = createDataResponse (title, timeframes, areaDictionary, datastationID, req.query);
				callback(data);
			}
		}
	);
};

function formatDate(date)
{
	return date.getFullYear() + "-" + pad(date.getMonth()+1) + "-" + pad(date.getDate()) + " 00:00:00";
}
	
function pad(n) {
    return (n < 10) ? ("0" + n) : n;
}
	
function createDataResponse(title, timeframes, areaDictionary, datastationID, query){
	var data = {};
	data.title = title;
	data.timeframes = timeframes;
	data.dataPerArea = [];
	datastationID.forEach(function(item) {
		var areasData = {}
		areasData.name = item;
		areasData.data = areaDictionary[item];
		data.dataPerArea.push(areasData);
		});
	return data;
}
	
function createTimeframes (startDate, endDate, finerAggregation){
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
			timestring = time.getDate() + ". " + monthNames[time.getMonth()] ;
			time.setDate(time.getDate() +1);
			break;
		case "H":
			timestring = pad(time.getHours()) + ":" + pad(time.getMinutes());
			time.setHours(time.getHours () +1);
			break;
		}
		timeframes.push(timestring);
	};
	return timeframes;
}

function createAreaDictionary(datastationID, length)
{
	var areaDictionary = []
	datastationID.forEach(function(item) {
		areaDictionary[item] = [length];
		for (var i = 0; i < length; i++){
			areaDictionary[item][i]=null;
		}
	});
	return areaDictionary;
}
	
function fillAreaDictionary (startDate, finerAggregation, areaDictionary, rows)
{
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
		areaDictionary[item.ID][difference] = dataObject;
	});
	return areaDictionary;
}	
