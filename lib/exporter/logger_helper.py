import os
import re
import logging, logging.handlers


SPLUNK_HOME = os.environ.get('SPLUNK_HOME')
LOG_FILENAME = os.path.join(SPLUNK_HOME, 'var', 'log', 'splunk', 'ExcelExporter.log')

DEBUG_format = '%(asctime)s millis=%(msecs)06d log_level=%(levelname)s logger=%(name)s function=%(funcName)s line=%(lineno)d message=%(message)s'
INFO_format = '%(asctime)s log_level=%(levelname)s message=%(message)s'

handler = logging.handlers.RotatingFileHandler(LOG_FILENAME, maxBytes=1024000, backupCount=5, encoding='utf-8')
f = logging.Formatter(INFO_format)
handler.setFormatter(f)

def getLogger(loggerName):
    logger = logging.getLogger(loggerName)
    logger.setLevel(logging.DEBUG)
    logger.addHandler(handler)

    return logger