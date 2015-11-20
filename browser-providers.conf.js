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
    version: '46'
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
    version: '42'
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
  'SL_SAFARI9.0': {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.11',
    version: '9.0'
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
    version: '8.4'
  },
  'SL_IOS9': {
    base: 'SauceLabs',
    browserName: 'iphone',
    platform: 'OS X 10.10',
    version: '9.1'
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
  'SL_EDGE': {
    base: 'SauceLabs',
    browserName: 'microsoftedge',
    platform: 'Windows 10',
    version: '20.10240'
  },
  'SL_ANDROID4.1': {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '4.1'
  },
  'SL_ANDROID4.2': {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '4.2'
  },
  'SL_ANDROID4.3': {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '4.3'
  },
  'SL_ANDROID4.4': {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '4.4'
  },
  'SL_ANDROID5.1': {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '5.1'
  },

  'BS_CHROME': {
    base: 'BrowserStack',
    browser: 'chrome',
    os: 'OS X',
    os_version: 'Yosemite'
  },
  'BS_FIREFOX': {
    base: 'BrowserStack',
    browser: 'firefox',
    os: 'Windows',
    os_version: '10'
  },
  'BS_SAFARI7': {
    base: 'BrowserStack',
    browser: 'safari',
    os: 'OS X',
    os_version: 'Mavericks'
  },
  'BS_SAFARI8': {
    base: 'BrowserStack',
    browser: 'safari',
    os: 'OS X',
    os_version: 'Yosemite'
  },
  'BS_SAFARI9': {
    base: 'BrowserStack',
    browser: 'safari',
    os: 'OS X',
    os_version: 'El Capitan'
  },
  'BS_IOS7': {
    base: 'BrowserStack',
    device: 'iPhone 5S',
    os: 'ios',
    os_version: '7.0'
  },
  'BS_IOS8': {
    base: 'BrowserStack',
    device: 'iPhone 6',
    os: 'ios',
    os_version: '8.3'
  },
  'BS_IOS9': {
    base: 'BrowserStack',
    device: 'iPhone 6S',
    os: 'ios',
    os_version: '9.0'
  },
  'BS_IE9': {
    base: 'BrowserStack',
    browser: 'ie',
    browser_version: '9.0',
    os: 'Windows',
    os_version: '7'
  },
  'BS_IE10': {
    base: 'BrowserStack',
    browser: 'ie',
    browser_version: '10.0',
    os: 'Windows',
    os_version: '8'
  },
  'BS_IE11': {
    base: 'BrowserStack',
    browser: 'ie',
    browser_version: '11.0',
    os: 'Windows',
    os_version: '10'
  },
  'BS_EDGE': {
    base: 'BrowserStack',
    browser: 'edge',
    os: 'Windows',
    os_version: '10'
  },
  'BS_WINDOWSPHONE' : {
    base: 'BrowserStack',
    device: 'Nokia Lumia 930',
    os: 'winphone',
    os_version: '8.1'
  },
  'BS_ANDROID5': {
    base: 'BrowserStack',
    device: 'Google Nexus 5',
    os: 'android',
    os_version: '5.0'
  },
  'BS_ANDROID4.4': {
    base: 'BrowserStack',
    device: 'HTC One M8',
    os: 'android',
    os_version: '4.4'
  },
  'BS_ANDROID4.3': {
    base: 'BrowserStack',
    device: 'Samsung Galaxy S4',
    os: 'android',
    os_version: '4.3'
  },
  'BS_ANDROID4.2': {
    base: 'BrowserStack',
    device: 'Google Nexus 4',
    os: 'android',
    os_version: '4.2'
  },
  'BS_ANDROID4.1': {
    base: 'BrowserStack',
    device: 'Google Nexus 7',
    os: 'android',
    os_version: '4.1'
  }
};

// iOS9 deactivated as not reliable in both providers
// TODO(mlaval): reactivate after https://github.com/angular/angular/issues/5408

