$(document).ready(function() {
    $('#datepicker1').datepicker({
        format: "dd/mm/yyyy",
        //language: 'de',
        autoclose: 'true'
    });
    $("#datepicker1").datepicker("update", new Date());
    $('#datepicker2').datepicker({
        format: "dd/mm/yyyy",
        //language: 'de',
        autoclose: 'true'
    });
    $("#datepicker2").datepicker("update", new Date());
    $('#datepicker3').datepicker({
        format: "dd/mm/yyyy",
        //language: 'de',
        autoclose: 'true'
    });
    $("#datepicker3").datepicker("update", new Date());
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

$('#togglesensorcomparsioncockpit').click(function() {
    $('#sensorcomparsioncockpit').toggleClass('hidden');
    $(this).find('i').toggleClass('fa-angle-double-down');
    $(this).find('i').toggleClass('fa-angle-double-up');
})

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
    json['data']['dataPerArea'].forEach(function(dataPerArea) {
        console.log(dataPerArea);
        chart.addSeries(dataPerArea);
    });
    //set chart options depending on the sensortype
    for (var i = 0; i < chart.series.length; i++) {
        chart.series[i].update({
            dashStyle: 'solid',
            lineWidth: 3,
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
