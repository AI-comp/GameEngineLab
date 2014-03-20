Hero = (function () {
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
  
  return Hero;
})();