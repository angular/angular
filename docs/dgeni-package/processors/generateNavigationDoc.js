var _ = require('lodash');

module.exports = function generateNavigationDoc() {

  return {
    $runAfter: ['docs-processed'],
    $runBefore: ['rendering-docs'],
    $process: function(docs) {
      var navigationDoc = {
        value: { sections: [] },
        moduleName: 'navigation-data',
        serviceName: 'NAVIGATION',
        template: 'data-module.template.js',
        outputPath: 'js/navigation.js'
      };

      _.forEach(docs, function(doc) {
        if ( doc.docType === 'module' ) {
          var moduleNavItem = {
            path: doc.path,
            name: doc.id,
            type: 'module',
            pages: []
          };

          navigationDoc.value.sections.push(moduleNavItem);

          _.forEach(doc.exports, function(exportDoc) {
            var exportNavItem = {
              path: exportDoc.path,
              name: exportDoc.name,
              type: exportDoc.docType
            };
            moduleNavItem.pages.push(exportNavItem);
          });
        }
      });

      docs.push(navigationDoc);
    }
  };
};