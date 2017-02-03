module.exports = (gulp) => (done) => {
  const madge = require('madge');

  const dependencyObject = madge(['dist/all/'], {
    format: 'cjs',
    extensions: ['.js'],
    onParseFile: function(data) { data.src = data.src.replace(/\/\* circular \*\//g, '//'); }
  });
  const circularDependencies = dependencyObject.circular().getArray();
  if (circularDependencies.length > 0) {
    console.log('Found circular dependencies!');
    console.log(circularDependencies);
    process.exit(1);
  }
  done();
};
