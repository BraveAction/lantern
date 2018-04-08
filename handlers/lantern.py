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

def obj2dict(x):
    if hasattr(x, '__dict__'):
        return vars(x)
    else:
        ret = {slot: getattr(x, slot) for slot in x.__slots__}
        for cls in type(x).mro():
            spr = super(cls, x)
            if not hasattr(spr, '__slots__'):
                break
            for slot in spr.__slots__:
                ret[slot] = getattr(x, slot)
        return ret

class LanternHandler(BaseHandler):
    def __init__(self,application,request,**kwargs):
        super(LanternHandler,self).__init__(application,request,**kwargs)
        GPIO=self.GPIO
        try:
            #GPIO.setup(channel,GPIO.OUT,initial=GPIO.LOW)
            GPIO.setup(channel,GPIO.OUT)
            GPIO.setup(channel1,GPIO.OUT)
            logging.info("channel default value is %d " %  GPIO.input(channel))
        except RuntimeError:
            logging.warning("GPIO no mode")
            GPIO.setwarnings(False) 
            GPIO.setmode(GPIO.BCM)
            GPIO.setup(channel,GPIO.OUT)
            GPIO.setup(channel1,GPIO.OUT)

    def switchLantern(self,switch):
        self.GPIO.output(channel,switch)
        self.GPIO.output(channel1,switch)
        self.write({"lanternState":self.GPIO.input(channel)});

    def switchLanternTask(self,switch):
        self.GPIO.output(channel,switch)
        self.GPIO.output(channel1,switch)

    def removeJobsClearGPIO(self):
        logging.info("GPIO cleanup and Scheduler remove all jobs")
        self.GPIO.cleanup()
        self.scheduler.remove_all_jobs()
        self.write("cleanup complete")

    def addJob(self):
        GPIO=self.GPIO
        job=self.scheduler.add_job(self.switchLanternTask, 'cron', year=2018, month=1, day='*', hour=21, minute=00,end_date=datetime(2018,1,25,20,59), args=[NO])
        logging.info("add job info %s :" % job)
        self.write("channel default value is %d " %  GPIO.input(channel))

    def put(self,input):
        self.write("put")

    def post(self,input):
        #self.set_header('Content-Type', 'application/json; charset=UTF-8')

        action=str(input)
        logger.info("action is %s " % action)

        if action == "addnew":
            obj=self.get_json_argument("dateTime")
            fdatetime=datetime.strptime(str("%s %s" % (obj["date"],obj["time"])),"%Y-%m-%d %H:%M")

            result=self.scheduler.add_job(self.switchLanternTask, 'cron', year=fdatetime.year, month=fdatetime.month, day=fdatetime.day, hour=fdatetime.hour, minute=fdatetime.minute, args=[int("%s" % obj["flag"])])

            logger.info("%s" % result)
            logger.info(obj2dict(result))
            if result is not None:
                #self.write(simplejson.dumps(obj2dict(result)))
                #self.write(json.dumps({'message': True}))
                self.write(json.dumps({'id':result.id,'args':int('%d' % result.args),'year':str(result.trigger.fields[0]),'month':str(result.trigger.fields[1]),'day':str(result.trigger.fields[2]),'hour':str(result.trigger.fields[5]),'minute':str(result.trigger.fields[6]),'second':str(result.trigger.fields[7])}))

    def get(self,input):
        action=str(input)
        logger.info("action is %s " % action)

        if action == "list":
            jobs = self.scheduler.get_jobs()
            self.render("lantern_md.html",lanternTasks = jobs,lanternState=self.GPIO.input(channel))
        elif action == 'clear':
            self.removeJobsClearGPIO()
        elif action == "update":
            logging.info("update jobs")
        elif action == "add":
            self.addJob()
        elif action == "switch":
            self.render("lantern.html",lanternState=self.GPIO.input(channel))
        elif action == "on":
            logging.info("open lantern")
            self.switchLantern(NO)
        elif action == "off":
            logging.info("close lantern")
            self.switchLantern(OFF)
        elif action == "delete":
            logging.info("delete lantern")
            result=self.scheduler.remove_job(self.get_argument("lanternTaskId"))
            if result is None:
                self.write(json.dumps({'message': True}))
            else:
                self.write(json.dumps({'message': True}))
        else:
            logging.error("invalid action")
            raise Exception("invalid action")

    def write_error(self,status_code,**kwargs):
        if 'exc_info' in kwargs:
            error_message=(str(kwargs['exc_info'][1]))
            self.write("Gosh darnit, user! You caused a %d error, with error message %s " %(status_code , error_message))
        else:
            logging.error("other error")
            self.write("other error")

