var http = require('http');
var url = require('url');
var counter = 0;
http.createServer(function (req, res) {
  	var path = url.parse(req.url).path;
  	console.log(path);
	if(path == '/') counter++;
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end('Hello World\n'+counter);

}).listen(9999, '127.0.0.1');
console.log('Server running at http://127.0.0.1:9999/');