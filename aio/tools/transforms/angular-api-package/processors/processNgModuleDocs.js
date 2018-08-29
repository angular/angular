module.exports = function processNgModuleDocs() {
  return {
    $runAfter: ['extractDecoratedClassesProcessor'],
    $runBefore: ['docs-processed'],
    $process(docs) {
      docs.forEach(doc => {
        if (doc.docType === 'ngmodule') {
          Object.keys(doc.ngmoduleOptions).forEach(key => {
            const value = doc.ngmoduleOptions[key];
            if (value && !Array.isArray(value)) {
              doc.ngmoduleOptions[key] = [value];
            }
          });
        }
      });
    }
  };
};
