var nullLine = '###';
var nullLinePattern = new RegExp(nullLine + '\n', 'g');

function getCommentInfo(extension) {
  var commentInfo;
  switch (extension) {
    case 'ts':
    case 'js':
    case 'dart':
      commentInfo = {
        prefix: '//',
        plasterPattern: '/* {tag} */'
      };
      break;
    case 'html':
      commentInfo = {
        prefix: '<!--',
        plasterPattern: '<!-- {tag} -->'
      };
      break;
    case 'css':
      commentInfo = {
        prefix: '/*',
        plasterPattern: '/* {tag} */'
      };
      break;
    case 'json':
      return null;
    case 'yaml':
      commentInfo = {
        prefix: '#',
        plasterPattern: '# {tag} '
      };
      break;
    case 'jade':
      commentInfo = {
        prefix: '//',
        plasterPattern: '// {tag} '
      };
      break;
    default:
      return null;
  }
  return commentInfo;
}

function hasDocPlasterTag(line) {
  return line.indexOf("#docplaster") >= 0;
}

function hasDocTag(line) {
  return hasRegionTag(line) || hasEndRegionTag(line) || hasDocPlasterTag(line);
}

function hasEndRegionTag(line) {
  return line.indexOf("#enddocregion") >= 0;
}

function hasRegionTag(line) {
  return line.indexOf("#docregion") >= 0;
}

function isCommentLine(line, commentPrefix) {
  return line.trim().indexOf(commentPrefix) == 0;
}

function joinLines(lines) {
  var content = lines.join('\n');
  // eliminate all #docregion lines
  content = content.replace(nullLinePattern, '');
  if (content.substr(-3) === nullLine) {
    content = content.substr(0, content.length - 3);
  }
  return content;
}

function removeDocTags(content, extn) {
  var commentInfo = getCommentInfo(extn);
  if (commentInfo == null) {
    return content;
  }
  var lines = result = content.split(/\r?\n/);

  lines.forEach(function(line, ix) {
    if (isCommentLine(line, commentInfo.prefix)) {
      if (hasDocTag(line)) {
        lines[ix] = nullLine;
      }
    }
  });
  var result = joinLines(lines);
  return result;
}

module.exports = {
  removeDocTags: removeDocTags
};
