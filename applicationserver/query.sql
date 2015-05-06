SELECT D.Area, avg(M.Value) AS Average, min(M.Value)AS Minimum, max(M.Value) AS Maximum, strftime("%Y-%m-%d %H:%M:%S",M.Timestamp) AS Timestamp
FROM Data AS M 
JOIN Sensors AS SE ON SE.ID = M.SensorID 
JOIN Datastations AS D ON SE.DatastationID = D.ID 
JOIN Sensortype AS ST ON SE.SensortypeID = ST.ID
WHERE strftime("%Y-%m-%d %H:%M%S", M.Timestamp) 
BETWEEN "2015-05-06 00:00:00"
AND "2015-05-07 00:00:00"
AND D.Area = "1/111"
AND ST.Name = "temperature"
GROUP BY D.Area, strftime("%d", M.Timestamp)