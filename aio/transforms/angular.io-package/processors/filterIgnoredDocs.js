/**
 * Filter out docs whose id matches a pattern in the `filterIgnoredDocs.ignore` list
 */
module.exports = function filterIgnoredDocs() {
  return {
    ignore: [],
    $runAfter: ['ids-computed'],
    $runBefore: ['computing-paths'],
    $process: function(docs) {
      return docs.filter(doc => !this.ignore.some(regexp => regexp.test(doc.id)));
    }
  };
};
