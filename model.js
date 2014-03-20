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

////////////////// Hero //////////////////
function Hero(index) {
  this.index = index;
  this.star = 0;
  this.totalLoveScore = 0;
}

Hero.compareTo = function (self, other) {
  if (self.star === other.star) {
    return self.totalLoveScore > other.totalLoveScore ? 1 : (self.totalLoveScore < other.totalLoveScore ? -1 : 0);
  } else {
    return self.star > other.star ? 1 : -1;
  }
};


////////////////// Heroine //////////////////
function Heroine(value, numHeros) {
  this.value = value;
  this.dateScore = [];
  this.loveScore = [];
  for (var i = 0; i < numHeros; i++) {
    this.dateScore.push(0);
    this.loveScore.push(0);
  }
}

Heroine.prototype.date = function (heroIndex) {
  this.dateScore[heroIndex] += 1;
};

Heroine.prototype.updateLoveScore = function () {
  totalDateScore = this.dateScore.reduce(function (x, y) {
    return x + y;
  });
  for (heroIndex = 0; heroIndex < this.loveScore.length; heroIndex++) {
    var pureScore = this.value * this.dateScore[heroIndex];
    if (pureScore > 0) {
      this.loveScore[heroIndex] += pureScore / totalDateScore;
    }
  }
};

Heroine.prototype.getBestHeros = function (heros) {
  var maxScore = Math.max.apply(null, this.loveScore);
  var bestHeros = [];
  _.each(heros, function (hero) {
    if (this.loveScore[hero.index] === maxScore) {
      bestHeros.push(hero);
    }
  }, this);
  return bestHeros;
};


////////////////// Game //////////////////
function Game(numHeros) {
  this.numHeros = numHeros;
  this.heroines = [];
  this.turn = 0;
}

Game.prototype.addHeroine = function (value) {
  this.heroines.push(new Heroine(value, this.numHeros));
};

Game.prototype.populateHeroines = function (numHeroines) {
  this.heroines = []
  for (var i = 0; i < numHeroines; i++) {
    this.heroines.push(new Heroine(Math.floor(Math.random() * 6) + 1, this.numHeros));
  }
};

Game.prototype.proceed = function (moves) {
  this.turn += 1;

  for (var i = 0; i < this.turn; i++) {
    for (var heroIndex = 0; heroIndex < this.numHeros; heroIndex++) {
      var targetHeroineIndex = moves[heroIndex][i];
      if (targetHeroineIndex < 0 || targetHeroineIndex >= this.heroines.length) {
        targetHeroineIndex = 0;
      }
      this.heroines[targetHeroineIndex].date(heroIndex);
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
  var heros = [];
  for (var index = 0; index < this.numHeros; index++) {
    heros.push(new Hero(index));
  }

  _.each(this.heroines, function (heroine) {
    var bestHeros = heroine.getBestHeros(heros);
    _.each(bestHeros, function (bestHero) {
      bestHero.star += 1 / bestHeros.length;
    });
  });

  _.each(heros, function (hero) {
    hero.totalLoveScore = this.heroines.map(function (heroine) {
      return heroine.loveScore[hero.index];
    }).reduce(function (x, y) {
      return x + y;
    });
  }, this);

  return heros.slice(0).sort(Hero.compareTo).reverse();
};
