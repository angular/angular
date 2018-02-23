/**
 * Split the descripton (of selected docs) into:
 * * `shortDescription`: the first paragraph
 * * `description`: the rest of the paragraphs
 */
module.exports = function splitDescription(log, createDocMessage) {
  return {
    $runAfter: ['tags-extracted', 'migrateLegacyJSDocTags'],
    $runBefore: ['processing-docs'],
    docTypes: [],
    $process(docs) {
      docs.forEach(doc => {
        if (this.docTypes.indexOf(doc.docType) !== -1 && doc.description !== undefined) {
          const description = doc.description.trim();
          const endOfParagraph = description.indexOf('\n\n');
          if (endOfParagraph === -1) {
            doc.shortDescription = description;
            doc.description = '';
          } else {
            doc.shortDescription = description.substr(0, endOfParagraph).trim();
            doc.description = description.substr(endOfParagraph).trim();
          }
        }
      });
    }
  };
};

