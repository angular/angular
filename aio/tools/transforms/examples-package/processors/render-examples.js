const { parseAttributes, renderAttributes } = require('../../helpers/utils');

/**
 * Search the renderedContent looking for code examples that have a path (and optionally a region) attribute.
 * When they are found replace their content with the appropriate doc-region parsed previously from an example file.
 */
module.exports = function renderExamples(getExampleRegion, log, createDocMessage) {
  return {
    $runAfter: ['docs-rendered'],
    $runBefore: ['writing-files'],
    ignoreBrokenExamples: false,
    $process: function(docs) {
      const titleVsHeaderErrors = [];

      docs.forEach(doc => {
        if (doc.renderedContent) {
          // We match either `code-example` or `code-pane` elements that have a path attribute
          doc.renderedContent = doc.renderedContent.replace(
            /<(code-example|code-pane)([^>]*)>[^<]*<\/([^>]+)>/g,
            (original, openingTag, attributes, closingTag) => {
              const attrMap = parseAttributes(attributes);

              if (attrMap.hasOwnProperty('title')) {
                titleVsHeaderErrors.push(createDocMessage(
                  `Using the "title" attribute for specifying a ${openingTag} header is no longer supported. ` +
                  `Use the "header" attribute instead.\n<${openingTag}${attributes}>`, doc));
                return;
              }

              if (attrMap.path) {
                try {
                  if (closingTag !== openingTag) {
                    // The markdown renderer will wrap what it thinks is a paragraph in `<p>` and `</p>` tags.
                    // If you do not leave a blank line between a paragraph of text and a `<code-example>` then
                    // the markdown renderer may add a paragraph marker "in-between" the opening and closing
                    // tags of the code-example. For example:
                    //
                    // ```
                    // Some paragraph
                    // <code-example path="...">
                    //
                    // </code-example>
                    // ```
                    //
                    // will be rendered as:
                    //
                    // ```
                    // <p>Some paragraph
                    // <code-example path="...">
                    // </p>
                    // </code-example>
                    // ```
                    throw new Error(
                      'Badly formed example: ' + original + ' - closing tag does not match opening tag.\n' +
                      ' - Perhaps you forgot to put a blank line before the example?');
                  }
                  // We found a path attribute so look up the example and rebuild the HTML
                  const exampleContent = getExampleRegion(doc, attrMap.path, attrMap.region);
                  return `<${openingTag}${renderAttributes(attrMap)}>\n${exampleContent}\n</${openingTag}>`;
                } catch(e) {
                  log.warn(createDocMessage(e.message, doc));
                  if (!this.ignoreBrokenExamples) {
                    throw e;
                  }
                }
              }
              // No path attribute so just ignore this one
              return original;
            });
        }
      });

      if (titleVsHeaderErrors.length) {
        titleVsHeaderErrors.forEach(err => log.error(err));
        throw new Error('Some code snippets use the `title` attribute instead of `header`.');
      }
    }
  };
};
