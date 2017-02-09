module.exports = function() {
  return {
    name: 'cheatsheetSection',
    docProperty: 'docType',
    transforms: function(doc, tag, value) {
      doc.name = value ? value.trim() : '';
      return 'cheatsheet-section';
    }
  };
};
