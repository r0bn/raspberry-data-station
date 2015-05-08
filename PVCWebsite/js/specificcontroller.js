//update Datepicker
$(document).ready(function() {
    $('#datepicker1').datepicker({
        format: "dd/mm/yyyy",
        autoclose: 'true',
        firstDay: 1 // Start with Monday
    });
    $("#datepicker1").datepicker("update", new Date());
    $('#datepicker2').datepicker({
        format: "dd/mm/yyyy",
        autoclose: 'true',
        firstDay: 1 // Start with Monday
    });
    $("#datepicker2").datepicker("update", new Date());
    $('#datepicker3').datepicker({
        format: "dd/mm/yyyy",
        autoclose: 'true',
        firstDay: 1 // Start with Monday
    });
    $("#datepicker3").datepicker("update", new Date());
});

$(document).ready(function() {
    $.ajax({
        type: 'GET',
        url: '/init',
        dataType: 'json',
        success: function(json) {
            console.log(json);
            initDatastationsAndSensortypes(json);
        }
    });
});

function initDatastationsAndSensortypes(json) {
    console.log(json['datastations']);
    console.log(json['sensortypes']);
    if (json['datastations'].length < 1 && json['sensortypes'].length < 1) {
        console.log('no datastations and sensortypes, no values in database');
    } else {
        //SENSORCOMPARISON
        var sensorcomparison = $('#sensorcomparison');

        //ROOMS
        //first remove old options
        var selectrooms = sensorcomparison.find('#rooms select');
        selectrooms.find('option').remove();
        selectrooms.selectpicker('refresh');

        $.each(json['datastations'], function(i, v) {
            selectrooms.append("<option value=" + v['Area'] + ">" + v['Area'] + "</option>");
            selectrooms.selectpicker('refresh');
        });
        
        
        //select first  (SENSORCOMPARISON EXTRA)
        if(json['datastations'].length===1)
        selectrooms.selectpicker('val', [json['datastations'][0]['Area']]);
        if(json['datastations'].length>1)
        selectrooms.selectpicker('val', [json['datastations'][0]['Area'],json['datastations'][1]['Area']]);
        
        //SENSORTYPES
        //first remove old options
        var selectsensortypes = sensorcomparison.find('#sensortype select');
        selectsensortypes.find('option').remove();
        selectsensortypes.selectpicker('refresh');

        $.each(json['sensortypes'], function(i, v) {
            selectsensortypes.append("<option value=" + v['Name'] + ">" + v['Name'] + "</option>");
            selectsensortypes.selectpicker('refresh');
        });
        
        //TIMESPANCOMPARISON
        var sensorcomparison = $('#timespancomparison');

        //ROOMS
        //first remove old options
        var selectrooms = sensorcomparison.find('#rooms select');
        selectrooms.find('option').remove();
        selectrooms.selectpicker('refresh');

        $.each(json['datastations'], function(i, v) {
            selectrooms.append("<option value=" + v['Area'] + ">" + v['Area'] + "</option>");
            selectrooms.selectpicker('refresh');
        });

        //SENSORTYPES
        //first remove old options
        var selectsensortypes = sensorcomparison.find('#sensortype select');
        selectsensortypes.find('option').remove();
        selectsensortypes.selectpicker('refresh');

        $.each(json['sensortypes'], function(i, v) {
            selectsensortypes.append("<option value=" + v['ID'] + ">" + v['Name'] + "</option>");
            selectsensortypes.selectpicker('refresh');
        });     
    }
}





$('#sensorcomparisonsubmit').click(function() {
    $.ajax({
        type: 'GET',
        url: '/data',
        dataType: 'json',
        data: getParametersOfSensorComparsion(),
        success: function(json) {
            console.log(json);
            updateSensorComparison(json);
        }
    });
});

function getParametersOfSensorComparsion() {
    var arr = [];
    $.each($('#sensorcomparison #rooms option:selected'), function(i, v) {
        arr[i] = v['value'];
    });
    var areas = arr.toString();
    var sensortype = $('#sensorcomparison #sensortype option:selected').val();
    var aggregation = $('#sensorcomparison #aggregation .active input').val();
    var startdate = $('#datepicker1').val();
    return {'areas': areas, 'sensortype': sensortype, 'aggregation': aggregation, 'startdate': startdate};
}


function updateSensorComparison(json) {
    //get chart as object to modify it
    var chart = $('#chartSensorComparsion').highcharts();
    //set title of chart
    chart.setTitle({
        text: json['data']['title']
    });
    //set categories of chart
    chart.xAxis[0].setCategories(json['data']['timeframes']);
    //remove all series of chart
    var i = 0;
    while (chart.series.length > 0)
        chart.series[0].remove(true);
    //add all series to chart
    var colorid = 0;
    json['data']['dataPerArea'].forEach(function(dataPerArea) {
        console.log(dataPerArea);
        var dataPerAreaAreaRange = {type: 'arearange', name: dataPerArea.name + " minmax", data: dataPerArea.data, color: Highcharts.getOptions().colors[colorid]};
        chart.addSeries(dataPerAreaAreaRange);
        var dataPerAreaSpline = {type: 'spline', name: dataPerArea.name + " avg", data: dataPerArea.data, likedTo: ":previous", color: Highcharts.getOptions().colors[colorid]};
        chart.addSeries(dataPerAreaSpline);
        colorid++;
    });
    //set chart options depending on the sensortype
    for (var i = 1; i < chart.series.length; i = i + 2) {
        chart.series[i].update({
            dashStyle: 'solid',
            lineWidth: 3,
            tooltip: {
                valueSuffix: '°C'
            }
        });
    }
    //set chart options depending on the sensortype
    for (var i = 0; i < chart.series.length; i = i + 2) {
        chart.series[i].update({
            fillOpacity: 0.2,
            lineWidth: 0,
            //linkedTo:':previous',
            tooltip: {
                valueSuffix: '°C'
            }
        });
    }
    chart.yAxis[0].update({
        labels: {
            format: '{value} °C'
        }
    });
}
