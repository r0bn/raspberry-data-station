SELECT avg(M.Messwert) AS Average, min(M.Messwert)AS Minimum, max(M.Messwert) AS Maximum, strftime("%Y-%m-%d %H:%M:%S", M.Zeitstempel) AS Timestamp
FROM Messwerte AS M
JOIN Sensoren AS SE ON SE.ID = M.SensorID
JOIN Datenstationen AS D ON SE.DatenstationID = D.ID
JOIN Sensortyp AS ST ON SE.SensortypID = ST.ID
WHERE strftime("%Y-%m-%d", M.Zeitstempel) 
BETWEEN "2015-04-25" 
AND "2015-04-25"
AND D.Standort = "Hft"
AND ST.Name = "Temperatur"
GROUP BY strftime("%d", M.Zeitstempel)