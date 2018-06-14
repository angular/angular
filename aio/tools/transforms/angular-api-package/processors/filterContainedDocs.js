/**
 * Remove docs that are contained in (owned by) another doc
 * so that they don't get rendered as files in themselves.
 */
module.exports = function filterContainedDocs() {
  return {
    docTypes: ['member', 'function-overload', 'get-accessor-info', 'set-accessor-info', 'parameter'],
    $runAfter: ['extra-docs-added', 'checkContentRules'],
    $runBefore: ['computing-paths'],
    $process: function(docs) {
      var docTypes = this.docTypes;
      return docs.filter(function(doc) {
        return docTypes.indexOf(doc.docType) === -1;
      });
    }
  };
};
