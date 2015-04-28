var express = require('express');
var app = express();
var jsonfile= require(__dirname + "/dummydata.json");
var path = require('path')

var server = app.listen(7085, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});

app.use(express.static(path.resolve(__dirname +'/../PVCWebsite')));


app.get('/data', function (req, res) {
	
	console.log("sensortype: " + req.query.sensortype);	
	console.log("areas: " + req.query.areas);
	console.log("aggregation: " + req.query.aggregation);
	console.log("startdate: \n" + req.query.startdate);
	
	var finerAggregation;
	var startDate = new Date(req.query.startdate);
	var endDate = startDate;
	var areas = req.query.areas;
	var sensortype = req.query.sensortype;
	
	switch(req.query.aggregation) {
    	case "year":
        	finerAggregation = "month";
        	endDate.setDate(startDate.getMonth() + 12); 
        	break;
    	case "month":
        	finerAggregation = "day";
        	endDate.setDate(startDate.getMonth() + 1);
        	break;
        case "week":
        	finerAggregation = "day";
        	endDate.setDate(startDate.getDate() + 7);
        	break;
        case "day":
        	finerAggregation = "hour";
        	endDate.setDate(startDate.getDate() + 1);
        	break;
	}
	
	console.log("endDate: \n" + endDate);
	
	/*var request = require('request');
		request({
    		url: '../datastation/myapp', //URL to hit
    		method: 'POST',
    		//Lets post the following key/values as form
    		json: {
        		areas : areas,
			sensortype : sensortype,
			startDate : startDate,
			endDate : endDate,
			aggregation : finerAggregation
    		}
	}, function(error, response, body){
    		if(error) {
        		console.log(error);
    		} else {
        		console.log(response.statusCode, body);
				*/
				var rows = JSON.parse(body);
				
				var timeframes = [];
				for (var time = startDate; time < endDate; ) {
					timeframes.push(time);
					switch(finerAggregation) {
					case "month":
						time.setMonth(time.getMonth() +1);
						break;
					case "day":
						time.setDate(time.getDate() +1);
						break;
					case "hour":
						time.setHours(time.getHours () +1);
						break;
					}
				};
				
				var areaDictionary = [];
				rows.forEach(function(item) {
					if (areaDictionary[item.area]==null){
						areaDictionary[item.area] = [];
					}
					var difference = 0;
					switch(finerAggregation) {
					case "month":
						time.setMonth(time.getMonth() +1);
						break;
					case "day":
						time.setDate(time.getDate() +1);
						break;
					case "hour":
						time.setHours(time.getHours () +1);
						break;
					}
					areaDictionary[item.area][difference] = item.Messwert;
				});
				
				res.request = req;
				res.timeframes = timeframes;
				res.dataPerArea = [];
				areaDictionary.forEach(function(item) {
					res.dataPerArea.push(item);
				}
				/*
			});
		}
	});
	*/

	
	//res.json(jsonfile);
});

