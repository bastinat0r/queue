var http = require('http');
var util = require('util');

var clients = {};

var srv = http.createServer(function(req,res) {
	var data = "";
	req.on('data', function(chunk) {
		data = data + chunk;
	});
	req.on('end', function() {
		util.puts(data);
		res.writeHead(200);
		if(req.method == "GET")
			res.end(JSON.stringify(clients));
		if(req.method == "POST") {
			res.end();
			client = JSON.parse(data);
			clients[""+client.id] = client["status"];
			util.puts(JSON.stringify(clients));
		}
	});
});
srv.listen(require('./worker_config.js').opts.port);
