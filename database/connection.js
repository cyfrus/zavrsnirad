var mysql = require("mysql");
var bcrypt = require("bcrypt");
const saltRounds = 10;
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "checkers3"
});

connection.connect();

var authentication = function (username, password, result) {
  var sql = "SELECT * FROM users WHERE username = " + connection.escape(username) + " LIMIT 1";
  connection.query(sql, function(error, results, fields) {
    if (error) throw error;
    if(results.length > 0) {
      bcrypt.compare(password, results[0].password, function(err, res) {
        // res == true
        if(res) {
          console.log("password je ok!");
        }
        else {
          console.log("password nije ok");
        }
        result(res, results[0]);
    });
    } else {
      result(false, []);
    }
  });
}


var registration = function (username, firstName, lastName, age, about, password) {
  console.log("registration");
  var user = {username: username, "first name": firstName, "last name": lastName, age: age, about: about, password: password};
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(password, saltRounds, function(err, hash) {
      // Store hash in your password DB.
      user.password = hash;
      var query = connection.query('INSERT INTO users SET ?', user, function (error, results, fields){
        if (error) throw error;
      });
    })
  });
}

var editProfile = function(id, username, firstName, lastName, age, about, password) {
  var user = {id: id, username: username, "first name": firstName, "last name": lastName, age: age, about: about, password: password};
  var query = connection.query('UPDATE users SET ? WHERE id = ' + connection.escape(id), user, function(error, results, fields){
    if (error) throw error;
  });
}

var findGame = function(player_id, seconds, opponent) {
  var s = {player_id: player_id, seconds: seconds, opponent: opponent};
  console.log(s);
  var query = connection.query('INSERT INTO search SET ?', s, function(error, results, fields){
    if(error) throw error;
  });
}

var createGame = function(gameID, opponent, seconds) {
  var game  = {gameID: gameID, opponent: opponent, seconds: seconds};
  var query = connection.query('INSERT INTO games SET ?', game, function (error, results, fields) {
    if (error) throw error;
    // Neat!
  });
}


module.exports.authentication = authentication;
module.exports.registration = registration;
module.exports.editProfile = editProfile;
module.exports.findGame = findGame;
module.exports.createGame = createGame;