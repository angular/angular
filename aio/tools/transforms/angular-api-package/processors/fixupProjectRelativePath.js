module.exports = function fixupProjectRelativePath(API_DOC_TYPES) {
  return {
    $runAfter: ['readTypeScriptModules'],
    $runBefore: ['processing-docs'],
    $process(docs) {
      docs.forEach(doc => {
        if (API_DOC_TYPES.indexOf(doc.docType) !== -1 && doc.fileInfo && doc.fileInfo.realFilePath) {
          // this is an API doc - so fix up its real path
          doc.fileInfo.projectRelativePath = 'packages/' + doc.fileInfo.projectRelativePath;
        }
      });
    }
  };
};
