/**
 * Copies over the properties from a doc's alias if it is marked with `@alias`.
 */
module.exports = function processAliasDocs(getDocFromAlias, log, createDocMessage) {
  return {
    $runAfter: ['tags-extracted', 'ids-computed'],
    $runBefore: ['filterPrivateDocs'],
    propertiesToKeep: [
      'name', 'id', 'aliases', 'fileInfo', 'startingLine', 'endingLine',
      'path', 'originalModule', 'outputPath', 'privateExport', 'moduleDoc'
    ],
    $process(docs) {
      docs.forEach(doc => {
        if (doc.aliasDocId) {
          const aliasDocs = getDocFromAlias(doc.aliasDocId, doc);
          if (aliasDocs.length === 1) {
            const aliasDoc = aliasDocs[0];
            log.debug('processing alias', doc.id, doc.aliasDocId, aliasDoc.id);
            // Clean out the unwanted properties from the doc
            Object.keys(doc).forEach(key => {
              if (!this.propertiesToKeep.includes(key)) {
                delete doc[key];
              }
            });
            // Copy over all the properties of the alias doc.
            Object.keys(aliasDoc).forEach(key => {
              if (!this.propertiesToKeep.includes(key)) {
                doc[key] = aliasDoc[key];
              }
            });
          } else if (aliasDocs.length === 0) {
            throw new Error(createDocMessage(`There is no doc that matches "@alias ${doc.aliasDocId}"`, doc));
          } else {
            throw new Error(createDocMessage(`There is more than one doc that matches "@alias ${doc.aliasDocId}": ${aliasDocs.map(d => d.id).join(', ')}.`, doc));
          }
        }
      });
    }
  };
};