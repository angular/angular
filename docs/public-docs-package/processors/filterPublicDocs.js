var _ = require('lodash');

module.exports = function filterPublicDocs(modules, EXPORT_DOC_TYPES) {
  return {
    $runAfter: ['tags-parsed', 'cloneExportedFromDocs'],
    $runBefore: ['computing-ids'],
    $process: function(docs) {

      // Filter out the documents that are not public
      return _.filter(docs, function(doc) {

        if (doc.docType === 'module') {
          // doc is a module - is it public?
          return doc.public;
        }

        if (EXPORT_DOC_TYPES.indexOf(doc.docType) === -1) {
          // doc is not a type we care about
          return true;
        }

        // doc is in a public module
        return doc.moduleDoc && doc.moduleDoc.public;

      });
    }
  };
};