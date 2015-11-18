var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var testing_internal_1 = require('angular2/testing_internal');
var browser_jsonp_1 = require('angular2/src/http/backends/browser_jsonp');
var jsonp_backend_1 = require('angular2/src/http/backends/jsonp_backend');
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var static_request_1 = require('angular2/src/http/static_request');
var collection_1 = require('angular2/src/facade/collection');
var base_request_options_1 = require('angular2/src/http/base_request_options');
var base_response_options_1 = require('angular2/src/http/base_response_options');
var enums_1 = require('angular2/src/http/enums');
var addEventListenerSpy;
var existingScripts = [];
var unused;
var MockBrowserJsonp = (function (_super) {
    __extends(MockBrowserJsonp, _super);
    function MockBrowserJsonp() {
        _super.call(this);
        this.callbacks = new collection_1.Map();
    }
    MockBrowserJsonp.prototype.addEventListener = function (type, cb) { this.callbacks.set(type, cb); };
    MockBrowserJsonp.prototype.removeEventListener = function (type, cb) { this.callbacks.delete(type); };
    MockBrowserJsonp.prototype.dispatchEvent = function (type, argument) {
        if (!lang_1.isPresent(argument)) {
            argument = {};
        }
        var cb = this.callbacks.get(type);
        if (lang_1.isPresent(cb)) {
            cb(argument);
        }
    };
    MockBrowserJsonp.prototype.build = function (url) {
        var script = new MockBrowserJsonp();
        script.src = url;
        existingScripts.push(script);
        return script;
    };
    MockBrowserJsonp.prototype.send = function (node) {
    };
    MockBrowserJsonp.prototype.cleanup = function (node) {
    };
    return MockBrowserJsonp;
})(browser_jsonp_1.BrowserJsonp);
function main() {
    testing_internal_1.describe('JSONPBackend', function () {
        var backend;
        var sampleRequest;
        testing_internal_1.beforeEach(function () {
            var injector = core_1.Injector.resolveAndCreate([
                core_1.provide(base_response_options_1.ResponseOptions, { useClass: base_response_options_1.BaseResponseOptions }),
                core_1.provide(browser_jsonp_1.BrowserJsonp, { useClass: MockBrowserJsonp }),
                core_1.provide(jsonp_backend_1.JSONPBackend, { useClass: jsonp_backend_1.JSONPBackend_ })
            ]);
            backend = injector.get(jsonp_backend_1.JSONPBackend);
            var base = new base_request_options_1.BaseRequestOptions();
            sampleRequest = new static_request_1.Request(base.merge(new base_request_options_1.RequestOptions({ url: 'https://google.com' })));
        });
        testing_internal_1.afterEach(function () { existingScripts = []; });
        testing_internal_1.it('should create a connection', function () {
            var instance;
            testing_internal_1.expect(function () { return instance = backend.createConnection(sampleRequest); }).not.toThrow();
            testing_internal_1.expect(instance).toBeAnInstanceOf(jsonp_backend_1.JSONPConnection);
        });
        testing_internal_1.describe('JSONPConnection', function () {
            testing_internal_1.it('should use the injected BaseResponseOptions to create the response', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var connection = new jsonp_backend_1.JSONPConnection_(sampleRequest, new MockBrowserJsonp(), new base_response_options_1.ResponseOptions({ type: enums_1.ResponseTypes.Error }));
                connection.response.subscribe(function (res) {
                    testing_internal_1.expect(res.type).toBe(enums_1.ResponseTypes.Error);
                    async.done();
                });
                connection.finished();
                existingScripts[0].dispatchEvent('load');
            }));
            testing_internal_1.it('should ignore load/callback when disposed', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var connection = new jsonp_backend_1.JSONPConnection_(sampleRequest, new MockBrowserJsonp());
                var spy = new testing_internal_1.SpyObject();
                var loadSpy = spy.spy('load');
                var errorSpy = spy.spy('error');
                var returnSpy = spy.spy('cancelled');
                var request = connection.response.subscribe(loadSpy, errorSpy, returnSpy);
                request.unsubscribe();
                connection.finished('Fake data');
                existingScripts[0].dispatchEvent('load');
                async_1.TimerWrapper.setTimeout(function () {
                    testing_internal_1.expect(connection.readyState).toBe(enums_1.ReadyStates.Cancelled);
                    testing_internal_1.expect(loadSpy).not.toHaveBeenCalled();
                    testing_internal_1.expect(errorSpy).not.toHaveBeenCalled();
                    testing_internal_1.expect(returnSpy).not.toHaveBeenCalled();
                    async.done();
                }, 10);
            }));
            testing_internal_1.it('should report error if loaded without invoking callback', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var connection = new jsonp_backend_1.JSONPConnection_(sampleRequest, new MockBrowserJsonp());
                connection.response.subscribe(function (res) {
                    testing_internal_1.expect("response listener called").toBe(false);
                    async.done();
                }, function (err) {
                    testing_internal_1.expect(err.text()).toEqual('JSONP injected script did not invoke callback.');
                    async.done();
                });
                existingScripts[0].dispatchEvent('load');
            }));
            testing_internal_1.it('should report error if script contains error', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var connection = new jsonp_backend_1.JSONPConnection_(sampleRequest, new MockBrowserJsonp());
                connection.response.subscribe(function (res) {
                    testing_internal_1.expect("response listener called").toBe(false);
                    async.done();
                }, function (err) {
                    testing_internal_1.expect(err.text()).toBe('Oops!');
                    async.done();
                });
                existingScripts[0].dispatchEvent('error', ({ message: "Oops!" }));
            }));
            testing_internal_1.it('should throw if request method is not GET', function () {
                [enums_1.RequestMethods.Post, enums_1.RequestMethods.Put, enums_1.RequestMethods.Delete, enums_1.RequestMethods.Options,
                    enums_1.RequestMethods.Head, enums_1.RequestMethods.Patch]
                    .forEach(function (method) {
                    var base = new base_request_options_1.BaseRequestOptions();
                    var req = new static_request_1.Request(base.merge(new base_request_options_1.RequestOptions({ url: 'https://google.com', method: method })));
                    testing_internal_1.expect(function () { return new jsonp_backend_1.JSONPConnection_(req, new MockBrowserJsonp()).response.subscribe(); })
                        .toThrowError();
                });
            });
            testing_internal_1.it('should respond with data passed to callback', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                var connection = new jsonp_backend_1.JSONPConnection_(sampleRequest, new MockBrowserJsonp());
                connection.response.subscribe(function (res) {
                    testing_internal_1.expect(res.json()).toEqual(({ fake_payload: true, blob_id: 12345 }));
                    async.done();
                });
                connection.finished(({ fake_payload: true, blob_id: 12345 }));
                existingScripts[0].dispatchEvent('load');
            }));
        });
    });
}
exports.main = main;
//# sourceMappingURL=jsonp_backend_spec.js.map