const nomnom: NomnomInternal.Parser = require("nomnom");
const urlHelper = require("url");
const http = require("http");
const https = require("https");
const chalk = require('chalk');
const uniqid = require('uniqid');
const notifier = require('node-notifier');

const defaultConfig = {
  interval: 1,
}

const opts = nomnom
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
    help: `Url to check every {interval} minutes`,
  })
  .option('interval', {
    abbr: 'i',
    help: `Specifies minutes count between, defaults to ${defaultConfig.interval}`,
    callback: (count: any): any => {
      if (count != parseInt(count)) {
        return "Interval parameter must be an integer";
      }
      if (parseInt(count) < 1) {
        return "Mininum interval is 1 minute."
      }
    }
  })
  .parse();


const url = new urlHelper.URL(opts.url);
const interval = opts.interval ? opts.interval : defaultConfig.interval;
const separator = "|";

// create execution data
var execution = {
  requestWaiting: false,
};


function prefix(id?: string) {
  const now = new Date();
  return `${now.toISOString()}${separator}${id ? id + separator : ""}`
}

function verbose(...params: any[]) {
  opts.verbose ? console.log(...params) : undefined;
}

function puts(...params: any[]) {
  console.log(prefix(), ...params);
}

function notify(message: { message: string, title?: string }, level?: string, logMethod?: Function) {
  notifier.notify(message);
  if (logMethod) {
    switch (level) {
      case "red":
        updateLedsColors("#FF0000");
        logMethod(chalk.red(message.message));
        break;
      default:
        updateLedsColors("#FFFF00");
        logMethod(chalk.yellow(message.message));
        break;
    }
  }
};


function callUrl() {
  const currentId = uniqid();

  function currBose(...params: any[]) {
    verbose(prefix(currentId), ...params);
  }
  function currPut(...params: any[]) {
    console.log(prefix(currentId), ...params);
  }
  currBose(`Call start`);

  // set requestWaiting to true
  execution.requestWaiting = true;

  (url.https ? https : http).get({
    href: url.href,
    port: url.port,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Connection': 'keep-alive',
    }
  }, (resp: any) => {
    let data = '';
    currBose("Get Start");
    currBose(`Status Code : ${resp.statusCode}`);
    currBose(`HEADERS: ${JSON.stringify(resp.headers)}`);

    // A chunk of data has been recieved.
    resp.on('data', (chunk: any) => {
      data += chunk;
    });

    if (resp.statusCode === 200) {
      currPut(chalk.green("200 ok"));
      updateLedsColors("#00FF00");

      resp.on('end', () => {
        execution.requestWaiting = false;
        currBose(chalk.green("Request finished"));
      });
    } else {
      resp.on('socket', () => {
        currPut(chalk.red("Socket connection error"));
      })

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        execution.requestWaiting = false;
        currPut("Data has been finished", data);
      });
    }

  }).on("error", (err: any) => {
    execution.requestWaiting = false;
    const message = {
      title: `${url.hostname} is down`,
      message: "Error: " + err.message
    }
    notify(message, "red", currPut);
  });
}

function startWatch() {
  puts(chalk.blue(`Start watching [${url.hostname}] every ${interval} minute${interval > 1 ? "s" : ""}`));
  callUrl();
  if (!opts.once) {
    setInterval(() => {
      if (execution.requestWaiting) {
        puts(chalk.yellow("Previous execution in progress, this one is skipped"));
      } else {
        callUrl();
      }
    }, interval * 1000 * 1); //  interval * 1000 * 60
  }
}

startWatch();

process.on('exit', function (code) {
  return puts(`About to exit with code ${code}`);
});


//// SPECIFIC BLINKSTICK


const blinkstick = require('blinkstick');
// https://github.com/arvydas/blinkstick-node/wiki
//
// "usb": "^1.3.0",
// "blinkstick": "^1.1.3",
//
// const device = blinkstick.findFirst();


function getLeds() {
  return blinkstick.findAll();
}

const leds = getLeds();

puts("leds", leds);

// rgb is a '#RRGGBB' string
// red/green/blue are each numbers in [0..255]
// function is optional
const rgb = '#RRGGBB';
const red = 40;
const green = 40;
const blue = 40;
leds.forEach((led: any) => {
  led.setColor(rgb, function () { /* called when color is changed */ });
  led.setColor(red, green, blue, function () { /* called when color is changed */ });

  led.setColor('random', function () { /* called when color is changed */ });

  // //All color parameters and options work on these functions too
  // led.pulse(rgb, function() { /* called when color animation is complete */ });
  // led.blink(rgb, function() { /* called when color animation is complete */ });
  // led.morph(rgb, function() { /* called when color animation is complete */ });

  led.turnOff();    // i.e., setColor(0, 0, 0)
});

function updateLedsColors(color: string) {
  const leds = getLeds();

  // puts("leds", leds);
  if (leds.length) {
    puts(leds[0].device.deviceAddress);
  }

  // color is a '#RRGGBB' string
  // function is optional
  // const color = '#RRGGBB';
  leds.forEach((led: any) => {
    led.setColor(color, function () { /* called when color is changed */ });
  });
}

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
  blinkstick.findAll().forEach((led: any) => {
    led.turnOff();    // i.e., setColor(0, 0, 0)
  });
};

process.on('exit', function (code) {
  puts("Turn leds off");
  return turnAllLedsOff();
});
