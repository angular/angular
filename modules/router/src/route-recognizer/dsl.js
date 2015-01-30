class Target {
  constructor(path, matcher, delegate) {
    this.path = path;
    this.matcher = matcher;
    this.delegate = delegate;
  }

  to(target, callback) {
    var delegate = this.delegate;

    if (delegate && delegate.willAddRoute) {
      target = delegate.willAddRoute(this.matcher.target, target);
    }

    this.matcher.add(this.path, target);

    if (callback) {
      if (callback.length === 0) { throw new Error("You must have an argument in the function passed to `to`"); }
      this.matcher.addChild(this.path, target, callback, this.delegate);
    }
    return this;
  }
}

class Matcher {
  constructor(target) {
    this.routes = {};
    this.children = {};
    this.target = target;
  }

  add(path, handler) {
    this.routes[path] = handler;
  }

  addChild(path, target, callback, delegate) {
    var matcher = new Matcher(target);
    this.children[path] = matcher;

    var match = generateMatch(path, matcher, delegate);

    if (delegate && delegate.contextEntered) {
      delegate.contextEntered(target, match);
    }

    callback(match);
  }
}

function generateMatch(startingPath, matcher, delegate) {
  return function(path, nestedCallback) {
    var fullPath = startingPath + path;

    if (nestedCallback) {
      nestedCallback(generateMatch(fullPath, matcher, delegate));
    } else {
      return new Target(startingPath + path, matcher, delegate);
    }
  };
}

function addRoute(routeArray, path, handler) {
  var len = 0;
  for (var i=0, l=routeArray.length; i<l; i++) {
    len += routeArray[i].path.length;
  }

  path = path.substr(len);
  var route = { path: path, handler: handler };
  routeArray.push(route);
}

function eachRoute(baseRoute, matcher, callback, binding) {
  var routes = matcher.routes;

  for (var path in routes) {
    if (routes.hasOwnProperty(path)) {
      var routeArray = baseRoute.slice();
      addRoute(routeArray, path, routes[path]);

      if (matcher.children[path]) {
        eachRoute(routeArray, matcher.children[path], callback, binding);
      } else {
        callback.call(binding, routeArray);
      }
    }
  }
}

function map(context, callback, addRouteCallback) {
  var matcher = new Matcher();

  callback(generateMatch("", matcher, context.delegate));

  eachRoute([], matcher, function(route) {
    if (addRouteCallback) { addRouteCallback(context, route); }
    else { context.add(route); }
  }, this);
}

export {map}
