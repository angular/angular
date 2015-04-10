var _ = require('lodash');

module.exports = function attachModuleDocs(log) {

  return {
    $runAfter: ['tags-extracted'],
    $runBefore: ['computing-ids'],
    $process: function(docs) {
      return _.filter(docs, function(doc) {
        if (doc.docType !== 'moduleDoc') {
          return true;
        }
        if (doc.module || doc.module === '') {
          doc.moduleDoc.description = doc.description;
          doc.moduleDoc.public = doc.public;
          log.debug('attached', doc.moduleDoc.id, doc.moduleDoc.description);
        }
        return false;
      });
    }
  };
};
