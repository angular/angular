import buildOptimizer from 'rollup-plugin-angular-optimizer'
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

export default {
  input: `built/index.js`,
  output: {
    name: 'hw',
    file: `dist/bundle.js`,
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    buildOptimizer(),
    nodeResolve({jsnext: true, module: true}),
    commonjs({
      include: 'node_modules/rxjs/**'
    }),
    uglify({
      mangle: true,
      compress: {
        global_defs: {
          'ngDevMode': false,
        }
      }
    })
  ],
  external: []
}
