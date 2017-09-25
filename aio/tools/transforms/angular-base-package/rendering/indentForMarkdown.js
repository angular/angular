module.exports = function() {
  // var MIXIN_PATTERN = /\S*\+\S*\(.*/;
  return {
    name: 'indentForMarkdown',
    process: function(str, width) {
      if (str == null || str.length === 0) {
        return '';
      }
      width = width || 4;

      var lines = str.split('\n');
      var newLines = [];
      var sp = spaces(width);
      var spMixin = spaces(width - 2);
      var isAfterMarkdownTag = true;
      lines.forEach(function(line) {
        // indent lines that match mixin pattern by 2 less than specified width
        if (line.indexOf('{@example') >= 0) {
          if (isAfterMarkdownTag) {
            // happens if example follows example
            if (newLines.length > 0) {
              newLines.pop();
            } else {
              // weird case - first expression in str is an @example
              // in this case the :marked appear above the str passed in,
              // so we need to put 'something' into the markdown tag.
              newLines.push(sp + '.');  // '.' is a dummy char
            }
          }
          newLines.push(spMixin + line);
          // after a mixin line we need to reenter markdown.
          newLines.push(spMixin + ':marked');
          isAfterMarkdownTag = true;
        } else {
          if ((!isAfterMarkdownTag) || (line.trim().length > 0)) {
            newLines.push(sp + line);
            isAfterMarkdownTag = false;
          }
        }
      });
      if (isAfterMarkdownTag) {
        if (newLines.length > 0) {
          // if last line is a markdown tag remove it.
          newLines.pop();
        }
      }
      // force character to be a newLine.
      if (newLines.length > 0) newLines.push('');
      var res = newLines.join('\n');
      return res;
    }
  };

  function spaces(n) {
    var str = '';
    for (var i = 0; i < n; i++) {
      str += ' ';
    }
    return str;
  }

};
