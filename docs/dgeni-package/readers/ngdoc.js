var path = require('canonical-path');

/**
 * @dgService ngdocFileReader
 * @description
 * This file reader will pull the contents from a text file (by default .ngdoc)
 *
 * The doc will initially have the form:
 * ```
 * {
 *   content: 'the content of the file',
 *   startingLine: 1
 * }
 * ```
 */
module.exports = function ngdocFileReader() {
  var reader = {
    name: 'ngdocFileReader',
    defaultPattern: /\.md$/,
    getDocs: function(fileInfo) {

      // We return a single element array because ngdoc files only contain one document
      return [{
        docType: 'guide',
        content: fileInfo.content,
        startingLine: 1
      }];
    }
  };

  return reader;
};