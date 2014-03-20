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
