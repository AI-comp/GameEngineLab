var games = [];

String.prototype.endsWith = function(suffix) {
  return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function startGame(room) {
  var game = games[room.gameId];
  game.initialize(room.capacity);
  room.logs.push(game.getStatus());
  room.isStarted = true;
}

function processGame(room, commands) {
  var game = games[room.gameId];
  if (game.finished === true) {
    return;
  }
  game.processTurn(commands);
  room.logs.push(game.getStatus());
  if (game.isFinished()) {
    room.logs.push(game.getRanking());
    game.finished = true;
  }
}

Meteor.startup(function () {
  //Assets.getText('sample.js');

  var fs = Npm.require('fs');
  var scriptDir = '../server/assets/app/';
  var scriptNames = fs.readdirSync(scriptDir)
    .filter(function(name) { return _.endsWith(name, ".js"); });

  Scripts.remove({});
  _.each(scriptNames, function(name) {
    console.log(name);
    var content = fs.readFileSync(scriptDir + name).toString();
    Scripts.insert(new Script(name, content));
  });
});

Meteor.methods({
  clear: function () {
    Rooms.remove({});
    games = [];
  },

  sendCommand: function (roomId, playerIndex, command) {
    var room = Rooms.findOne(roomId);
    room.players[playerIndex].command = command;

    var commands = _.map(room.players, function (player) {
      return player.command && player.command.trim().split(" ");
    });
    if (_.every(commands, function (command) { return command })) {
      processGame(room, commands);
      _.each(room.players, function (player) {
        player.command = undefined;
      });
    }

    Rooms.update(roomId, room);
  },

  joinRoom: function (roomId, playerName) {
    var room = Rooms.findOne(roomId);
    var index = room.players.length;
    room.players.push(new Player(playerName, index));

    if (room.players.length == room.capacity) {
      startGame(room);
    }

    Rooms.update(roomId, room);
    return index;
  },

  createRoom: function (roomName, capacity, gameEngine) {
    var gameIndex = games.length;
    games.push(eval(gameEngine));
    return Rooms.insert(new Room(roomName, capacity, gameIndex));
  },
});
