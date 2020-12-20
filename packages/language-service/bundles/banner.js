/**
 * @license Angular v0.0.0-PLACEHOLDER
 * Copyright Google LLC All Rights Reserved.
 * License: MIT
 */

let $deferred;
function define(modules, callback) {
  $deferred = {modules, callback};
}
module.exports = function(provided) {
  const ts = provided['typescript'];
  if (!ts) {
    throw new Error('Caller does not provide typescript module');
  }
  const results = {};
  const resolvedModules = $deferred.modules.map(m => {
    if (m === 'exports') {
      return results;
    }
    if (m === 'typescript' || m === 'typescript/lib/tsserverlibrary') {
      return ts;
    }
    return require(m);
  });
  $deferred.callback(...resolvedModules);
  return results;
};
