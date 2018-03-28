import optimizer from '@angular-devkit/build-optimizer/src/build-optimizer/rollup-plugin'
import nodeResolve from 'rollup-plugin-node-resolve';
import paths from 'rollup-plugin-paths';
import pathMapping from 'rxjs/_esm5/path-mapping';
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
    paths(pathMapping()),
    nodeResolve({jsnext: true, module: true}),
    optimizer({
      sideEffectFreeModules: ['@angular/core/esm5/core.js']
    }),
    uglify({
      mangle: true,
      compress: {
        global_defs: {
          'ngDevMode': false,
        },
        keep_fargs: false,
        passes: 3,
        pure_getters: true,
        unsafe: true,
      }
    })
  ],
  external: []
}
