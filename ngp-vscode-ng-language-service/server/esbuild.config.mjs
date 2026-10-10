// esbuild config for the Bazel-built server bundle.
//
// The server is bundled as CommonJS (matching the shipped extension), but the
// preprocessor's analyzer loader relies on `import.meta.url` to locate itself.
// Instead of regex-patching the output after the fact (as `build.js` does), we
// define `import.meta.url` up-front to a CJS-compatible equivalent.
export default {
  banner: {
    js: "const __ngp_import_meta_url = require('node:url').pathToFileURL(__filename).href;",
  },
  define: {
    'import.meta.url': '__ngp_import_meta_url',
  },
  // Workaround for https://github.com/aspect-build/rules_esbuild/issues/58
  resolveExtensions: ['.js'],
};
