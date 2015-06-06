Highcharts.setOptions({
        colors: ['#B15983', '#D47D6A', '#4D9A6A', '#9DC462', '#A374B4', '#8C7CB9'],
        chart: {
            backgroundColor: null
        },
        title: {
            text: 'title',
        },
        yAxis: {
            title: {
                enabled: false
            },
            labels: {
                format: '{value} %',
            },
            plotLines: [
                {
                    value: 0,
                    width: 1,
                    color: '#808080'
                }
            ]
        },
        tooltip: {
            valueSuffix: ' °C',
            shared: true
        },
        legend: {
            //layout: 'vertical',
            //align: 'right',
            //verticalAlign: 'middle',
            borderWidth: 1
        },
        plotOptions: {
            series: {
                marker: {
                    symbol: 'circle'
                }
            }
        },
        exporting: {
            buttons: {
                contextButton: {
                    symbol: 'url(./img/Download.png)',
//                    symbolStrokeWidth: 1,
//                    symbolFill: '#bada55',
//                    symbolStroke: '#330033'
                }
            }
        }
});
$(function() {
    $('#chartSensorComparsion').highcharts({

        xAxis: {
            categories: ['Mo 6.4.', 'Di 6.4.', 'Mi 7.4.', 'Do 8.4.',
                'Fr 9.4.', 'Sa 10.4.', 'So 11.4.']
        },
        series: [
            {
                name: 'null',
                data: [null, null, null, null, null, null, null]
            }
        ],
    });
});
$(function() {
    $('#chartTimespanComparsion').highcharts({
        xAxis: {
            categories: ['5.4. / 12.4.', '6.4. / 13.4', '7.4. / 14.4.', '8.4. / 15.4.',
                '9.4. / 16.4.', '10.4. / 17.4.', '11.4. / 18.4.']
        },
        series: [
            {
                name: 'null',
                data: [null, null, null, null, null, null, null]
            }
        ],
    });
});