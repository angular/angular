var _ = require('lodash');

module.exports = function addJadeDataDocsProcessor(EXPORT_DOC_TYPES) {
  return {
    $runAfter: ['adding-extra-docs'],
    $runBefore: ['extra-docs-added'],
    $process: function(docs) {
      var extraDocs = [];
      _.forEach(docs, function(doc) {
        if (doc.docType === 'module') {
          extraDocs.push({
            id: doc.id + "_data",
            docType: 'jade-data',
            originalDoc: doc,
            data: doc.exports
          });
        }
      });
      return docs.concat(extraDocs);
    }
  };
};