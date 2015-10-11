'use strict';

let execSync = require('child_process').execSync;
let fs = require('fs');
let path = require('path');
let os = require('os');
let ua = require('universal-analytics');

const analyticsFile = path.resolve(path.join(__dirname, '..', '..', '.build-analytics'));
const analyticsId = "UA-8594346-17"; // Owned by the Angular account
const analyticsOptions = {
  https: true,
  debug: false
};

let cid = fs.existsSync(analyticsFile) ? fs.readFileSync(analyticsFile, 'utf-8') : null;
let visitor;

if (cid) {
  visitor = ua(analyticsId, cid, analyticsOptions);
} else {
  visitor = ua(analyticsId, analyticsOptions);
  cid = visitor.cid;
  fs.writeFileSync(analyticsFile, cid, 'utf-8');
}


// https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters
let customParams = {
  // OS Platform (darwin, win32, linux)
  cd1: os.platform,
  // Node.js Version (v4.1.2)
  cd2: process.version,
  // npm Version (2.14.7)
  cd10: getNpmVersion(),
  // TypeScript Version (1.6.2)
  cd3: getTypeScriptVersion(),
  // Dart Version
  cd11: getDartVersion(),
  // Dev Environment
  cd4: process.env.TRAVIS ? 'Travis CI' : 'Local Dev',
  // Travis - Pull Request?
  cd5: process.env.TRAVIS && process.env.TRAVIS_PULL_REQUEST ? 'true' : 'false',
  // Travis - Branch Name (master)
  cd6: process.env.TRAVIS_BRANCH,
  // Travis - Repo Slug  (angular/angular)
  cd7: process.env.TRAVIS_REPO_SLUG,
  // HW - CPU Info
  cd8: `${os.cpus().length} x ${os.cpus()[0].model}`,
  // HW - Memory Info
  cd9: `${Math.round(os.totalmem()/1024/1024/1024)}GB`,
};



function getTypeScriptVersion() {
  try {
    return require('typescript').version;
  } catch (e) {
    return 'unknown';
  }
}


function getNpmVersion() {
  try {
    return execSync('npm -v').toString().replace(/\s/, '');
  } catch (e) {
    return 'unknown';
  }
}


function getDartVersion() {
  try {
    return execSync('dart --version 2>&1').toString().replace(/.+: (\S+) [\s\S]+/, '$1')
  } catch (e) {
    return 'unknown';
  }
}


module.exports = {
  install: (actionName, duration) => {
    duration = Math.round(duration);
    visitor.
      event('install', actionName, 'testLabel', duration, customParams).
      timing('install', actionName, duration, customParams).
      send();
  },

  build: (actionName, duration) => {
    duration = Math.round(duration);
    visitor.
      event('build', actionName, 'testLabel', duration, customParams).
      timing('build', actionName, duration, customParams).
      send();
  },

  test: (actionName, duration) => {
    duration = Math.round(duration);
    visitor.
      event('test', actionName, 'testLabel', duration, customParams).
      timing('test', actionName, duration, customParams).
      send();
  }
};
