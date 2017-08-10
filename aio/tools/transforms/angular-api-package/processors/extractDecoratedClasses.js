var _ = require('lodash');

module.exports = function extractDecoratedClassesProcessor(EXPORT_DOC_TYPES) {

  // Add the "directive" docType into those that can be exported from a module
  EXPORT_DOC_TYPES.push('directive', 'pipe');

  return {
    $runAfter: ['processing-docs'],
    $runBefore: ['docs-processed'],
    decoratorTypes: ['Directive', 'Component', 'Pipe'],
    $process: function(docs) {
      var decoratorTypes = this.decoratorTypes;

      _.forEach(docs, function(doc) {

        _.forEach(doc.decorators, function(decorator) {

          if (decoratorTypes.indexOf(decorator.name) !== -1) {
            doc.docType = decorator.name.toLowerCase();
            doc[doc.docType + 'Options'] = decorator.argumentInfo[0];
          }
        });
      });

      return docs;
    }
  };
};
