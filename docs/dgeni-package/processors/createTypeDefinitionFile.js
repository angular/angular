var _ = require('lodash');

module.exports = function createTypeDefinitionFile() {

  return {
    $runAfter: ['processing-docs'],
    $runBefore: ['docs-processed'],
    $process: function(docs) {
      var typeDefDoc = {
        id: 'type-definition',
        aliases: ['type-definition'],
        path: 'type-definition',
        outputPath: 'angular2.d.ts',
        modules: []
      };
      _.forEach(docs, function(doc) {
        if ( doc.docType === 'module' ) {
          typeDefDoc.modules.push(doc);
        }
      });
      docs.push(typeDefDoc);
    }
  };
};