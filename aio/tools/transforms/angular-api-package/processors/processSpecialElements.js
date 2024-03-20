const path = require('canonical-path');

module.exports = function processSpecialElements() {
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
        // Wire up each 'element' doc to its containing module/package.
        if (doc.docType === 'element') {
          doc.moduleDoc = moduleDocs[path.dirname(doc.fileInfo.relativePath)];
          doc.moduleDoc.exports.push(doc);
        }
      });
    }
  };
};
