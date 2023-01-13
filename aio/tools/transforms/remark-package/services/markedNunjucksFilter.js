/**
 * Convert the value, as markdown, into HTML
 * @param headingMappings A map of headings to convert (e.g. from h3 to h4).
 */
module.exports = function markedNunjucksFilter(renderMarkdown) {
  return {
    name: 'marked',
    process: function(str, headingMappings) {
      return str && renderMarkdown(str, headingMappings);
    }
  };
};