'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var promise_1 = require('angular2/src/facade/promise');
var collection_1 = require('angular2/src/facade/collection');
var instruction_1 = require('./instruction');
var path_recognizer_1 = require('./path_recognizer');
var RouteMatch = (function () {
    function RouteMatch() {
    }
    return RouteMatch;
})();
exports.RouteMatch = RouteMatch;
var PathMatch = (function (_super) {
    __extends(PathMatch, _super);
    function PathMatch(instruction, remaining, remainingAux) {
        _super.call(this);
        this.instruction = instruction;
        this.remaining = remaining;
        this.remainingAux = remainingAux;
    }
    return PathMatch;
})(RouteMatch);
exports.PathMatch = PathMatch;
var RedirectMatch = (function (_super) {
    __extends(RedirectMatch, _super);
    function RedirectMatch(redirectTo, specificity) {
        _super.call(this);
        this.redirectTo = redirectTo;
        this.specificity = specificity;
    }
    return RedirectMatch;
})(RouteMatch);
exports.RedirectMatch = RedirectMatch;
var RedirectRecognizer = (function () {
    function RedirectRecognizer(path, redirectTo) {
        this.path = path;
        this.redirectTo = redirectTo;
        this._pathRecognizer = new path_recognizer_1.PathRecognizer(path);
        this.hash = this._pathRecognizer.hash;
    }
    /**
     * Returns `null` or a `ParsedUrl` representing the new path to match
     */
    RedirectRecognizer.prototype.recognize = function (beginningSegment) {
        var match = null;
        if (lang_1.isPresent(this._pathRecognizer.recognize(beginningSegment))) {
            match = new RedirectMatch(this.redirectTo, this._pathRecognizer.specificity);
        }
        return promise_1.PromiseWrapper.resolve(match);
    };
    RedirectRecognizer.prototype.generate = function (params) {
        throw new exceptions_1.BaseException("Tried to generate a redirect.");
    };
    return RedirectRecognizer;
})();
exports.RedirectRecognizer = RedirectRecognizer;
// represents something like '/foo/:bar'
var RouteRecognizer = (function () {
    // TODO: cache component instruction instances by params and by ParsedUrl instance
    function RouteRecognizer(path, handler) {
        this.path = path;
        this.handler = handler;
        this.terminal = true;
        this._cache = new collection_1.Map();
        this._pathRecognizer = new path_recognizer_1.PathRecognizer(path);
        this.specificity = this._pathRecognizer.specificity;
        this.hash = this._pathRecognizer.hash;
        this.terminal = this._pathRecognizer.terminal;
    }
    RouteRecognizer.prototype.recognize = function (beginningSegment) {
        var _this = this;
        var res = this._pathRecognizer.recognize(beginningSegment);
        if (lang_1.isBlank(res)) {
            return null;
        }
        return this.handler.resolveComponentType().then(function (_) {
            var componentInstruction = _this._getInstruction(res['urlPath'], res['urlParams'], res['allParams']);
            return new PathMatch(componentInstruction, res['nextSegment'], res['auxiliary']);
        });
    };
    RouteRecognizer.prototype.generate = function (params) {
        var generated = this._pathRecognizer.generate(params);
        var urlPath = generated['urlPath'];
        var urlParams = generated['urlParams'];
        return this._getInstruction(urlPath, urlParams, params);
    };
    RouteRecognizer.prototype.generateComponentPathValues = function (params) {
        return this._pathRecognizer.generate(params);
    };
    RouteRecognizer.prototype._getInstruction = function (urlPath, urlParams, params) {
        if (lang_1.isBlank(this.handler.componentType)) {
            throw new exceptions_1.BaseException("Tried to get instruction before the type was loaded.");
        }
        var hashKey = urlPath + '?' + urlParams.join('?');
        if (this._cache.has(hashKey)) {
            return this._cache.get(hashKey);
        }
        var instruction = new instruction_1.ComponentInstruction(urlPath, urlParams, this.handler.data, this.handler.componentType, this.terminal, this.specificity, params);
        this._cache.set(hashKey, instruction);
        return instruction;
    };
    return RouteRecognizer;
})();
exports.RouteRecognizer = RouteRecognizer;
//# sourceMappingURL=route_recognizer.js.map