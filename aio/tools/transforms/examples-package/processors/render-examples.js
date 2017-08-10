const { parseAttributes, renderAttributes } = require('../../helpers/utils');

/**
 * Search the renderedContent looking for code examples that have a path (and optionally a region) attribute.
 * When they are found replace their content with the appropriate doc-region parsed previously from an example file.
 */
module.exports = function renderExamples(getExampleRegion) {
  return {
    $runAfter: ['docs-rendered'],
    $runBefore: ['writing-files'],
    $process: function(docs) {
      docs.forEach(doc => {
        if (doc.renderedContent) {
          // We match either `code-example` or `code-pane` elements that have a path attribute
          doc.renderedContent = doc.renderedContent.replace(/<(code-example|code-pane)([^>]*)>[^<]*<\/\1>/g, (original, element, attributes) => {
            const attrMap = parseAttributes(attributes);
            if (attrMap.path) {
              // We found a path attribute so look up the example and rebuild the HTML
              const exampleContent = getExampleRegion(doc, attrMap.path, attrMap.region);
              return `<${element}${renderAttributes(attrMap)}>\n${exampleContent}\n</${element}>`;
            }
            // No path attribute so just ignore this one
            return original;
          });
        }
      });
    }
  };
};

