BEGIN TRANSACTION;
CREATE TABLE `Sensortyp` (
	`ID`	INTEGER PRIMARY KEY AUTOINCREMENT,
	`Name`	TEXT NOT NULL,
	`Einheit`	TEXT NOT NULL
);
CREATE TABLE "Sensoren" (
	`ID`	INTEGER PRIMARY KEY AUTOINCREMENT,
	`Datenstation-ID`	INTEGER NOT NULL,
	`Sensortyp-ID`	INTEGER NOT NULL,
	FOREIGN KEY(`Datenstation-ID`) REFERENCES Datenstationen ( ID ),
	FOREIGN KEY(`Sensortyp-ID`) REFERENCES Sensortyp(ID)
);
CREATE TABLE "Messwerte" (
	`Zeitstempel`	TEXT NOT NULL,
	`ID`	INTEGER PRIMARY KEY AUTOINCREMENT,
	`Sensor-ID`	INTEGER NOT NULL,
	`Messwert`	NUMERIC NOT NULL,
	FOREIGN KEY(`Sensor-ID`) REFERENCES Sensoren(ID)
);
CREATE TABLE `Datenstationen` (
	`ID`	INTEGER PRIMARY KEY AUTOINCREMENT,
	`Standort`	TEXT NOT NULL
);
COMMIT;
