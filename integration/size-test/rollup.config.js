const {buildOptimizer} = require('@angular-devkit/build-optimizer');
const node = require('rollup-plugin-node-resolve');

const buildOptimizerPlugin = {
  name: 'build-optimizer',
  transform: (content, id) => {
    const {content: code, sourceMap: map} = buildOptimizer({
      content,
      inputFilePath: id,
      emitSourceMap: true,
      isSideEffectFree: true,
      isAngularCoreFile: false,
    });
    if (!code) {
      return null;
    }
    if (!map) {
      throw new Error('No sourcemap produced by build optimizer');
    }
    return {code, map};
  },
};

module.exports = {
  plugins: [
    buildOptimizerPlugin,
    node({
      mainFields: ['es2015_ivy_ngcc', 'module_ivy_ngcc','es2015', 'module'],
    }),
  ],
};
