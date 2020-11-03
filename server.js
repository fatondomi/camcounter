
let http = require("http");
let fs = require("fs");

var uiFile = fs.readFileSync("ui.html", "utf8");
var uiStyleFile = fs.readFileSync("uiStyle.css", "utf8");
var uiFunFile = fs.readFileSync("uiFun.js", "utf8");
var iconFile = fs.readFileSync("favicon.ico");

let ipAdresa = "192.168.0.105";

let method;
let url;
let postBody = [];

let numOfPeople = 0;

let server = http.createServer(function (req, resp) {

    method = req.method;
    url = req.url;

	//logging method and url to cmd
    console.log("\n method = " + method + "     url = " + url);

    if(method == "POST")
    {
        if(url.indexOf("/msg") == 0)
        {
            req.on('data', (chunk) => {postBody.push(chunk);});
            req.on('end', () => {
                let newSketch = Buffer.concat(postBody).toString();
                console.log("\n Content:\n" + newSketch);
                let newEventObj = JSON.parse(newSketch);
                handelEvent(newEventObj);
                postBody = [];
                resp.writeHead(200, {"Content-Type":"text/plain"});
                resp.end("msg accepted");
            });
        }    
    }
    else if(method == "GET")
    {
        if(url == "/")
        {
            resp.writeHead(200, { "Content-Type" : "text/html" });
            resp.end(uiFile);
        }
        if(url == "/renew")
        {
            resp.writeHead(200, { "Content-Type" : "text/plain" });
            resp.end("ok");
            uiFile = fs.readFileSync("ui.html", "utf8");
            uiStyleFile = fs.readFileSync("uiStyle.css", "utf8");
            uiFunFile = fs.readFileSync("uiFun.js", "utf8");
        }
        else if(url == "/msg")
        {
            resp.writeHead(200, { "Content-Type" : "text/plain" });
            resp.end("msg requested");
        }
        else if(url == "/uiStyle.css")
        {
            resp.writeHead(200, { "Content-Type" : "text/css" });
            resp.end(uiStyleFile,"binary");
        }
        else if(url == "/uiFun.js")
        {
            resp.writeHead(200, { "Content-Type" : "text/javascript" });
            resp.end(uiFunFile,"binary");
        }
        else if(url == "/favicon.ico")
        {
            resp.writeHead(200, { "Content-Type" : "image/ico" });
            resp.end(iconFile);
        }
        else
        {
            resp.writeHead(404, {"Content-Type":"text/plain"});
            resp.end("404 : Not found");
        }  //for irregular urls
    }

    
    req.on('error', function (err){
        // This prints the error message and stack trace to `stderr`.
        console.error(err.stack);
    });
})

server.listen(8080, ipAdresa);

console.log("Server running at " + ipAdresa + ":8080");

function handelEvent(newEvent){

    if(newEvent.rule_name)
    {
        //handel enter and exit line crossings
        // send new num of people to the database
        if(newEvent.rule_name == "Enter"){
            numOfPeople++;
        }
        else if(newEvent.rule_name == "Exit"){
            numOfPeople--;
        }
    }
    else
    {
        //handel camera obstructed and disconnected events
        // send new status to database and others
    }
    
    console.log("\n\n Event Name : " + newEvent.rule_name + " numOfPeople :" +numOfPeople+"\n\n");
}