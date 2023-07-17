const {mergeProperties} = require('../../helpers/utils');

/**
 * Decorators in the Angular code base are made up from three code items:
 *
 * 1) An interface that represents the call signature of the decorator. E.g.
 *
 *   ```
 *   export interface ComponentDecorator {
 *     (obj: Component): TypeDecorator;
 *     new (obj: Component): Component;
 *   }
 *   ```
 *
 * 2) An interface that represents the members of the object that should be passed
 *   into the decorator. E.g.
 *
 *   ```
 *   export interface Component extends Directive {
 *     changeDetection?: ChangeDetectionStrategy;
 *     viewProviders?: Provider[];
 *     templateUrl?: string;
 *     ...
 *   }
 *   ```
 *
 * 3) A constant that is created by a call to a generic function, whose type parameter is
 *   the call signature interface of the decorator. E.g.
 *
 *   ```
 *   export const Component: ComponentDecorator =
 *     <ComponentDecorator>makeDecorator('Component', { ... }, Directive)
 *   ```
 *
 * This processor searches for these constants (3) by looking for a call to
 * `make...Decorator(...)`. (There are variations to the call for property and param
 * decorators). From this call we identify the `decoratorType` (e.g. `ComponentDecorator`).
 *
 * Calls to `make...Decorator<X>` will return an object of type X. This type is the document
 * referred to in (2). This is the primary doc that we care about for documenting the decorator.
 * It holds all of the members of the metadata that is passed to the decorator call.
 *
 * Finally we want to capture the documentation attached to the call signature interface of the
 * associated decorator (1). We copy across the properties that we care about from this call
 * signature (e.g. `description` and `usageNotes`).
 */

module.exports = function mergeDecoratorDocs(log) {
  return {
    $runAfter: ['processing-docs'],
    $runBefore: ['docs-processed', 'checkContentRules'],
    propertiesToMerge: [],
    makeDecoratorCalls: [
      {type: '', description: 'toplevel', functionName: 'makeDecorator'},
      {type: 'Prop', description: 'property', functionName: 'makePropDecorator'},
      {type: 'Param', description: 'parameter', functionName: 'makeParamDecorator'},
    ],
    $process(docs) {
      const decoratorDocs = Object.create(null);

      // find all the decorators, signified by a call to `make...Decorator<Decorator>(metadata)`
      docs.forEach(doc => {
        const initializer = getInitializer(doc);
        if (initializer) {
          this.makeDecoratorCalls.forEach(function(call) {
            if (initializer.expression && initializer.expression.text === call.functionName) {
              // Get the type of the decorator metadata from the first "type" argument of the call.
              // For example the `X` of `createDecorator<X>(...)`.
              const decoratorType = initializer.arguments[0].text;

              log.debug(
                  'mergeDecoratorDocs: found decorator', doc.docType, doc.name, decoratorType);

              doc.docType = 'decorator';
              doc.decoratorLocation = call.description;
              doc.decoratorType = decoratorType;

              decoratorDocs[doc.name + 'Decorator'] = doc;
            }
          });
        }
      });

      // merge the info from the associated metadata interfaces into the decorator docs
      docs = docs.filter(doc => {
        if (decoratorDocs[doc.name]) {
          // We have found an `XxxDecorator` document that will hold the call signature of the
          // decorator
          var decoratorDoc = decoratorDocs[doc.name];
          var callMember = doc.members.find(member => member.isCallMember);

          log.debug(
              'mergeDecoratorDocs: merging', doc.name, 'into', decoratorDoc.name,
              callMember.description.substring(0, 50));

          // Merge the documentation found in this call signature into the original decorator
          mergeProperties(decoratorDoc, callMember, this.propertiesToMerge);

          // remove doc from its module doc's exports
          doc.moduleDoc.exports = doc.moduleDoc.exports.filter(exportDoc => exportDoc !== doc);
        }

        return !decoratorDocs[doc.name];
      });

      return docs;
    }
  };
};

function getInitializer(doc) {
  const declaration = doc.symbol && doc.symbol.valueDeclaration;
  if (!declaration || !declaration.initializer || !declaration.initializer.expression) {
    return;
  }

  let initializer = declaration.initializer;

  // There appear to be two forms of initializer:
  //
  // ```
  // export const Injectable: InjectableFactory =
  //       <InjectableFactory>makeDecorator(InjectableMetadata);
  // ```
  //
  // and
  //
  // ```
  // export const RouteConfig: (configs: RouteDefinition[]) => ClassDecorator =
  //       makeDecorator(RouteConfigAnnotation);
  // ```
  //
  // In the first case, the type assertion `<InjectableFactory>` causes the AST to contain an extra
  // level of expression to hold the new type of the expression.
  if (initializer.type && initializer.expression.expression) {
    initializer = initializer.expression;
  }

  // It is also possible that the decorator call is wrapped in a call to `attachInjectFlag()`:
  //
  // ```
  // const Optional: OptionalDecorator =
  //       attachInjectFlag(makeParamDecorator('Optional'), InternalInjectFlags.Optional);
  // ```
  //
  // If so, use the first argument of the call.
  if (initializer.arguments && initializer.expression.text === 'attachInjectFlag') {
    initializer = initializer.arguments[0];
  }

  return initializer;
}
