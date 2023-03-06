module.exports = function processErrorsContainerDoc() {
  return {
    $runAfter: ['extra-docs-added'],
    $runBefore: ['rendering-docs'],
    $process(docs) {
      const errorsDoc = docs.find((doc) => doc.id === 'errors/index');
      errorsDoc.id = 'errors-container';
      errorsDoc.errors = [
        {
          title: 'Runtime',
          errors: docs
            .filter((doc) => doc.docType === 'error' && doc.category === 'runtime')
            .sort(byCode),
        },
        {
          title: 'Compiler',
          errors: docs
            .filter((doc) => doc.docType === 'error' && doc.category === 'compiler')
            .sort(byCode),
        },
      ];
    },
  };
};

/**
 * Helper function to sort documents by error codes (NG0100 will come before NG0200)
 */
function byCode(doc1, doc2) {
  // slice to drop the 'NG' part of the code.
  const code1 = +doc1.code.slice(2);
  const code2 = +doc2.code.slice(2);
  return code1 > code2 ? 1 : -1;
}
