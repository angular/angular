// #docregion
import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve'
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
  // Rollup treeshaking has issues with https://github.com/angular/angular/blob/addd7f6249d54e258109f139fad1db0d0250352c/packages/core/src/linker/query_list.ts#L192
  // see: https://github.com/rollup/rollup/issues/4895
  treeshake: false,
  plugins: [
    nodeResolve(),
    commonjs({
      include: ['node_modules/rxjs/**']
    }),
    terser()
  ]
}
