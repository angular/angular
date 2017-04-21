module.exports = function mergeDecoratorDocs(log) {
  return {
    $runAfter: ['processing-docs'],
    $runBefore: ['docs-processed'],
    makeDecoratorCalls: [
      {type: '', description: 'toplevel'},
      {type: 'Prop', description: 'property'},
      {type: 'Param', description: 'parameter'},
    ],
    $process: function(docs) {

      var makeDecoratorCalls = this.makeDecoratorCalls;
      var docsToMerge = Object.create(null);

      docs.forEach(function(doc) {

        makeDecoratorCalls.forEach(function(call) {
          // find all the decorators, signified by a call to `makeDecorator(metadata)`
          var makeDecorator = getMakeDecoratorCall(doc, call.type);
          if (makeDecorator) {
            log.debug('mergeDecoratorDocs: found decorator', doc.docType, doc.name);
            doc.docType = 'decorator';
            doc.decoratorLocation = call.description;
            // get the type of the decorator metadata
            doc.decoratorType = makeDecorator.arguments[0].text;
            // clear the symbol type named (e.g. ComponentMetadataFactory) since it is not needed
            doc.symbolTypeName = undefined;

            // keep track of the names of the docs that need to be merged into this decorator doc
            docsToMerge[doc.name + 'Decorator'] = doc;
          }
        });
      });

      // merge the metadata docs into the decorator docs
      docs = docs.filter(function(doc) {
        if (docsToMerge[doc.name]) {
          var decoratorDoc = docsToMerge[doc.name];
          log.debug(
              'mergeDecoratorDocs: merging', doc.name, 'into', decoratorDoc.name,
              doc.callMember.description.substring(0, 50));
          decoratorDoc.description = doc.callMember.description;

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

function getMakeDecoratorCall(doc, type) {
  var makeDecoratorFnName = 'make' + (type || '') + 'Decorator';

  var initializer = doc.exportSymbol && doc.exportSymbol.valueDeclaration &&
      doc.exportSymbol.valueDeclaration.initializer;

  if (initializer) {
    // There appear to be two forms of initializer:
    //    export var Injectable: InjectableFactory =
    //    <InjectableFactory>makeDecorator(InjectableMetadata);
    // and
    //    export var RouteConfig: (configs: RouteDefinition[]) => ClassDecorator =
    //    makeDecorator(RouteConfigAnnotation);
    // In the first case, the type assertion `<InjectableFactory>` causes the AST to contain an
    // extra level of expression
    // to hold the new type of the expression.
    if (initializer.expression && initializer.expression.expression) {
      initializer = initializer.expression;
    }
    if (initializer.expression && initializer.expression.text === makeDecoratorFnName) {
      return initializer;
    }
  }
}
