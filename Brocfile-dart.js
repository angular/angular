// Brocfile to transpile sources from TypeScript to Dart using ts2dart.
var Funnel = require('broccoli-funnel');
var stew = require('broccoli-stew');
var ts2dart = require('./dist/broccoli/broccoli-ts2dart');
var path = require('path');

// Transpile everything in 'modules'...
var modulesTree = new Funnel('modules', {
  include: ['**/*.js', '**/*.ts', '**/*.dart'], // .dart file available means don't translate.
  exclude: ['rtts_assert/**/*'],  // ... except for the rtts_asserts (don't apply to Dart).
  destDir: '/',  // Remove the 'modules' prefix.
});

// Transpile to dart.
var dartTree = ts2dart.transpile(modulesTree);

// Move around files to match Dart's layout expectations.
dartTree = stew.rename(dartTree, function(relativePath) {
  // If a file matches the `pattern`, insert the given `insertion` as the second path part.
  var replacements = [
    {pattern: /^benchmarks\/test\//, insertion: ''},
    {pattern: /^benchmarks\//, insertion: 'web'},
    {pattern: /^benchmarks_external\/test\//, insertion: ''},
    {pattern: /^benchmarks_external\//, insertion: 'web'},
    {pattern: /^example.?\//, insertion: 'web/'},
    {pattern: /^example.?\/test\//, insertion: ''},
    {pattern: /^[^\/]*\/test\//, insertion: ''},
    {pattern: /^./, insertion: 'lib'},  // catch all.
  ];

  for (var i = 0; i < replacements.length; i++) {
    var repl = replacements[i];
    if (relativePath.match(repl.pattern)) {
      var parts = relativePath.split('/');
      parts.splice(1, 0, repl.insertion);
      return path.join.apply(path, parts);
    }
  }
  throw new Error('Failed to match any path', relativePath);
});

// Move the tree under the 'dart' folder.
module.exports = stew.mv(dartTree, 'dart');
