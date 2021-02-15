
import os, sys, json, time
from io import BytesIO
from io import StringIO
import urllib.parse
from http.cookies import SimpleCookie
import csv

path = os.path.dirname(os.path.abspath(__file__))
sys.path.append(path)
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "lib"))

import splunk.rest as rest

from splunk import rest
from openpyxl import Workbook


from exporter.logger_helper import getLogger
logger = getLogger('excelExporter_endpoint')

class TestHandler(rest.BaseRestHandler):
    
    def handle_GET(self):
        logger.debug('ExcelExporter handle_GET called')

        #get authToken from cookie
        cookie = SimpleCookie()
        cookie.load(self.request["headers"]["cookie"])
        authToken = self.sessionKey
        logger.debug("handleGET: authToken=%s" % (authToken))
        
        sid = self.request["query"]["sid"]
        logger.debug("handleGET: sid=%s" % (sid))

        filename = self.request["query"]["filename"]
        logger.debug("handleGET: filename=%s" % (filename))

        logger.debug("handleGET: query=%s" % (self.request["query"]))
        if 'search' in self.request["query"]:
            search = self.request["query"]["search"]
            logger.debug("handleGET: search=%s" % (search))
        else: 
            search = None
            logger.debug("handleGET: search=None")

        if self.isJobDone(sid, authToken):
            #TODO: Fehlerhandling (statusCodes)
            response = self.getSearchResults(authToken, sid, search)
            if response == None: 
                logger.debug('No Search Results found')
                self.response.write("No Searchresults found")
                self.response.status = 404
                return
            searchResultsAsCSV = self.stringToCSVReader(response)
            #searchResultsAsCSV = self.removePrivateFields(searchResultsAsCSV)
            excelFileStream = self.writeXLSX(searchResultsAsCSV)
            if excelFileStream == None: 
                logger.debug('Error in transform to excel')
                self.response.write("Error transform Excel")
                self.response.status = 404
                return
        else:
            logger.debug('No Job found')
            self.response.write("No Job found")
            self.response.status = 404
            return
            

        self.response.setHeader('content-type', 'application/x-www-form-urlencoded')
        self.response.setHeader('Content-Disposition', "attachment;filename=%s" % (filename))
        self.response.write(excelFileStream.getvalue())

    # def removePrivateFields(self, searchResult):
    #     field_names_removed_extra_columns = [i for i in f_names if not i.endswith('_intern') and not i.endswith('_noexport') ]

    def isJobDone(self, sid, authToken, search=None):
        try:
            response, content = rest.simpleRequest(
                path = '/services/search/jobs/' + sid + '?output_mode=json',
                sessionKey = authToken,
                method = "GET")
            contentAsJson = json.loads(content)

            isDone = contentAsJson["entry"][0]["content"]["isDone"]
            logger.debug('Job isDone %s' % (isDone))

            return isDone
        except Exception as error:
            logger.error('ExcelExporter isDone: SID not found: %s' % (error))


    def getSearchResults(self, authToken, sid, search=None):
        path='/services/search/jobs/' + sid + '/results_preview?output_mode=csv'

        searchQuery = '&search='

        if search != None:
            searchQuery += urllib.parse.quote(search)
        
        searchQuery += urllib.parse.quote("| fields - _* ")

        path += searchQuery

        logger.debug('REST Call for search Events= %s' % (path))
        try:
            response, content = rest.simpleRequest(
                path = path,
                sessionKey = authToken,
                method = "GET")
            logger.debug('response code %s' % (response["status"]))
           
            return content
        except Exception as error:
            logger.error('ExcelExporter getResults: SID not found: %s' % (error))
    
    def stringToCSVReader(self, input): 
        stream = StringIO(str(input, "utf-8"))
        csvReader = csv.reader(stream, delimiter=',')
        
        return csvReader

    def writeXLSX(self, rows):
        #in memory file as Stream
        virtualWorkbook = BytesIO()
        
        #excel handler
        excelWorkbook = Workbook()
        activeWorksheet = excelWorkbook.active

        for row in rows:
            activeWorksheet.append(row)
        
        excelWorkbook.save(virtualWorkbook)
        logger.debug('excelFile created')
        return virtualWorkbook
