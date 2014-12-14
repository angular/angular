var traceur = require('traceur/src/node/traceur.js');

module.exports = function ParseTreeVisitor() {
  return System.get(System.map.traceur + '/src/syntax/ParseTreeVisitor').ParseTreeVisitor;
};