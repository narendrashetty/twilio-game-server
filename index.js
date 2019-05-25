const http = require("http");
const express = require("express");
const VoiceResponse = require("twilio").twiml.VoiceResponse;
const urlencoded = require("body-parser").urlencoded;
const MessagingResponse = require('twilio').twiml.MessagingResponse;

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

    if (value.count > 0) {
        console.log("emitted ", value);
        console.log("digits obj ", digits);
        io.emit("move", value.key);
    }
}, 1000);

app.post("/sms", (request, response) => {
    // Use the Twilio Node.js SDK to build an XML response
    const twiml = new MessagingResponse();

    if (request.body.Body && digits[request.body.Body] !== undefined) {
        digits[request.body.Body]++;
        twiml.message('You move is registered. Keep going. You are doing great');
    } else {
        twiml.message('Unknown! Send 2, 4, 6 or 8');
    }
    response.writeHead(200, { 'Content-Type': 'text/xml' });
    response.end(twiml.toString());
});

const port = process.env.PORT || 8000;

console.log("listening on port " + port);
server.listen(port); //listen on port 80
