const {copySync} = require('fs-extra');

module.exports = function copyFolder() {
  return (from, to) => copySync(from, to);
};
