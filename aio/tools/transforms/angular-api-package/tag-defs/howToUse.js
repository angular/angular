module.exports = function(log, createDocMessage) {
  return {
    name: 'howToUse',
    transforms(doc, tag, value) {
      log.warn(createDocMessage('Deprecated `@howToUse` tag found', doc));
      log.warn('PLEASE FIX by renaming to `@usageNotes.');
      return value;
    }
  };
};
