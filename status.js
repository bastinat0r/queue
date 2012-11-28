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
		for(var i in blobs) {
			util.puts(JSON.stringify(blobs[i].name));
		}
	}
});

queueService.getMessages(config.azure.queue, function(err, msgs) {
	for(var i in msgs) {
		util.puts(JSON.stringify(msgs[i]));
	}
});
