module.exports = function(gulp, plugins, config) {
  return function() {
    plugins.connect.server({
      root: [__dirname+'/../../'+config.path],
      port: 8000,
      livereload: false,
      open: false
    })();
  };
};
