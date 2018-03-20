module.exports = function(log, createDocMessage) {
  return {
    name: 'whatItDoes',
    deprecated: true,
    transforms(doc, tag, value) {
      log.warn(createDocMessage('Deprecated `@whatItDoes` tag found', doc));
      log.warn('PLEASE FIX by adding the content of this tag as the first paragraph of the `@description` tag.');
      return value;
    }
  };
};
