// This file only hook up on require calls to transpile the TypeScript.
// If you're looking at this file to see Karma configuration, you should look at
// karma.config.ts instead.

const fs = require('fs');
const ts = require('typescript');

const old = require.extensions['.ts'];

require.extensions['.ts'] = function(m, filename) {
  // If we're in node module, either call the old hook or simply compile the
  // file without transpilation. We do not touch node_modules/**.
  if (filename.match(/node_modules/)) {
    if (old) {
      return old(m, filename);
    }
    return m._compile(fs.readFileSync(filename), filename);
  }

  // Node requires all require hooks to be sync.
  const source = fs.readFileSync(filename).toString();
  const result = ts.transpile(source, {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJs,
  });

  // Send it to node to execute.
  return m._compile(result, filename);
};

// Import the TS once we know it's safe to require.
module.exports = require('./karma.config.ts').config;
