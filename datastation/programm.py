#!/usr/bin/env python
# -*- coding: utf-8 -*-

import re
import time
import json
import urllib2
import calendar
from datetime import datetime
import time
import sys
from ctypes import *
#cdll.LoadLibrary("./bcm2835.so")
import math


# Path to Application and DB Server 
url = "http://pvc.r9u.de:7090/insert" 
# Path to temperature sensor DS1820
path = "/sys/bus/w1/devices/10-000802b56552/w1_slave"

# MPL3115a2 Sensor Board
sensor = CDLL("/home/pi/sensor.so")
class mpl3115a2:
	def __init__(self):
		if (0 == sensor.bcm2835_init()):
			print "bcm3835 driver init failed."
			return
			
	def writeRegister(self, register, value):
	    sensor.MPL3115A2_WRITE_REGISTER(register, value)
	    
	def readRegister(self, register):
		return sensor.MPL3115A2_READ_REGISTER(register)

	def active(self):
		sensor.MPL3115A2_Active()

	def standby(self):
		sensor.MPL3115A2_Standby()

	def initAlt(self):
		sensor.MPL3115A2_Init_Alt()

	def initBar(self):
		sensor.MPL3115A2_Init_Bar()

	def readAlt(self):
		return sensor.MPL3115A2_Read_Alt()

	def readTemp(self):
		return sensor.MPL3115A2_Read_Temp()

	def setOSR(self, osr):
		sensor.MPL3115A2_SetOSR(osr);

	def setStepTime(self, step):
		sensor.MPL3115A2_SetStepTime(step)

	def getTemp(self):
		t = self.readTemp()
		t_m = (t >> 8) & 0xff;
		t_l = t & 0xff;

		if (t_l > 99):
			t_l = t_l / 1000.0
		else:
			t_l = t_l / 100.0
		return (t_m + t_l)

	def getAlt(self):
		alt = self.readAlt()
		alt_m = alt >> 8 
		alt_l = alt & 0xff
		
		if (alt_l > 99):
			alt_l = alt_l / 1000.0
		else:
			alt_l = alt_l / 100.0
			
		return self.twosToInt(alt_m, 16) + alt_l
	def getBar(self):
		alt = self.readAlt()
		alt_m = alt >> 6 
		alt_l = alt & 0x03
		
		if (alt_l > 99):
			alt_l = alt_l 
		else:
			alt_l = alt_l 

		return (self.twosToInt(alt_m, 18))

	def twosToInt(self, val, len):
		# Convert twos compliment to integer
		if(val & (1 << len - 1)):
			val = val - (1<<len)

		return val
		
# read DS1820 sensor
def read_sensor(path):
    value = "U"
    try:
        f = open(path,"r")
        line = f.readline()
        if re.match(r"([0-9a-f]{2} ){9}: crc=[0-9a-f]{2} YES", line):
            line = f.readline()
            m = re.match(r"([0-9a-f]{2} ){9}t=([+-]?[0-9]+)", line)
            if m:
                value = str(float(m.group(2)) / 1000.0)
        f.close()
    except (IOError), e:
        print time.strftime("%x %X"), "Error reading", path, ": ", e
    return value



# json gateway to application server
def send_json(value, sensortype, datastationId, unit, area):
    req = urllib2.Request(url)
    ts = time.time()
    data = {
            'DatastationID': datastationId,
            'Timestamp': datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S'),
            'Value' : str(value),
            'Sensortype' : sensortype,
            'Area' : area,
            'Unit' : unit 
            }
    req.add_header('Content-Type', 'application/json')
    print data
    response = urllib2.urlopen(req, json.dumps(data))

# main
datastationId = int(sys.argv[1])
sensorK = sys.argv[2]
area = sys.argv[3]

if sensorK == "ds1820":
    value = read_sensor(path)
    send_json(value, 'temperature', datastationId, '°C', area)

if sensorK == "mpl3115a2T":
    mpl = mpl3115a2()
    mpl.initBar()
    mpl.active()
    time.sleep(1)

    value = mpl.getTemp() 
    send_json(value, 'temperature', datastationId, '°C', area)

if sensorK == "mpl3115a2B":
    mpl = mpl3115a2()
    mpl.initBar()
    mpl.active()
    time.sleep(1)

    value = mpl.getBar() / 100
    send_json(value, 'pressure', datastationId, 'hPa', area)
