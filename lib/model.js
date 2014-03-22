Rooms = new Meteor.Collection("rooms");
Scripts = new Meteor.Collection("scripts");

Room = function (name, capacity, gameId) {
  var self = this;
  self.name = name;
  self.capacity = capacity;
  self.gameId = gameId;
  self.players = [];
  self.logs = [];
  self.messages = [];
  self.isStarted = false;
};

Script = function (name, script) {
  var self = this;
  self.name = name;
  self.script = script;
};

Player = function (name, index) {
  var self = this;
  self.name = name;
  self.index = index;
  self.command = undefined;
};

Message = function (name, text) {
  var self = this;
  self.name = name;
  self.text = text;
};
