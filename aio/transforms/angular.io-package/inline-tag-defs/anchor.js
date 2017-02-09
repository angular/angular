module.exports = {
  name: 'a',
  description: 'A shorthand for creating heading anchors. Usage: `{@a some-id}`',
  handler: function(doc, tagName, tagDescription, docs) {
    return '<a id="' + tagDescription.trim() + '"></a>';
  }
};
