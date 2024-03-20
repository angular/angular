/**
 * Render markdown code blocks as `<code-example>` tags
 */
module.exports = function code(h, node) {
  var value = node.value ? ('\n' + node.value + '\n') : '';
  var lang = node.lang && node.lang.match(/^[^ \t]+(?=[ \t]|$)/);
  var props = {};

  if (lang) {
    props.language = lang;
  }

  return h(node, 'code-example', props, [{ type: 'text', value }]);
};
