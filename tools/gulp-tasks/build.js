
module.exports = (gulp) => (done) => {
  const path = require('path');
  const childProcess = require('child_process');
  childProcess.exec(path.join(__dirname, '../../build.sh'), done);
};
