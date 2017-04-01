module.exports = {
  name: 'a',
  description: 'A shorthand for creating heading anchors. Usage: `{@a some-id}`',
  handler: function(doc, tagName, tagDescription) {
    return '<a id="' + tagDescription.trim() + '"></a>';
  }
};
