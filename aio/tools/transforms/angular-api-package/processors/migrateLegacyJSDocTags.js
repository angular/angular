module.exports = function migrateLegacyJSDocTags(log, createDocMessage) {
  return {
    $runAfter: ['tags-extracted'],
    $runBefore: ['processing-docs'],
    $process(docs) {
      let migrated = false;
      docs.forEach(doc => {
        if (doc.howToUse) {
          if (doc.usageNotes) {
            throw new Error(createDocMessage('`@usageNotes` and the deprecated `@howToUse` are not allowed on the same doc', doc));
          }
          log.debug(createDocMessage('Using deprecated `@howToUse` tag as though it was `@usageNotes` tag', doc));
          doc.usageNotes = doc.howToUse;
          doc.howToUse = null;
          migrated = true;
        }

        if (doc.whatItDoes) {
          log.debug(createDocMessage('Merging the content of `@whatItDoes` tag into the description.', doc));
          if (doc.description) {
            doc.description = `${doc.whatItDoes}\n\n${doc.description}`;
          } else {
            doc.description = doc.whatItDoes;
          }
          doc.whatItDoes = null;
          migrated = true;
        }
      });

      if (migrated) {
        log.warn('Some deprecated tags were migrated.');
        log.warn('This automatic handling will be removed in a future version of the doc generation.\n');
      }
    }
  };
};
