Games = new Meteor.Collection("games", {
  transform: function (doc) {
    var game = new Game();
    for (var prop in doc) {
      game[prop] = doc[prop];
    }
    return game;
  }
});
Rooms = new Meteor.Collection("rooms");

Player = function (name, index) {
  var self = this;
  self.name = name;
  self.index = index;
  self.command = undefined;
}

Game = function (engineCode) {
  var self = this;
  self.engineCode = engineCode;
  self.logs = [];
  self.isStarted = false;
}

Game.prototype.initialize = function (numPlayers) {
  var engine = eval(this.engineCode);
  engine.initialize(numPlayers);
}

Game.prototype.processTurn = function (commands) {
  var engine = eval(this.engineCode);
  return engine.processTurn(commands);
}

Game.prototype.isFinished = function () {
  var engine = eval(this.engineCode);
  return engine.isFinished();
}

Game.prototype.getStatus = function () {
  var engine = eval(this.engineCode);
  return engine.getStatus();
}

Game.prototype.getRanking = function () {
  var engine = eval(this.engineCode);
  return engine.getRanking();
}

Room = function (name, capacity, engineCode) {
  var self = this;
  self.name = name;
  self.capacity = capacity;
  self.players = [];
  self.gameId = Games.insert(new Game(engineCode));
}