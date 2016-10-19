var http = require('http');
var fs   = require('fs');

var server = http.createServer(function(req, res) {
	fs.createReadStream('./scratchtest.html').pipe(res);
}).listen(8080);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
	socket.emit('server/hello', { from: 'server' });
	socket.on('browser/move', function (data) {
		io.sockets.emit('browser/move', data);
	});
	socket.on('browser/rotate', function (data) {
		io.sockets.emit('browser/rotate', data);
	});
});
