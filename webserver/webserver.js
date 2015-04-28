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
	console.log("startdate: " + req.query.startdate);
	
	var finerAggregation;
	var endDate = new Date();
	var startDate = new Date(req.query.startdate);
	var areas = req.query.areas;
	var sensortype req.query.sensortype;
	
	switch(req.query.aggregation) {
    	case "year":
        	finerAggreation = "month";
        	endDate.setDate(startDate.getMonth() + 12); 
        	break;
    	case "month":
        	finerAggreation = "day";
        	endDate.setDate(startDate.getMonth() + 1);
        	break;
        case "week":
        	finerAggreation = "day";
        	endDate.setDate(startDate.getDate() + 7);
        	break;
        case "day":
        	finerAggreation = "hour";
        	endDate = startDate;
        	break;
	}
 
	var request = require('request');
	request({
    		url: '../datastation/myapp', //URL to hit
    		//qs: {from: 'blog example', time: +new Date()}, //Query string data
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
		}
	});

	
	res.json(jsonfile);
});
