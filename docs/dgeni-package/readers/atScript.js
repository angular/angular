var path = require('canonical-path');


/**
 * @dgService atScriptFileReader
 * @description
 * This file reader will create a simple doc for each
 * file including a code AST of the AtScript in the file.
 */
module.exports = function atScriptFileReader(log, atParser, modules) {
  var reader = {
    name: 'atScriptFileReader',
    defaultPattern: /\.js|\.es6|\.ts$/,
    getDocs: function(fileInfo) {
      var moduleDoc = atParser.parseModule(fileInfo);
      moduleDoc.docType = 'module';
      moduleDoc.id = moduleDoc.moduleTree.moduleName;
      moduleDoc.aliases = [moduleDoc.id];

      modules[moduleDoc.id] = moduleDoc;

      // Readers return a collection of docs read from the file
      // but in this read there is only one document (module) to return
      return [moduleDoc];
    }
  };

  return reader;


};
