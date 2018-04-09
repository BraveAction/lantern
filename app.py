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

#导入GPIO设置针脚编码格式
try:
    import RPi.GPIO as GPIO
    GPIO.setwarnings(False)
    GPIO.setmode(GPIO.BCM)

#导入GPIO失败
except RuntimeError:
    print("import RPi.GPIO error")

#创建Tornado任务调度器
SCHEDULER=TornadoScheduler()

class TornadoLanternApp(tornado.web.Application):
    def __init__(self):
        tornado.web.Application.__init__(self, url_patterns, **settings)

'''
接收到进程中止信号
1:清除针脚状态
2:清除任务调度器中的所有任务
'''
def sig_handler(sig,frame):
    logging.info("GPIO cleanup and Scheduler remove all jobs")
    
    GPIO.cleanup()
    
    SCHEDULER.remove_all_jobs()
    SCHEDULER.print_jobs()

    '''
    for job in SCHEDULER.get_jobs():
        print(u'%s' % job)
        print(u'%s' % job.args)SCHEDULER.shutdown(False)
    '''

def main():
    #扩展app属性
    app = TornadoLanternApp()
    app.scheduler = SCHEDULER

    app.GPIO=GPIO
    app.scheduler.start()


    http_server = tornado.httpserver.HTTPServer(app)
    http_server.listen(options.port)
    
    signal.signal(signal.SIGTERM, sig_handler)
    signal.signal(signal.SIGINT, sig_handler)
    
    tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    main()
