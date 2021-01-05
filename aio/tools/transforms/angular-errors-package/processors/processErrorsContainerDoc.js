module.exports = function processErrorsContainerDoc() {
  return {
    $runAfter: ['extra-docs-added'],
    $runBefore: ['rendering-docs'],
    $process(docs) {
      const errorsDoc = docs.find(doc => doc.id === 'errors/index');
      errorsDoc.id = 'errors-container';
      errorsDoc.errors = docs.filter(doc => doc.docType === 'error');
    }
  };
};
