import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: 'dist/src/main.js',
  sourceMap: true,
  treeshake: true,
  moduleName: 'main',
  plugins: [
    commonjs({
      include: 'node_modules/**'
    }),
    nodeResolve({
      jsnext: true, main: true, module: true
    })
  ]
};
