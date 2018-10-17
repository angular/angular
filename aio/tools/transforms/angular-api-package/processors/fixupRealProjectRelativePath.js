module.exports = function fixupRealProjectRelativePath(API_DOC_TYPES) {
  return {
    $runAfter: ['readTypeScriptModules'],
    $runBefore: ['processing-docs'],
    $process(docs) {
      docs.forEach(doc => {
        if (API_DOC_TYPES.indexOf(doc.docType) !== -1 && doc.fileInfo && doc.fileInfo.realProjectRelativePath) {
          // this is an API doc - so fix up its real path
          doc.fileInfo.realProjectRelativePath = 'packages/' + doc.fileInfo.realProjectRelativePath;
        }
      });
    }
  };
};
