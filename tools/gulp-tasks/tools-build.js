function tsc(projectPath, done) {
  const path = require('path');
  const platformScriptPath = require('./platform-script-path');
  const childProcess = require('child_process');

  childProcess
      .spawn(
          path.join(__dirname, platformScriptPath('../../node_modules/.bin/tsc')),
          ['-p', path.join(__dirname, '../..', projectPath)], {stdio: 'inherit'})
      .on('close', done);
}

module.exports = (gulp) => (done) => {
  tsc('tools/', done);
};
