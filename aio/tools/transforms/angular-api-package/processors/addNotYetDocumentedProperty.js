module.exports = function addNotYetDocumentedProperty(log, createDocMessage) {
  return {
    docTypes: [],
    $runAfter: ['tags-extracted'],
    $runBefore: ['processing-docs', 'splitDescription'],
    $process(docs) {
      docs.forEach(doc => {
        if (
          this.docTypes.indexOf(doc.docType) !== -1 &&
          !doc.noDescription &&
          (!doc.description || doc.description.trim().length === 0)
        ) {
          doc.notYetDocumented = true;
          log.debug(createDocMessage('Not yet documented', doc));
        }
      });
    }
  };
};
