// A fake annotation to prevent Closure compiler from modifying the
// associated code.
// See https://github.com/angular/angular/blob/master/packages/compiler-cli/src/transformers/nocollapse_hack.ts
// We must provide a tag-def for it or the doc-gen will error.
module.exports = function() {
  return {name: 'nocollapse'};
};
