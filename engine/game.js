Game = (function () {
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
  
  return Game;
})();