module.exports = function extractDecoratedClassesProcessor(EXPORT_DOC_TYPES) {

  // Add the "directive" docType into those that can be exported from a module
  EXPORT_DOC_TYPES.push('directive', 'pipe');

  return {
    $runAfter: ['processing-docs'],
    $runBefore: ['docs-processed'],
    decoratorTypes: ['Directive', 'Component', 'Pipe', 'NgModule'],
    $process: function(docs) {
      const decoratorTypes = this.decoratorTypes;
      docs.forEach(doc => {
        (doc.decorators || []).forEach(decorator => {
          if (decoratorTypes.indexOf(decorator.name) !== -1) {
            doc.docType = decorator.name.toLowerCase();
            // Directives do not always have an argument (i.e. abstract directives).
            // We still create options for those, as an empty object literal is equal
            // to just having an empty object literal as decorator argument.
            doc[doc.docType + 'Options'] = decorator.argumentInfo[0] || {};
          }
        });
      });

      return docs;
    }
  };
};
