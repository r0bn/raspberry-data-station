//update Datepicker
$(document).ready(function() {
    $('#datepicker1').datepicker({
        format: "dd/mm/yyyy",
        autoclose: 'true',
        weekStart: 1 // Start with Monday
    });
    $("#datepicker1").datepicker("update", new Date());
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    $('#datepicker2').datepicker({
        format: "dd/mm/yyyy",
        autoclose: 'true',
        weekStart: 1 // Start with Monday
    });
    $("#datepicker2").datepicker("update", yesterday);
    $('#datepicker3').datepicker({
        format: "dd/mm/yyyy",
        autoclose: 'true',
        weekStart: 1 // Start with Monday
    });
    $("#datepicker3").datepicker("update", new Date());

    $.ajax({
        type: 'GET',
        url: '/init',
        dataType: 'json',
        success: function(json) {
            console.log(json);
            initDatastationsAndSensortypes(json);
            sensorComparison();
            timespanComparison();
        }
    });
    
});

var initJSON;
function initDatastationsAndSensortypes(json) {
    console.log(json['datastations']);
    console.log(json['sensortypes']);
    if (json.length == 0){
        alert('no connection to database');
    }
    else {
    if (json['datastations'].length < 1 && json['sensortypes'].length < 1) {
        alert('no datastations, sensortypes and values in database');
    }
        //SENSORCOMPARISON
//        saveValuesAsArrayInSession(json);
    initJSON=json;
        var sensorcomparison = $('#sensorcomparison');
        initDatastationsAndSensortypes_UpdateFields(json, sensorcomparison, "SC");
        //TIMESPANCOMPARISON
        var timespancomparison = $('#timespancomparison');
        initDatastationsAndSensortypes_UpdateFields(json, timespancomparison, "TC");
    }
}

function initDatastationsAndSensortypes_UpdateFields(json, sensorOrTimespanComparison, SCorTC) {
        //ROOMS
        //first remove old options
        var selectrooms = sensorOrTimespanComparison.find('#rooms select');
        selectrooms.find('option').remove();
        selectrooms.selectpicker('refresh');

        $.each(json['datastations'], function(i, v) {
            selectrooms.append("<option value=" + v['ID'] + ">" + v['Area'] + "</option>");
            selectrooms.selectpicker('refresh');
        });
        
        if (json['datastations'].length > 0){
            //select first  (SENSORCOMPARISON EXTRA)
            if(json['datastations'].length===1)
            selectrooms.selectpicker('val', [json['datastations'][0]['ID']]);
            //select two  (SENSORCOMPARISON)
            if(json['datastations'].length>1 && SCorTC =="SC")
            selectrooms.selectpicker('val', [json['datastations'][0]['ID'],json['datastations'][1]['ID']]);
            //select one (TIMESPANCOMPARISON)
            if(json['datastations'].length>1 && SCorTC =="TC")
            selectrooms.selectpicker('val', [json['datastations'][0]['ID']]);
        }
        //SENSORTYPES
        //first remove old options
        var selectsensortypes = sensorOrTimespanComparison.find('#sensortype select');
        selectsensortypes.find('option').remove();
        selectsensortypes.selectpicker('refresh');

        $.each(json['sensortypes'], function(i, v) {
            selectsensortypes.append("<option value=" + v['ID'] + ">" + v['Name'] + "</option>");
            selectsensortypes.selectpicker('refresh');
        });    
}

$('#sensorcomparisonsubmit').click(function() {
    sensorComparison();
});
$('#timespancomparisonsubmit').click(function() {
    timespanComparison();
});

function sensorComparison(){
    var data = getParametersOfSensorComparsion();
    console.log(data);
    if (typeof(data.error) === 'undefined'){ 
        $.ajax({
            type: 'GET',
            url: '/data',
            dataType: 'json',
            data: data,
            success: function(json) {
                console.log(json);
                updateSensorAndTimespanComparisonChart(json, '#chartSensorComparsion');
            }
        });
    }else{
        alert(data.error);
    }
}
function timespanComparison(){
    var data = getParametersOfTimespanComparsion();
    if (typeof(data.error) === 'undefined'){ 
        $.ajax({
            type: 'GET',
            url: '/data',
            dataType: 'json',
            data: data,
            success: function(json) {
                console.log(json);
                updateSensorAndTimespanComparisonChart(json, '#chartTimespanComparsion');
            }
        });
    }else{
        alert(data.error);
    }
}

