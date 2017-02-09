module.exports = function generateNavigationDoc() {

  return {
    $runAfter: ['extra-docs-added'],
    $runBefore: ['rendering-docs'],
    outputFolder: '',
    $validate: {outputFolder: {presence: true}},
    $process: function(docs) {
      var modulesDoc = {
        docType: 'data-module',
        value: {api: {sections: []}, guide: {pages: []}},
        path: this.outputFolder + '/navigation',
        outputPath: this.outputFolder + '/navigation.ts',
        serviceName: 'NAVIGATION'
      };

      docs.forEach(function(doc) {
        if (doc.docType === 'module') {
          var moduleNavItem =
              {path: doc.path, partial: doc.outputPath, name: doc.id, type: 'module', pages: []};

          modulesDoc.value.api.sections.push(moduleNavItem);

          doc.exports.forEach(function(exportDoc) {
            if (!exportDoc.internal) {
              var exportNavItem = {
                path: exportDoc.path,
                partial: exportDoc.outputPath,
                name: exportDoc.name,
                type: exportDoc.docType
              };
              moduleNavItem.pages.push(exportNavItem);
            }
          });
        }
      });

      docs.forEach(function(doc) {
        if (doc.docType === 'guide') {
          console.log('guide', doc.name);
          var guideDoc = {path: doc.path, partial: doc.outputPath, name: doc.name, type: 'guide'};
          modulesDoc.value.guide.pages.push(guideDoc);
        }
      });

      docs.push(modulesDoc);
    }
  };
};
