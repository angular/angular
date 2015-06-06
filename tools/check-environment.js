var exec = require('child_process').exec;
var semver = require('semver');

var checkNodeModules = require('./npm/check-node-modules.js');


function checkEnvironment(reqs) {

  exec('npm --version', function(e, stdout) {
    var foundNpmVersion = semver.clean(stdout);
    var foundNodeVersion = process.version;
    var issues = [];


    if (!semver.satisfies(foundNodeVersion, reqs.requiredNodeVersion)) {
      issues.push('You are running unsupported node version. Found: ' + foundNodeVersion +
        ' Expected: ' + reqs.requiredNodeVersion + '. Use nvm to update your node version.');
    }

    if (!semver.satisfies(foundNpmVersion, reqs.requiredNpmVersion)) {
      issues.push('You are running unsupported npm version. Found: ' + foundNpmVersion +
        ' Expected: ' + reqs.requiredNpmVersion + '. Run: npm update -g npm');
    }

    if (!checkNodeModules()) {
      issues.push('Your node_modules directory is stale or out of sync with npm-shrinkwrap.json. Run: npm install');
    }

    if (issues.length) {
      console.warn(Array(80).join('!'));
      console.warn('Your environment is not in a good shape. Following issues were found:');
      issues.forEach(function(issue) {console.warn('  - ' + issue)});
      console.warn(Array(80).join('!'));
    }
  });
}


module.exports = checkEnvironment;
