var traceur = require('traceur/src/node/traceur.js');

module.exports = function TraceurParser() {
  return System.get(System.map.traceur + '/src/syntax/Parser.js').Parser;
};