const path = require('canonical-path');

module.exports = function processBlocks() {
  return {
    $runAfter: ['tags-extracted'],
    $runBefore: ['collectPackageContentDocsProcessor'],
    $process(docs) {
      const moduleDocs = {};
      docs.forEach(doc => {
        if (doc.docType === 'module') {
          moduleDocs[doc.id] = doc;
        }
      });

      docs.forEach(doc => {
        // Wire up each 'block' doc to its containing module/package.
        if (doc.docType === 'block') {
          doc.moduleDoc = moduleDocs[path.dirname(doc.fileInfo.relativePath)];
          doc.moduleDoc.exports.push(doc);
        }
      });
    }
  };
};
