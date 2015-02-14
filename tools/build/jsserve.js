module.exports = function(gulp, plugins, config) {
  return function() {
    plugins.connect.server({
      root: [__dirname+'/../../'+config.path],
      port: config.port,
      livereload: false,
      open: false,
      middleware: function(connect, opt) {
        // TODO(juliemr): decide if this is the best place for this.
        // TODO(juliemr): extract into a helper.
        // TODO(juliemr): this won't work for dart pubserve
        return [
          function(req, res, next) {
            if (req.url === '/slowcall') {
              setTimeout(function() {
                res.end('finally done');
              }, 5000);
            } else {
              next();
            }
          }
        ];
      }
    })();
  };
};
