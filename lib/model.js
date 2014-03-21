Rooms = new Meteor.Collection("rooms");

Player = function (name, index) {
  var self = this;
  self.name = name;
  self.index = index;
  self.command = undefined;
}

Room = function (name, capacity, gameId) {
  var self = this;
  self.name = name;
  self.capacity = capacity;
  self.gameId = gameId;
  self.players = [];
  self.logs = [];
  self.isStarted = false;
}