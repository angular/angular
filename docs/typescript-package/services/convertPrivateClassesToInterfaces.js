var _ = require('lodash');

module.exports = function convertPrivateClassesToInterfaces() {
  return function(exportDocs, addInjectableReference) {
    _.forEach(exportDocs, function(exportDoc) {

      // Search for classes with a constructor marked as `@internal`
      if (exportDoc.docType === 'class' && exportDoc.constructorDoc && exportDoc.constructorDoc.internal) {

        // Convert this class to an interface with no constructor
        exportDoc.docType = 'interface';
        exportDoc.constructorDoc = null;

        if (exportDoc.heritage) {
          // convert the heritage since interfaces use `extends` not `implements`
          exportDoc.heritage = exportDoc.heritage.replace('implements', 'extends');
        }

        if (addInjectableReference) {
          // Add the `declare var SomeClass extends InjectableReference` construct
          exportDocs.push({
            docType: 'var',
            name: exportDoc.name,
            id: exportDoc.id,
            returnType: 'InjectableReference'
          });
        }
      }
    });
  };
};
