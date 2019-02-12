define([
    'underscore',
    "splunkjs/mvc",
    'splunkjs/mvc/simplexml/ready!'
], function (_, mvc) {

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
     * saves an array of objects in kv-store
     * @param {String} collection name of kv-store collection 
     * @param {Array} records array of objects, that should be stored
     */
	function saveRecordsInBatch(collection, records) {
        service.request(
			this.restEndPoint + "storage/collections/data/" + collection + '/batch_save',
			"POST",
			null,
			null,
            records,
            {
			"Content-Type": "application/json"
		    },
			null);
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
    
    //TODO: mahu 07.11.2018 verschieben, sodass dieser Service aus 
    //außerhalb des Filterprofils genutzt werden kann.
    /**
     * Service for storing records in kv-store
     * @param restEndpoint {String} Url of REST-endpoit for kv-store
     */
    return function KVStoreServices(restEndpoint) {
        this.restEndPoint = restEndpoint;

        return{
            deleteRecord: deleteRecord.bind(this),
            saveRecord: saveRecord.bind(this),
            saveRecordsInBatch: saveRecordsInBatch.bind(this)
        }
    }
});