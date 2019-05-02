const http = require("http");
const express = require("express");
const VoiceResponse = require("twilio").twiml.VoiceResponse;
const urlencoded = require("body-parser").urlencoded;

app = module.exports.app = express();

var server = http.createServer(app);
var io = require("socket.io").listen(server); //pass a http.Server instance

app.use(urlencoded({extended: false}));

const digits = {
    "2": 0,
    "4": 0,
    "6": 0,
    "8": 0
};

setInterval(() => {
    if (Object.keys(digits).every(d => digits[d] === 0)) {
        return;
    }

    const value = Object.keys(digits).reduce((max, d) => {
        if (digits[d] > max.count) {
            return {
                key: d,
                count: digits[d]
            };
        }
        return max;
    }, {
        key: 0,
        count: 0
    });

    Object.keys(digits).forEach(d => digits[d] = 0);

    io.emit("move", value.key);
}, 500);

app.post("/voice", (request, response) => {
    // Use the Twilio Node.js SDK to build an XML response
    const twiml = new VoiceResponse();

    /** helper function to set up a <Gather> */
    function gather() {
        const gatherNode = twiml.gather({numDigits: 1});
        // If the user doesn't enter input, loop
        twiml.redirect("/voice");
    }

    // If the user entered digits, process their request
    if (request.body.Digits && digits[request.body.Digits] !== undefined) {
        digits[request.body.Digits]++;
    }
    gather();

    // Render the response as XML in reply to the webhook request
    response.type("text/xml");
    response.send(twiml.toString());
});

console.log("listening on port 8000");
server.listen(8000); //listen on port 80
