module.exports = function(extractTypeTransform, wholeTagTransform) {
  return {
    name: 'throws',
    aliases: ['exception'],
    multi: true,
    transforms: [ extractTypeTransform, wholeTagTransform ]
  };
};