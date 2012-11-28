var util = require('util');
var azure = require('azure');
var config = require('./worker_config.js');

var blobService = azure.createBlobService(config.azure.name, config.azure.key);
var queueService = azure.createQueueService(config.azure.name, config.azure.key);

queueService.createQueueIfNotExists(config.azure.queue, function(error){
    if(!error){
        
    }
});

blobService.listBlobs(config.azure.container, function(error, blobs) {
	if(error)
		util.puts(error);
	else {
		util.puts(JSON.stringify(blobs));
		for(var i in blobs) {
			util.puts(JSON.stringify(blobs[i].name));
			if(/\.zip$/.test(blobs[i].name)) {
				queueService.createMessage(config.azure.queue, blobs[i].name, function(error) {
						if(error)
							util.puts(error);
				});
			}
		}
	}
});
