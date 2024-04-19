/**
 * Use this tag to ensure that dgeni does not include this code item
 * in the rendered docs.
 *
 * The `@internal` tag indicates to the compiler not to include the
 * item in the public typings file.
 * Use the `@nodoc` alias if you only want to hide the item from the
 * docs but not from the typings file.
 */
module.exports = function() {
  return {
    name: 'internal',
    aliases: ['nodoc'],
    transforms: function() { return true; }
  };
};
