module.exports = function computeApiBreadCrumbs(API_DOC_TYPES_TO_RENDER) {
  return {
    $runAfter: ['paths-computed'],
    $runBefore: ['rendering-docs'],
    $process(docs) {
      // Compute the breadcrumb for each doc by processing its containers
      docs.forEach(doc => {
        if (API_DOC_TYPES_TO_RENDER.indexOf(doc.docType) !== -1) {
          doc.breadCrumbs = [];
          doc.breadCrumbs.push({ text: 'API', path: '/api' });
          if (isSecondaryEntryPoint(doc)) {
            doc.breadCrumbs.push(createPackageBreadcrumb(doc));
          }
          if (doc.moduleDoc) {
            if (isSecondaryEntryPoint(doc.moduleDoc)) {
              doc.breadCrumbs.push(createPackageBreadcrumb(doc.moduleDoc));
            }
            doc.breadCrumbs.push({ text: '@angular/' + doc.moduleDoc.id, path: doc.moduleDoc.path });
          }
          doc.breadCrumbs.push({ text: doc.name, path: doc.path });
        }

      });
    }
  };
};

function isSecondaryEntryPoint(doc) {
  return doc.docType === 'package' && !doc.isPrimaryPackage;
}

function createPackageBreadcrumb(doc) {
  return { text: doc.packageInfo.primary.name, path: doc.packageInfo.primary.path };
}
