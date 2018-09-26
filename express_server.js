var express = require("express");
var app = express();
var PORT = 8080;
const bodyParser = require("body-parser");


app.set("view engine", "ejs");
var urlDatabase ={
	"b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
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

app.get("/urls/new",(req,res) => {
	console.log("loading2...");
		res.render("urls_new");

});

app.get("/urls/:id",(req,res) => {
	console.log("loading...");
	let templateVars = {shortURL: req.params.id};
	res.render("urls_show",templateVars);
});


app.post("/urls",(req,res) => {
	console.log(req.body);
	res.send("Ok");
});

function generateRandomString() {
	let randomString = "";
	const character = "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < 6; i++){
    	randomString += character.charAt(Math.floor(Math.random()*character.lenght));
    }
    return randomString;
}

app.listen(PORT,() => {
	console.log(`Example app listening on port ${PORT}!`);
});
