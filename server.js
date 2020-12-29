
let http = require("http");
let fs = require("fs");
let fb = require("firebase");

let cfgFb = {
    apiKey: "AIzaSyDc3k4HMhMScwHOOA8vR6Bv_YZvxnU-EF0",
    authDomain: "k-qyr-e-dil.firebaseapp.com",
    databaseURL: "https://k-qyr-e-dil.firebaseio.com",
    projectId: "k-qyr-e-dil",
    storageBucket: "k-qyr-e-dil.appspot.com",
    messagingSenderId: "16672936100",
    appId: "1:16672936100:web:fa81e3557af6876d5c5631",
    measurementId: "G-63ETX0642H"
};

if (!fb.apps.length) {
    fb.initializeApp(cfgFb);
}

var db = fb.database();

var uiFile = fs.readFileSync("ui.html", "utf8");
var uiStyleFile = fs.readFileSync("uiStyle.css", "utf8");
var uiFunFile = fs.readFileSync("uiFun.js", "utf8");
var iconFile = fs.readFileSync("favicon.ico");
//192.168.0.105
let ipAdresa = "172.20.10.3";

let method;
let url;
let postBody = [];

let user;

try{
    user = JSON.parse(fs.readFileSync("user.json", "utf8"));
}
catch{
    //nese punon 12 ore e bon hoursOpened 11 edhe hoursScores e bush me 12 0-o
    //edhe gjithashtu e ndryshon user.json njejt ose e delete krejt
    user = {
        id:0,
        cameraObstructed:false,
        color:"#00ff00",
        numOfPeople:0,
        area:100,
        dangerScale:0.0,
        hoursOpened:23,
        hsIndex:0,
        hourScores:[0.0,0.0,0.0,0.0,0.0,0.0,
                    0.0,0.0,0.0,0.0,0.0,0.0,
                    0.0,0.0,0.0,0.0,0.0,0.0,
                    0.0,0.0,0.0,0.0,0.0,0.0],
        score:0.0,
        dsIndex:0,
        dailyScore:[0.0,0.0,0.0,0.0,0.0,0.0,0.0],
        weeklyScore:0.0,
        eventTimeRef1:null,
        eventTimeRef2:null,
        eventRecords:[]
    };
}

var UserRef = db.ref(user.id);

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
        console.log("\n\n Event Name : " + newEvent.rule_name + " numOfPeople :" +user.numOfPeople+"\n\n");
    
        //handel enter and exit line crossings
        // send new num of people to the database
        if(newEvent.rule_name == "Enter"){ user.numOfPeople = user.numOfPeople + 1; }
        else if(newEvent.rule_name == "Exit"){
            user.numOfPeople = user.numOfPeople - 1; 
            user.numOfPeople = (user.numOfPeople < 0)? 0 : user.numOfPeople;
        }

        if(user.eventTimeRef1)
        {
            if(user.eventTimeRef2)
            {
                user.eventTimeRef1 = new Date(user.eventTimeRef2.getYear(),
                                            user.eventTimeRef2.getMonth(),
                                            user.eventTimeRef2.getDay(),
                                            user.eventTimeRef2.getMinutes(),
                                            user.eventTimeRef2.getSeconds(),
                                            user.eventTimeRef2.getMilliSeconds());
                
                user.eventTimeRef2 = new Date();

                user.eventRecords.push(user.numOfPeople * getMilliDiff(user.eventTimeRef1,user.eventTimeRef2));
                user.cameraObstructed = false;
            }
            else
            {
                user.eventTimeRef2 = new Date();
                user.eventRecords.push(user.numOfPeople * getMilliDiff(user.eventTimeRef1,user.eventTimeRef2));
                user.cameraObstructed = false;
            }
        }
        else
        {
            user.eventTimeRef1 = new Date();
        }
    }
    else
    {
        console.log("\n\n Event Name : camera obstructed or disconnected\n\n");
        //handel camera obstructed and disconnected events
        // send new status to database and others
        // varsisht qka dojm e programojm
        user.cameraObstructed = true;
        UserRef.update({
            "Obstructed": user.cameraObstructed,
        });
    }
}

