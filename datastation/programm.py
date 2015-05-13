#!/usr/bin/python
# -*- coding: utf-8 -*-

import re
import time
import json
import urllib2
import calendar
from datetime import datetime
import time

# TODO: Move to config file
path = "/sys/bus/w1/devices/10-000802b56552/w1_slave"
url = "http://pvc.r9u.de:7090/insert" 
#url = "http://0.0.0.0:3000/insert" 

# read and parse sensor data file
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

def send_json(value):
    req = urllib2.Request(url)
    ts = time.time()
    data = {
            'DatastationID': 100,
            'Timestamp': datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H:%M:%S'),
            'Value' : str(value),
            'Sensortype' : 'temperatur',
            'Area' : 'RobWG',
            'Unit' : 'Grad'
            }
    req.add_header('Content-Type', 'application/json')
    print data
    response = urllib2.urlopen(req, json.dumps(data))

# main
data = "N"
data = read_sensor(path)
send_json(data)
time.sleep(1)
