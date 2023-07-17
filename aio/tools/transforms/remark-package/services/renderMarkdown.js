const remark = require('remark');
const html = require('remark-html');
const code = require('./handlers/code');
const mapHeadings = require('./plugins/mapHeadings');

/**
 * @dgService renderMarkdown
 * @description
 * Render the markdown in the given string as HTML.
 * @param headingMap A map of headings to convert.
 *                   E.g. `{h3: 'h4'} will map heading 3 level into heading 4.
 */
module.exports = function renderMarkdown() {
  return function renderMarkdownImpl(content, headingMap) {

    const renderer = remark()
      .use(inlineTagDefs)
      .use(noIndentedCodeBlocks)
      .use(plainHTMLBlocks)
      // USEFUL DEBUGGING CODE
      // .use(() => tree => {
      //   console.log(require('util').inspect(tree, { colors: true, depth: 4 }));
      // })
      .use(mapHeadings(headingMap))
      .use(html, { handlers: { code }, sanitize: false });

    return renderer.processSync(content).toString();
  };

  /**
   * Teach remark not to render indented codeblocks
   */
  function noIndentedCodeBlocks() {
    const blockMethods = this.Parser.prototype.blockMethods;
    blockMethods.splice(blockMethods.indexOf('indentedCode'), 1);
  }


  /**
   * Teach remark about inline tags, so that it neither wraps block level
   * tags in paragraphs nor processes the text within the tag.
   */
  function inlineTagDefs() {
    const Parser = this.Parser;
    const inlineTokenizers = Parser.prototype.inlineTokenizers;
    const inlineMethods = Parser.prototype.inlineMethods;
    const blockTokenizers = Parser.prototype.blockTokenizers;
    const blockMethods = Parser.prototype.blockMethods;

    blockTokenizers.inlineTag = tokenizeInlineTag;
    blockMethods.splice(blockMethods.indexOf('paragraph'), 0, 'inlineTag');

    inlineTokenizers.inlineTag = tokenizeInlineTag;
    inlineMethods.splice(blockMethods.indexOf('text'), 0, 'inlineTag');
    tokenizeInlineTag.notInLink = true;
    tokenizeInlineTag.locator = inlineTagLocator;

    function tokenizeInlineTag(eat, value, silent) {
      const match = /^\{@[^\s}]+[^}]*\}/.exec(value);

      if (match) {
        if (silent) {
          return true;
        }
        return eat(match[0])({
          'type': 'inlineTag',
          'value': match[0]
        });
      }
    }

    function inlineTagLocator(value, fromIndex) {
      return value.indexOf('{@', fromIndex);
    }
  }

  /**
   * Teach remark that some HTML blocks never include markdown
   */
  function plainHTMLBlocks() {

    const plainBlocks = ['code-example', 'code-tabs'];

    // Create matchers for each block
    const anyBlockMatcher = new RegExp('^' + createOpenMatcher(`(${plainBlocks.join('|')})`));

    const Parser = this.Parser;
    const blockTokenizers = Parser.prototype.blockTokenizers;
    const blockMethods = Parser.prototype.blockMethods;

    blockTokenizers.plainHTMLBlocks = tokenizePlainHTMLBlocks;
    blockMethods.splice(blockMethods.indexOf('html'), 0, 'plainHTMLBlocks');

    function tokenizePlainHTMLBlocks(eat, value, silent) {
      const openMatch = anyBlockMatcher.exec(value);
      if (openMatch) {
        const blockName = openMatch[1];
        try {
          const fullMatch = matchRecursiveRegExp(value, createOpenMatcher(blockName), createCloseMatcher(blockName))[0];
          if (silent || !fullMatch) {
            // either we are not eating (silent) or the match failed
            return !!fullMatch;
          }
          return eat(fullMatch[0])({
            type: 'html',
            value: fullMatch[0]
          });
        } catch(e) {
          this.file.fail('Unmatched plain HTML block tag ' + e.message);
        }
      }
    }
  }
};

/**
 * matchRecursiveRegExp
 *
 * (c) 2007 Steven Levithan <stevenlevithan.com>
 * MIT License
 *
 * Accepts a string to search, a left and right format delimiter
 * as regex patterns, and optional regex flags. Returns an array
 * of matches, allowing nested instances of left/right delimiters.
 * Use the "g" flag to return all matches, otherwise only the
 * first is returned. Be careful to ensure that the left and
 * right format delimiters produce mutually exclusive matches.
 * Backreferences are not supported within the right delimiter
 * due to how it is internally combined with the left delimiter.
 * When matching strings whose format delimiters are unbalanced
 * to the left or right, the output is intentionally as a
 * conventional regex library with recursion support would
 * produce, e.g. "<<x>" and "<x>>" both produce ["x"] when using
 * "<" and ">" as the delimiters (both strings contain a single,
 * balanced instance of "<x>").
 *
 * examples:
 * matchRecursiveRegExp("test", "\\(", "\\)")
 * returns: []
 * matchRecursiveRegExp("<t<<e>><s>>t<>", "<", ">", "g")
 * returns: ["t<<e>><s>", ""]
 * matchRecursiveRegExp("<div id=\"x\">test</div>", "<div\\b[^>]*>", "</div>", "gi")
 * returns: ["test"]
 */
function matchRecursiveRegExp(str, left, right, flags) {
  'use strict';

  const matchPos = rgxFindMatchPos(str, left, right, flags);
  const results = [];

  for (var i = 0; i < matchPos.length; ++i) {
    results.push([
      str.slice(matchPos[i].wholeMatch.start, matchPos[i].wholeMatch.end),
      str.slice(matchPos[i].match.start, matchPos[i].match.end),
      str.slice(matchPos[i].left.start, matchPos[i].left.end),
      str.slice(matchPos[i].right.start, matchPos[i].right.end)
    ]);
  }
  return results;
}

function rgxFindMatchPos(str, left, right, flags) {
  'use strict';
  flags = flags || '';
  const global = flags.indexOf('g') > -1;
  const bothMatcher = new RegExp(left + '|' + right, 'g' + flags.replace(/g/g, ''));
  const leftMatcher = new RegExp(left, flags.replace(/g/g, ''));
  const pos = [];
  let index, match, start, end;
  let count = 0;

  while ((match = bothMatcher.exec(str))) {
    if (leftMatcher.test(match[0])) {
      if (!(count++)) {
        index = bothMatcher.lastIndex;
        start = index - match[0].length;
      }
    } else if (count) {
      if (!--count) {
        end = match.index + match[0].length;
        var obj = {
          left: {start: start, end: index},
          match: {start: index, end: match.index},
          right: {start: match.index, end: end},
          wholeMatch: {start: start, end: end}
        };
        pos.push(obj);
        if (!global) {
          return pos;
        }
      }
    }
  }

  if (count) {
    throw new Error(str.slice(start, index));
  }

  return pos;
}

function createOpenMatcher(elementNameMatcher) {
  const attributeName = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
  const unquoted = '[^"\'=<>`\\u0000-\\u0020]+';
  const singleQuoted = '\'[^\']*\'';
  const doubleQuoted = '"[^"]*"';
  const attributeValue = '(?:' + unquoted + '|' + singleQuoted + '|' + doubleQuoted + ')';
  const attribute = '(?:\\s+' + attributeName + '(?:\\s*=\\s*' + attributeValue + ')?)';
  return `<${elementNameMatcher}${attribute}*\\s*>`;
}

function createCloseMatcher(elementNameMatcher) {
  return `</${elementNameMatcher}>`;
}
