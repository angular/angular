import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  entry: 'dist/src/main.js',
  sourceMap: true,
  treeshake: true,
  moduleName: 'main',
  plugins: [
    nodeResolve()
  ]
};
