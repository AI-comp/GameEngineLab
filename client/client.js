function game() {
  return Games.findOne({});
}

Template.chat.me = Template.command_center.me = function () {
  return Players.findOne(Session.get("me"));
};

Template.command_center.players = function () {
  return Players.find({}, { sort: { id: 1, name: 1 } });
};

Template.command_center.myCommand = function () {
  if (!game()) return undefined;
  var me = Template.command_center.me();
  return Commands.findOne({ playerId: me._id, turn: game().turn });
};

Template.command_center.events({
  'click #send_cmd': function () {
    var me = Template.command_center.me();
    var commandText = $("#cmd_text").val();
    var command = new Command(me._id, commandText, game().turn);
    Meteor.call("sendCommand", command);
  }
});

Template.chat.messages = function () {
  return Messages.find({});
};

Template.chat.events({
  'click #enter': function () {
    Meteor.call("enter", $("#name").val(), function (error, myId) {
      Session.set("me", myId);
    });
  },
  'click #ready': function () {
    Players.update(Session.get("me"), { $set: { ready: true } });
  },
  'click #advance': function () {
    cmds = _.range(game().turn + 1);
    Meteor.call('advance_turn', [
        cmds.map(function (x) { return 1; })
      , cmds.map(function (x) { return 2; })
      , cmds.map(function (x) { return 2; })
      , cmds.map(function (x) { return 3; })
    ]);
  },
  'click #clear': function () {
    Meteor.call('clear');
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
  if (!game()) return undefined;
  return Commands.findOne({ playerId: this._id, turn: game().turn - 1 });;
};

