/**
 * @dgService
 * @description
 * This file reader will pull the contents from a text file that will be used
 * as the description of a "special element", such as `<ng-content>` or `<ng-template>`, etc.
 *
 * The doc will initially have the form:
 * ```
 * {
 *   docType: 'element',
 *   name: 'some-name',
 *   content: 'the content of the file',
 * }
 * ```
 */
module.exports = function specialElementFileReader() {
  return {
    name: 'specialElementFileReader',
    defaultPattern: /\.md$/,
    getDocs: function(fileInfo) {
      // We return a single element array because element files only contain one document
      return [{
        docType: 'element',
        name: `<${fileInfo.baseName}>`,
        content: fileInfo.content,
      }];
    }
  };
};