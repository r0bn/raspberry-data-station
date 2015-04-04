#!/usr/bin/python
# -*- coding: utf-8 -*-

import re
import time
import json
import urllib2

# TODO: Move to config file
path = "/sys/bus/w1/devices/10-000802b56552/w1_slave"
url = "http://pvc.r9u.de" 

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
    data = {'temp': str(value)}
    req.add_header('Content-Type', 'application/json')
    response = urllib2.urlopen(req, json.dumps(data))

# main
data = "N"
data = read_sensor(path)
send_json(data)
print data
time.sleep(1)
