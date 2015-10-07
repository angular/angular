var data = module.exports = require('./protractor-js.conf.js');
var config = data.config;

config.sauceUser = process.env.SAUCE_USERNAME;
config.sauceKey = process.env.SAUCE_ACCESS_KEY;
config.multiCapabilities = [
    capabilitiesForSauceLabs({
      browserName: 'chrome',
      version: '45'
    }),
    capabilitiesForSauceLabs({
      browserName: 'firefox',
      version: '37'
    }),
    capabilitiesForSauceLabs({
      browserName: 'safari',
      version: '8'
    })
  ];

config.allScriptsTimeout = 30000;
config.getPageTimeout = 30000;

if (process.env.TRAVIS) {
  process.env.SAUCE_ACCESS_KEY = process.env.SAUCE_ACCESS_KEY.split('').reverse().join('');
}

function capabilitiesForSauceLabs(capabilities) {
  return {
    'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,

    'name': 'Angular2 E2E',
    'build': process.env.TRAVIS_BUILD_NUMBER,

    'browserName': capabilities.browserName,
    'platform': capabilities.platform,
    'version': capabilities.version
  };
}
