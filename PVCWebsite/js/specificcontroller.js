$(document).ready(function () {
	$('#datepicker1').datepicker({
		format : "dd/mm/yyyy",
		//language: 'de',
		autoclose : 'true'
	});
	$("#datepicker1").datepicker("update", new Date());
	$('#datepicker2').datepicker({
		format : "dd/mm/yyyy",
		//language: 'de',
		autoclose : 'true'
	});
	$("#datepicker2").datepicker("update", new Date());
	$('#datepicker3').datepicker({
		format : "dd/mm/yyyy",
		//language: 'de',
		autoclose : 'true'
	});
	$("#datepicker3").datepicker("update", new Date());
});

$(document).ready(function () {
	var arr = [];
	$.each($('#sensorcomparison #rooms .active input'), function (i, v) {
		arr[i] = v['value'];
	});
	console.log(arr.toString());
	console.log($('#sensorcomparison #rooms .active input').val());
	console.log($('#sensorcomparison #sensortype .active input').val());
	console.log($('#sensorcomparison #aggregation .active input').val());
	console.log($('#sensorcomparison #rooms .active input').val());
	console.log($('#sensorcomparison #rooms .active input').val());
	console.log($('#datepicker1').val());
});
$(document).ready(function () {
	console.log($('#timespancomparison #rooms .active input').val());
	console.log($('#timespancomparison #sensortype .active input').val());
	console.log($('#timespancomparison #aggregation .active input').val());
	console.log($('#timespancomparison #rooms .active input').val());
	console.log($('#timespancomparison #rooms .active input').val());
	console.log($('#datepicker2').val());
	console.log($('#datepicker3').val());
});

$('#sensorcomparisonsubmit').click(function () {
	alert('klklk');
	$.ajax({
		type : 'GET',
		url : 'test.js',
		dataType : 'json',
		//data: ({ json:$jsonAddIt }),
		success : function (json) {
			console.log(json);
			updateSensorComparison(json);
		}
	});

});

function updateSensorComparison(json) {
	var chart = $('#chartSensorComparsionHumidity').highcharts();

	chart.setTitle({
		text : json['data']['title']
	});
	chart.xAxis[0].setCategories(json['data']['timeframes']);
	var i = 0;
	while (chart.series.length > 0)
		chart.series[0].remove(true);
	json['data']['dataPerArea'].forEach(function (dataPerArea) {
		console.log(dataPerArea);
		chart.addSeries(dataPerArea);
	});
	for (var i = 0; i < chart.series.length; i++) {
		chart.series[i].update({
			dashStyle : 'solid',
			lineWidth : 3,
			tooltip : {
				valueSuffix : '°C'
			},
		});
	}

	chart.yAxis[0].update({
		labels : {
			format : '{value} °C',
		},
	});

}
