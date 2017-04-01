var _ = require('lodash');

/**
 * @dgProcessor
 * @description
 *
 */
module.exports = function matchUpDirectiveDecoratorsProcessor() {

  return {
    $runAfter: ['ids-computed', 'paths-computed'],
    $runBefore: ['rendering-docs'],
    decoratorMappings: {'Inputs': 'inputs', 'Outputs': 'outputs'},
    $process: function(docs) {
      var decoratorMappings = this.decoratorMappings;
      _.forEach(docs, function(doc) {
        if (doc.docType === 'directive') {
          doc.selector = doc.directiveOptions.selector;

          for (let decoratorName in decoratorMappings) {
            var propertyName = decoratorMappings[decoratorName];
            doc[propertyName] =
                getDecoratorValues(doc.directiveOptions[propertyName], decoratorName, doc.members);
          }
        }
      });
    }
  };
};

function getDecoratorValues(classDecoratorValues, memberDecoratorName, members) {
  var decoratorValues = {};

  // Parse the class decorator
  _.forEach(classDecoratorValues, function(option) {
    // Options are of the form: "propName : bindingName" (bindingName is optional)
    var optionPair = option.split(':');
    var propertyName = optionPair.shift().trim();
    var bindingName = (optionPair.shift() || '').trim() || propertyName;

    decoratorValues[propertyName] = {propertyName: propertyName, bindingName: bindingName};
  });

  _.forEach(members, function(member) {
    _.forEach(member.decorators, function(decorator) {
      if (decorator.name === memberDecoratorName) {
        decoratorValues[member.name] = {
          propertyName: member.name,
          bindingName: decorator.arguments[0] || member.name
        };
      }
    });
    if (decoratorValues[member.name]) {
      decoratorValues[member.name].memberDoc = member;
    }
  });

  if (Object.keys(decoratorValues).length) {
    return decoratorValues;
  }
}
