from handlers.base import BaseHandler

import logging
import getpass
import platform
import socket
import time
import fcntl
import struct

logger = logging.getLogger('dashboard.' + __name__)

class IndexHandler(BaseHandler):
    def get(self):
        now=time.localtime()
        uptimes=readFile("/proc/uptime","0")
        uptime=time.strftime("%H:%M:%S",time.localtime(float(uptimes.split(" ")[0])))
        self.render("base.html",
                    info={'hostip':get_ip_address('wlan0'),
                          'user':getpass.getuser(),
                          'os':platform.system(),
                          'hostname':socket.gethostname(),
                          'uname':platform.uname(),
                          'time':time.strftime("%H:%M:%S",now),
                          'date':time.strftime("%Y-%m-%d",now),
                          'uptime':uptime
                          })

def readFile(file,defaultValue):
    input=open(file,'r')
    content=defaultValue
    try:
        content=input.read()
    finally:
        input.close()
    return content    

  
def get_ip_address(ifname):
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    return socket.inet_ntoa(fcntl.ioctl(
    s.fileno(),
    0x8915,  # SIOCGIFADDR
    struct.pack('256s', ifname[:15])
    )[20:24])

