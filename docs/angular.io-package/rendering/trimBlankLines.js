module.exports = function(encodeCodeBlock) {
  return {
    name: 'trimBlankLines',
    process: function(str) {
      var lines = str.split(/\r?\n/);
      while(lines[0] === '') {
        lines.shift();
      }
      return lines.join('\n');
    }
  };
};