module.exports = function() {
  return {
    name: 'toId',
    process: function(str) {
      return str.replace(/[^(a-z)(A-Z)(0-9)._-]/, '-');
    }
  };
};