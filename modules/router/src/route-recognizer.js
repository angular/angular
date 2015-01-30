import {map} from './route-recognizer/dsl';
import {decodeUri} from 'facade/uri';
import {ListWrapper} from 'facade/collection';

var specials = [
  '/', '.', '*', '+', '?', '|',
  '(', ')', '[', ']', '{', '}', '\\'
];

var escapeRegex = new RegExp('(\\' + specials.join('|\\') + ')', 'g');

function isArray(test) {
  return Object.prototype.toString.call(test) === "[object Array]";
}

// A Segment represents a segment in the original route description.
// Each Segment type provides an `eachChar` and `regex` method.
//
// The `eachChar` method invokes the callback with one or more character
// specifications. A character specification consumes one or more input
// characters.
//
// The `regex` method returns a regex fragment for the segment. If the
// segment is a dynamic of star segment, the regex fragment also includes
// a capture.
//
// A character specification contains:
//
// * `validChars`: a String with a list of all valid characters, or
// * `invalidChars`: a String with a list of all invalid characters
// * `repeat`: true if the character specification can repeat

class StaticSegment {
  string : String;

  constuctor(string) { this.string = string; }

  eachChar(callback) {
    var string = this.string, ch;

    for (var i=0, l=string.length; i<l; i++) {
      ch = string[i];
      callback({ validChars: ch });
    }
  }

  regex() {
    return this.string.replace(escapeRegex, '//$1');
  }

  generate() {
    return this.string;
  }
};

class DynamicSegment {
  constructor(name) { this.name = name; }

  eachChar(callback) {
    callback({ invalidChars: "/", repeat: true });
  }

  regex() {
    return "([^/]+)";
  }

  generate(params) {
    return params[this.name];
  }
};

class StarSegment {
  constructor(name) { this.name = name; }

  eachChar(callback) {
    callback({ invalidChars: "", repeat: true });
  }

  regex() {
    return "(.+)";
  }

  generate(params) {
    return params[this.name];
  }
}

class EpsilonSegment {
  eachChar() {}
  regex() { return ""; }
  generate() { return ""; }
}

function parse(route, names, types) {
  // normalize route as not starting with a "/". Recognition will
  // also normalize.
  if (route[0] === "/") {
    route = route.substr(1);
  }

  var segments = route.split("/"), results = [];

  for (var i=0, l=segments.length; i<l; i++) {
    var segment = segments[i], match;

    if (match = segment.match(/:([^\/]+)$/)) {
      results.push(new DynamicSegment(match[1]));
      names.push(match[1]);
      types.dynamics++;
    } else if (match = segment.match(/^\*([^\/]+)$/)) {
      results.push(new StarSegment(match[1]));
      names.push(match[1]);
      types.stars++;
    } else if(segment === "") {
      results.push(new EpsilonSegment());
    } else {
      results.push(new StaticSegment(segment));
      types.statics++;
    }
  }

  return results;
}

// A State has a character specification and (`charSpec`) and a list of possible
// subsequent states (`nextStates`).
//
// If a State is an accepting state, it will also have several additional
// properties:
//
// * `regex`: A regular expression that is used to extract parameters from paths
//   that reached this accepting state.
// * `handlers`: Information on how to convert the list of captures into calls
//   to registered handlers with the specified parameters
// * `types`: How many static, dynamic or star segments in this route. Used to
//   decide which route to use if multiple registered routes match a path.
//
// Currently, State is implemented naively by looping over `nextStates` and
// comparing a character specification against a character. A more efficient
// implementation would use a hash of keys pointing at one or more next states.

class State {
  nextStates;
  charSpec;

  constructor(charSpec = '') {
    this.charSpec = charSpec;
    this.nextStates = [];
  }

  get(charSpec) {
    var nextStates = this.nextStates;

    for (var i=0, l=nextStates.length; i<l; i++) {
      var child = nextStates[i];

      var isEqual = child.charSpec.validChars === charSpec.validChars;
      isEqual = isEqual && child.charSpec.invalidChars === charSpec.invalidChars;

      if (isEqual) { return child; }
    }
  }

  put(charSpec) {
    var state;

    // If the character specification already exists in a child of the current
    // state, just return that state.
    if (state = this.get(charSpec)) { return state; }

    // Make a new state for the character spec
    state = new State(charSpec);

    // Insert the new state as a child of the current state
    this.nextStates.push(state);

    // If this character specification repeats, insert the new state as a child
    // of itself. Note that this will not trigger an infinite loop because each
    // transition during recognition consumes a character.
    if (charSpec.repeat) {
      state.nextStates.push(state);
    }

    // Return the new state
    return state;
  }

