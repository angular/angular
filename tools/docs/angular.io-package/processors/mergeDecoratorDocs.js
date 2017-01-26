var _ = require('lodash');

module.exports = function mergeDecoratorDocs() {
  return {
    $runAfter: ['processing-docs'],
    $runBefore: ['docs-processed'],
    docsToMergeInfo: [
      {nameTemplate: _.template('${name}Decorator'), decoratorProperty: 'decoratorInterfaceDoc'}, {
        nameTemplate: _.template('${name}Metadata'),
        decoratorProperty: 'metadataDoc',
        useFields: ['howToUse', 'whatItDoes']
      },
      {nameTemplate: _.template('${name}MetadataType'), decoratorProperty: 'metadataInterfaceDoc'},
      {
        nameTemplate: _.template('${name}MetadataFactory'),
        decoratorProperty: 'metadataFactoryDoc'
      }
    ],
    $process: function(docs) {

      var docsToMergeInfo = this.docsToMergeInfo;
      var docsToMerge = Object.create(null);

      docs.forEach(function(doc) {

        // find all the decorators, signified by a call to `makeDecorator(metadata)`
        var makeDecorator = getMakeDecoratorCall(doc);
        if (makeDecorator) {
          doc.docType = 'decorator';
          // get the type of the decorator metadata
          doc.decoratorType = makeDecorator.arguments[0].text;
          // clear the symbol type named (e.g. ComponentMetadataFactory) since it is not needed
          doc.symbolTypeName = undefined;

          // keep track of the docs that need to be merged into this decorator doc
          docsToMergeInfo.forEach(function(info) {
            docsToMerge[info.nameTemplate({name: doc.name})] = {
              decoratorDoc: doc,
              property: info.decoratorProperty
            };
          });
        }
      });

      // merge the metadata docs into the decorator docs
      docs = docs.filter(function(doc) {
        if (docsToMerge[doc.name]) {
          var decoratorDoc = docsToMerge[doc.name].decoratorDoc;
          var property = docsToMerge[doc.name].property;
          var useFields = docsToMerge[doc.name].useFields;

          // attach this document to its decorator
          decoratorDoc[property] = doc;

          // Copy over fields from the merged doc if specified
          if (useFields) {
            useFields.forEach(function(field) { decoratorDoc[field] = doc[field]; });
          }

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