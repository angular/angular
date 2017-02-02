var rho = require('rho');

/**
 * @dgService renderMarkdown
 * @description
 * Render the markdown in the given string as HTML.
 */
module.exports = function renderMarkdown() {


  // TODO(petebd): We might want to remove the leading whitespace from the code
  // block before it gets to the markdown code render function

  // We need to teach Rho about inline tags so that it doesn't try to process
  // the inside of the tag
  const emitNormal = rho.InlineCompiler.prototype.emitNormal;
  rho.InlineCompiler.prototype.emitNormal = function(walk) {
    if (this.emitText(walk)) return;
    if (tryDgeniInlineTag(this, walk)) return;
    emitNormal.call(this, walk);
  };

  rho.BlockCompiler.prototype.emitBlock = function(walk) {
    walk.skipBlankLines();
    this.countBlockIndent(walk);
    if (this.tryUnorderedList(walk)) return;
    if (this.tryOrderedList(walk)) return;
    if (this.tryDefinitionList(walk)) return;
    if (this.tryHeading(walk)) return;
    if (this.tryCodeBlock(walk)) return;
    if (this.tryDiv(walk)) return;
    if (this.tryHtml(walk)) return;
    if (tryDgeniInlineTag(this, walk, true)) return;
    if (this.tryHrTable(walk)) return;
    this.emitParagraph(walk);
  };

  function tryDgeniInlineTag(compiler, walk, isBlock) {
    if (!walk.at('{@')) return false;

    const startIdx = walk.position;
    var endIdx = walk.indexOf('}');

    if (endIdx === null) return false;

    if (isBlock) compiler.out.push('<div>');
    compiler.out.push(walk.substring(startIdx, endIdx + 1));
    if (isBlock) compiler.out.push('</div>');

    walk.startFrom(endIdx + 2);
    return true;
  };

  return function renderMarkdownImpl(content) { return rho.toHtml(content, true); };
};