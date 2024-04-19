/**
 * Use this tag to indicate that this class can be extended.
 *
 * This is the opposite of the Java `sealed` keyword.
 */
module.exports = function() {
  return {
    name: 'extensible',
    transforms: function() { return true; }
  };
};
