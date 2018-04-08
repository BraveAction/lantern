from handlers.foo import FooHandler
from handlers.index import IndexHandler
from handlers.lantern import LanternHandler

url_patterns = [
    (r"/foo", FooHandler),
    (r"/index",IndexHandler),
    (r"/lantern/(\w+)",LanternHandler),
]
