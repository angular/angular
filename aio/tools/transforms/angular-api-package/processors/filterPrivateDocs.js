module.exports = function filterPrivateDocs() {
  return {
    $runAfter: ['extra-docs-added', 'checkContentRules'],
    $runBefore: ['computing-paths'],
    $process: function(docs) {
      return docs.filter(function(doc) { return doc.privateExport !== true; });
    }
  };
};
