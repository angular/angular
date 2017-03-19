module.exports = function filterPrivateDocs() {
  return {
    $runAfter: ['extra-docs-added'],
    $runBefore: ['computing-paths'],
    $process: function(docs) {
      return docs.filter(function(doc) { return !doc.name || (doc.name.indexOf('ɵ') !== 0); });
    }
  }
};