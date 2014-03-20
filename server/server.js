function initializeGame() {
  var game = new Game(4);
  game.populateHeroines(10);
  Games.insert(game);
  return game;
}

Meteor.startup(function () {
  var game = initializeGame();
  return Meteor.methods({
    advance_turn: function(cmds) {
      console.log(JSON.stringify(game));
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
      if (Commands.find({ turn: game.turn }).count() == Players.find({}).count()) {
        //game.proceed
      }
    },
  });
});