  // Find a list of child states matching the next character
  match(ch) {
    // DEBUG "Processing `" + ch + "`:"
    var nextStates = this.nextStates,
        child, charSpec, chars;

    // DEBUG "  " + debugState(this)
    var returned = [];

    for (var i=0, l=nextStates.length; i<l; i++) {
      child = nextStates[i];

      charSpec = child.charSpec;

      if (typeof (chars = charSpec.validChars) !== 'undefined') {
        if (chars.indexOf(ch) !== -1) {
          returned.push(child);
        }
      } else if (typeof (chars = charSpec.invalidChars) !== 'undefined') {
        if (chars.indexOf(ch) === -1) {
          returned.push(child);
        }
      }
    }

    return returned;
  }

  /** IF DEBUG
  debug() {
    var charSpec = this.charSpec,
        debug = "[",
        chars = charSpec.validChars || charSpec.invalidChars;

    if (charSpec.invalidChars) { debug += "^"; }
    debug += chars;
    debug += "]";

    if (charSpec.repeat) { debug += "+"; }

    return debug;
  }
  END IF **/
}

/** IF DEBUG
function debug(log) {
  console.log(log);
}

function debugState(state) {
  return state.nextStates.map(function(n) {
    if (n.nextStates.length === 0) { return "( " + n.debug() + " [accepting] )"; }
    return "( " + n.debug() + " <then> " + n.nextStates.map(function(s) { return s.debug() }).join(" or ") + " )";
  }).join(", ")
}
END IF **/

// This is a somewhat naive strategy, but should work in a lot of cases
// A better strategy would properly resolve /posts/:id/new and /posts/edit/:id.
//
// This strategy generally prefers more static and less dynamic matching.
// Specifically, it
//
//  * prefers fewer stars to more, then
//  * prefers using stars for less of the match to more, then
//  * prefers fewer dynamic segments to more, then
//  * prefers more static segments to more
function sortSolutions(states) {
  return states.sort(function(a, b) {
    if (a.types.stars !== b.types.stars) { return a.types.stars - b.types.stars; }

    if (a.types.stars) {
      if (a.types.statics !== b.types.statics) { return b.types.statics - a.types.statics; }
      if (a.types.dynamics !== b.types.dynamics) { return b.types.dynamics - a.types.dynamics; }
    }

    if (a.types.dynamics !== b.types.dynamics) { return a.types.dynamics - b.types.dynamics; }
    if (a.types.statics !== b.types.statics) { return b.types.statics - a.types.statics; }

    return 0;
  });
}

function recognizeChar(states, ch) {
  var nextStates = [];

  states.forEach(state => {
    nextStates = ListWrapper.concat(nextStates, state.match(ch));
  });

  return nextStates;
}

function findHandler(state, path, queryParams) {
  var handlers = state.handlers, regex = state.regex;
  var captures = path.match(regex), currentCapture = 1;
  var result = [];
  result.queryParams = queryParams;

  for (var i=0, l=handlers.length; i<l; i++) {
    var handler = handlers[i], names = handler.names, params = {};

    for (var j=0, m=names.length; j<m; j++) {
      params[names[j]] = captures[currentCapture++];
    }

    result.push({ handler: handler.handler, params: params, isDynamic: !!names.length });
  }

  return result;
}

function addSegment(currentState, segment) {
  segment.eachChar(function(ch) {
    var state;

    currentState = currentState.put(ch);
  });

  return currentState;
}

// The main interface

export class RouteRecognizer {
  rootState : State;
  names;

  constructor() {
    this.rootState = new State();
    this.names = {};
  }

  add(routes, options) {
    var currentState = this.rootState, regex = "^",
        types = { statics: 0, dynamics: 0, stars: 0 },
        handlers = [], allSegments = [], name;

    var isEmpty = true;

    for (var i=0, l=routes.length; i<l; i++) {
      var route = routes[i], names = [];

      var segments = parse(route.path, names, types);

      allSegments = allSegments.concat(segments);

      for (var j=0, m=segments.length; j<m; j++) {
        var segment = segments[j];

        if (segment instanceof EpsilonSegment) { continue; }

        isEmpty = false;

        // Add a "/" for the new segment
        currentState = currentState.put({ validChars: "/" });
        regex += "/";

        // Add a representation of the segment to the NFA and regex
        currentState = addSegment(currentState, segment);
        regex += segment.regex();
      }

      var handler = { handler: route.handler, names: names };
      handlers.push(handler);
    }

    if (isEmpty) {
      currentState = currentState.put({ validChars: "/" });
      regex += "/";
    }

    currentState.handlers = handlers;
    currentState.regex = new RegExp(regex + "$");
    currentState.types = types;

    if (name = options && options.as) {
      this.names[name] = {
        segments: allSegments,
        handlers: handlers
      };
    }
  }

