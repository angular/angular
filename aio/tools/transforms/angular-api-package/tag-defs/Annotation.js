// A ts2dart compiler annotation that we don't care about for API docs.
// But, if we don't have a tag-def for it the doc-gen will error.
module.exports = function() {
  return {name: 'Annotation'};
};
