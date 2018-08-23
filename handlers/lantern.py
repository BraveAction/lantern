# -*- coding: UTF-8 -*-
from handlers.base import BaseHandler
from datetime import datetime
import tornado.web
import json
import simplejson

from datetime import datetime
import logging

logger = logging.getLogger('dashboard.' + __name__)

channel=23
channel1=24
NO=1
OFF=0


class LanternHandler(BaseHandler):
    def __init__(self,application,request,**kwargs):
        super(LanternHandler,self).__init__(application,request,**kwargs)
        GPIO=self.GPIO
        try:
            GPIO.setup(channel,GPIO.OUT)
            GPIO.setup(channel1,GPIO.OUT)
            logging.info("channel default value is %d " %  GPIO.input(channel))
        except RuntimeError:
            '''GPIO可能未初始化'''
            logging.warning("GPIO no mode")
            GPIO.setwarnings(False) 
            GPIO.setmode(GPIO.BCM)
            GPIO.setup(channel,GPIO.OUT)
            GPIO.setup(channel1,GPIO.OUT)

    '''设置针脚的状态'''
    def switchLantern(self,switch):
        self.switchLanternTask(switch)
        self.write({"lanternState":self.GPIO.input(channel)});

    '''设置针脚状态的调度任务'''
    def switchLanternTask(self,switch):
        self.GPIO.output(channel,switch)
        self.GPIO.output(channel1,switch)

    '''清除针脚状态移除调度器中的所有的任务'''
    def removeJobsClearGPIO(self):
        logging.info("GPIO cleanup and Scheduler remove all jobs")
        self.GPIO.cleanup()
        self.scheduler.remove_all_jobs()
        self.write("cleanup complete")

    def put(self,input):
        self.write("put")

    '''保存定时开关任务'''
    def post(self,input):
        '''job=self.scheduler.add_job(self.switchLanternTask, 'cron', year=2018, month=1, day='*', hour=21, minute=00,end_date=datetime(2018,1,25,20,59), args=[NO])'''

        action=str(input)
        logger.info("action is %s " % action) 
        
        if action == "addnew": 
            #获取任务时间
            obj=self.get_json_argument("dateTime") 
            #格式化任务时间
            fdatetime=datetime.strptime(str("%s %s" % (obj["date"],obj["time"])),"%Y-%m-%d %H:%M") 

            #添加开关任务到调度器
            result=self.scheduler.add_job(self.switchLanternTask, 'cron', year=fdatetime.year, month=fdatetime.month, day=fdatetime.day, hour=fdatetime.hour, minute=fdatetime.minute, args=[int("%s" % obj["flag"])]) 

            logger.info("%s" % result) 

            #任务添加成功输出
            if result is not None:
                self.write(json.dumps({'id':result.id,'args':int('%d' % result.args),'year':str(result.trigger.fields[0]),'month':str(result.trigger.fields[1]),'day':str(result.trigger.fields[2]),'hour':str(result.trigger.fields[5]),'minute':str(result.trigger.fields[6]),'second':str(result.trigger.fields[7])}))


    def get(self,input):
        action=str(input)
        logger.info("action is %s " % action)

        #任务列表
        if action == "list":
            jobs = self.scheduler.get_jobs()
            self.render("lantern_md.html",lanternTasks = jobs,lanternState=self.GPIO.input(channel))
        #获取job数据，并格式化
        elif action == "refresh":
            jobs=self.scheduler.get_jobs()
            lanterns=[]
            for job in jobs:
                lantern={"id":job.id,"taskDate":str("%s-%s-%s" %(job.trigger.fields[0] ,job.trigger.fields[1] ,job.trigger.fields[2])),"taskTime": str("%s:%s:%s" %(job.trigger.fields[5] ,job.trigger.fields[6] ,job.trigger.fields[7])),"args":int("%d" %job.args)} 
                lanterns.append(lantern)
            self.write(json.dumps({"result":lanterns}));
        #清空任务列表
        elif action == 'clear':
            self.removeJobsClearGPIO()
        #更新任务
        elif action == "update":
            logging.info("update jobs")
            result=self.scheduler.reschedule_job(self.get_argument("lanternTaskId"),trigger='cron',hour=16)
            if result is None:
                self.write(json.dumps({'message': False}))
            else:
                self.write(json.dumps({'message': True}))
        #开/关
        elif action == "switch":
            self.render("lantern.html",lanternState=self.GPIO.input(channel))
        #删除开关任务
        elif action == "delete":
            logging.info("delete lantern")
            result=self.scheduler.remove_job(self.get_argument("lanternTaskId"))
            if result is None:
                self.write(json.dumps({'message': True}))
            else:
                self.write(json.dumps({'message': False}))
        #没有匹配的事件
        else:
            logging.error("invalid action")
            raise Exception("invalid action")

    #向浏览器打印错误日志
    def write_error(self,status_code,**kwargs):
        if 'exc_info' in kwargs:
            error_message=(str(kwargs['exc_info'][1]))
            self.write("Gosh darnit, user! You caused a %d error, with error message %s " %(status_code , error_message))
        else:
            logging.error("other error")
            self.write("other error")

