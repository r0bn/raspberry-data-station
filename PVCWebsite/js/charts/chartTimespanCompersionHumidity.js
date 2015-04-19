$(function () {
    $('#chartTimespanComparsionHumidity').highcharts({
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
                format: '{value} %',
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }],
            //max: 100,
            //min: 0
        },
        tooltip: {
            valueSuffix: '%'
        },
        legend: {
            //layout: 'vertical',
            //align: 'right',
            //verticalAlign: 'middle',
            borderWidth: 1
        },
        series: [{
            name: '2/222',
            data: [null, null, 50, 51, 60, 61, 62]
        }, {
            name: '2/223',
            data: [40, 41, 45, 44, 42, 45, 45]
        }, {
            name: '2/225',
            data: [50, 55, 55, 56, 57, 58, 59]
        }, {
            name: '2/229',
            data: [50, 51, 52, 52, 52, 52, 52]
        },],
        plotOptions: {
            series: {
                marker: {
                    enabled: false,
                    symbol: 'circle'
                },
                 dashStyle: 'shortdot',
                 lineWidth: 3
            }
        },

    });
});