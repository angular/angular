var _ = require('lodash');
var traceur;

/**
 * @dgService atScriptFileReader
 * @description
 * This file reader will create a simple doc for each
 * file including a code AST of the AtScript in the file.
 */
module.exports = function atScriptFileReader(log) {
  return {
    name: 'atScriptFileReader',
    defaultPattern: /\.js$/,
    getDocs: function(fileInfo) {

      try {
        fileInfo.ast = null; // TODO utilize Traceur here
      } catch(ex) {
       ex.file = fileInfo.filePath;
        throw new Error(
          _.template('Syntax error in file "${file}"" [line ${lineNumber}, column ${column}]: "${description}"', ex));
      }

      return [{
        docType: 'atScriptFile'
      }];
    }
  };
};