$(function () {
    $('#chartTimespanComparsionTemperature').highcharts({
		chart: {
            backgroundColor: null
        },
        title: {
            text: null,
        },
        colors: ['#B15983','#D47D6A','#4D9A6A', '#9DC462'],
        //colors: ['#8E2F5C', '#AA4C39', '#297B48', '#739D34'],
        xAxis: {
            categories: ['Mo 6.4.', 'Di 6.4.', 'Mi 7.4.', 'Do 8.4.', 
                         'Fr 9.4.', 'Sa 10.4.','So 11.4.']
        },
        yAxis: {  
            title: {
                enabled: false
            },
            labels: {
                format: '{value} °C',
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            valueSuffix: '°C'
        },
        legend: {
            //layout: 'vertical',
            //align: 'right',
            //verticalAlign: 'middle',
            borderWidth: 1
        },
        series: [{
            name: '2/222 6.4.-11.4.',
            data: [null, null, 9.5, 14.5, 18.2, 21.5, 25.2]
        }, {
            name: '2/222 12.4.-18.7.',
            data: [24, 23, 20, 19.3, 17.0, 22.0, 24.8]
        },],
        plotOptions: {
            series: {
                marker: {
                    enabled: false,
                    symbol: 'circle'
                }
            }
        },
    });
});