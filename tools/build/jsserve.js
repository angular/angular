var onHeaders = require('on-headers');
var proxy = require('proxy-middleware');
var url = require('url');

module.exports = function(gulp, plugins, config) {
  return function() {
    plugins.connect.server({
      root: [__dirname + '/../../' + config.path],
      port: config.port,
      livereload: false,
      open: false,
      middleware: function(connect, opt) {
        config.proxies = config.proxies || [];
        var middlewares =
            config.proxies.map(function(entry) { return makeProxy(entry.route, entry.url); });
        middlewares.push(function(req,res,next){
          console.log('request', req.url)
          next();
        });
        middlewares.push(connect.favicon());

        // pub serve can't give the right content-type header for jsonp requests
        // so we must turn off Chromium strict MIME type checking
        // see https://github.com/angular/angular/issues/3030#issuecomment-123453168
        middlewares.unshift(stripHeader('x-content-type-options'));
        return middlewares;
      }
    })();
  };
};

function makeProxy(route, urlParam) {
  var options = url.parse(urlParam);
  options.route = route;
  return proxy(options);
}

function stripHeader(toStrip) {
  return function(req, res, next) {
    onHeaders(res, function onHeaders() {
      res.removeHeader(toStrip);
    });
    next();
  };
}
