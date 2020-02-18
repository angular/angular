/**
 * Read in JSON files
 */
module.exports = function jsonFileReader() {
  return {
    name: 'jsonFileReader',
    getDocs: function(fileInfo) {

      // We return a single element array because content files only contain one document
      return [{
        docType: fileInfo.baseName + '-json',
        data: JSON.parse(fileInfo.content),
        template: 'json-doc.template.json',
        id: fileInfo.baseName,
        aliases: [fileInfo.baseName, fileInfo.relativePath]
      }];
    }
  };
};