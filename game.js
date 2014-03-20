// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

(function () {
  Player = (function () {
    function Player(index) {
      this.index = index;
      this.star = 0;
      this.totalLoveScore = 0;
    }

    Player.compareTo = function (self, other) {
      if (self.star === other.star) {
        return self.totalLoveScore > other.totalLoveScore ? 1 : (self.totalLoveScore < other.totalLoveScore ? -1 : 0);
      } else {
        return self.star > other.star ? 1 : -1;
      }
    };

    return Player;

  })();

}).call(this);

(function () {
  Heroine = (function () {
    function Heroine(value, numPlayers) {
      this.value = value;
      this.dateScore = [];
      this.loveScore = [];
      for (var i = 0; i < numPlayers; i++) {
        this.dateScore.push(0);
        this.loveScore.push(0);
      }
    }

    Heroine.prototype.date = function (playerIndex) {
      this.dateScore[playerIndex] += 1;
    };

    Heroine.prototype.updateLoveScore = function () {
      totalDateScore = this.dateScore.reduce(function (x, y) {
        return x + y;
      });
      for (playerIndex = 0; playerIndex < this.loveScore.length; playerIndex++) {
        var pureScore = this.value * this.dateScore[playerIndex];
        if (pureScore > 0) {
          this.loveScore[playerIndex] += pureScore / totalDateScore;
        }
      }
    };

    Heroine.prototype.getBestPlayers = function (players) {
      var maxScore = Math.max.apply(null, this.loveScore);
      var bestPlayers = [];
      _.each(players, function (player) {
        if (this.loveScore[player.index] === maxScore) {
          bestPlayers.push(player);
        }
      }, this);
      return bestPlayers;
    };

    return Heroine;

  })();

}).call(this);

(function () {
  Game = (function () {
    function Game(numPlayers) {
      this.numPlayers = numPlayers;
      this.heroines = [];
      this.turn = 0;
    }

    Game.prototype.addHeroine = function (value) {
      this.heroines.push(new Heroine(value, this.numPlayers));
    };

    Game.prototype.populateHeroines = function (numHeroines) {
      this.heroines = []
      for (var i = 0; i < numHeroines; i++) {
        this.heroines.push(new Heroine(Math.floor(Math.random() * 6) + 1, this.numPlayers));
      }
    };

    Game.prototype.proceed = function (moves) {
      this.turn += 1;

      for (var i = 0; i < this.turn; i++) {
        for (var playerIndex = 0; playerIndex < this.numPlayers; playerIndex++) {
          var targetHeroineIndex = moves[playerIndex][i];
          if (targetHeroineIndex < 0 || targetHeroineIndex >= this.heroines.length) {
            targetHeroineIndex = 0;
          }
          this.heroines[targetHeroineIndex].date(playerIndex);
        }
      }

      _.each(this.heroines, function (heroine) {
        heroine.updateLoveScore();
      });
    };

    Game.prototype.isFinished = function () {
      return this.turn === 10;
    };

    Game.prototype.getRanking = function () {
      var players = [];
      for (var index = 0; index < this.numPlayers; index++) {
        players.push(new Player(index));
      }

      _.each(this.heroines, function (heroine) {
        var bestPlayers = heroine.getBestPlayers(players);
        _.each(bestPlayers, function (bestPlayer) {
          bestPlayer.star += 1 / bestPlayers.length;
        });
      });

      _.each(players, function (player) {
        player.totalLoveScore = this.heroines.map(function (heroine) {
          return heroine.loveScore[player.index];
        }).reduce(function (x, y) {
          return x + y;
        });
      }, this);

      return players.slice(0).sort(Player.compareTo).reverse();
    };

    return Game;

  })();

}).call(this);

Players = new Meteor.Collection("players");
Messages = new Meteor.Collection("messages");
Commands = new Meteor.Collection("commands");
Games = new Meteor.Collection("games");

Player = function (name) {
  var self = this;
  self.name = name;
  self.ready = false;
  self.command = "";
}

Command = function (playerId, text, turn) {
  var self = this;
  self.playerId = playerId;
  self.text = text;
  self.turn = turn;
}

if (Meteor.isClient) {
  var turn = 0;

  Template.chat.me = Template.command_center.me = function () {
    return Players.findOne(Session.get("me"));
  };

  Template.command_center.players = function () {
    return Players.find({}, { sort: { id: 1, name: 1 } });
  };

  Template.command_center.myCommand = function () {
    var me = Template.command_center.me();
    var game = Games.findOne({});
    return Commands.findOne({ playerId: me._id, turn: game.turn });
  };

  Template.command_center.events({
    'click #send_cmd': function () {
      var me = Template.command_center.me();
      var commandText = $("#cmd_text").val();
      var game = Games.findOne({});
      var command = new Command(me._id, commandText, game.turn);
      Meteor.call("sendCommand", command);
    }
  });

  Template.chat.messages = function () {
    return Messages.find({});
  };

  Template.chat.events({
    'click #enter': function () {
      var myId = Players.insert({
        name: $("#name").val(),
        ready: false
      });
      Session.set("me", myId);
    },
    'click #ready': function () {
      Players.update(Session.get("me"), { $set: { ready: true } });
    },
    'click #advance': function () {
      turn += 1;
      cmds = _.range(turn);
      Meteor.call('advance_turn', [
          cmds.map(function(x) { return 1; })
        , cmds.map(function(x) { return 2; })
        , cmds.map(function(x) { return 2; })
        , cmds.map(function(x) { return 3; })
      ]);
    },
    'click #clear': function () {
      Meteor.call('clear');
      turn = 0;
    },
    'click #send': function () {
      var me = Template.chat.me();
      Messages.insert({
        name: me.name,
        msg: $("#chat_msg").val()
      });
    }
  });

  Template.player.command = function () {
    var game = Games.findOne({});
    if (!game) return undefined;
    var c = Commands.findOne({ playerId: this._id, turn: game.turn - 1 });
    console.log(c);
    return c;
  };
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {

  function initializeGame() {
    var game = new Game(4);
    game.populateHeroines(10);
    return Games.insert(game);
  };

  Meteor.startup(function () {
    var gameId = initializeGame();
    return Meteor.methods({
      advance_turn: function(cmds) {
        var game = Commands.findOne(gameId);
        if (!game.isFinished()) {
          game.proceed(cmds);
        }
        Messages.insert({
          name: "system",
          msg: JSON.stringify(game.getRanking())
        });
        Games.update(gameId, { $set: game });
      },
      clear: function() {
        Players.remove({});
        Messages.remove({});
        Commands.remove({});
        Games.remove({});
        gameId = initializeGame();
      },

      sendCommand: function (command) {
        Commands.update({ _id: command.id, turn: command.turn }, command, { upsert: true });
      },
    });
  });
}
