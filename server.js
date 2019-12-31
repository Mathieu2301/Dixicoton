require('console.table');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 80;

app.use(require('express').static(__dirname + "/dist"));
app.get('/', function(req, res){
    res.sendFile(__dirname + '/dist/index.html');
});
app.get('/*', function(req, res){
    res.sendFile(__dirname + '/dist/index.html');
});

http.listen(port, () => console.log(`Listening on *:${port}`));

Array.prototype.remove = function(i) {
    return this.filter(e => e != i)
}

Array.prototype.pickRandom = function() {
	return this[Math.floor(Math.random() * this.length)];
}

let players = [];

io.on('connection', socket => {
    socket.on('play', () => {
        players.push(socket.id);
        io.emit('players', players.length);

        socket.on('word', (word, exception, callback) => {
            const list = players.filter(id => id != socket.id);
            const exception_player = list.pickRandom();
            
            if (exception == '') exception = '.';
            
            list.forEach(player => {
                if (player != exception_player) {
                    io.to(player).emit('word', word);
                }else{
                    io.to(exception_player).emit('word', exception);
                }
            });

            callback();
        });
        
        socket.on('disconnect', () => {
            players = players.remove(socket.id);
            io.emit('players', players.length);
        });
    });
});
