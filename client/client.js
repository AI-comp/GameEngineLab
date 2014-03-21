function room() {
  return Rooms.findOne(Session.get("roomId"));
}

function myIndex() {
  return Session.get("playerIndex");
}

Template.outer.inRoom = function () {
  return (Session.get("roomId") != undefined);
};

Template.lobby.rooms = function () {
  return Rooms.find({});
};

Template.lobby.events({
  "click #clear": function () {
    Meteor.call("clear");
  }
});

Template.roomInfo.events({
  "click #join": function () {
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
  return room() && room().logs;
};

Template.commandCenter.players = function () {
  return room() && room().players;
};

Template.commandCenter.started = function () {
  return room() && room().isStarted;
};

Template.commandCenter.events({
  'click #send_cmd': function (event, template) {
    Meteor.call("sendCommand", room()._id, myIndex(), template.find("#cmd_text").value);
  }
});

Template.player.ready = function () {
  return this.command ? "ready" : "thinking";
};

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