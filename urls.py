from handlers.index import IndexHandler
from handlers.lantern import LanternHandler

url_patterns = [
    (r"/index",IndexHandler),
    (r"/lantern/(\w+)",LanternHandler),
]
