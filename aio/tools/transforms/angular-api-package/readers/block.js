/**
 * @dgService
 * @description
 * This file reader will pull the contents from a text file that will be used
 * as the description of a "block", such as `@if` or `@for`, etc.
 *
 * The doc will initially have the form:
 * ```
 * {
 *   docType: 'block',
 *   name: 'some-name',
 *   content: 'the content of the file',
 * }
 * ```
 */
module.exports = function blockFileReader() {
  return {
    name: 'blockFileReader',
    defaultPattern: /\.md$/,
    getDocs: function(fileInfo) {
      // We return a single element array because element files only contain one document
      return [{
        docType: 'block',
        name: `@${fileInfo.baseName}`,
        content: fileInfo.content,
      }];
    }
  };
};
