const nomnom: NomnomInternal.Parser = require("nomnom");
const urlHelper = require("url");
const http = require("http");
const https = require("https");
const chalk = require('chalk');
const uniqid = require('uniqid');

const defaultConfig = {
  url: "http://localhost:3000/",
  interval: 1
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


// import * as blinkstick from 'blinkstick';
// https://github.com/arvydas/blinkstick-node/wiki
//
// "usb": "^1.3.0",
// "blinkstick": "^1.1.3",
//
// const device = blinkstick.findFirst();


// var leds = blinkstick.findAll();

// leds.array.forEach((led: any) => {
//   led.blink('random', function() {
//     led.pulse('random', function() {
//       led.setColor('red', function() {
//       });
//     });
//   });
// });
// const leds: any[] = [];

// export function checkSite(siteUrl: string) {
//   return leds;
// }


const url = new urlHelper.URL(opts.url);
const interval = opts.interval ? opts.interval : defaultConfig.interval;
const separator = "|";

// create execution data
var execution = {
  requestWaiting: false,
  currentDuration: 0,
  lastExecution: {
    duration: 0
  }
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

  // console.log("URL data : ", url);

  (url.https ? https : http).get({
    href: url.href,
    port: url.port,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Connection': 'keep-alive',
    }
  }, (resp: any) => {
    let data = '';
    currBose("init data");
    currBose(`HEADERS: ${JSON.stringify(resp.headers)}`);

    // A chunk of data has been recieved.
    resp.on('data', (chunk: any) => {
      data += chunk;
    });

    if (resp.statusCode === 200) {
      currPut(chalk.green("200 ok"));

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
    currPut(chalk.red("Error: " + err.message));
  });
}


function init() {
  // avoid call while request is in progress
  execution.requestWaiting = false;
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
    }, interval * 1000 * 60); //  interval * 1000 * 60
  }
}

init();
startWatch();

process.on('exit', function (code) {
  return puts(`About to exit with code ${code}`);
});