function getParametersOfSensorComparsion() {
    var sC = $('#sensorcomparison');
    var arr = [];
    $.each(sC.find('#rooms option:selected'), function(i, v) {
        arr[i] = v['value'];
    });
    var datastations = arr.toString();
    var sensortype = sC.find('#sensortype option:selected').val();
    var timespan = sC.find('#aggregation .active input').val();
    var startdate = $('#datepicker1').val();
    if (datastations == "" && typeof(sensortype) === 'undefined'){
        return {error:'No sensortype and no datastations selected !'};
    }else if (typeof(datastations) == "" ){
        return {error:'No datastations selected !'};
    }else if (typeof(sensortype) === 'undefined' ){
        return {error:'No sensortype selected !'};
    }
    return {datastationID: datastations, sensortypeID: sensortype, timespan: timespan, date: startdate};
}

function getParametersOfTimespanComparsion() {
    var tC = $('#timespancomparison');
    var datastation = tC.find('#rooms option:selected').val();
    var sensortype = tC.find('#sensortype option:selected').val();
    var timespan = tC.find('#aggregation .active input').val();
    var startdate2 = $('#datepicker2').val();
    var startdate3 = $('#datepicker3').val();
    if (typeof(datastation) === 'undefined' && typeof(sensortype) === 'undefined'){
        return {error:'No sensortype and no datastations selected !'};
    }else if (typeof(datastation) === 'undefined' ){
        return {error:'No datastations selected !'};
    }else if (typeof(sensortype) === 'undefined' ){
        return {error:'No sensortype selected !'};
    }
    return {datastationID: datastation, sensortypeID: sensortype, timespan: timespan, date: startdate2+','+startdate3};
}

function updateSensorAndTimespanComparisonChart(json, chartID) {
    //get chart as object to modify it
    var chart = $(chartID).highcharts();
    var sensortype;
    $.each(initJSON['sensortypes'], function(i, v) {
        if(json['data']['titlesensortypeID']==v['ID']){
            sensortype = v['Name'];
        }
    });  
    //set title of chart
    chart.setTitle({
        text: json['data']['title'] + sensortype
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
        var datastationname;
        $.each(initJSON['datastations'], function(i, v) {
            if(dataPerArea.name==v['ID']){
                datastationname = v['Area'];
            }
        });       
        var dataPerAreaSpline = {type: 'spline', name: datastationname+ " "+dataPerArea.nameTimeframe, data: dataPerArea.data, color: Highcharts.getOptions().colors[colorid]};
        chart.addSeries(dataPerAreaSpline);
        var dataPerAreaAreaRange = {type: 'areasplinerange', name: " min-max", data: dataPerArea.data, color: Highcharts.getOptions().colors[colorid]};
        chart.addSeries(dataPerAreaAreaRange);
        colorid++;
    });
    
     var unit;
    $.each(initJSON['sensortypes'], function(i, v) {
        if(json['data']['titlesensortypeID']==v['ID']){
            unit = v['Unit'];
        }
    });
    
    //set chart options depending on the sensortype
    for (var i = 0; i < chart.series.length; i = i + 2) {
        chart.series[i].update({
            dashStyle: 'solid',
            lineWidth: 3,
            tooltip: {
                valueSuffix: unit
            }
        });
    }
    //set chart options depending on the sensortype
    for (var i = 1; i < chart.series.length; i = i + 2) {
        chart.series[i].update({
            fillOpacity: 0.2,
            lineWidth: 0,
            linkedTo:':previous',
            tooltip: {
                valueSuffix: unit
            }
        });
    }
    chart.yAxis[0].update({
        labels: {
            format: '{value} '+unit
        }
    });
}
