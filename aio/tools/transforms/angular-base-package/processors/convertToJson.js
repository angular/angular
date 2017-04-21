module.exports = function convertToJsonProcessor(log, createDocMessage) {

  return {
    $runAfter: ['checkUnbalancedBackTicks'],
    $runBefore: ['writeFilesProcessor'],
    docTypes: [],
    $process: function(docs) {
      const docTypes = this.docTypes;
      docs.forEach((doc) => {
        if (docTypes.indexOf(doc.docType) !== -1) {
          let contents = doc.renderedContent || '';

          let title = doc.title;

          // We do allow an empty `title` but resort to `name` if it is not even defined
          if (title === undefined) {
            title = doc.name;
          }

          // If there is no title then try to extract it from the first h1 in the renderedContent
          if (title === undefined) {
            const match = /<h1[^>]*>(.+?)<\/h1>/.exec(contents);
            if (match) {
              title = match[1];
            }
          }

          // If there is still no title then log a warning
          if (title === undefined) {
            title = '';
            log.warn(createDocMessage('Title property expected', doc));
          }

          doc.renderedContent = JSON.stringify({ id: doc.path, title, contents }, null, 2);
        }
      });
    }
  };

};
