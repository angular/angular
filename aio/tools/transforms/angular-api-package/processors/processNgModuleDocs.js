module.exports = function processNgModuleDocs(getDocFromAlias, createDocMessage, log) {
  return {
    $runAfter: ['extractDecoratedClassesProcessor', 'computeIdsProcessor'],
    $runBefore: ['createSitemap'],
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

      // Match all the directives/pipes to their module
      const errors = [];
      docs.forEach(doc => {
        if (['directive', 'pipe'].indexOf(doc.docType) !== -1) {
          if (!doc.ngModules || doc.ngModules.length === 0) {
            errors.push(createDocMessage(`"${doc.id}" has no @ngModule tag. Docs of type "${doc.docType}" must have this tag.`, doc));
            return;
          }

          doc.ngModules.forEach((ngModule, index) => {

            const ngModuleDocs = getDocFromAlias(ngModule, doc);

            if (ngModuleDocs.length === 0) {
              errors.push(createDocMessage(`"@ngModule ${ngModule}" does not match a public NgModule`, doc));
              return;
            }

            if (ngModuleDocs.length > 1) {
              errors.push(createDocMessage(`"@ngModule ${ngModule}" is ambiguous. Matches: ${ngModuleDocs.map(d => d.id).join(', ')}`, doc));
              return;
            }

            const ngModuleDoc = ngModuleDocs[0];
            const container = ngModuleDoc[doc.docType + 's'] = ngModuleDoc[doc.docType + 's'] || [];
            container.push(doc);

            doc.ngModules[index] = ngModuleDoc;
          });
        }
      });

      if (errors.length) {
        errors.forEach(error => log.error(error));
        throw new Error('Failed to process NgModule relationships.');
      }
    }
  };
};
