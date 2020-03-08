define([
    'underscore',
    "splunkjs/mvc"
], function (_, mvc) {

    //service raus in util
    //Obejct übergeben, dass AppContext nd collectionname verwendet
    //eine getCollection bauen
    //url aus funktionen rausziehen

	var service = mvc.createService({
        owner: "nobody"
    });


	function renewURIComponent(component) {
		return encodeURIComponent(decodeURIComponent(component));
	}

    /**
     * saves single record in kv-store
     * @param {String} collection name of kv-store collection 
     * @param {Object} record object, that should be stored in kv-store
     * @param {*} overwrite true for overwriting existing record,
     *                      id of record should be stored in _key
     */
	function saveRecord(collection, record, overwrite) {
		if (overwrite) {
			collection = collection + encodeURIComponent(record._key);
        }
        
		service.request(
			this.restEndPoint + "storage/collections/data/" + collection,
			"POST",
			null,
			null,
            record.toJson(), 
            {
			    "Content-Type": "application/json"
		    },
			null);
    }

    /**
     * saves single record in kv-store
     * @param {String} collection name of kv-store collection 
     * @param {Object} record object, that should be stored in kv-store
     * @param {*} overwrite true for overwriting existing record,
     *                      id of record should be stored in _key
     */
	function smartSaveRecord(collection, record, callback) {
        var key = JSON.parse(record)._key;
        var url = this.restEndPoint + "storage/collections/data/" + collection;
        var informedSave = function(errorResponse, response) {
            if (response && response.status == 200) {
                var keyFound = _.find(response.data, function(item) {
                    return item["_key"] == key;
                });
                if (keyFound) {
                    url += "/" + encodeURIComponent(key);
                }
                service.request(
                    url,
                    "POST",
                    null,
                    null,
                    record, 
                    {
                        "Content-Type": "application/json"
                    },
                    callback);
            } else {
                callback(errorResponse, response)
            }
        }
        
		service.request(
			url,
			"GET",
			null,
			null,
            null, 
            {
			    "Content-Type": "application/json"
		    },
            informedSave.bind(this));
    }
    
    /**
     * saves an array of objects in kv-store
     * @param {String} collection name of kv-store collection 
     * @param {Array} records array of objects, that should be stored
     */
	function saveRecordsInBatch(collection, records, callback) {
        service.request(
			this.restEndPoint + "storage/collections/data/" + collection + '/batch_save',
			"POST",
			null,
			null,
            records,
            {
			"Content-Type": "application/json"
		    },
			callback);
    }
    
    /**
     * deletes object in kv-store
     * @param {String} collection name of kv-store collection
     * @param {*} record object, that should be deleted,
     *                   id of object should be stored in _key 
     */
	function deleteRecord(collection, record) {
		service.del(
            this.restEndPoint + "storage/collections/data/" + collection + renewURIComponent(record._key));
    }

    function getRecords(collection, query, callback) {
        var url = this.restEndPoint + "storage/collections/data/" + collection;
		service.request(
			url,
			"GET",
			{query: JSON.stringify(query)},
			null,
            null, 
            {
			    "Content-Type": "application/json"
		    },
            callback);
    }
    
    /**
     * Service for storing records in kv-store
     * @param restEndpoint {String} Url of REST-endpoit for kv-store
     */
    return function KVStoreServices(restEndpoint) {
        this.restEndPoint = restEndpoint;

        return{
            deleteRecord: deleteRecord.bind(this),
            saveRecord: saveRecord.bind(this),
            smartSaveRecord: smartSaveRecord.bind(this),
            saveRecordsInBatch: saveRecordsInBatch.bind(this),
            getRecords: getRecords.bind(this)
        }
    }
});