var sauceAliases = {
  'ALL': Object.keys(customLaunchers).filter(function(item) {return customLaunchers[item].base == 'SauceLabs';}),
  'DESKTOP': ['SL_CHROME', 'SL_FIREFOX', 'SL_IE9', 'SL_IE10', 'SL_IE11', 'SL_EDGE', 'SL_SAFARI7', 'SL_SAFARI8', 'SL_SAFARI9.0'],
  'MOBILE': ['SL_ANDROID4.1', 'SL_ANDROID4.2', 'SL_ANDROID4.3', 'SL_ANDROID4.4', 'SL_ANDROID5.1', 'SL_IOS7', 'SL_IOS8', 'SL_IOS9'],
  'ANDROID': ['SL_ANDROID4.1', 'SL_ANDROID4.2', 'SL_ANDROID4.3', 'SL_ANDROID4.4', 'SL_ANDROID5.1'],
  'IE': ['SL_IE9', 'SL_IE10', 'SL_IE11'],
  'IOS': ['SL_IOS7', 'SL_IOS8', 'SL_IOS9'],
  'SAFARI': ['SL_SAFARI7', 'SL_SAFARI8', 'SL_SAFARI9.0'],
  'BETA': ['SL_CHROMEBETA', 'SL_FIREFOXBETA'],
  'DEV': ['SL_CHROMEDEV', 'SL_FIREFOXDEV'],
  'CI': ['SL_CHROME', 'SL_ANDROID5.1', 'SL_SAFARI7', 'SL_SAFARI8', 'SL_SAFARI9.0', 'SL_IOS7', 'SL_IOS8',
         'SL_FIREFOX', 'SL_IE9', 'SL_IE10', 'SL_IE11', 'SL_EDGE', 'SL_ANDROID4.1', 'SL_ANDROID4.2', 'SL_ANDROID4.3', 'SL_ANDROID4.4',
         'SL_CHROMEDEV', 'SL_FIREFOXBETA']
};

var browserstackAliases = {
  'ALL': Object.keys(customLaunchers).filter(function(item) {return customLaunchers[item].base == 'BrowserStack';}),
  'DESKTOP': ['BS_CHROME', 'BS_FIREFOX', 'BS_IE9', 'BS_IE10', 'BS_IE11', 'BS_EDGE', 'BS_SAFARI7', 'BS_SAFARI8', 'BS_SAFARI9'],
  'MOBILE': ['BS_ANDROID4.3', 'BS_ANDROID4.4', 'BS_IOS7', 'BS_IOS8', 'BS_IOS9', 'BS_WINDOWSPHONE'],
  'ANDROID': ['BS_ANDROID4.3', 'BS_ANDROID4.4'],
  'IE': ['BS_IE9', 'BS_IE10', 'BS_IE11'],
  'IOS': ['BS_IOS7', 'BS_IOS8', 'BS_IOS9'],
  'SAFARI': ['BS_SAFARI7', 'BS_SAFARI8', 'BS_SAFARI9'],
  'CI': ['BS_CHROME', 'BS_SAFARI7', 'BS_SAFARI8', 'BS_SAFARI9', 'BS_IOS7', 'BS_IOS8',
    'BS_FIREFOX', 'BS_IE9', 'BS_IE10', 'BS_IE11', 'BS_EDGE', 'BS_WINDOWSPHONE', 'BS_ANDROID4.3', 'BS_ANDROID4.4']
};

module.exports = {
  customLaunchers: customLaunchers,
  sauceAliases: sauceAliases,
  browserstackAliases: browserstackAliases
}

if (process.env.TRAVIS) {
  process.env.SAUCE_ACCESS_KEY = process.env.SAUCE_ACCESS_KEY.split('').reverse().join('');
  process.env.BROWSER_STACK_ACCESS_KEY = process.env.BROWSER_STACK_ACCESS_KEY.split('').reverse().join('');
}
