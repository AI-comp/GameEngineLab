function startGame(room) {
  var game = Games.findOne(room.gameId);
  game.initialize(room.capacity);
  game.isStarted = true;
  Games.update(game._id, game);
}

function processGame(gameId, commands) {
  var game = Games.findOne(gameId);
  game.processTurn(commands);
  game.logs.push(game.getStatus());
  if (game.isFinished()) {
    game.logs.push(game.getRanking());
  }
  Games.update(gameId, game);
}

Meteor.startup(function () {
});

Meteor.methods({
  clear: function () {
    Rooms.remove({});
    Games.remove({});
  },

  sendCommand: function (roomId, playerIndex, command) {
    var room = Rooms.findOne(roomId);
    room.players[playerIndex].command = command;

    var commands = _.map(room.players, function (player) {
      return player.command && player.command.split(" ");
    });
    if (_.every(commands, function (command) { return command })) {
      processGame(room.gameId, commands);
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
    return Rooms.insert(new Room(roomName, capacity, gameEngine));
  },
});
