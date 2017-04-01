module.exports = function filterMemberDocs() {
  return {
    $runAfter: ['extra-docs-added'], $runBefore: ['computing-paths'], $process: function(docs) {
      return docs.filter(function(doc) { return doc.docType !== 'member'; });
    }
  };
};
