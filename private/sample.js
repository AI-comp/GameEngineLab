(function() {
  var engine = {
    turn: 0,
    scores: [],
    initialize: function(playerCount) {
      console.log("initialize");
      this.scores = _.range(playerCount).map(function() { return 0; });
    },
    processTurn: function(cmdsList) {
      console.log("processTurn");
      this.turn++;
      _.each(cmdsList, function(cmds, index) {
        this.scores[index] += _.reduce(cmds, function(memo, cmd) { return memo + parseInt(cmd); }, 0);
      }, this);
      return "processTurn " + this.turn;
    },
    isFinished: function() {
      console.log("isFinished");
      return this.turn == 2;
    },
    getStatus: function() {
      console.log("getStatus");
      return "getStatus turn: " + this.turn + ", scores: " + this.scores.join(', ');
    },
    getRanking: function() {
      console.log("getRanking");
      return "getRanking scores:" + this.scores.join(', ');
    },
  };

  return engine;
}).call(this);
