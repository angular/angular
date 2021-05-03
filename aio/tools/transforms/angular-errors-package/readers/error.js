/**
 * @dgService
 * @description
 * This file reader will pull the contents from a text file (by default .md)
 *
 * The doc will initially have the form:
 * ```
 * {
 *   docType: 'error',
 *   content: 'the content of the file',
 * }
 * ```
 */
module.exports = function errorFileReader() {
  return {
    name: 'errorFileReader',
    defaultPattern: /\.md$/,
    getDocs: function(fileInfo) {
      // We return a single element array because content files only contain one document
      return [{docType: 'error', content: fileInfo.content}];
    }
  };
};
