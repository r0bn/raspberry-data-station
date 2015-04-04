# Setup

## Temperatur Sensor DS1820 

Kernel Module laden:
```
sudo modprobe wire
sudo modprobe w1_gpio
sudo modprobe w1_therm
```

Kernel Module in den autostart
```
sudo vi /etc/modules
```

```
wire
w1_gpio
w1_therm
```

Kontrollieren
```
lsmod
```

```
Module                  Size  Used by
w1_therm                2866  0 
w1_gpio                 2751  0 
wire                   25349  2 w1_gpio,w1_therm
cn                      4780  1 wire
xt_nat                  1770  1 
iptable_nat             2607  1 
nf_conntrack_ipv4      12965  1 
nf_defrag_ipv4          1491  1 nf_conntrack_ipv4
nf_nat_ipv4             3630  1 iptable_nat
nf_nat                 15166  3 nf_nat_ipv4,xt_nat,iptable_nat
nf_conntrack           87622  4 nf_nat,nf_nat_ipv4,iptable_nat,nf_conntrack_ipv4
ip_tables              11694  1 iptable_nat
x_tables               17030  2 ip_tables,xt_nat
i2c_dev                 5769  0 
snd_bcm2835            19584  0 
snd_soc_bcm2708_i2s     6202  0 
regmap_mmio             2818  1 snd_soc_bcm2708_i2s
snd_soc_core          127841  1 snd_soc_bcm2708_i2s
snd_compress            8259  1 snd_soc_core
regmap_i2c              1661  1 snd_soc_core
snd_pcm_dmaengine       5505  1 snd_soc_core
regmap_spi              1913  1 snd_soc_core
snd_pcm                83845  3 snd_bcm2835,snd_soc_core,snd_pcm_dmaengine
snd_page_alloc          5132  1 snd_pcm
snd_seq                55484  0 
snd_seq_device          6469  1 snd_seq
snd_timer              20998  2 snd_pcm,snd_seq
leds_gpio               2079  0 
led_class               4118  1 leds_gpio
snd                    62252  7 snd_bcm2835,snd_soc_core,snd_timer,snd_pcm,snd_seq,snd_seq_device,snd_compress
i2c_bcm2708             4943  0 
```

ID finden:

```
ls /sys/bus/w1/devices/
```

Auslesen
```
cat /sys/bus/w1/devices/10-000802b56552/w1_slave
```

```
2c 00 4b 46 ff ff 0a 10 2c : crc=2c YES
2c 00 4b 46 ff ff 0a 10 2c t=22125
```
