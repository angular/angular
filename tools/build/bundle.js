module.exports.bundle = function(buildConfig, moduleName, outputFile, outputConfig){
  // loading it earlier interfers with custom traceur.
  var Builder = require('systemjs-builder');
  var builder = new Builder();
  builder.config(buildConfig);
  return builder.build(moduleName, outputFile, outputConfig);
}
