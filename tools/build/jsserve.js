var rewriteModule = require('http-rewrite-middleware');

module.exports = function(gulp, plugins, config) {
  return function() {
    plugins.connect.server({
      root: [__dirname+'/../../'+config.path],
      port: config.port,
      livereload: false,
      open: false,
      middleware: function(connect, opt) {
        return [
          // change verbose to true to help debug rewrites
          rewriteModule.getMiddleware(config.rewriteRules || [], {verbose: false}),
          connect.favicon()
        ];
      }
    })();
  };
};
