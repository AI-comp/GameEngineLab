// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

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

Game = function () {
  var self = this;
  self.turn = 0;
}

if (Meteor.isClient) {
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
    'click #clear': function () {
      Meteor.call('clear');
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
  Meteor.startup(function () {
    Games.insert(new Game());

    return Meteor.methods({
      clear: function () {
        Players.remove({});
        Messages.remove({});
        Commands.remove({});
        Games.remove({});
      },

      sendCommand: function (command) {
        Commands.update({ _id: command.id, turn: command.turn }, command, { upsert: true });
      },
    });
  });
}
