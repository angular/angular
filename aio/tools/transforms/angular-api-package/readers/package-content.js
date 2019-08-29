/**
 * @dgService
 * @description
 * This file reader will pull the contents from a text file that will be used
 * as the description of a package.
 *
 * The doc will initially have the form:
 * ```
 * {
 *   content: 'the content of the file',
 *   startingLine: 1
 * }
 * ```
 */
module.exports = function packageContentFileReader() {
  return {
    name: 'packageContentFileReader',
    defaultPattern: /PACKAGE\.md$/,
    getDocs: function(fileInfo) {

      // We return a single element array because content files only contain one document
      return [{docType: 'package-content', content: fileInfo.content, startingLine: 1}];
    }
  };
};