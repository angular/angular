var util = require('./util');
var spawn = require('child_process').spawn;

module.exports = function(gulp, plugins, config, module) {
  return function() {
    return util.streamToPromise(spawn(config.command, ['serve'], {
      cwd: config.path, stdio: 'inherit'
    }));
  };
};

