function initializeGame() {
  var game = new Game(4);
  game.populateHeroines(10);
  Games.insert(game);
  return game;
}

function createCommandArray(commandsCursor) {
  var commands = [];
  commandsCursor.forEach(function (command) {
    var player = Players.findOne(command.playerId);
    commands[player.index] = command.text.split(" ");
  });
  return commands;
}

Meteor.startup(function () {
  var game = initializeGame();

  return Meteor.methods({
    advance_turn: function (cmds) {
      console.log(JSON.stringify(game));
      console.log(cmds);
      if (!game.isFinished()) {
        game.proceed(cmds);
      }
      Messages.insert({
        name: "system",
        msg: JSON.stringify(game.getRanking())
      });
      var gameId = Games.findOne({})._id;
      Games.update(gameId, { $set: game });
    },

    clear: function () {
      Players.remove({});
      Messages.remove({});
      Commands.remove({});
      Games.remove({});
      game = initializeGame();
    },

    sendCommand: function (command) {
      Commands.update({ playerId: command.playerId, turn: command.turn }, command, { upsert: true });
      var game = Games.findOne({});
      var commandsForThisTurn = Commands.find({ turn: game.turn });
      if (commandsForThisTurn.count() == Players.find({}).count()) {
        Meteor.call("advance_turn", createCommandArray(commandsForThisTurn));
      }
    },

    enter: function (name) {
      var index = Players.find({}).count();
      return Players.insert(new Player(name, index));
    },
  });
});
