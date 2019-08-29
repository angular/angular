import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  input: 'dist/src/main.js',
  output: {
    sourceMap: true,
  },
  treeshake: true,
  plugins: [
    nodeResolve()
  ]
};
