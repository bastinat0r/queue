var http = require('http');
var util = require('util');
var timers = require('timers');
var azure = require('azure');
var fs = require('fs');
var exec = require('child_process').exec;
var config = require('./worker_config.js');


var blobService = azure.createBlobService(config.azure.name, config.azure.key);
var queueService = azure.createQueueService(config.azure.name, config.azure.key);

var id = Math.random();
fs.mkdir('./tmp/'+id, function(err) {
		if(err) util.puts(err);
		process.chdir('./tmp/'+id);
});
var statusstring = "idle";

function updateStatus(newStatus) {
	if(newStatus)
		statusstring = newStatus;
	var req = http.request(config.opts, function(res) {
		res.on('data', function(data){
			util.puts(data);
		});
		res.on('end', function() {
			util.puts("res:end");
		})
	});
	req.end(JSON.stringify({"status" : statusstring, "id" : id}));
	req.on('error', util.puts);
	if(statusstring === "idle")
		getJob();
}

function getJob() {
	queueService.getMessages(config.azure.queue, function(err, msgs) {
		var job = msgs[0];
		if(job) {	
			util.puts("Job: " + JSON.stringify(job));
			queueService.deleteMessage(config.azure.queue, job.messageid, job.popreceipt, function(err) {
				if(err)
					util.puts(err);
				else
					download(job.messagetext);
			});
		} else
			util.puts("Waiting for Jobs.");
	});
}

function download(name) {
	updateStatus("downloading");
	var path = name;
	blobService.getBlobToFile(config.azure.container,name, path,  function(err) {
		if(err)
			util.puts(err)
		else {
			util.puts("downloaded to: " + path);
			processFile(path);
		}
	});
}

function processFile(path) {
	updateStatus("processing");
	unzip = exec('unzip "' + path + '"', function(err, stdout, stderr) {
		util.puts(err);
		util.puts(stdout);
		util.puts(stderr);
	});
	unzip.on('exit', function(code) {
		util.puts("unzip exited with code: " + code);
		unzip = exec('rm "' + path + '"', function(err, stdout, stderr) {
			fs.readdir('.', function(err, filenames) {
				if(err)
					util.puts(err);
				else {
					if(filenames[0])
						upload(filenames[0]);
				}
			});
		});
	});
}

function upload(path) {
	updateStatus("uploading");

	blobService.createBlockBlobFromFile(config.azure.container, path, path, function (error){
			if(!error){
				util.puts("uploaded: " + path);
				updateStatus("idle");
				unzip = exec('rm "' + path + '"', function(err, stdout, stderr) {
					if(err) util.puts(err);
					util.puts(stderr);
				});
			}
	});
}


timers.setInterval(updateStatus, 5000);