  handlersFor(name) {
    var route = this.names[name], result = [];
    if (!route) { throw new Error("There is no route named " + name); }

    for (var i=0, l=route.handlers.length; i<l; i++) {
      result.push(route.handlers[i]);
    }

    return result;
  }

  hasRoute(name) {
    return !!this.names[name];
  }

  generate(name, params) {
    var route = this.names[name], output = "";
    if (!route) { throw new Error("There is no route named " + name); }

    var segments = route.segments;

    for (var i=0, l=segments.length; i<l; i++) {
      var segment = segments[i];

      if (segment instanceof EpsilonSegment) { continue; }

      output += "/";
      output += segment.generate(params);
    }

    if (output[0] !== '/') { output = '/' + output; }

    if (params && params.queryParams) {
      output += this.generateQueryString(params.queryParams, route.handlers);
    }

    return output;
  }

  generateQueryString(params, handlers) {
    var pairs = [];
    var keys = [];
    for(var key in params) {
      if (params.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    keys.sort();
    for (var i = 0, len = keys.length; i < len; i++) {
      key = keys[i];
      var value = params[key];
      if (value == null) {
        continue;
      }
      var pair = encodeURIComponent(key);
      if (isArray(value)) {
        for (var j = 0, l = value.length; j < l; j++) {
          var arrayPair = key + '[]' + '=' + encodeURIComponent(value[j]);
          pairs.push(arrayPair);
        }
      } else {
        pair += "=" + encodeURIComponent(value);
        pairs.push(pair);
      }
    }

    if (pairs.length === 0) { return ''; }

    return "?" + pairs.join("&");
  }

  parseQueryString(queryString) {
    var pairs = queryString.split("&"), queryParams = {};
    for(var i=0; i < pairs.length; i++) {
      var pair      = pairs[i].split('='),
          key       = decodeUriComponent(pair[0]),
          keyLength = key.length,
          isArray = false,
          value;
      if (pair.length === 1) {
        value = 'true';
      } else {
        //Handle arrays
        if (keyLength > 2 && key.slice(keyLength -2) === '[]') {
          isArray = true;
          key = key.slice(0, keyLength - 2);
          if(!queryParams[key]) {
            queryParams[key] = [];
          }
        }
        value = pair[1] ? decodeUriComponent(pair[1]) : '';
      }
      if (isArray) {
        queryParams[key].push(value);
      } else {
        queryParams[key] = value;
      }
    }
    return queryParams;
  }

  recognize(path) {
    var states = [ this.rootState ],
        pathLen, i, l, queryStart, queryParams = {},
        isSlashDropped = false;

    queryStart = path.indexOf('?');
    if (queryStart !== -1) {
      var queryString = path.substr(queryStart + 1, path.length);
      path = path.substr(0, queryStart);
      queryParams = this.parseQueryString(queryString);
    }

    path = decodeUri(path);

    // DEBUG GROUP path

    if (path[0] !== "/") { path = "/" + path; }

    pathLen = path.length;
    if (pathLen > 1 && path[pathLen - 1] === "/") {
      path = path.substr(0, pathLen - 1);
      isSlashDropped = true;
    }

    for (i=0; i < path.length; i++) {
      states = recognizeChar(states, path[i]);
      if (states.length < 1) { break; }
    }

    // END DEBUG GROUP

    var solutions = [];
    for (i=0; i < states.length; i++) {
      if (states[i].handlers) {
        solutions.push(states[i]);
      }
    }

    states = sortSolutions(solutions);

    var state = solutions[0];

    if (state && state.handlers) {
      // if a trailing slash was dropped and a star segment is the last segment
      // specified, put the trailing slash back
      if (isSlashDropped && state.regex.source.slice(-5) === "(.+)$") {
        path = path + "/";
      }
      return findHandler(state, path, queryParams);
    }
  }

  map(a, b) {
    return map(this, a, b);
  }
};
