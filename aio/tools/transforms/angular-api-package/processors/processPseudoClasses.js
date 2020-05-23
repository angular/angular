module.exports = function processPseudoClasses(tsHost) {
  return {
    $runAfter: ['readTypeScriptModules'],
    $runBefore: ['parsing-tags'],
    $process(docs) {
      docs.forEach(doc => {
        if (doc.docType === 'interface' && doc.additionalDeclarations &&
            doc.additionalDeclarations.length > 0) {
          doc.docType = 'class';
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
