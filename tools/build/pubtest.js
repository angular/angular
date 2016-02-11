var util = require('./util');
var spawn = require('child_process').spawn;
var glob = require('glob');
var path = require('path');
var fs = require('fs');
var process = require('process');

function filterExclusiveTestFiles(files, dir) {
  return files.filter(function(file) {
    // TODO(juliemr): revisit if readFileSync becomes too slow.
    // At the moment, this takes <100ms for all of angular2.
    var text = fs.readFileSync(path.join(dir, file));
    var iit = text.indexOf('iit(');
    var ddescribe = text.indexOf('ddescribe(');
    return (iit !== -1 || ddescribe !== -1);
  });
}

module.exports = function(gulp, plugins, config) {
  return function() {
    var platform = config.platform || 'dartium';
    var pubArgs = ['run', 'test', '-p', platform];
    var env = process.env;
    if (config.dartiumTmpdir) {
      env['PATH'] = env['PATH'] + ':' + config.dartiumTmpdir;
    }

    testFiles = glob.sync(path.join(config.files), {cwd: config.dir});
    if (config.useExclusiveTests) {
      var filtered = filterExclusiveTestFiles(testFiles, config.dir);
      if (filtered.length) {
        pubArgs.push('--tags');
        pubArgs.push('solo');
        testFiles = filtered;
      }
    }

    pubArgs = pubArgs.concat(testFiles);

    return util.processToPromise(spawn(config.command, pubArgs, {
      cwd: config.dir, stdio: 'inherit', env: env
    }));
  };
};
