var express = require("express");
var app = express();
var PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
var urlDatabase ={

	"b2xVn2": {
		url: "http://www.lighthouselabs.ca"
	},
    "9sm5xK": {
    	url: "http://www.google.com"
    }
};
app.use (bodyParser.urlencoded({extended:true}));

app.get("/",(req,res) => {
	res.send("Hello!");
});

app.get("/urls.json",(req,res) => {
	res.json(urlDatabase);
});

app.get("/hello",(req,res) => {
	console.log('hello...');
	let templateVars = { greeting:'Hello World'};
	res.render("hello_world",templateVars);
});

app.get("/urls", (req,res) => {
	let templateVars = {urls: urlDatabase};
	res.render("urls_index", templateVars);
});

//Enter Long URL   
app.get("/urls/new",(req,res) => {
	res.render("urls_new");
});

//View generated Short URL  
app.get("/urls/:id",(req,res) => {
	let templateVars = {shortURL: req.params.id,
		                longURL: urlDatabase[req.params.id].url};
	res.render("urls_show",templateVars);
});

//Edit Long URL
app.post("/urls/:id",(req,res) => {
    urlDatabase[req.body.hidshortURL] = {url: req.body.longURL};
	let templateVars = {urls: urlDatabase};
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

//Login using cookie-parser
app.post("/login",(req,res) =>{
	let username = req.cookies["username"];
	res.cookie("username",username);
	res.direct("/urls")
})

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