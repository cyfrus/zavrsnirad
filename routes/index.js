var express = require("express");
var router = express.Router();
var db = require("../database/connection.js");

/* GET home page. */
var allConnectedClients = new Map();
var client = function client(socket) {
  this.id = socket.id;
  this.state = "searching";
  this.clientSocket = socket;
  this.LobbyArr = [];
  this.gameRoom = "";
  this.username = "";
  this.changeState = function(newState) {
    this.state = newState;
  };

  this.addLobby = function(lobbyId) {
    this.LobbyArr.push(lobbyId);
  };
};

var gameObject = {
  "id" : "",
  "playerOne" : "",
  "playerTwo" : "",
  "moves" : []
};

var authenticated = function(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/login", function(req, res, next) {
  res.render("login", { showNavbar: false });
});

router.post("/authenticate", function(req, res, next) {
  db.authentication(req.body.username, req.body.password, function(
    result,
    user
  ) {
    if (result) {
      req.session.user = user;
      console.log(req.session.user);
      res.redirect("/");
    } else {
      res.redirect("/login");
    }
  });
});

router.post("/change", function(req, res, next) {
  db.editProfile(
    req.session.user.id,
    req.body.username,
    req.body.firstName,
    req.body.lastName,
    req.body.age,
    req.body.about,
    req.body.password
  );
  req.session.user.username = req.body.usernamce;
  req.session.user["first name"] = req.body.firstName;
  req.session.user["last name"] = req.body.lastName;
  req.session.age = req.body.age;
  req.session.body = req.body.about;
  req.body.password = req.body.password;
  res.redirect("/edit");
});

router.get("/", authenticated, function(req, res, next) {
  res.render("index", { showNavbar: true, user: req.session.user });
});

router.get("/register", function(req, res, next) {
  res.render("register", { showNavbar: false });
});

router.post("/add", function(req, res, next) {
  db.registration(
    req.body.username,
    req.body.firstName,
    req.body.lastName,
    req.body.age,
    req.body.about,
    req.body.password
  );
  res.redirect("/");
});

router.get("/edit", authenticated, function(req, res, next) {
  if (req.session.user) {
    res.render("profile", { showNavbar: true });
  } else {
    res.redirect("/login");
  }
});

router.get("/logout", authenticated, function(req, res, next) {
  req.session.destroy(function(err) {
    res.redirect("/login");
  });
});

router.get("/play", authenticated, function(req, res, next) {
  var connectedUser;
  res.io.on("connection", function(socket) {
    console.log("connected");
    if(!req.session.user.connectionDetails) {
      connectedUser = new client(socket);
      connectedUser.username = req.session.user.username;
      req.session.user.connectionDetails = connectedUser;
    } else {
      connectedUser = req.session.user.connectionDetails;
    }
    connectedUser.clientSocket.on("searchGame", function() {
      console.log("Pocinjem searchati game!");
      if(!allConnectedClients.get(connectedUser.id))
      allConnectedClients.set(socket.id, connectedUser);
      var opponent = findOpponent(allConnectedClients, connectedUser.id);
      if (opponent) {
        var gameRoom = Math.random()
        .toString(36)
        .substring(7);
        console.log("Pronasao protivnika " + opponent.username +" game id i soba je " + gameRoom);
        connectedUser.clientSocket.join(gameRoom);
        opponent.clientSocket.join(gameRoom);
        db.createGame(gameRoom, "player", 30);
        res.io.in(gameRoom).emit('gameCreated', gameRoom);
        allConnectedClients.delete(connectedUser.id);
        allConnectedClients.delete(opponent.id);
      } else {
        console.log("nije pronasao protivnika!");
      }
    });
    

    connectedUser.clientSocket.on('disconnect', function() {
        allConnectedClients.delete(connectedUser.id);
        console.log(allConnectedClients);
    });
    
  });
  res.render("play", { showNavbar: true });
});




function findOpponent(connectedClients, id) {
  var result = false;
  console.log("Broj ljudi koji trazi gejm je " + connectedClients.size);
  if (connectedClients.size > 1) {
    for (let [key, element] of connectedClients) {
      console.log(key);
      console.log(id);
      if (key !== id) {
        result = element;
        break;
      }
    }
  }
  return result;
}

router.get("/game/:gameId", authenticated, function(req, res){
  res.send(req.params);
});

router.post("/search", authenticated, function(req, res, next) {
  db.findGame(req.session.user.id, req.body.seconds, req.body.opponent);
  res.redirect("/play");
});

module.exports = router;
