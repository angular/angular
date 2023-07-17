/**
 * @dgProcessor processPseudoClasses
 * @description
 * If an API element is declared both as a `const` and an `interface` then these are both merged
 * into a single `interface` document.
 *
 * We can identify such cases because the interface doc has one or more items in the
 * `additionalDeclarations` property.
 *
 * This processor will convert such interface docs to class docs and ensure that the content and
 * members are fixed up appropriately.
 *
 * Such pseudo classes should have overloaded members rendered similar to interfaces (i.e. all
 * overloads are rendered whereas in classes the "implementation overload" is not rendered) we
 * also mark the doc with the `isPseudoClass` property to be used in templates when rendering.
 */
module.exports = function processPseudoClasses(tsHost) {
  return {
    $runAfter: ['readTypeScriptModules'],
    $runBefore: ['parsing-tags'],
    $process(docs) {
      docs.forEach(doc => {
        if (doc.docType === 'interface' && doc.additionalDeclarations?.length > 0) {
          doc.docType = 'class';
          doc.isPseudoClass = true;
          const additionalContent = tsHost.getContent(doc.additionalDeclarations[0]);
          if (!doc.content || doc.content === '@publicApi' && additionalContent) {
            doc.content = additionalContent;
          }
          doc.members = doc.members && doc.members.filter(m => {
            if (m.isNewMember) {
              doc.constructorDoc = m;
              doc.constructorDoc.name = 'constructor';
              return false;
            } else {
              return true;
            }
          });
        }
      });
    }
  };
};
