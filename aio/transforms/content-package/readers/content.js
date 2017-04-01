/**
 * @dgService
 * @description
 * This file reader will pull the contents from a text file (by default .md)
 *
 * The doc will initially have the form:
 * ```
 * {
 *   content: 'the content of the file',
 *   startingLine: 1
 * }
 * ```
 */
module.exports = function contentFileReader() {
  return {
    name: 'contentFileReader',
    defaultPattern: /\.md$/,
    getDocs: function(fileInfo) {

      // We return a single element array because content files only contain one document
      return [{docType: 'content', content: fileInfo.content, startingLine: 1}];
    }
  };
};
