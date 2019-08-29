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
          doc.selectorArray = doc.selector ? doc.selector.split(',') : [];
          doc.exportAs = stripQuotes(doc.directiveOptions.exportAs);
          doc.exportAsArray = doc.exportAs ? doc.exportAs.split(',') : [];

          attachBindingInfo(doc.directiveOptions.inputs, doc.members, 'Input');
          attachBindingInfo(doc.directiveOptions.outputs, doc.members, 'Output');
        }
      });
    }
  };
};

function attachBindingInfo(directiveBindings, members, bindingType) {
  const bindings = {};

  if (members) {
    // Parse the bindings from the directive decorator
    if (directiveBindings) {
      directiveBindings.forEach(function(binding) {
        const bindingInfo = parseBinding(bindingType, binding);
        bindings[bindingInfo.propertyName] = bindingInfo;
      });
    }

    members.forEach(function(member) {
      if (member.decorators) {
        // Search for members with binding decorators
        member.decorators.forEach(function(decorator) {
          if (decorator.name === bindingType) {
            bindings[member.name] = createBindingInfo(bindingType, member.name, decorator.arguments[0] || member.name);
          }
        });
      }
      // Attach binding info to the member
      // Note: this may have come from the `@Directive` decorator or from a property decorator such as `@Input`.
      if (bindings[member.name]) {
        member.boundTo = bindings[member.name];
      }
    });
  }
}

function stripQuotes(value) {
  return (typeof(value) === 'string') ? value.trim().replace(/^(['"])(.*)\1$/, '$2') : value;
}

function parseBinding(bindingType, option) {
  // Directive decorator bindings are of the form: "propName : bindingName" (bindingName is optional)
  const optionPair = option.split(':');
  const propertyName = optionPair[0].trim();
  const bindingName = (optionPair[1] || '').trim() || propertyName;
  return createBindingInfo(bindingType, propertyName, bindingName);
}

function createBindingInfo(bindingType, propertyName, bindingName) {
  return {
    type: bindingType,
    propertyName: stripQuotes(propertyName),
    bindingName: stripQuotes(bindingName)
  };
}