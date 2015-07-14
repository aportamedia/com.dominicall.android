var path = require('path');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var twilio = require('twilio');
var config = require("../config");

// Configure appplication routes
module.exports = function(app) {
    var fromNumber;

    // Set Jade as the default template engine
    app.set('view engine', 'jade');

    // Express static file middleware - serves up JS, CSS, and images from the
    // "public" directory where we started our webapp process
    app.use(express.static(path.join(process.cwd(), 'public')));

    // Parse incoming request bodies as form-encoded
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    // Use morgan for HTTP request logging
    app.use(morgan('combined'));

    // Home Page with Click to Call
    app.get('/', function(request, response) {
        response.send("ahoy!");
    });

    // Handle an AJAX POST request to place an outbound call
    app.post('/call', function(request, response) {
        fromNumber = request.body.From;
        var from = request.body.From;
        var to = request.body.To;

        console.log('[CALL] - '+from + ' -> ' + to);

        var allowed = [ "+34695562311",
            "+18299226595",
            "+34603847010",
            "+34609839964",
            "+34619413131",
            "+34646810736",
            "+34881928475",
            "+34981905883",
            "+34619096364",
            "+34603254093",
            "+34654435434",
            "+447928664097",
            "+34617996733",
            "+34620007868",
            "+34622815003",
            "+447783047504"
        ];

        var res = "";

        //international forwarding
        if(to === "+34911980567") {
            res = ('<?xml version="1.0" encoding="UTF-8"?><Response><Dial timeout="20" record="false" callerId="+18299479006">+18299226595</Dial></Response>');
        }else if(to === "+18299479006") {
            res = ('<?xml version="1.0" encoding="UTF-8"?><Response><Dial timeout="20" record="false" callerId="+18299479006">+34603847010</Dial></Response>');
        }else if (allowed.indexOf(from) > -1){
            //read number.
            res = ('<?xml version="1.0" encoding="UTF-8"?><Response><Gather action="/makecall" numDigits="13" timeout="20"><Say voice="woman" language="es-es">Marca el número de teléfono al que quieres llamar con su código de país.</Say></Gather></Response>');
        } else{
            res = ('<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="woman" language="es-es">No puedes hacer llamadas desde este número.</Say></Response>');
        }

        response.send(res);

    });

    // Return TwiML instuctions for the outbound call
    app.post('/makecall', function(request, response) {
        console.log(request.body.Digits);
        console.log("Got " + request.body.Digits.length + " digits.");
        if(request.body.Digits.length < 12){
            console.log("Not enough, repeat");
            response.send('<?xml version="1.0" encoding="UTF-8"?><Response><Gather action="/makecall" numDigits="13" timeout="20"><Say voice="woman" language="es-es">El número no es válido. Marca el número de teléfono al que quieres llamar con su código de país.</Say></Gather></Response>');
        }else{
            response.send('<?xml version="1.0" encoding="UTF-8"?><Response><Dial timeout="20" record="false" callerId="'+fromNumber+'">'+request.body.Digits+'</Dial></Response>');
        }
    });

    //Android endpoint
    app.post('/android',  function(req, res) {
        res.end(200, "Hue!");
    });
};


