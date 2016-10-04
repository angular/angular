module.exports = {
  target: 'node',
  entry: './test/all_spec.js',
  output: {
    filename: './all_spec.js'
  },
  resolve: {
    extensions: ['.js']
  },
};
