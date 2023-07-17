/**
 * Split the description (of selected docs) into:
 * * `shortDescription`: the first paragraph
 * * `description`: the rest of the paragraphs
 */
module.exports = function splitDescription() {
  return {
    $runAfter: ['tags-extracted'],
    $runBefore: ['processing-docs'],
    docTypes: [],
    $process(docs) {
      docs.forEach(doc => {
        if (this.docTypes.indexOf(doc.docType) !== -1 && doc.description !== undefined) {
          const description = doc.description.trim();
          const endOfParagraph = description.search(/\n\s*\n/);
          if (endOfParagraph === -1) {
            doc.shortDescription = description;
            doc.description = '';
          } else {
            doc.shortDescription = description.slice(0, endOfParagraph).trim();
            doc.description = description.slice(endOfParagraph).trim();
          }
        }
      });
    }
  };
};

