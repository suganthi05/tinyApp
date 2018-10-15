const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
let urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca"
  },
  "9sm5xK": {
    url: "http://www.google.com"
  }
};

let users = {
  "c2xVn2": {
    id: "c2xVn2",
    email: "bill@gates.com",
    password: "purple-monkey-dinosaur"
  },
  "8sm5xK": {
    id: "8sm5xK",
    email: "prabhu@deva.com",
    password: "dishwasher-funk"
  },
  "8fm5xK": {
    id: "8fm5xK",
    email: "rajini@kanth.com",
    password: "washingmachine-jug"
  },
  "8sn5xK": {
    id: "8sn5xK",
    email: "ar@rahman.com",
    password: "fishingnet-pig"
  }
};
// Use bodyParser
app.use(bodyParser.urlencoded({
  extended: true
}));
// Use cookieParser
app.use(cookieParser());

//Short URL generation
function generateRandomString() {
  let randomString = "";
  const character = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    randomString += character.charAt(Math.floor(Math.random() * character.length));
  }
  return randomString;
};

function checkifalreadyexists(email) {
  let exists = 0;
  for (var user in users) {
    if (!users.hasOwnProperty(user)) continue;
    var userObj = users[user];
    for (var value in userObj) {
      if (!userObj.hasOwnProperty(value)) continue;
      if (userObj[value] === email) {
        exists = 1;
      }
    }
  }
  if (exists === 1) {
    return true;
  } else {
    return false;
  }
};

function checkEmail(email) {
  let userKeys = Object.keys(users);
  let emailFound = false;
  for (let userID in userKeys) {
    let id = userKeys[userID];
    if (email === users[id].email) {
      emailFound = true;
      return emailFound;
    }
  }
  return emailFound;
};

function checkUser(email, password) {
  let userKeys = Object.keys(users);
  let userFound = false;
  for (let userID in userKeys) {
    let id = userKeys[userID];
    if ((email === users[id].email) && (password === users[id].password)) {
      userFound = true;
      return userFound;
    }
  }
  return userFound;
};

function getUserId(email) {
  let userKeys = Object.keys(users);
  let userFound = '';
  for (let userID in userKeys) {
    let id = userKeys[userID];
    if (email === users[id].email) {
      userFound = users[id].id;
      return userFound;
    }
  }
  return userFound;
}

app.get("/", (req, res) => {
  res.render("urls_login");
});

app.get("/hello", (req, res) => {
  let templateVars = {
    greeting: 'Hello World'
  };
  res.render("hello_world", templateVars);
});

//Enter Long URL   
app.get("/urls/new", (req, res) => {
  let userid = req.cookies["userid"];
  let userData = users[userid];
  let templateVars = {
    userObj: userData
  }
  res.render("urls_new", templateVars);
});


//View generated Short URL  
app.get("/urls/:id", (req, res) => {
  let userid = req.cookies["userid"];
  let userData = users[userid];
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].url,
    userObj: userData
  };
  res.render("urls_show", templateVars);
});

//Edit Long URL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.body.hidshortURL] = {
    url: req.body.longURL
  };
  let userid = req.cookies["userid"];
  let userData = users[userid];
  let templateVars = {
    urls: urlDatabase,
    userObj: userData
  };
  res.render("urls_index", templateVars);
});

//Delete Long and Short URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    url: longURL
  }; //Update to database
  res.redirect(`/urls/${shortURL}`);
});

//Register
app.get("/register", (req, res) => {
  res.render("urls_register");
});
app.post("/register", (req, res) => {
  let userid = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  if (email.trim() === "" || email.trim() === null) {
    res.status(400);
    res.send(`<html><body>Please enter a valid email. Please go back to <a href="/register">register</a> page to retry.</body></html>`);
  } else if (password === "" || password === null) {
    res.status(400);
    res.send(`<html><body>Please enter a valid password. Please go back to <a href="/register">register</a> page to retry.</body></html>`);
  } else if (checkifalreadyexists(email) === true) {
    res.status(400);
    res.send(`<html><body>Email already registered. Please go back to <a href="/register">register</a> page to retry.</body></html>`);
  } else {
    users[userid] = {
      id: userid,
      email: email,
      password: password
    }; //Update to database
    res.redirect("/login");
  };
});

//Login GET
app.get("/login", (req, res) => {
  res.render("urls_login");
});

//Login Route
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (email.trim() === "" || email.trim() === null) {
    res.status(400);
    res.send(`<html><body>Please enter a valid email. Please go back to <a href="/login">login</a> page to retry.</body></html>`);
  } else if (password === "" || password === null) {
    res.status(400);
    res.send(`<html><body>Please enter a valid password. Please go back to <a href="/login">login</a> page to retry.</body></html>`);
  } else if (checkEmail(email) === false) {
    res.status(403);
    res.send(`<html><body>Invalid email. Please go back to <a href="/login">login</a> page to retry.</body></html>`);
  } else if (checkUser(email, password) === false) {
    res.status(403);
    res.send(`<html><body>Invalid password. Please go back to <a href="/login">login</a> page to retry.</body></html>`);
  } else {
    let userid = getUserId(email);
    res.cookie("userid", userid)
    res.redirect("/urls");
  }
});
//Logout Route
app.post("/logout", (req, res) => {
  res.clearCookie("userid");
  res.redirect("/login");
});

//Display Username
app.get("/urls", (req, res) => {
  let userid = req.cookies["userid"];
  let userData = users[userid];
  let templateVars = {
    userObj: userData,
    urls: urlDatabase
  }
  res.render("urls_index", templateVars);
});

//Handle short URL requests
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].url;
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});