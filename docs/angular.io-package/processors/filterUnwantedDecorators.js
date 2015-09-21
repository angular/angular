var _ = require('lodash');

module.exports = function filterUnwantedDecorators() {
  return {
    decoratorsToIgnore: [],
    $runAfter: ['processing-docs'],
    $runBefore: ['docs-processed'],
    $process: function(docs) {
      var decoratorsToIgnore = this.decoratorsToIgnore || [];
      _.forEach(docs, function(doc) {
        if (doc.decorators) {
          doc.decorators = _.filter(doc.decorators, function(decorator) {
            return decoratorsToIgnore.indexOf(decorator.name) === -1;
          });
        }
      });
      return docs;
    }
  };
}
