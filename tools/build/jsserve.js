module.exports = function(gulp, plugins, config) {
  return function() {
    plugins.connect.server({
      root: [__dirname+'/../../'+config.path],
      port: config.port,
      livereload: false,
      open: false,
      middleware: function(connect, opt) {
        return [
          connect.favicon()
        ]
      }
    })();
  };
};
