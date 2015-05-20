request = require('request-json')
moment = require('moment')

client = request.createClient('http://pvc.r9u.de:7090')
 
data =
    Unit : 'db'
    Area: 'kitchen'
    Sensortype : 'loudness'
    Value : 0
    Timestamp : moment().toISOString()
    DatastationID : 202

time = moment()
time.subtract(14, "d")
time.startOf('day')

rnd = (min, max) ->
  Math.random() * (max - min) + min


generate = () ->

    data.Timestamp = time.format("YYYY-MM-DD HH:mm:ss")
    data.Value = Math.round(rnd(0,80))

    console.log data

    time.add(10, "m")

    client.post 'insert/', data, (err, res, body) ->
        console.log(res.statusCode)

        if time.isBefore(moment())
            setTimeout generate, 100

generate()
