from handlers.base import BaseHandler

import logging

logger = logging.getLogger('boilerplate.' + __name__)


class FooHandler(BaseHandler):
    def get(self):
        #self.write("fooHandler message")
        self.render("lantern_md.html")
