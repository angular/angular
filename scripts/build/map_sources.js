var path = require('path');
var sorcery = require('sorcery');

var argv = require('yargs')
  .alias('f', 'file')
  .argv;

sorcery.load(argv.file).then(function(chain) {
  chain.write();
});
