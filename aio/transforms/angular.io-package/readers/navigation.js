/**
 * Read in the navigation JSON
 */
module.exports = function navigationFileReader() {
  return {
    name: 'navigationFileReader',
    getDocs: function(fileInfo) {

      // We return a single element array because content files only contain one document
      return [{
        docType: 'navigation-map',
        data: JSON.parse(fileInfo.content),
        template: 'json-doc.template.json',
        id: 'navigation',
        aliases: ['navigation', 'navigation.json']
      }];
    }
  };
};