var _ = require('lodash');

module.exports = function cloneExportedFromDocs(modules, EXPORT_DOC_TYPES) {
  return {
    $runAfter: ['tags-parsed', 'attachModuleDocs'],
    $runBefore: ['computing-ids'],
    $process: function(docs) {

      var extraPublicDocs = [];

      _.forEach(docs, function(doc) {

        if (EXPORT_DOC_TYPES.indexOf(doc.docType) === -1 || !doc.exportedAs) return;

        _.forEach(doc.exportedAs, function(exportedAs) {
          var exportedAsModule = modules[exportedAs];

          if (!exportedAsModule) {
            throw new Error('Missing module definition: "' + doc.exportedAs + '"\n' +
                            'Referenced in "@exportedAs" tag on class: "' + doc.moduleDoc.id + '/' + doc.name + '"');
          } else {

            // Add a clone of export to its "exportedAs" module
            var clonedDoc = _.clone(doc);
            clonedDoc.moduleDoc = exportedAsModule;
            exportedAsModule.exports.push(clonedDoc);
            extraPublicDocs.push(clonedDoc);
          }
        });
      });

      docs = docs.concat(extraPublicDocs);

      return docs;
    }
  };
};