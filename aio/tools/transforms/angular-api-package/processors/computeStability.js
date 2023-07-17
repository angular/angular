module.exports = function computeStability(log, createDocMessage) {
  return {
    docTypes: [],
    $runAfter: ['tags-extracted'],
    $runBefore: ['rendering-docs'],
    $process(docs) {
      docs.forEach(doc => {
        if (this.docTypes.indexOf(doc.docType) !== -1 &&
            doc.experimental === undefined &&
            doc.deprecated === undefined &&
            doc.stable === undefined) {
          log.debug(createDocMessage('Adding stable property', doc));
          doc.stable = true;
        }
      });
    }
  };
};
