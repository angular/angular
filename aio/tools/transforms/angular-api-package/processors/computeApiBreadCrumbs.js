module.exports = function computeApiBreadCrumbs(EXPORT_DOC_TYPES) {
  return {
    $runAfter: ['paths-computed'],
    $runBefore: ['rendering-docs'],
    $process(docs) {
      // Compute the breadcrumb for each doc by processing its containers
      docs.forEach(doc => {
        if (EXPORT_DOC_TYPES.indexOf(doc.docType) !== -1) {
          doc.breadCrumbs = [
            { text: 'API', path: '/api' },
            { text: '@angular/' + doc.moduleDoc.id, path: doc.moduleDoc.path },
            { text: doc.name, path: doc.path }
          ];
        }
      });
    }
  };
};

