module.exports = function() {
  return {
    name: 'trimBlankLines',
    process: function(str) {
      var lines = str.split(/\r?\n/);
      while(lines.length && (lines[0].trim() === '')) {
        lines.shift();
      }
      return lines.join('\n');
    }
  };
};