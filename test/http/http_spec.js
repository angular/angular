var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var testing_internal_1 = require('angular2/testing_internal');
var core_1 = require('angular2/core');
var mock_backend_1 = require('angular2/src/http/backends/mock_backend');
var http_1 = require('angular2/http');
var Rx_1 = require('@reactivex/rxjs/dist/cjs/Rx');
var SpyObserver = (function (_super) {
    __extends(SpyObserver, _super);
    function SpyObserver() {
        _super.call(this);
        this.onNext = this.spy('onNext');
        this.onError = this.spy('onError');
        this.onCompleted = this.spy('onCompleted');
    }
    return SpyObserver;
})(testing_internal_1.SpyObject);
function main() {
    testing_internal_1.describe('injectables', function () {
        var url = 'http://foo.bar';
        var http;
        var parentInjector;
        var childInjector;
        var jsonpBackend;
        var xhrBackend;
        var jsonp;
        testing_internal_1.it('should allow using jsonpInjectables and httpInjectables in same injector', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            parentInjector = core_1.Injector.resolveAndCreate([
                core_1.provide(http_1.XHRBackend, { useClass: mock_backend_1.MockBackend }),
                core_1.provide(http_1.JSONPBackend, { useClass: mock_backend_1.MockBackend })
            ]);
            childInjector = parentInjector.resolveAndCreateChild([
                http_1.HTTP_PROVIDERS,
                http_1.JSONP_PROVIDERS,
                core_1.provide(http_1.XHRBackend, { useClass: mock_backend_1.MockBackend }),
                core_1.provide(http_1.JSONPBackend, { useClass: mock_backend_1.MockBackend })
            ]);
            http = childInjector.get(http_1.Http);
            jsonp = childInjector.get(http_1.Jsonp);
            jsonpBackend = childInjector.get(http_1.JSONPBackend);
            xhrBackend = childInjector.get(http_1.XHRBackend);
            var xhrCreatedConnections = 0;
            var jsonpCreatedConnections = 0;
            xhrBackend.connections.subscribe(function () {
                xhrCreatedConnections++;
                testing_internal_1.expect(xhrCreatedConnections).toEqual(1);
                if (jsonpCreatedConnections) {
                    async.done();
                }
            });
            http.get(url).subscribe(function () { });
            jsonpBackend.connections.subscribe(function () {
                jsonpCreatedConnections++;
                testing_internal_1.expect(jsonpCreatedConnections).toEqual(1);
                if (xhrCreatedConnections) {
                    async.done();
                }
            });
            jsonp.request(url).subscribe(function () { });
        }));
    });
    testing_internal_1.describe('http', function () {
        var url = 'http://foo.bar';
        var http;
        var injector;
        var backend;
        var baseResponse;
        var jsonp;
        testing_internal_1.beforeEach(function () {
            injector = core_1.Injector.resolveAndCreate([
                http_1.BaseRequestOptions,
                mock_backend_1.MockBackend,
                core_1.provide(http_1.Http, {
                    useFactory: function (backend, defaultOptions) {
                        return new http_1.Http(backend, defaultOptions);
                    },
                    deps: [mock_backend_1.MockBackend, http_1.BaseRequestOptions]
                }),
                core_1.provide(http_1.Jsonp, {
                    useFactory: function (backend, defaultOptions) {
                        return new http_1.Jsonp(backend, defaultOptions);
                    },
                    deps: [mock_backend_1.MockBackend, http_1.BaseRequestOptions]
                })
            ]);
            http = injector.get(http_1.Http);
            jsonp = injector.get(http_1.Jsonp);
            backend = injector.get(mock_backend_1.MockBackend);
            baseResponse = new http_1.Response(new http_1.ResponseOptions({ body: 'base response' }));
        });
        testing_internal_1.afterEach(function () { return backend.verifyNoPendingRequests(); });
        testing_internal_1.describe('Http', function () {
            testing_internal_1.describe('.request()', function () {
                testing_internal_1.it('should return an Observable', function () { testing_internal_1.expect(http.request(url)).toBeAnInstanceOf(Rx_1.Observable); });
                testing_internal_1.it('should accept a fully-qualified request as its only parameter', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    backend.connections.subscribe(function (c) {
                        testing_internal_1.expect(c.request.url).toBe('https://google.com');
                        c.mockRespond(new http_1.Response(new http_1.ResponseOptions({ body: 'Thank you' })));
                        async.done();
                    });
                    http.request(new http_1.Request(new http_1.RequestOptions({ url: 'https://google.com' })))
                        .subscribe(function (res) { });
                }));
                testing_internal_1.it('should perform a get request for given url if only passed a string', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    backend.connections.subscribe(function (c) { return c.mockRespond(baseResponse); });
                    http.request('http://basic.connection')
                        .subscribe(function (res) {
                        testing_internal_1.expect(res.text()).toBe('base response');
                        async.done();
                    });
                }));
                testing_internal_1.it('should perform a get request and complete the response', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    backend.connections.subscribe(function (c) { return c.mockRespond(baseResponse); });
                    http.request('http://basic.connection')
                        .subscribe(function (res) { testing_internal_1.expect(res.text()).toBe('base response'); }, null, function () { async.done(); });
                }));
                testing_internal_1.it('should perform multiple get requests and complete the responses', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    backend.connections.subscribe(function (c) { return c.mockRespond(baseResponse); });
                    http.request('http://basic.connection')
                        .subscribe(function (res) { testing_internal_1.expect(res.text()).toBe('base response'); });
                    http.request('http://basic.connection')
                        .subscribe(function (res) { testing_internal_1.expect(res.text()).toBe('base response'); }, null, function () { async.done(); });
                }));
                // TODO: make dart not complain about "argument type 'Map' cannot be assigned to the
                // parameter type 'IRequestOptions'"
                // xit('should perform a get request for given url if passed a dictionary',
                //     inject([AsyncTestCompleter], async => {
                //       ObservableWrapper.subscribe(backend.connections, c => c.mockRespond(baseResponse));
                //       ObservableWrapper.subscribe(http.request(url, {method: RequestMethods.GET}), res =>
                //       {
                //         expect(res.text()).toBe('base response');
                //         async.done();
                //       });
                //     }));
                testing_internal_1.it('should throw if url is not a string or Request', function () {
                    var req = {};
                    testing_internal_1.expect(function () { return http.request(req); })
                        .toThrowError('First argument must be a url string or Request instance.');
                });
            });
            testing_internal_1.describe('.get()', function () {
                testing_internal_1.it('should perform a get request for given url', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    backend.connections.subscribe(function (c) {
                        testing_internal_1.expect(c.request.method).toBe(http_1.RequestMethods.Get);
                        backend.resolveAllConnections();
                        async.done();
                    });
                    http.get(url).subscribe(function (res) { });
                }));
            });
            testing_internal_1.describe('.post()', function () {
                testing_internal_1.it('should perform a post request for given url', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    backend.connections.subscribe(function (c) {
                        testing_internal_1.expect(c.request.method).toBe(http_1.RequestMethods.Post);
                        backend.resolveAllConnections();
                        async.done();
                    });
                    http.post(url, 'post me').subscribe(function (res) { });
                }));
                testing_internal_1.it('should attach the provided body to the request', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    var body = 'this is my post body';
                    backend.connections.subscribe(function (c) {
                        testing_internal_1.expect(c.request.text()).toBe(body);
                        backend.resolveAllConnections();
                        async.done();
                    });
                    http.post(url, body).subscribe(function (res) { });
                }));
            });
            testing_internal_1.describe('.put()', function () {
                testing_internal_1.it('should perform a put request for given url', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    backend.connections.subscribe(function (c) {
                        testing_internal_1.expect(c.request.method).toBe(http_1.RequestMethods.Put);
                        backend.resolveAllConnections();
                        async.done();
                    });
                    http.put(url, 'put me').subscribe(function (res) { });
                }));
                testing_internal_1.it('should attach the provided body to the request', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    var body = 'this is my put body';
                    backend.connections.subscribe(function (c) {
                        testing_internal_1.expect(c.request.text()).toBe(body);
                        backend.resolveAllConnections();
                        async.done();
                    });
                    http.put(url, body).subscribe(function (res) { });
                }));
            });
            testing_internal_1.describe('.delete()', function () {
                testing_internal_1.it('should perform a delete request for given url', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    backend.connections.subscribe(function (c) {
                        testing_internal_1.expect(c.request.method).toBe(http_1.RequestMethods.Delete);
                        backend.resolveAllConnections();
                        async.done();
                    });
                    http.delete(url).subscribe(function (res) { });
                }));
            });
            testing_internal_1.describe('.patch()', function () {
                testing_internal_1.it('should perform a patch request for given url', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    backend.connections.subscribe(function (c) {
                        testing_internal_1.expect(c.request.method).toBe(http_1.RequestMethods.Patch);
                        backend.resolveAllConnections();
                        async.done();
                    });
                    http.patch(url, 'this is my patch body').subscribe(function (res) { });
                }));
                testing_internal_1.it('should attach the provided body to the request', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    var body = 'this is my patch body';
                    backend.connections.subscribe(function (c) {
                        testing_internal_1.expect(c.request.text()).toBe(body);
                        backend.resolveAllConnections();
                        async.done();
                    });
                    http.patch(url, body).subscribe(function (res) { });
                }));
            });
            testing_internal_1.describe('.head()', function () {
                testing_internal_1.it('should perform a head request for given url', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    backend.connections.subscribe(function (c) {
                        testing_internal_1.expect(c.request.method).toBe(http_1.RequestMethods.Head);
                        backend.resolveAllConnections();
                        async.done();
                    });
                    http.head(url).subscribe(function (res) { });
                }));
            });
            testing_internal_1.describe('searchParams', function () {
                testing_internal_1.it('should append search params to url', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    var params = new http_1.URLSearchParams();
                    params.append('q', 'puppies');
                    backend.connections.subscribe(function (c) {
                        testing_internal_1.expect(c.request.url).toEqual('https://www.google.com?q=puppies');
                        backend.resolveAllConnections();
                        async.done();
                    });
                    http.get('https://www.google.com', new http_1.RequestOptions({ search: params }))
                        .subscribe(function (res) { });
                }));
                testing_internal_1.it('should append string search params to url', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    backend.connections.subscribe(function (c) {
                        testing_internal_1.expect(c.request.url).toEqual('https://www.google.com?q=piggies');
                        backend.resolveAllConnections();
                        async.done();
                    });
                    http.get('https://www.google.com', new http_1.RequestOptions({ search: 'q=piggies' }))
                        .subscribe(function (res) { });
                }));
                testing_internal_1.it('should produce valid url when url already contains a query', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                    backend.connections.subscribe(function (c) {
                        testing_internal_1.expect(c.request.url).toEqual('https://www.google.com?q=angular&as_eq=1.x');
                        backend.resolveAllConnections();
                        async.done();
                    });
                    http.get('https://www.google.com?q=angular', new http_1.RequestOptions({ search: 'as_eq=1.x' }))
                        .subscribe(function (res) { });
                }));
            });
            testing_internal_1.describe('string method names', function () {
                testing_internal_1.it('should allow case insensitive strings for method names', function () {
                    testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
                        backend.connections.subscribe(function (c) {
                            testing_internal_1.expect(c.request.method)
                                .toBe(http_1.RequestMethods.Post);
                            c.mockRespond(new http_1.Response(new http_1.ResponseOptions({ body: 'Thank you' })));
                            async.done();
                        });
                        http.request(new http_1.Request(new http_1.RequestOptions({ url: 'https://google.com', method: 'PosT' })))
                            .subscribe(function (res) { });
                    });
                });
                testing_internal_1.it('should throw when invalid string parameter is passed for method name', function () {
                    testing_internal_1.expect(function () {
                        http.request(new http_1.Request(new http_1.RequestOptions({ url: 'https://google.com', method: 'Invalid' })));
                    }).toThrowError('Invalid request method. The method "Invalid" is not supported.');
                });
            });
        });
        testing_internal_1.describe('Jsonp', function () {
            testing_internal_1.describe('.request()', function () {
                testing_internal_1.it('should throw if url is not a string or Request', function () {
                    var req = {};
                    testing_internal_1.expect(function () { return jsonp.request(req); })
                        .toThrowError('First argument must be a url string or Request instance.');
                });
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=http_spec.js.map