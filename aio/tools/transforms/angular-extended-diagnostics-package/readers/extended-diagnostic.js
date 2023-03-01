/**
 * @dgService
 * @description
 * This file reader will pull the contents from an extended diagnostic text file (by default `.md`).
 *
 * The doc will initially have the form:
 * ```
 * {
 *   docType: 'extended-diagnostic',
 *   content: 'the content of the file',
 * }
 * ```
 */
module.exports = function extendedDiagnosticFileReader() {
  return {
    name: 'extendedDiagnosticFileReader',
    defaultPattern: /\.md$/,
    getDocs: fileInfo => {
      // We return a single element array because extended-diagnostic files only contain one
      // document.
      return [{docType: 'extended-diagnostic', content: fileInfo.content}];
    },
  };
};
