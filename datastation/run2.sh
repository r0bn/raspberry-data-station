#!/bin/sh

sleep 10
#/usr/bin/python /home/pi/raspberry-data-station/programm.py 100 ds1820 R100 

/usr/bin/python /home/pi/raspberry-data-station/programm.py 105 dht11temp R200 

sleep 4 

/usr/bin/python /home/pi/raspberry-data-station/programm.py 105 dht11hum R200 



