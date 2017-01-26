module.exports = function(createDocMessage, cheatsheetItemParser) {
  return {
    name: 'cheatsheetItem',
    multi: true,
    docProperty: 'items',
    transforms: function(doc, tag, value) {
      try {
        return cheatsheetItemParser(value);
      } catch (x) {
        throw new Error(createDocMessage(
            '"@' + tag.tagName + '" tag has an invalid format - ' + x.message, doc));
      }
    }
  };
};