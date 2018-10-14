const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
let urlDatabase ={
	"b2xVn2": {
		url: "http://www.lighthouselabs.ca"
	},
    "9sm5xK": {
    	url: "http://www.google.com"
    }
};

let users ={
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
app.use(bodyParser.urlencoded({extended:true}));
// Use cookieParser
app.use(cookieParser());

app.get("/",(req,res) => {
	res.send("Hello!");
});

/*
app.get("/urls.json",(req,res) => {
	res.json(urlDatabase);
});
*/

app.get("/hello",(req,res) => {
	console.log('hello...');
	let templateVars = { greeting:'Hello World'};
	res.render("hello_world",templateVars);
});

//Enter Long URL   
app.get("/urls/new",(req,res) => {
	let templateVars = {username: req.cookies["username"]} 
	res.render("urls_new", templateVars);
});


//View generated Short URL  
app.get("/urls/:id",(req,res) => {
	let templateVars = {shortURL: req.params.id,
		                longURL: urlDatabase[req.params.id].url,
		                username: req.cookies["username"]};
	res.render("urls_show",templateVars);
});

//Edit Long URL
app.post("/urls/:id",(req,res) => {
    urlDatabase[req.body.hidshortURL] = {url: req.body.longURL};
	let templateVars = {urls: urlDatabase, username: req.cookies["username"]};
	res.render("urls_index", templateVars);
});

//Delete Long and Short URL
app.post("/urls/:id/delete",(req,res) => {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
});

app.post("/urls",(req,res) => {
	let shortURL = generateRandomString();
	let longURL = req.body.longURL;
	urlDatabase[shortURL] = {url: longURL}; //Update to database
	res.redirect(`/urls/${shortURL}`);
});

//Register
app.get("/register",(req,res) => {
	res.render("urls_register");
});
app.post("/register",(req,res) =>{
	let userid = generateRandomString();
	res.cookie("userid", userid);
	let email = req.body.email;
	let password = req.body.password;
	users[userid] = {id: userid, email: email, password: password}; //Update to database
	res.redirect("/urls");
});
//Login Route
app.post("/login",(req,res) =>{
	res.cookie("username", req.body.username); // Assign the username from form to cookie's username
	res.redirect("/urls");
});
//Logout Route
app.post("/logout",(req,res) =>{
	res.clearCookie("username");
	res.redirect("/urls");
});

//Display Username
app.get("/urls",(req,res) => {
	let templateVars = {username: req.cookies["username"], urls: urlDatabase} 
	res.render("urls_index",templateVars);
});

//Short URL generation
function generateRandomString() {
	let randomString = "";
	const character = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 6; i++){
    	randomString += character.charAt(Math.floor(Math.random()*character.length));
    }
    return randomString;
}

//Handle short URL requests
app.get("/u/:shortURL",(req,res) => {
	let longURL = urlDatabase[req.params.shortURL].url;
	res.redirect(longURL);
});

app.listen(PORT,() => {
	console.log(`Example app listening on port ${PORT}!`);
});