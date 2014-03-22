(function(){
  var engine={
    turn:0,
    initialize:function(){
      console.log("initialize");
    },
    processTurn:function(){
      console.log("processTurn");
      this.turn++;
      return "processTurn " + this.turn;
    },
    isFinished:function(){
      console.log("isFinished");
      return this.turn==2;
    },
    getStatus:function(){
      console.log("getStatus");
      return "getStatus";
    },
    getRanking:function(){
      console.log("getRanking");
      return "getRanking";
    },
  };

  return engine;
}).call(this);
