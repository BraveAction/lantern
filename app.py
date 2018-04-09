#!/usr/bin/env python
# -*- coding: UTF-8 -*-
import tornado.httpserver
import tornado.ioloop
import tornado.web
from tornado.options import options

import signal
import logging

from settings import settings
from urls import url_patterns

from apscheduler.schedulers.tornado import TornadoScheduler

try:
    import RPi.GPIO as GPIO
    print("import RPi.GPIO success 成功")
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)
except RuntimeError:
    print("import RPi.GPIO error")

SCHEDULER=TornadoScheduler()

class TornadoDashBoard(tornado.web.Application):
    def __init__(self):
        tornado.web.Application.__init__(self, url_patterns, **settings)

def sig_handler(sig,frame):
    logging.info("GPIO cleanup and Scheduler remove all jobs")
    
    GPIO.cleanup()
    
    SCHEDULER.print_jobs()
    for job in SCHEDULER.get_jobs():
        print(u'%s' % job)
        print(u'%s' % job.args)
    SCHEDULER.remove_all_jobs()
    SCHEDULER.shutdown(False)

def main():
    app = TornadoDashBoard()
    app.scheduler = SCHEDULER
    
    http_server = tornado.httpserver.HTTPServer(app)
    http_server.listen(options.port)
    app.GPIO=GPIO
    app.scheduler.start()
    
    signal.signal(signal.SIGTERM, sig_handler)
    signal.signal(signal.SIGINT, sig_handler)
    
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()
