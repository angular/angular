const node = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');

module.exports = {
  external: ['shelljs', 'minimatch', 'yaml'],
  preferBuiltins: true,
  output: {
    banner: "#!/usr/bin/env node",
  },
  plugins: [
    node({
      mainFields: ['browser', 'es2015', 'module', 'jsnext:main', 'main'],
    }),
    commonjs(),
  ],
};
