// #docregion
import rollup      from 'rollup'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs    from 'rollup-plugin-commonjs';
import uglify      from 'rollup-plugin-uglify'

import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
//paths are relative to the execution path
export default {
  entry: 'src/main-aot.js',
  dest: 'aot/dist/build.js', // output a single application bundle
  sourceMap: true,
  sourceMapFile: 'aot/dist/build.js.map',
  format: 'iife',
  onwarn: function(warning) {
    // Skip certain warnings

    // should intercept ... but doesn't in some rollup versions
    if ( warning.code === 'THIS_IS_UNDEFINED' ) { return; }
    // intercepts in some rollup versions
    if ( warning.indexOf("The 'this' keyword is equivalent to 'undefined'") > -1 ) { return; }

    // console.warn everything else
    console.warn( warning.message );
  },
  plugins: [
    nodeResolve({jsnext: true, module: true, browser: true}),
    commonjs({
      include: [
        'node_modules/rxjs/**',
        'node_modules/graphql-tag/**',
        'node_modules/apollo-client/**',
        'node_modules/lodash/**',
        'node_modules/graphql-tools/dist/**',
        'node_modules/graphql/**',
        'node_modules/graphql-anywhere/**',
        'node_modules/iterall/**',
        'node_modules/deprecated-decorator/**',
        'node_modules/uuid/**'
      ],
      namedExports: {
        'node_modules/graphql-tools/dist/index.js': ['makeExecutableSchema' ],
        'node_modules/graphql/index.js': ['execute' ],
        'node_modules/graphql-tag/bundledPrinter.js': ['print'],
        'node_modules/lodash/lodash.js': ['find', 'omit', 'assign', 'isFunction'],
      }
    }),
    globals(),
    builtins(),
    uglify()
  ]
}