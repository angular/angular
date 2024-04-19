const { dirname } = require('canonical-path');

module.exports = function collectPackageContentDocsProcessor() {
  return {
    $runAfter: ['tags-extracted'],
    $runBefore: ['computing-ids', 'processPackages'],
    packageContentFiles: {},
    $process(docs) {
      return docs.filter(doc => {
        if (doc.docType === 'package-content') {
          this.packageContentFiles[dirname(doc.fileInfo.filePath)] = doc;
          return false;
        } else {
          return true;
        }
      });
    }
  };
};