/**
 * @dgProcessor
 * @description
 * Directives in Angular are specified by various decorators. In particular the `@Directive()`
 * decorator on the class and various other property decorators, such as `@Input`.
 *
 * This processor will extract this decorator information and attach it as properties to the
 * directive document.
 *
 * Notably, the `input` and `output` binding information can be specified
 * either via property decorators (`@Input()`/`@Output()`) or by properties on the metadata
 * passed to the `@Directive` decorator. This processor will collect up info from both and
 * merge them.
 */
module.exports = function matchUpDirectiveDecorators() {
  return {
    $runAfter: ['ids-computed', 'paths-computed'],
    $runBefore: ['rendering-docs'],
    $process: function(docs) {
      docs.forEach(function(doc) {
        if (doc.docType === 'directive') {

          doc.selector = stripQuotes(doc.directiveOptions.selector);
          doc.exportAs = stripQuotes(doc.directiveOptions.exportAs);

          doc.inputs = getBindingInfo(doc.directiveOptions.inputs, doc.members, 'Input');
          doc.outputs = getBindingInfo(doc.directiveOptions.outputs, doc.members, 'Output');
        }
      });
    }
  };
};

function getBindingInfo(directiveBindings, members, bindingType) {
  const bindings = {};

  // Parse the bindings from the directive decorator
  if (directiveBindings) {
    directiveBindings.forEach(function(binding) {
      const bindingInfo = parseBinding(binding);
      bindings[bindingInfo.propertyName] = bindingInfo;
    });
  }

  if (members) {
    members.forEach(function(member) {
      if (member.decorators) {
        // Search for members with binding decorators
        member.decorators.forEach(function(decorator) {
          if (decorator.name === bindingType) {
            bindings[member.name] = createBindingInfo(member.name, decorator.arguments[0] || member.name);
          }
        });
      }

      // Now ensure that any bindings have the associated member attached
      // Note that this binding could have come from the directive decorator
      if (bindings[member.name]) {
        bindings[member.name].memberDoc = member;
      }
    });
  }

  // Convert the map back to an array
  return Object.keys(bindings).map(function(key) { return bindings[key]; });
}

function stripQuotes(value) {
  return (typeof(value) === 'string') ? value.trim().replace(/^(['"])(.*)\1$/, '$2') : value;
}

function parseBinding(option) {
  // Directive decorator bindings are of the form: "propName : bindingName" (bindingName is optional)
  const optionPair = option.split(':');
  const propertyName = optionPair[0].trim();
  const bindingName = (optionPair[1] || '').trim() || propertyName;
  return createBindingInfo(propertyName, bindingName);
}

function createBindingInfo(propertyName, bindingName) {
  return {
    propertyName: stripQuotes(propertyName),
    bindingName: stripQuotes(bindingName)
  };
}