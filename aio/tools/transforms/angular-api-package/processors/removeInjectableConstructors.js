module.exports = function removeInjectableConstructors() {
  return {
    $runAfter: ['processing-docs', 'splitDescription'],
    $runBefore: ['docs-processed'],
    injectableDecorators: ['Injectable', 'Directive', 'Component', 'Pipe', 'NgModule'],
    $process(docs) {
      docs.forEach(doc => {
        if (
          doc.constructorDoc &&
          !doc.constructorDoc.shortDescription &&
          doc.decorators &&
          doc.decorators.some(decorator => this.injectableDecorators.indexOf(decorator.name) !== -1)) {
          delete doc.constructorDoc;
        }
      });
    }
  };
};
