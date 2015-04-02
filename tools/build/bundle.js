module.exports.bundle = function(buildConfig, moduleName, outputFile, outputConfig){
  //this is here on purpose, to prevent it loading too early and interfering with the custom traceur...
  var Builder = require('systemjs-builder');
  var builder = new Builder();
  builder.config(buildConfig);
  return builder.build(moduleName,outputFile,outputConfig);
}

//TODO: concat deps
