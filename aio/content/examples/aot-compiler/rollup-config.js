// #docregion
import rollup      from 'rollup'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs    from 'rollup-plugin-commonjs';
import uglify      from 'rollup-plugin-uglify'

// #docregion config
export default {
  entry: 'src/main.js',
  dest: 'src/build.js', // output a single application bundle
  sourceMap: false,
  format: 'iife',
  onwarn: function(warning) {
    // Skip certain warnings

    // should intercept ... but doesn't in some rollup versions
    if ( warning.code === 'THIS_IS_UNDEFINED' ) { return; }

    // console.warn everything else
    console.warn( warning.message );
  },
  plugins: [
      nodeResolve({jsnext: true, module: true}),
      // #docregion commonjs
      commonjs({
        include: 'node_modules/rxjs/**',
      }),
      // #enddocregion commonjs
      // #docregion uglify
      uglify()
      // #enddocregion uglify
  ]
}
// #enddocregion config
