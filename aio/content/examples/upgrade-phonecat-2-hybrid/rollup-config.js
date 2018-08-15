// #docregion
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs';
import {terser} from 'rollup-plugin-terser'

//paths are relative to the execution path
export default {
  input: 'app/main.js',
  output: {
    file: 'aot/dist/build.js', // output a single application bundle
    format: 'iife',
    sourcemap: true,
    sourcemapFile: 'aot/dist/build.js.map'
  },
  plugins: [
    nodeResolve({jsnext: true, module: true}),
    commonjs({
      include: ['node_modules/rxjs/**']
    }),
    terser()
  ]
}
