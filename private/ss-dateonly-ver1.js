(function () {

  var Game = (function () {
    function Game() {
      this.heroines = [];
      this.turn = 1;
    }

    Game.prototype.initialize = function (numheroes) {
      this.numheroes = numheroes;
      this.populateHeroines(numheroes * 2.5);
    };

    Game.prototype.populateHeroines = function (numHeroines) {
      this.heroines = [];
      for (var i = 0; i < numHeroines; i++) {
        this.heroines.push(new Heroine(Math.floor(Math.random() * 6) + 1, this.numheroes));
      }
    };

    Game.prototype.isHoliday = function () {
      return this.turn % 2 === 0;
    };

    Game.prototype.processTurn = function (moves) {
      for (var i = 0; i < (this.isHoliday() ? 2 : 5) ; i++) {
        for (var heroIndex = 0; heroIndex < this.numheroes; heroIndex++) {
          var targetHeroineIndex = parseInt(moves[heroIndex][i]);
          if (!(targetHeroineIndex >= 0 && targetHeroineIndex < this.heroines.length)) {
            targetHeroineIndex = 0;
          }
          this.heroines[targetHeroineIndex].date(heroIndex, this.isHoliday());
        }
      }

      this.turn += 1;
    };

    Game.prototype.isFinished = function () {
      return this.turn === 11;
    };

    Game.prototype.getRanking = function () {
      var heroes = [];
      for (var index = 0; index < this.numheroes; index++) {
        heroes.push(new Hero(index));
      }

      _.each(this.heroines, function (heroine) {
        var bestheroes = heroine.getBestheroes(heroes);
        _.each(bestheroes, function (bestHero) {
          bestHero.star += heroine.value / bestheroes.length;
        });
      });

      var text = "Game Is Over!\n";
      text += this.getScoreText(true);

      var rankedheroes = heroes.slice(0).sort(Hero.compareTo).reverse();
      for (var rank = 0; rank < rankedheroes.length; rank++) {
        var hero = rankedheroes[rank];
        text += (rank + 1) + ": Player " + hero.index + ", " + hero.star + " pts.\n";
      }
      return text;
    };

    Game.prototype.getStatus = function () {
      return _.map(_.range(this.numheroes), function(i) {
        var status = "";
        status += "Turn " + (this.turn) + "\n";
        status += (this.isHoliday() ? "Holiday" : "Weekday") + "\n";
        status += this.getScoreText(false, i);
        return status;
      }, this);
    };

    Game.prototype.getScoreText = function (useRealScore, playerIndex) {
      var text = "";
      for (var i = 0; i < this.heroines.length; i++) {
        var heroine = this.heroines[i];
        text += "Heroine " + i + ": " + heroine.value + ","
        for (var j = 0; j < this.numheroes; j++) {
          text += " " + (useRealScore ? heroine.realScore[j] : heroine.revealedScore[j]);
          if (j === playerIndex) {
            text += " (" + heroine.realScore[j] + ")";
          }
        }
        text += "\n";
      }
      return text;
    };

    return Game;
  })();

  var Hero = (function () {
    function Hero(index) {
      this.index = index;
      this.star = 0;
    }

    Hero.compareTo = function (self, other) {
      return self.star > other.star ? 1 : -1;
    };

    return Hero;
  })();

  var Heroine = (function () {
    function Heroine(value, numheroes) {
      this.value = value;
      this.revealedScore = [];
      this.realScore = [];
      for (var i = 0; i < numheroes; i++) {
        this.revealedScore.push(0);
        this.realScore.push(0);
      }
    }

    Heroine.prototype.date = function (heroIndex, isHoliday) {
      this.realScore[heroIndex] += 1;
      if (!isHoliday) {
        this.revealedScore[heroIndex] += 1;
      }
    };

    Heroine.prototype.getBestheroes = function (heroes) {
      var maxScore = Math.max.apply(null, this.realScore);
      var bestheroes = [];
      _.each(heroes, function (hero) {
        if (this.realScore[hero.index] === maxScore) {
          bestheroes.push(hero);
        }
      }, this);
      return bestheroes;
    };

    return Heroine;
  })();


  return new Game();
})();
