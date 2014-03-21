function game() {
  return room() && Games.findOne(room().gameId);
}

function room() {
  return Rooms.findOne(Session.get("roomId"));
}

function myIndex() {
  return Session.get("playerIndex");
}

function me() {
  return myIndex() && game() && game().players[myIndex()];
}

Template.outer.inRoom = function () {
  return (Session.get("roomId") != undefined);
};

Template.lobby.rooms = function () {
  return Rooms.find({});
};

Template.roomInfo.events({
  "click #join": function (event, template) {
    joinRoom(this._id, $("#player_name").val());
  }
});

Template.newRoom.events({
  "click #new_room": function (event, template) {
    var roomName = template.find("#room_name").value;
    var capacity = parseInt(template.find("#capacity").value);
    var gameEngine = template.find("#game_engine").value;
    if (!roomName || !capacity || !gameEngine) {
      alert("All information must be given.");
    } else {
      Meteor.call("createRoom", roomName, capacity, gameEngine, function (error, result) {
        var roomId = result;
        if (error) {
          console.log(error);
        } else {
          joinRoom(roomId);
        }
      });
    }
  }
});

Template.console.gameLogs = function () {
  return game() && game().logs;
};

Template.commandCenter.players = function () {
  return game() && game().players;
};

Template.commandCenter.myCommand = function () {
  return me() && me().command;
};

Template.commandCenter.events({
  'click #send_cmd': function (event, template) {
    Meteor.call("sendCommand", room()._id, myIndex(), template.find("#cmd_text").value);
  }
});

function joinRoom(roomId, playerName) {
  if (!playerName) {
    playerName = "Anonymous";
  }
  Meteor.call("joinRoom", roomId, playerName, function (error, result) {
    if (error) {
      console.log(error);
    } else {
      var playerIndex = result;
      Session.set("roomId", roomId);
      Session.set("playerIndex", playerIndex);
    }
  });
}