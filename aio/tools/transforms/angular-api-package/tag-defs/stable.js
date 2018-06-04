module.exports = function(log, createDocMessage) {
  return {
    name: 'stable',
    deprecated: true,
    transforms(doc, tag, value) {
      log.warn(createDocMessage('Deprecated `@stable` tag found', doc));
      log.warn('PLEASE REMOVE - its value is now computed.');
      return value;
    }
  };
};
