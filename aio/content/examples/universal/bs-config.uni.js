module.exports = function(bs) {

  return {
    "open": true,
    "port": 3200,
    "server": {
        "baseDir": "aot",
        "routes": {
            "/node_modules": "node_modules"
        },
        "middleware": [
            testMiddleware
        ]
    }
  };

};

function testMiddleware (req, res, next) {

    var routes = []; //['/', '/dashboard', '/heroes'];
    var prefixRoutes = ['/detail/', '/styles.css'];
    var url = req.originalUrl;

    if (routes.indexOf(url) >= 0 || prefixRoutes.some(function(r) { return url.startsWith(r); })) {
        console.log('test handling ' + url);
        res.setHeader('Content-Type', 'text/css');
        res.end("this should be css");
        return;
    }

    console.log('test skipping ' + url);
    // var parsed = require("url").parse(req.url);
    // if (parsed.pathname.match(/\.less$/)) {
    //     return less(parsed.pathname).then(function (o) {
    //         res.setHeader('Content-Type', 'text/css');
    //         res.end(o.css);
    //     });
    // }
    next();
}
