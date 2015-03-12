var traceur = require('traceur/src/node/traceur.js');

module.exports = function SourceFile() {
  return System.get(System.map.traceur + '/src/syntax/SourceFile.js').SourceFile;
};