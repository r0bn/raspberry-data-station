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


app.get('/data', function (req, res) {
	
	console.log("sensortype: " + req.query.sensortype);	
	console.log("areas: " + req.query.areas);
	console.log("aggregation: " + req.query.aggregation);
	console.log("startdate: " + req.query.startdate+"\n");
	
	var finerAggregation;
	var dateParts = req.query.startdate.split("/");
	var test = dateParts[2]+"-"+dateParts[1]+"-"+dateParts[0]+" 00:00:00";
	console.log("startdate: " + test);
	var startDate = new Date(test);
	var endDate = new Date(startDate);
	req.query.areas = req.query.areas.split(",");
	var areas = req.query.areas;
	var sensortype = req.query.sensortype;
	
	switch(req.query.aggregation) {
    	case "year":
			title = "Monthly Temperature";
        	finerAggregation = "month";
        	endDate.setFullYear(startDate.getFullYear() + 1); 
        	break;
    	case "month":
			title = "Daily Temperature";
        	finerAggregation = "day";
        	endDate.setDate(startDate.getMonth() + 1);
        	break;
        case "week":
			title = "Daily Temperature";
        	finerAggregation = "day";
        	endDate.setDate(startDate.getDate() + 7);
        	break;
        case "day":
			title = "Hourly Temperature";
        	finerAggregation = "hour";
        	endDate.setDate(startDate.getDate() + 1);
        	break;
	}
	
	console.log("endDate: " + endDate);
	console.log("finerAggregation: " + finerAggregation);

				var rows = dataFile;
				//var rows = JSON.parse(body);
				
				console.log("starttime: " + startDate);
				console.log("endtime: " + endDate);
				var timeframes = [];
				var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
				for (var time = new Date (startDate); time < endDate; ) {
					var timestring = "";
					switch(finerAggregation) {
					case "month":
						timestring = monthNames[time.getMonth()] + " " + time.getFullYear();
						time.setMonth(time.getMonth() +1);
						break;
					case "day":
						timestring = time.getDate() + " " + monthNames[time.getMonth()] + " " + time.getFullYear();
						time.setDate(time.getDate() +1);
						break;
					case "hour":
						timestring = time.getHours() + ":" + time.getMinutes() + " " + time.getDate() + " " + monthNames[time.getMonth()] + " " + time.getFullYear();
						time.setHours(time.getHours () +1);
						break;
					}
					timeframes.push(timestring);
				};
				
				var areaDictionary = [];
				rows.forEach(function(item) {
					if (areaDictionary[item.Datenstation]==null){
						areaDictionary[item.Datenstation] = [];
						areaDictionary[item]
					}
					var difference = {};
					switch(finerAggregation) {
					case "month": 
						difference =  item.Zeitstempel.getMonth -startDate.getMonth
						difference = (difference < 0)?difference + 12 : difference;
						break;
					case "day":
						difference = new Date(item.Zeitstempel) - startDate;
						difference = difference/86400000;
						break;
					case "hour":
						difference = new Date(item.Zeitstempel) - startDate;
						difference = difference/3600000;
						break;
					}
					areaDictionary[item.Datenstation][difference] = Number(item["avg(Messwert)"]);
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
				//res.json(jsonfile);
});

