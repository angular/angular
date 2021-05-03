/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const desiredCapabilities = {
  firefox52Win7: {browserName: 'firefox', platform: 'Windows 7', version: '52'},
  firefox53Win7: {browserName: 'firefox', platform: 'Windows 7', version: '53'},
  edge14: {browserName: 'MicrosoftEdge', platform: 'Windows 10', version: '14.14393'},
  edge15: {browserName: 'MicrosoftEdge', platform: 'Windows 10', version: '15.15063'},
  chrome48: {browserName: 'chrome', version: '48'},
  safari8: {browserName: 'safari', platform: 'OS X 10.10', version: '8.0'},
  safari9: {browserName: 'safari', platform: 'OS X 10.11', version: '9.0'},
  safari10: {browserName: 'safari', platform: 'OS X 10.11', version: '10.0'},
  safari11: {browserName: 'safari', platform: 'macOS 10.13', version: '11.1'},
  /*ios84: {browserName: 'iphone', platform: 'OS X 10.10', version: '8.4'},*/
  ios10: {browserName: 'iphone', platform: 'OS X 10.10', version: '10.3'},
  ios11: {browserName: 'iphone', platform: 'OS X 10.12', version: '11.2'},
  ie11: {browserName: 'internet explorer', platform: 'Windows 10', version: '11'},
  // andriod44: {browserName: 'android', platform: 'Linux', version: '4.4'},
  android51: {browserName: 'android', platform: 'Linux', version: '5.1'},
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
                .url('http://localhost:8080/test/webdriver/test.html')
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
