var util = require('util');
var azure = require('azure');
var config = require('./worker_config.js');
var fs = require('fs');

var blobService = azure.createBlobService(config.azure.name, config.azure.key);

blobService.createContainerIfNotExists(config.azure.container, {publicAccessLevel : 'blob'}, function(error){
    if(!error){
        // Container exists and is public
    }
});

fs.readdir('./data/', function(err, filenames) {
	if(err)
		util.puts(err);
	else {
		util.puts(JSON.stringify(filenames));
		for(var i in filenames) {
			blobService.createBlockBlobFromFile(config.azure.container, filenames[i], "./data/" + filenames[i], function (error){
					if(!error){
							// Blob uploaded
						util.puts("uploaded: ./data/" + filenames[i]);
					}
			});
		}
	}
});
blobService.listBlobs(config.azure.container, function(error, blobs) {
	if(error)
		util.puts(error);
	else
		util.puts(JSON.stringify(blobs));
});
