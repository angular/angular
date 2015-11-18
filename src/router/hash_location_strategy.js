'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
var angular2_1 = require('angular2/angular2');
var location_strategy_1 = require('./location_strategy');
/**
 * `HashLocationStrategy` is a {@link LocationStrategy} used to configure the
 * {@link Location} service to represent its state in the
 * [hash fragment](https://en.wikipedia.org/wiki/Uniform_Resource_Locator#Syntax)
 * of the browser's URL.
 *
 * For instance, if you call `location.go('/foo')`, the browser's URL will become
 * `example.com#/foo`.
 *
 * ### Example
 *
 * ```
 * import {Component, provide} from 'angular2/angular2';
 * import {
 *   ROUTER_DIRECTIVES,
 *   ROUTER_PROVIDERS,
 *   RouteConfig,
 *   Location,
 *   LocationStrategy,
 *   HashLocationStrategy
 * } from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   constructor(location: Location) {
 *     location.go('/foo');
 *   }
 * }
 *
 * bootstrap(AppCmp, [
 *   ROUTER_PROVIDERS,
 *   provide(LocationStrategy, {useClass: HashLocationStrategy})
 * ]);
 * ```
 */
var HashLocationStrategy = (function (_super) {
    __extends(HashLocationStrategy, _super);
    function HashLocationStrategy() {
        _super.call(this);
        this._location = dom_adapter_1.DOM.getLocation();
        this._history = dom_adapter_1.DOM.getHistory();
    }
    HashLocationStrategy.prototype.onPopState = function (fn) {
        dom_adapter_1.DOM.getGlobalEventTarget('window').addEventListener('popstate', fn, false);
    };
    HashLocationStrategy.prototype.getBaseHref = function () { return ''; };
    HashLocationStrategy.prototype.path = function () {
        // the hash value is always prefixed with a `#`
        // and if it is empty then it will stay empty
        var path = this._location.hash;
        // Dart will complain if a call to substring is
        // executed with a position value that extends the
        // length of string.
        return (path.length > 0 ? path.substring(1) : path) +
            location_strategy_1.normalizeQueryParams(this._location.search);
    };
    HashLocationStrategy.prototype.prepareExternalUrl = function (internal) {
        return internal.length > 0 ? ('#' + internal) : internal;
    };
    HashLocationStrategy.prototype.pushState = function (state, title, path, queryParams) {
        var url = path + location_strategy_1.normalizeQueryParams(queryParams);
        if (url.length == 0) {
            url = this._location.pathname;
        }
        else {
            url = this.prepareExternalUrl(url);
        }
        this._history.pushState(state, title, url);
    };
    HashLocationStrategy.prototype.forward = function () { this._history.forward(); };
    HashLocationStrategy.prototype.back = function () { this._history.back(); };
    HashLocationStrategy = __decorate([
        angular2_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], HashLocationStrategy);
    return HashLocationStrategy;
})(location_strategy_1.LocationStrategy);
exports.HashLocationStrategy = HashLocationStrategy;
//# sourceMappingURL=hash_location_strategy.js.map