const {cp} = require('shelljs');

module.exports = function copyFolder() {
  return (from, to) => cp('-rf', from, to);
};
