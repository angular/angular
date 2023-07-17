module.exports = function() {
  return {
    name: 'trimBlankLines',
    process: function(str) {
      var lines = str.split(/\r?\n/);
      while (lines.length && (lines[0].trim() === '')) {
        lines.shift();
      }
      while (lines.length && (lines[lines.length - 1].trim() === '')) {
        lines.pop();
      }
      return lines.join('\n');
    }
  };
};