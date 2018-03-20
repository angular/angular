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
 * signature (e.g. description, whatItDoes and howToUse).
 */

module.exports = function mergeDecoratorDocs(log) {
  return {
    $runAfter: ['processing-docs'],
    $runBefore: ['docs-processed'],
    makeDecoratorCalls: [
      {type: '', description: 'toplevel', functionName: 'makeDecorator'},
      {type: 'Prop', description: 'property', functionName: 'makePropDecorator'},
      {type: 'Param', description: 'parameter', functionName: 'makeParamDecorator'},
    ],
    $process: function(docs) {

      var makeDecoratorCalls = this.makeDecoratorCalls;
      var docsToMerge = Object.create(null);

      docs.forEach(function(doc) {
        const initializer = getInitializer(doc);
        if (initializer) {
          makeDecoratorCalls.forEach(function(call) {
            // find all the decorators, signified by a call to `make...Decorator<Decorator>(metadata)`
            if (initializer.expression && initializer.expression.text === call.functionName) {
              log.debug('mergeDecoratorDocs: found decorator', doc.docType, doc.name);
              doc.docType = 'decorator';
              doc.decoratorLocation = call.description;
              // Get the type of the decorator metadata from the first "type" argument of the call.
              // For example the `X` of `createDecorator<X>(...)`.
              doc.decoratorType = initializer.arguments[0].text;
              // clear the symbol type named since it is not needed
              doc.symbolTypeName = undefined;

              // keep track of the names of the metadata interface that will need to be merged into this decorator doc
              docsToMerge[doc.name + 'Decorator'] = doc;
            }
          });
        }
      });

      // merge the metadata docs into the decorator docs
      docs = docs.filter(function(doc) {
        if (docsToMerge[doc.name]) {
          // We have found an `XxxDecorator` document that will hold the call signature of the decorator
          var decoratorDoc = docsToMerge[doc.name];
          var callMember = doc.members.filter(function(member) { return member.isCallMember; })[0];
          log.debug(
              'mergeDecoratorDocs: merging', doc.name, 'into', decoratorDoc.name,
              callMember.description.substring(0, 50));
          // Merge the documentation found in this call signature into the original decorator
          decoratorDoc.description = callMember.description;
          decoratorDoc.howToUse = callMember.howToUse;
          decoratorDoc.whatItDoes = callMember.whatItDoes;

          // remove doc from its module doc's exports
          doc.moduleDoc.exports =
              doc.moduleDoc.exports.filter(function(exportDoc) { return exportDoc !== doc; });


          // remove from the overall list of docs to be rendered
          return false;
        }
        return true;
      });
    }
  };
};

function getInitializer(doc) {
  var initializer = doc.symbol && doc.symbol.valueDeclaration && doc.symbol.valueDeclaration.initializer;
  // There appear to be two forms of initializer:
  //    export var Injectable: InjectableFactory =
  //    <InjectableFactory>makeDecorator(InjectableMetadata);
  // and
  //    export var RouteConfig: (configs: RouteDefinition[]) => ClassDecorator =
  //    makeDecorator(RouteConfigAnnotation);
  // In the first case, the type assertion `<InjectableFactory>` causes the AST to contain an
  // extra level of expression
  // to hold the new type of the expression.
  if (initializer && initializer.expression && initializer.expression.expression) {
    initializer = initializer.expression;
  }
  return initializer;
}
