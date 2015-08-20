var customLaunchers = {
  'DartiumWithWebPlatform': {
    base: 'Dartium',
    flags: ['--enable-experimental-web-platform-features'] },
  'ChromeNoSandbox': {
    base: 'Chrome',
    flags: ['--no-sandbox'] },
  'SL_CHROME': {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: '44'
  },
  'SL_CHROMEBETA': {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: 'beta'
  },
  'SL_CHROMEDEV': {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: 'dev'
  },
  'SL_FIREFOX': {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: '37'
  },
  'SL_FIREFOXBETA': {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: 'beta'
  },
  'SL_FIREFOXDEV': {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: 'dev'
  },
  'SL_SAFARI7': {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.9',
    version: '7'
  },
  'SL_SAFARI8': {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.10',
    version: '8'
  },
  'SL_IOS7': {
    base: 'SauceLabs',
    browserName: 'iphone',
    platform: 'OS X 10.10',
    version: '7.1'
  },
  'SL_IOS8': {
    base: 'SauceLabs',
    browserName: 'iphone',
    platform: 'OS X 10.10',
    version: '8.2'
  },
  'SL_IE9': {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 2008',
    version: '9'
  },
  'SL_IE10': {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 2012',
    version: '10'
  },
  'SL_IE11': {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 8.1',
    version: '11'
  },
  'SL_ANDROID5.1': {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '5.1'
  },
  'SL_ANDROID4.4': {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '4.4'
  },
  'SL_ANDROID4.3': {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '4.3'
  },
  'SL_ANDROID4.2': {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '4.2'
  },
  'SL_ANDROID4.1': {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '4.1'
  },
  'SL_ANDROID4.0': {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '4.0'
  }
};

var aliases = {
  'ALL': Object.keys(customLaunchers).filter(function(item) {return customLaunchers[item].base == 'SauceLabs';}),
  'DESKTOP': ['SL_CHROME', 'SL_FIREFOX', 'SL_IE9', 'SL_IE10', 'SL_IE11', 'SL_SAFARI7', 'SL_SAFARI8'],
  'MOBILE': ['SL_ANDROID4.0', 'SL_ANDROID4.1', 'SL_ANDROID4.2', 'SL_ANDROID4.3', 'SL_ANDROID4.4', 'SL_ANDROID5.1', 'SL_IOS7', 'SL_IOS8'],
  'ANDROID': ['SL_ANDROID4.0', 'SL_ANDROID4.1', 'SL_ANDROID4.2', 'SL_ANDROID4.3', 'SL_ANDROID4.4', 'SL_ANDROID5.1'],
  'IE': ['SL_IE9', 'SL_IE10', 'SL_IE11'],
  'IOS': ['SL_IOS7', 'SL_IOS8'],
  'SAFARI': ['SL_SAFARI7', 'SL_SAFARI8'],
  'BETA': ['SL_CHROMEBETA', 'SL_FIREFOXBETA'],
  'DEV': ['SL_CHROMEDEV', 'SL_FIREFOXDEV'],
  'CI': ['SL_CHROME', 'SL_ANDROID5.1', 'SL_SAFARI8', 'SL_IOS8', 'SL_FIREFOX', 'SL_IE11', 'SL_IE10', 'SL_IE9']
};

module.exports = {
  customLaunchers: customLaunchers,
  aliases: aliases
}

if (process.env.TRAVIS) {
  process.env.SAUCE_ACCESS_KEY = process.env.SAUCE_ACCESS_KEY.split('').reverse().join('');
}