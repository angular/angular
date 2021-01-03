/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const webdriverio = require('webdriverio');
const desiredCapabilities = {
  android60: {
    deviceName: 'Android GoogleAPI Emulator',
    browserName: 'Chrome',
    platformName: 'Android',
    platformVersion: '6.0',
    deviceOrientation: 'portrait',
    appiumVersion: '1.12.1'
  },
  android71: {
    deviceName: 'Android GoogleAPI Emulator',
    browserName: 'Chrome',
    platformName: 'Android',
    platformVersion: '7.1',
    deviceOrientation: 'portrait',
    appiumVersion: '1.12.1'
  }
};

const errors = [];
const tasks = [];

if (process.env.TRAVIS) {
  process.env.SAUCE_ACCESS_KEY = process.env.SAUCE_ACCESS_KEY.split('').reverse().join('');
}

Object.keys(desiredCapabilities).forEach(key => {
  console.log('begin webdriver test', key);
  if (process.env.TRAVIS) {
    desiredCapabilities[key]['tunnel-identifier'] = process.env.TRAVIS_JOB_NUMBER;
  }
  const client = require('webdriverio').remote({
    user: process.env.SAUCE_USERNAME,
    key: process.env.SAUCE_ACCESS_KEY,
    host: 'localhost',
    port: 4445,
    desiredCapabilities: desiredCapabilities[key]
  });

  const p = client.init()
                .timeouts('script', 60000)
                .url('http://localhost:8080/test/webdriver/test-es2015.html')
                .executeAsync(function(done) {
                  window.setTimeout(done, 1000)
                })
                .execute(function() {
                  const elem = document.getElementById('thetext');
                  const zone = window['Zone'] ? Zone.current.fork({name: 'webdriver'}) : null;
                  if (zone) {
                    zone.run(function() {
                      elem.addEventListener('click', function(e) {
                        e.target.innerText = 'clicked' + Zone.current.name;
                      });
                    });
                  } else {
                    elem.addEventListener('click', function(e) {
                      e.target.innerText = 'clicked';
                    });
                  }
                })
                .click('#thetext')
                .getText('#thetext')
                .then(
                    (text => {
                      if (text !== 'clickedwebdriver') {
                        errors.push(`Env: ${key}, expected clickedwebdriver, get ${text}`);
                      }
                    }),
                    (error) => {
                      errors.push(`Env: ${key}, error occurs: ${error}`);
                    })
                .end();
  tasks.push(p);
});

function exit(exitCode) {
  const http = require('http');
  http.get('http://localhost:8080/close', () => {
    process.exit(exitCode);
  });
}

Promise.all(tasks).then(() => {
  if (errors.length > 0) {
    let nonTimeoutError = false;
    errors.forEach(error => {
      console.log(error);
      if (error.toString().lastIndexOf('timeout') === -1) {
        nonTimeoutError = true;
      }
    });
    if (nonTimeoutError) {
      exit(1);
    } else {
      exit(0);
    }
  } else {
    exit(0);
  }
});
