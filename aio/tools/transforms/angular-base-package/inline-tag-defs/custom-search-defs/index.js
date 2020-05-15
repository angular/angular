module.exports = {
  name: 'searchKeywords',
  description:
      'A shorthand for creating elements with search terms. Usage: `{@searchKeywords term1 term2 termN }`',
  handler: function(doc, tagName, tagDescription) {
    doc.searchKeywords = tagDescription;
    return '';
  }
};
