var games = [];

function startGame(room) {
  var game = games[room.gameId];
  game.initialize(room.capacity);
  room.logs.push(game.getStatus());
  room.isStarted = true;
}

function processGame(room, commands) {
  var game = games[room.gameId];
  game.processTurn(commands);
  room.logs.push(game.getStatus());
  if (game.isFinished()) {
    room.logs.push(game.getRanking());
  }
}

Meteor.startup(function () {
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
