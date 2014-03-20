var turn = 0;

Template.chat.me = Template.command_center.me = function () {
  return Players.findOne(Session.get("me"));
};

Template.command_center.players = function () {
  return Players.find({}, { sort: { id: 1, name: 1 } });
};

Template.command_center.myCommand = function () {
  var me = Template.command_center.me();
  var game = Games.findOne({});
  return Commands.findOne({ playerId: me._id, turn: game.turn });
};

Template.command_center.events({
  'click #send_cmd': function () {
    var me = Template.command_center.me();
    var commandText = $("#cmd_text").val();
    var game = Games.findOne({});
    var command = new Command(me._id, commandText, game.turn);
    Meteor.call("sendCommand", command);
  }
});

Template.chat.messages = function () {
  return Messages.find({});
};

Template.chat.events({
  'click #enter': function () {
    var myId = Players.insert({
      name: $("#name").val(),
      ready: false
    });
    Session.set("me", myId);
  },
  'click #ready': function () {
    Players.update(Session.get("me"), { $set: { ready: true } });
  },
  'click #advance': function () {
    turn += 1;
    cmds = _.range(turn);
    Meteor.call('advance_turn', [
        cmds.map(function(x) { return 1; })
      , cmds.map(function(x) { return 2; })
      , cmds.map(function(x) { return 2; })
      , cmds.map(function(x) { return 3; })
    ]);
  },
  'click #clear': function () {
    Meteor.call('clear');
    turn = 0;
  },
  'click #send': function () {
    var me = Template.chat.me();
    Messages.insert({
      name: me.name,
      msg: $("#chat_msg").val()
    });
  }
});

Template.player.command = function () {
  var game = Games.findOne({});
  if (!game) return undefined;
  var c = Commands.findOne({ playerId: this._id, turn: game.turn - 1 });
  //console.log(c);
  return c;
};
