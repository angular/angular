module.exports = function cliNegate() {
  return {
    name: 'cliNegate',
    process: function(str) { return 'no' + str.charAt(0).toUpperCase() + str.slice(1); }
  };
};