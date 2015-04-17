var marked = require('marked');
var Encoder = require('node-html-encoder').Encoder;

// entity type encoder
var encoder = new Encoder('entity');

/**
 * @dgService renderMarkdown
 * @description
 * Render the markdown in the given string as HTML.
 */
module.exports = function renderMarkdown(trimIndentation) {

  var renderer = new marked.Renderer();

  renderer.code = function(code, lang, escaped) {

    var cssClasses = ['prettyprint', 'linenums'];
    var trimmedCode = trimIndentation(code);

    if(lang) {
      if(lang=='html') {
        trimmedCode = encoder.htmlEncode(trimmedCode);
      }
      cssClasses.push(this.options.langPrefix + escape(lang, true));
    }

    return '<pre class="' + cssClasses.join(' ') + '"><code>'
            + trimmedCode
            + '\n</code></pre>\n';
  };

  renderer.heading = function (text, level, raw) {
    var headingText = marked.Renderer.prototype.heading.call(renderer, text, level, raw);
    if (level==2) {
      headingText = '<div class="l-main-section">\n' + headingText + '</div>';
    }
    return headingText;
  };

  return function(content) {
    return marked(content, { renderer: renderer });
  };
};