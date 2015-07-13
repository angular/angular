var marked = require('marked');
var Encoder = require('node-html-encoder').Encoder;
var html2jade = require('html2jade');
var indentString = require('indent-string');


function stripTags(s) { //from sugar.js
  return s.replace(RegExp('<\/?[^<>]*>', 'gi'), '');
}

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

    return 'pre(class="' + cssClasses.join(' ') + '")\n' + indentString('code.\n', ' ', 2) + trimmedCode;
  };

  renderer.heading = function (text, level, raw) {
    var headingText = marked.Renderer.prototype.heading.call(renderer, text, level, raw);
    var title = 'h2 ' + stripTags(headingText);

    if (level==2) {
      title = '.l-main-section\n' + indentString(title, ' ', 2) ;
    }

    return title;
  };

  return function(content) {
    return marked(content, { renderer: renderer });
  };
};