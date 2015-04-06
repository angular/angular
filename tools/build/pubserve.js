var util = require('./util');
var spawn = require('child_process').spawn;

module.exports = function(gulp, plugins, config, module) {
  return function() {
    var pubMode = config.mode || 'debug';
    var pubArgs = ['serve', '--mode', pubMode];
    return util.streamToPromise(spawn(config.command, pubArgs, {
      cwd: config.path, stdio: 'inherit'
    }));
  };
};

