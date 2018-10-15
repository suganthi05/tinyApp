const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

app.set("view engine", "ejs");

let urlDatabase = {};

let users = {};

// Use bodyParser
app.use(bodyParser.urlencoded({
  extended: true
}));

// Use cookieSession
app.use(cookieSession({
  name: 'session',
  keys: ['suqAN7a1']
}));

// Generate Random String for user id and tiny url
function generateRandomString() {
  let randomString = "";
  const character = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    randomString += character.charAt(Math.floor(Math.random() * character.length));
  }
  return randomString;
};

// Check if the user already exists in database
function checkUserExists(email) {
  let exists = 0;
  for (let user in users) {
    if (!users.hasOwnProperty(user)) continue;
    let userObj = users[user];
    for (let value in userObj) {
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

// Check if entered email found in database
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

// Check if entered email and password combo found in database
function checkUser(email, password) {
  let userKeys = Object.keys(users);
  let userFound = false;
  for (let userID in userKeys) {
    let id = userKeys[userID];
    if (email === users[id].email) {
      userFound = bcrypt.compareSync(password, users[id].password);
      return userFound;
    }
  }
  return userFound;
};

// Get user id for the given email
function getUserId(email) {
  let userKeys = Object.keys(users);
  let userid = '';
  for (let user in userKeys) {
    let id = userKeys[user];
    if (email === users[id].email) {
      userid = users[id].id;
      return userid;
    }
  }
  return userid;
}

// Get the list of urls which belongs to current user
function urlsForUser(userid) {
  let urlKeys = Object.keys(urlDatabase);
  let userURLs = {};
  for (key in urlKeys) {
    let shortURL = urlKeys[key];
    if (urlDatabase[shortURL].userID === userid) {
      userURLs[shortURL] = {
        url: urlDatabase[shortURL].url,
        userID: userid
      }
    }
  }
  return userURLs;
}

// root redirect to login
app.get("/", (req, res) => {
  res.render("urls_login");
});

// sample hello world route
app.get("/hello", (req, res) => {
  let templateVars = {
    greeting: 'Hello World'
  };
  res.render("hello_world", templateVars);
});

// Getting list page
app.get("/urls", (req, res) => {
  let userid = req.session.user_id;
  let userData = users[userid];
  if (userData) {
    let urlsforuser = urlsForUser(userid);
    let templateVars = {
      userObj: userData,
      urls: urlsforuser
    }
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Redirect to Edit
app.post("/urls", (req, res) => {
  let userid = req.session.user_id;
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = {
    url: longURL,
    userID: userid
  }; //Update to database
  res.redirect(`/urls/${shortURL}`);
});

// Create new tiny URL   
app.get("/urls/new", (req, res) => {
  let userid = req.session.user_id;
  let userData = users[userid];
  if (userData) {
    let templateVars = {
      userObj: userData
    }
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//View generated Short URL  
app.get("/urls/:id", (req, res) => {
  let userid = req.session.user_id;
  let userData = users[userid];
  if (userData) {
    if (urlDatabase[req.params.id].userID === userid) {
      let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id].url,
        userObj: userData
      };
      res.render("urls_show", templateVars);
    } else {
      res.status(404);
      res.send(`<html><body>You do not have access to edit this url. Please go back to <a href="/urls">list</a> page.</body></html>`);
    }
  } else {
    res.redirect("/login");
  }
});

//Edit Long URL
app.post("/urls/:id", (req, res) => {
  let userid = req.session.user_id;
  let userData = users[userid];
  urlDatabase[req.body.hidshortURL] = {
    url: req.body.longURL,
    userID: userid
  };
  let urlsforuser = urlsForUser(userid);
  let templateVars = {
    urls: urlsforuser,
    userObj: userData
  };
  res.render("urls_index", templateVars);
});

//Delete Long and Short URL
app.post("/urls/:id/delete", (req, res) => {
  let userid = req.session.user_id;
  if (urlDatabase[req.params.id].userID === userid) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.status(404);
    res.send(`<html><body>You do not have access to delete this url. Please go back to <a href="/urls">list</a> page.</body></html>`);
  }
});

// render register page
app.get("/register", (req, res) => {
  res.render("urls_register");
});

// Register
app.post("/register", (req, res) => {
  let userid = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);
  if (email.trim() === "" || email.trim() === null) {
    res.status(400);
    res.send(`<html><body>Please enter a valid email. Please go back to <a href="/register">register</a> page to retry.</body></html>`);
  } else if (hashedPassword === "" || hashedPassword === null) {
    res.status(400);
    res.send(`<html><body>Please enter a valid password. Please go back to <a href="/register">register</a> page to retry.</body></html>`);
  } else if (checkUserExists(email) === true) {
    res.status(400);
    res.send(`<html><body>Email already registered. Please go back to <a href="/register">register</a> page to retry.</body></html>`);
  } else {
    users[userid] = {
      id: userid,
      email: email,
      password: hashedPassword
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
    req.session.user_id = userid;
    res.redirect("/urls");
  }
});

//Logout Route
app.post("/logout", (req, res) => {
  res.clearCookie("userid");
  res.redirect("/login");
});

//Handle short URL requests
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].url;
  res.redirect(longURL);
});

// Listening in the given port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});