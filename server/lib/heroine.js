Heroine = (function () {
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
  
  return Heroine;
})();