const showdown = require('showdown');
const inlineTagExt = require('./inlineTagExtension');
const customTagsExt = require('./customTagsExtension');

/**
 * @dgService renderMarkdown
 * @description
 * Render the markdown in the given string as HTML.
 */
module.exports = function renderMarkdown() {

  return function renderMarkdownImpl(content) {
    showdown.extension('inlineTag', inlineTagExt);
    showdown.extension('customTags', customTagsExt);
    const converter = new showdown.Converter({
      noHeaderId: true,
      extensions: ['inlineTag', 'customTags']
    });
    return converter.makeHtml(content);
  };
};