setInterval(
    ()=>{
        let eventCount = user.eventRecords.length; // eventet e regjistruara mbrenda 15 min
        let avgNumOfPeople = 0; // numri mesatar i njerzve mbrenda 15 min

        for(let i=0;i<eventCount;i++){ avgNumOfPeople += user.eventRecords.pop(); }

        avgNumOfPeople = (avgNumOfPeople / 900000) / eventCount;
        //danger scale osht numri i personave / siperfaqen
        // nese cdo person i ka vetem 2 metra katror ne dispozicion dangerScale osht 100
        // danger scale varion nga 0 deri ne 100 me 100 duke perfaqsuar limitin e eperm
        // te asaj qe lejohet qe nje biznes te kete 
        user.dangerScale = ((2 * avgNumOfPeople) / user.area) * 100;
        user.dangerScale = (user.dangerScale > 100)? 100 : dangerScale;

        // user.color eshte e gjelbert tersisht apo #00ff00 nese dangerScale osht 0 
        // e verdh apo #7f7f00 nese dangerScale osht 50 
        // e kuqe nese dangerScale osht 100 apo #ff0000
        user.color = calcColor(user.dangerScale);
        
        // cdo ore e punes regjistrohet pastaj perdoret per te llogaritur score
        // hourScore varion nga vlera negative kur dyqani eshte i stermbushur
        // ne 0 kur dyqani eshte ne limitin e eperm te lejuar te mbushjes
        // ne 1 kur dyqani eshte plotesisht i shprazur
        user.hourScores[user.hsIndex] = (hoursOpened>12)?     1 - ((2 * avgNumOfPeople) / user.area) :
                                        (hoursOpened>5)? 3 * (1 - ((2 * avgNumOfPeople) / user.area)) :
                                                         6 * (1 - ((2 * avgNumOfPeople) / user.area)) ;
        // indexi per hourScore rritet ose kthehet ne 0
        user.hsIndex = (user.hsIndex < user.hoursOpened)? user.hsIndex + 1 : 0;
        //score eshte te gjitha oret e dites te mbledhura sebashku (shuma e tyre)
        // teoritikisht score mbund te arrij nje vlere prej 24 nese dyqani eshte 
        // per 24 ore i shprazur ose 12 nese punon vetem dymbedhjet ore i shprazur tersisht
        user.score = calcScore(user.hourScores);
        
        //updating firebase
        //send user update to user id user.id
        // send userUpdate obj
            
        UserRef.update({
            "DangerColor":user.color,
            "DangerScale":user.dangerScale,
            "numOfPeople":user.numOfPeople,
            "S":user.area,
        });

        //refreshing user json on computer
        fs.writeFile("user.json",JSON.stringify(user,null,3),()=>{});
    },900000
);

setInterval(
    ()=>{
        
        let dateOb = new Date();
        if(dateOb.getHours() == 0)
        {
            // nese eshte bere nderrimi i dites
            // regjistrohet nje daily score qe pastaj nevojitet per te kalkuluar weekly score
            user.dailyScore[user.dsIndex] = user.score;
            // indeksi i daily score rritet
            user.dsIndex = (dsIndex < 6)? dsIndex + 1 : 0;

            // weekly score eshte shuma e daily score dhe arrin 24*7 pike max ose 12*7 pike
            user.weeklyScore = calcScore(user.dailyScore);
            
            user.numOfPeople = (user.hoursOpened>12)? user.numOfPeople : 0;

            //updating firebase
            //send user update to user id user.id
            // send userUpdate obj
            
            UserRef.update({
                "DailyScore":user.score
            });

            if(dateOb.getDay() == 0)
            {
                UserRef.update({
                    "WeeklyScore":user.weeklyScore,
                });
            }
        }
    },3600000
);


function calcScore(scArray)
{
    let sumScore = 0;

    for(let i=0;i<scArray.length;i++)
    {
        sumScore += scArray[i];
    }

    return sumScore;
}

