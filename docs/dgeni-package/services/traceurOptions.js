module.exports = function traceurOptions() {
  var Options = System.get(System.map.traceur + "/src/Options.js").Options;
  return new Options();
};