module.exports = function traceurOptions() {
  return System.get(System.map.traceur + '/src/Options.js').options;
};