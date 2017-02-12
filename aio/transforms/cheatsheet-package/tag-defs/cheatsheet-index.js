module.exports = function(createDocMessage) {
  return {
    name: 'cheatsheetIndex',
    docProperty: 'index',
    transforms: function(doc, tag, value) {
      try {
        return parseInt(value, 10);
      } catch (x) {
        throw new Error(
            createDocMessage('"@' + tag.tagName + '" must be followed by a number', doc));
      }
    }
  };
};