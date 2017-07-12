module.exports = function() {
  return {
    name: 'truncateFirstLine',
    process: function(str) {
      const parts = str && str.split && str.split(/\r?\n/);
      if (parts && parts.length > 1) {
        return parts[0] + '...';
      } else {
        return str;
      }
    }
  };
};