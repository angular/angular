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
        // The shape of the public API is determined by what is reexported into
        // angular2/angular2.
        if (doc.id === 'angular2/angular2') {
          typeDefDoc.modules.push(doc);
        }
      });
      docs.push(typeDefDoc);
    }
  };
};
