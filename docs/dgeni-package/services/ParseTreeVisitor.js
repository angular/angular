var traceur = require('traceur/src/node/traceur.js');

module.exports = function ParseTreeVisitor() {
  console.log(System.map.traceur);
  return System.get(System.map.traceur + '/src/syntax/ParseTreeVisitor.js').ParseTreeVisitor;
};