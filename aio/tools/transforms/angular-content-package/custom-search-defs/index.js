module.exports = {
    name: 'searchKeywords',
    description: 'A shorthand for creating elements with search terms. Usage: `{@searchKeywords "phrase one" "phrase two" term3 }`',
    handler: function(doc, tagName, tagDescription) {
      doc.searchKeywords = tagDescription;
      return doc;
    }
  };
  