var path = require('canonical-path');

// This creates aliases by pulling off each path segment in turn:
// "a/b/c" will have aliases ["a/b/c", "b/c", "c"]
// @rado - IS THIS WHAT WE WANT OR ARE MODULE NAMES NOT RELATIVE LIKE THIS?
function getModuleAliases(doc) {
  var aliases = [];

  if ( !doc.id ) return [];

  var parts = doc.id.split('/');
  while(parts.length) {
    aliases.push(parts.join('/'));
    parts.shift();
  }
  return aliases;
}

/**
 * @dgService atScriptFileReader
 * @description
 * This file reader will create a simple doc for each
 * file including a code AST of the AtScript in the file.
 */
module.exports = function atScriptFileReader(log, atParser) {
  var reader = {
    name: 'atScriptFileReader',
    defaultPattern: /\.js$/,
    getDocs: function(fileInfo) {

      var moduleDoc = atParser.parseModule(fileInfo);
      moduleDoc.docType = 'module';
      moduleDoc.id = moduleDoc.moduleTree.moduleName;
      moduleDoc.aliases = getModuleAliases(moduleDoc);

      // Readers return a collection of docs read from the file
      // but in this read there is only one document (module) to return
      return [moduleDoc];
    }
  };

  return reader;


};