function calcColor(percentage)
{
    let safePercentage = (percentage>100)?100:(percentage<0)?0:percentage;
    let redHex = Math.floor(safePercentage*255/100).toString(16);
    redHex = (redHex.length<2)?"0"+redHex:redHex;
    let greenHex = Math.floor((100-safePercentage)*255/100).toString(16);
    greenHex = (greenHex.length<2)?"0"+greenHex:greenHex;
    return "#"+redHex+greenHex+"00";
}

function getMilliDiff(fstDate,secDate)
{
    let milliSum = 0;

    if(fstDate.getHours() > secDate.getHours())
    {
        // 23-0 hour jump happend
        // complete all hours,minutes,seconds and milliseconds and add secondDate
        milliSum += (23 - fstDate.getHours() + secDate.getHours()) * 60 * 60 * 1000;
        milliSum += (59 - fstDate.getMinutes() + secDate.getMinutes()) * 60 * 1000;
        milliSum += (59 - fstDate.getSeconds() + secDate.getSeconds()) * 1000;
        milliSum += 1000 - fstDate.getMilliseconds() + secDate.getMilliseconds();
    }
    else if(fstDate.getHours() < secDate.getHours())
    {
        // hours passed implies 59-0 minute, 59-0 second and 999-0 millisecond jump
        // add difference in hours, complete minutes seconds and milliseconds
        milliSum += (secDate.getHours() - fstDate.getHours() - 1) * 60 * 60 * 1000;
        milliSum += (59 - fstDate.getMinutes() + secDate.getMinutes()) * 60 * 1000;
        milliSum += (59 - fstDate.getSeconds() + secDate.getSeconds()) * 1000;
        milliSum += 1000 - fstDate.getMilliseconds() + secDate.getMilliseconds();
    }
    else
    {
        //dates within the same hour
        //hours don't increase milliSum
        
        //checking for minute jumps
        if(fstDate.getMinutes() > secDate.getMinutes())
        {
            // 59-0 minute jump happened
            // complete all minutes,seconds and milliseconds
            milliSum += (59 - fstDate.getMinutes() + secDate.getMinutes()) * 60 * 1000;
            milliSum += (59 - fstDate.getSeconds() + secDate.getSeconds()) * 1000;
            milliSum += 1000 - fstDate.getMilliseconds() + secDate.getMilliseconds();
        }
        else if(fstDate.getMinutes() < secDate.getMinutes())
        {
            // minutes passed implies second, and millisecond jumps
            // add difference in minutes, complete seconds and milliseconds
            milliSum += (secDate.getMinutes() - fstDate.getMinutes() - 1) * 60 * 1000;
            milliSum += (59 - fstDate.getSeconds() + secDate.getSeconds()) * 1000;
            milliSum += 1000 - fstDate.getMilliseconds() + secDate.getMilliseconds();
        }
        else
        {
            //dates within the same hour and minute
            //hours and minutes don't increase milliSum

            //checking for second jumps
            if(fstDate.getSeconds() > secDate.getSeconds())
            {
                //59-0 second jump happened
                //compleating seconds and minutes
                milliSum += (59 - fstDate.getSeconds() + secDate.getSeconds()) * 1000;
                milliSum += 1000 - fstDate.getMilliseconds() + secDate.getMilliseconds();
            }
            else if(fstDate.getSeconds() < secDate.getSeconds())
            {
                // seconds passed implies milliesecond jump
                // adding second difference, compleating milliseconds
                milliSum += (secDate.getSeconds() - fstDate.getSeconds() - 1) * 1000;
                milliSum += 1000 - fstDate.getMilliseconds() + secDate.getMilliseconds();
            }
            else
            {
                //dates within the same hour,minute and second
                //hours, minutes and seconds don't increase milliSum

                if(fstDate.getMilliSeconds() > secDate.getMilliSeconds())
                {
                    // millisecond jump happened
                    // compleating milliseconds
                    milliSum += 1000 - fstDate.getMilliseconds() + secDate.getMilliseconds();
                }
                else
                {
                    // millisecond passed
                    // adding millisecond difference
                    milliSum += secDate.getMilliseconds() - fstDate.getMilliseconds();
                }
            }
        }
    }

    return milliSum;
}

