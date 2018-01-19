import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import typescript2 from 'rollup-plugin-typescript2';
import uglify from 'rollup-plugin-uglify';

export default {
  input: `src/index.ts`,
  output: {
    name: 'hw',
    file: `dist/bundle.js`,
    format: 'iife',
    sourcemap: false
  },
  plugins: [
    typescript2({
      typescript: require('typescript'),
      "experimentalDecorators": true,
      "emitDecoratorMetadata": true
    }),
    replace({
      delimiters: ['', ''],
      values: {
        '/** @class */': '/** @__PURE__ */'
      }
    }),
    nodeResolve({jsnext: true, module: true}),
    commonjs({
      include: 'node_modules/rxjs/**',
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
