
// returns the script path for the current platform
module.exports = function platformScriptPath(path) {
  const os = require('os');
  return /^win/.test(os.platform()) ? `${path}.cmd` : path;
};
