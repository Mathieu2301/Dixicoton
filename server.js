require('console.table');
const { printTable } = require('console-table-printer');
// const io = require('socket.io')(8000);
const partyEvent = new (require('events'));

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

http.listen(port, function(){
    console.log(`Listening on *:${port}`);
});

Array.prototype.remove = function(i) {
    return this.filter(e => e != i)
}

Array.prototype.pickRandom = function() {
	return this[Math.floor(Math.random() * this.length)];
}

const parties = {};

const Party = function(){
    this.id = 'ABCDEFG';
    parties[this.id] = this;
    
    this.started = false;
    this.joinable = true;
    this.owner = '';
    this.players = [];
    this.turn = -1;
    this.waitingForWord = false;

    this.join = function(username) {
        if (!this.players.includes(username)) {
            if (this.players.length == 0) this.owner = username;
            this.players.push(username);
            this.commit()
        }
    }

    this.start = function() {
        if (!this.started && this.players.length > 2){
            console.log("Starting");
            this.started = true;
            this.joinable = false;
            this.next();
        }
    }
    
    this.next = function() {
        this.turn++;
        if (!this.players[this.turn]) this.turn = 0;
        console.log("Next turn =", this.turn, '=>', this.players[this.turn]);
        this.waitingForWord = true;
        this.commit();
    }

    this.leave = function(username) {
        if (this.players.includes(username)) {
            this.players = this.players.remove(username);
            if (this.players.length != 0){
                this.owner = this.players[0];
            }else{
                this.delete();
            }
            this.commit();
        }
    }

    this.sendWord = function(word, noWord = '') {
        if (this.waitingForWord) {
            this.waitingForWord = false;
            partyEvent.emit(this.id, 'sendWord', {
                exception: this.players.filter(p => p != this.owner).pickRandom(),
                word,
                noWord
            });
            this.commit();
        }
    }

    this.delete = function(){
        io.emit("deleteParty", this.id);
        delete parties[this.id];
        this.commit()
    }

    this.commit = function(){
        partyEvent.emit(this.id, 'partyUpdate');
        debug();
    }
}

io.on('connection', socket => {
    socket.on('createParty', callback => callback(new Party()));
    socket.on('getParty', (PID, callback) => callback(parties[PID]));

    socket.on('joinParty', ({username, party}, callback) => {
        if (parties[party] && parties[party].joinable && !parties[party].players.includes(username)) {
            party = parties[party];

            party.join(username);
            callback({ success: true });

            socket.emit('partyUpdate', party);

            partyEvent.on(party.id, (type, args = {}) => {
                if (type == 'partyUpdate') {
                    socket.emit('partyUpdate', party)
                }else if (type == 'sendWord') {
                    socket.emit('word', (username != args.exception ? args.word : args.noWord))
                }
                
            });

            socket.on('word', (word, noWord = '') => {
                if (party.players[party.turn] == username) party.sendWord(word, noWord);
            });

            socket.once('partyStart', () => {
                if (party.owner == username) party.start();
            });

            socket.on('nextTurn', () => {
                if (party.players[party.turn] == username) party.next();
            });
        }else{
            callback({ error: "La partie n'existe pas" });
        }
    })

});

function debug(){
    if (parties['ABCDEFG']) {
        const {id, started, joinable, owner, players, turn} = parties["ABCDEFG"];
        printTable([{id, started, joinable, owner, players, turn}]);
    }
}
