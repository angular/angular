import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

// a real app should make a common bundle for libraries instead of bundling them
// in both the main module & the lazy module, but we don't care about size here
export default {
  input: 'dist/src/lazy.module.js',
  output: {
    sourceMap: true,
  },
  treeshake: true,
  plugins: [
    nodeResolve()
  ]
};
