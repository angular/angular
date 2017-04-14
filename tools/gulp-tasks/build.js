
module.exports = (gulp) => (done) => {
  const path = require('path');
  const childProcess = require('child_process');
  // increase maxbuffer to address out of memory exception when running certain tasks
  childProcess.exec(path.join(__dirname, '../../build.sh'), {maxBuffer: 300 * 1024}, done);
};
