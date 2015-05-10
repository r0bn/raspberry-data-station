SELECT D.ID, avg(M.Value) AS Average, min(M.Value)AS Minimum, max(M.Value) AS Maximum, strftime("%Y-%m-%d %H:%M:%S",M.Timestamp) AS Timestamp
FROM Data AS M 
JOIN Sensors AS SE ON SE.ID = M.SensorID 
JOIN Datastations AS D ON SE.DatastationID = D.ID 
JOIN Sensortype AS ST ON SE.SensortypeID = ST.ID
WHERE strftime("%Y-%m-%d %H:%M%S", M.Timestamp) 
BETWEEN "2015-03-31 00:00:00"
AND "2015-04-09 00:00:00"
AND D.ID = "1" OR D.ID = "2" 
AND ST.ID = "1"
GROUP BY D.ID, strftime("%d", M.Timestamp)