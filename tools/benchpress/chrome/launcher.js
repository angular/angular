var KarmaLauncher = require('../util/karma_launcher_adapter');
var retry = require('../util/retry');
var ChromeBrowser = require('./browser');
var KarmaChromeLauncher = require('karma-chrome-launcher')['launcher:Chrome'][1];

function ChromeLauncher(appEmitter, options) {
  this._options = options;
  options.port = options.port || 9222;
  options.flags = options.flags || [];
  options.flags.push('--remote-debugging-port='+options.port);
  this._launcher = KarmaLauncher(KarmaChromeLauncher, appEmitter, options);
  this._browser = new ChromeBrowser(options);
}

ChromeLauncher.prototype = {
  start: function() {
    var self = this;
    this._launcher.start('');
    return retry(function() {
      return self._browser.checkOpen();
    }, self._options.captureTimeout, 100);
  },
  kill: function() {
    this._launcher.kill();
  }
};

module.exports = ChromeLauncher;
