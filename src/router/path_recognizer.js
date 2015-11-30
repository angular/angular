'use strict';var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var url_parser_1 = require('./url_parser');
var instruction_1 = require('./instruction');
var TouchMap = (function () {
    function TouchMap(map) {
        var _this = this;
        this.map = {};
        this.keys = {};
        if (lang_1.isPresent(map)) {
            collection_1.StringMapWrapper.forEach(map, function (value, key) {
                _this.map[key] = lang_1.isPresent(value) ? value.toString() : null;
                _this.keys[key] = true;
            });
        }
    }
    TouchMap.prototype.get = function (key) {
        collection_1.StringMapWrapper.delete(this.keys, key);
        return this.map[key];
    };
    TouchMap.prototype.getUnused = function () {
        var _this = this;
        var unused = collection_1.StringMapWrapper.create();
        var keys = collection_1.StringMapWrapper.keys(this.keys);
        keys.forEach(function (key) { return unused[key] = collection_1.StringMapWrapper.get(_this.map, key); });
        return unused;
    };
    return TouchMap;
})();
function normalizeString(obj) {
    if (lang_1.isBlank(obj)) {
        return null;
    }
    else {
        return obj.toString();
    }
}
var ContinuationSegment = (function () {
    function ContinuationSegment() {
        this.name = '';
    }
    ContinuationSegment.prototype.generate = function (params) { return ''; };
    ContinuationSegment.prototype.match = function (path) { return true; };
    return ContinuationSegment;
})();
var StaticSegment = (function () {
    function StaticSegment(path) {
        this.path = path;
        this.name = '';
    }
    StaticSegment.prototype.match = function (path) { return path == this.path; };
    StaticSegment.prototype.generate = function (params) { return this.path; };
    return StaticSegment;
})();
var DynamicSegment = (function () {
    function DynamicSegment(name) {
        this.name = name;
    }
    DynamicSegment.prototype.match = function (path) { return path.length > 0; };
    DynamicSegment.prototype.generate = function (params) {
        if (!collection_1.StringMapWrapper.contains(params.map, this.name)) {
            throw new exceptions_1.BaseException("Route generator for '" + this.name + "' was not included in parameters passed.");
        }
        return normalizeString(params.get(this.name));
    };
    return DynamicSegment;
})();
var StarSegment = (function () {
    function StarSegment(name) {
        this.name = name;
    }
    StarSegment.prototype.match = function (path) { return true; };
    StarSegment.prototype.generate = function (params) { return normalizeString(params.get(this.name)); };
    return StarSegment;
})();
var paramMatcher = /^:([^\/]+)$/g;
var wildcardMatcher = /^\*([^\/]+)$/g;
function parsePathString(route) {
    // normalize route as not starting with a "/". Recognition will
    // also normalize.
    if (route.startsWith("/")) {
        route = route.substring(1);
    }
    var segments = splitBySlash(route);
    var results = [];
    var specificity = 0;
    // The "specificity" of a path is used to determine which route is used when multiple routes match
    // a URL.
    // Static segments (like "/foo") are the most specific, followed by dynamic segments (like
    // "/:id"). Star segments
    // add no specificity. Segments at the start of the path are more specific than proceeding ones.
    // The code below uses place values to combine the different types of segments into a single
    // integer that we can
    // sort later. Each static segment is worth hundreds of points of specificity (10000, 9900, ...,
    // 200), and each
    // dynamic segment is worth single points of specificity (100, 99, ... 2).
    if (segments.length > 98) {
        throw new exceptions_1.BaseException("'" + route + "' has more than the maximum supported number of segments.");
    }
    var limit = segments.length - 1;
    for (var i = 0; i <= limit; i++) {
        var segment = segments[i], match;
        if (lang_1.isPresent(match = lang_1.RegExpWrapper.firstMatch(paramMatcher, segment))) {
            results.push(new DynamicSegment(match[1]));
            specificity += (100 - i);
        }
        else if (lang_1.isPresent(match = lang_1.RegExpWrapper.firstMatch(wildcardMatcher, segment))) {
            results.push(new StarSegment(match[1]));
        }
        else if (segment == '...') {
            if (i < limit) {
                // TODO (matsko): setup a proper error here `
                throw new exceptions_1.BaseException("Unexpected \"...\" before the end of the path for \"" + route + "\".");
            }
            results.push(new ContinuationSegment());
        }
        else {
            results.push(new StaticSegment(segment));
            specificity += 100 * (100 - i);
        }
    }
    var result = collection_1.StringMapWrapper.create();
    collection_1.StringMapWrapper.set(result, 'segments', results);
    collection_1.StringMapWrapper.set(result, 'specificity', specificity);
    return result;
}
// this function is used to determine whether a route config path like `/foo/:id` collides with
// `/foo/:name`
function pathDslHash(segments) {
    return segments.map(function (segment) {
        if (segment instanceof StarSegment) {
            return '*';
        }
        else if (segment instanceof ContinuationSegment) {
            return '...';
        }
        else if (segment instanceof DynamicSegment) {
            return ':';
        }
        else if (segment instanceof StaticSegment) {
            return segment.path;
        }
    })
        .join('/');
}
function splitBySlash(url) {
    return url.split('/');
}
var RESERVED_CHARS = lang_1.RegExpWrapper.create('//|\\(|\\)|;|\\?|=');
function assertPath(path) {
    if (lang_1.StringWrapper.contains(path, '#')) {
        throw new exceptions_1.BaseException("Path \"" + path + "\" should not include \"#\". Use \"HashLocationStrategy\" instead.");
    }
    var illegalCharacter = lang_1.RegExpWrapper.firstMatch(RESERVED_CHARS, path);
    if (lang_1.isPresent(illegalCharacter)) {
        throw new exceptions_1.BaseException("Path \"" + path + "\" contains \"" + illegalCharacter[0] + "\" which is not allowed in a route config.");
    }
}
var PathMatch = (function () {
    function PathMatch(instruction, remaining, remainingAux) {
        this.instruction = instruction;
        this.remaining = remaining;
        this.remainingAux = remainingAux;
    }
    return PathMatch;
})();
exports.PathMatch = PathMatch;
// represents something like '/foo/:bar'
var PathRecognizer = (function () {
    // TODO: cache component instruction instances by params and by ParsedUrl instance
    function PathRecognizer(path, handler) {
        this.path = path;
        this.handler = handler;
        this.terminal = true;
        this._cache = new collection_1.Map();
        assertPath(path);
        var parsed = parsePathString(path);
        this._segments = parsed['segments'];
        this.specificity = parsed['specificity'];
        this.hash = pathDslHash(this._segments);
        var lastSegment = this._segments[this._segments.length - 1];
        this.terminal = !(lastSegment instanceof ContinuationSegment);
    }
    PathRecognizer.prototype.recognize = function (beginningSegment) {
        var nextSegment = beginningSegment;
        var currentSegment;
        var positionalParams = {};
        var captured = [];
        for (var i = 0; i < this._segments.length; i += 1) {
            var segment = this._segments[i];
            currentSegment = nextSegment;
            if (segment instanceof ContinuationSegment) {
                break;
            }
            if (lang_1.isPresent(currentSegment)) {
                captured.push(currentSegment.path);
                // the star segment consumes all of the remaining URL, including matrix params
                if (segment instanceof StarSegment) {
                    positionalParams[segment.name] = currentSegment.toString();
                    nextSegment = null;
                    break;
                }
                if (segment instanceof DynamicSegment) {
                    positionalParams[segment.name] = currentSegment.path;
                }
                else if (!segment.match(currentSegment.path)) {
                    return null;
                }
                nextSegment = currentSegment.child;
            }
            else if (!segment.match('')) {
                return null;
            }
        }
        if (this.terminal && lang_1.isPresent(nextSegment)) {
            return null;
        }
        var urlPath = captured.join('/');
        var auxiliary;
        var instruction;
        var urlParams;
        var allParams;
        if (lang_1.isPresent(currentSegment)) {
            // If this is the root component, read query params. Otherwise, read matrix params.
            var paramsSegment = beginningSegment instanceof url_parser_1.RootUrl ? beginningSegment : currentSegment;
            allParams = lang_1.isPresent(paramsSegment.params) ?
                collection_1.StringMapWrapper.merge(paramsSegment.params, positionalParams) :
                positionalParams;
            urlParams = url_parser_1.serializeParams(paramsSegment.params);
            auxiliary = currentSegment.auxiliary;
        }
        else {
            allParams = positionalParams;
            auxiliary = [];
            urlParams = [];
        }
        instruction = this._getInstruction(urlPath, urlParams, this, allParams);
        return new PathMatch(instruction, nextSegment, auxiliary);
    };
    PathRecognizer.prototype.generate = function (params) {
        var paramTokens = new TouchMap(params);
        var path = [];
        for (var i = 0; i < this._segments.length; i++) {
            var segment = this._segments[i];
            if (!(segment instanceof ContinuationSegment)) {
                path.push(segment.generate(paramTokens));
            }
        }
        var urlPath = path.join('/');
        var nonPositionalParams = paramTokens.getUnused();
        var urlParams = url_parser_1.serializeParams(nonPositionalParams);
        return this._getInstruction(urlPath, urlParams, this, params);
    };
    PathRecognizer.prototype._getInstruction = function (urlPath, urlParams, _recognizer, params) {
        var hashKey = urlPath + '?' + urlParams.join('?');
        if (this._cache.has(hashKey)) {
            return this._cache.get(hashKey);
        }
        var instruction = new instruction_1.ComponentInstruction_(urlPath, urlParams, _recognizer, params);
        this._cache.set(hashKey, instruction);
        return instruction;
    };
    return PathRecognizer;
})();
exports.PathRecognizer = PathRecognizer;
//# sourceMappingURL=path_recognizer.js.map