"use strict";
var nomnom = require("nomnom");
var urlHelper = require("url");
var http = require("http");
var https = require("https");
var chalk = require('chalk');
var uniqid = require('uniqid');
var defaultConfig = {
    url: "http://localhost:3000/",
    interval: 1
};
var opts = nomnom
    .option('debug', {
    abbr: 'd',
    flag: true,
    help: 'Print debugging info'
})
    .option('version', {
    flag: true,
    help: 'Print version and exit',
    callback: function () {
        return "0.0.1";
    }
})
    .option('verbose', {
    flag: true
})
    .option('once', {
    flag: true
})
    .option('url', {
    abbr: 'u',
    required: true,
    type: "string",
    help: "Url to check every {interval} minutes",
})
    .option('interval', {
    abbr: 'i',
    help: "Specifies minutes count between, defaults to " + defaultConfig.interval,
    callback: function (count) {
        if (count != parseInt(count)) {
            return "Interval parameter must be an integer";
        }
        if (parseInt(count) < 1) {
            return "Mininum interval is 1 minute.";
        }
    }
})
    .parse();
var url = new urlHelper.URL(opts.url);
var interval = opts.interval ? opts.interval : defaultConfig.interval;
var separator = "|";
// create execution data
var execution = {
    requestWaiting: false,
    currentDuration: 0,
    lastExecution: {
        duration: 0
    }
};
function prefix(id) {
    var now = new Date();
    return "" + now.toISOString() + separator + (id ? id + separator : "");
}
function verbose() {
    var params = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        params[_i] = arguments[_i];
    }
    opts.verbose ? console.log.apply(console, params) : undefined;
}
function puts() {
    var params = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        params[_i] = arguments[_i];
    }
    console.log.apply(console, [prefix()].concat(params));
}
function callUrl() {
    var currentId = uniqid();
    function currBose() {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        verbose.apply(void 0, [prefix(currentId)].concat(params));
    }
    function currPut() {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        console.log.apply(console, [prefix(currentId)].concat(params));
    }
    currBose("Call start");
    // set requestWaiting to true
    execution.requestWaiting = true;
    // console.log("URL data : ", url);
    (url.https ? https : http).get({
        href: url.href,
        port: url.port,
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Connection': 'keep-alive',
        }
    }, function (resp) {
        var data = '';
        currBose("init data");
        currBose("HEADERS: " + JSON.stringify(resp.headers));
        // A chunk of data has been recieved.
        resp.on('data', function (chunk) {
            data += chunk;
        });
        if (resp.statusCode === 200) {
            currPut(chalk.green("200 ok"));
            resp.on('end', function () {
                execution.requestWaiting = false;
                currBose(chalk.green("Request finished"));
            });
        }
        else {
            resp.on('socket', function () {
                currPut(chalk.red("Socket connection error"));
            });
            // The whole response has been received. Print out the result.
            resp.on('end', function () {
                execution.requestWaiting = false;
                currPut("Data has been finished", data);
            });
        }
    }).on("error", function (err) {
        execution.requestWaiting = false;
        currPut(chalk.red("Error: " + err.message));
    });
}
function init() {
    // avoid call while request is in progress
    execution.requestWaiting = false;
}
function startWatch() {
    puts(chalk.blue("Start watching [" + url.hostname + "] every " + interval + " minute" + (interval > 1 ? "s" : "")));
    callUrl();
    if (!opts.once) {
        setInterval(function () {
            if (execution.requestWaiting) {
                puts(chalk.yellow("Previous execution in progress, this one is skipped"));
            }
            else {
                callUrl();
            }
        }, interval * 1000 * 60); //  interval * 1000 * 60
    }
}
init();
startWatch();
process.on('exit', function (code) {
    return puts("About to exit with code " + code);
});
//// SPECIFIC BLINKSTICK
var blinkstick = require('blinkstick');
// https://github.com/arvydas/blinkstick-node/wiki
//
// "usb": "^1.3.0",
// "blinkstick": "^1.1.3",
//
// const device = blinkstick.findFirst();
function getLeds() {
    return blinkstick.findAll();
}
var leds = getLeds();
puts("leds", leds);
// rgb is a '#RRGGBB' string
// red/green/blue are each numbers in [0..255]
// function is optional
var rgb = '#RRGGBB';
var red = 40;
var green = 40;
var blue = 40;
leds.forEach(function (led) {
    led.setColor(rgb, function () { });
    led.setColor(red, green, blue, function () { });
    led.setColor('random', function () { });
    // //All color parameters and options work on these functions too
    // led.pulse(rgb, function() { /* called when color animation is complete */ });
    // led.blink(rgb, function() { /* called when color animation is complete */ });
    // led.morph(rgb, function() { /* called when color animation is complete */ });
    led.turnOff(); // i.e., setColor(0, 0, 0)
});
// leds.array.forEach((led: any) => {
//   led.blink('random', function() {
//     led.pulse('random', function() {
//       led.setColor('red', function() {
//       });
//     });
//   });
// });
// const leds: any[] = [];
// led.getColor(function(red, green, blue) { ... });
// led.getColorString(function(rgb) { ... });
function turnAllLedsOff() {
    blinkstick.findAll().forEach(function (led) {
        led.turnOff(); // i.e., setColor(0, 0, 0)
    });
}
;
process.on('exit', function (code) {
    puts("Turn leds off");
    return turnAllLedsOff();
});
