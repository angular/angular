'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require('angular2/src/core/di');
var platform_location_1 = require('angular2/src/router/platform_location');
var client_message_broker_1 = require('angular2/src/web_workers/shared/client_message_broker');
var messaging_api_1 = require('angular2/src/web_workers/shared/messaging_api');
var serialized_types_1 = require('angular2/src/web_workers/shared/serialized_types');
var async_1 = require('angular2/src/facade/async');
var exceptions_1 = require('angular2/src/facade/exceptions');
var serializer_1 = require('angular2/src/web_workers/shared/serializer');
var message_bus_1 = require('angular2/src/web_workers/shared/message_bus');
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var event_deserializer_1 = require('./event_deserializer');
var WebWorkerPlatformLocation = (function (_super) {
    __extends(WebWorkerPlatformLocation, _super);
    function WebWorkerPlatformLocation(brokerFactory, bus, _serializer) {
        var _this = this;
        _super.call(this);
        this._serializer = _serializer;
        this._popStateListeners = [];
        this._hashChangeListeners = [];
        this._location = null;
        this._broker = brokerFactory.createMessageBroker(messaging_api_1.ROUTER_CHANNEL);
        this._channelSource = bus.from(messaging_api_1.ROUTER_CHANNEL);
        async_1.ObservableWrapper.subscribe(this._channelSource, function (msg) {
            var listeners = null;
            if (collection_1.StringMapWrapper.contains(msg, 'event')) {
                var type = msg['event']['type'];
                if (lang_1.StringWrapper.equals(type, "popstate")) {
                    listeners = _this._popStateListeners;
                }
                else if (lang_1.StringWrapper.equals(type, "hashchange")) {
                    listeners = _this._hashChangeListeners;
                }
                if (listeners !== null) {
                    var e = event_deserializer_1.deserializeGenericEvent(msg['event']);
                    // There was a popState or hashChange event, so the location object thas been updated
                    _this._location = _this._serializer.deserialize(msg['location'], serialized_types_1.LocationType);
                    listeners.forEach(function (fn) { return fn(e); });
                }
            }
        });
    }
    /** @internal **/
    WebWorkerPlatformLocation.prototype.init = function () {
        var _this = this;
        var args = new client_message_broker_1.UiArguments("getLocation");
        var locationPromise = this._broker.runOnService(args, serialized_types_1.LocationType);
        return async_1.PromiseWrapper.then(locationPromise, function (val) {
            _this._location = val;
            return true;
        }, function (err) { throw new exceptions_1.BaseException(err); });
    };
    WebWorkerPlatformLocation.prototype.getBaseHrefFromDOM = function () {
        throw new exceptions_1.BaseException("Attempt to get base href from DOM from WebWorker. You must either provide a value for the APP_BASE_HREF token through DI or use the hash location strategy.");
    };
    WebWorkerPlatformLocation.prototype.onPopState = function (fn) { this._popStateListeners.push(fn); };
    WebWorkerPlatformLocation.prototype.onHashChange = function (fn) { this._hashChangeListeners.push(fn); };
    Object.defineProperty(WebWorkerPlatformLocation.prototype, "pathname", {
        get: function () {
            if (this._location === null) {
                return null;
            }
            return this._location.pathname;
        },
        set: function (newPath) {
            if (this._location === null) {
                throw new exceptions_1.BaseException("Attempt to set pathname before value is obtained from UI");
            }
            this._location.pathname = newPath;
            var fnArgs = [new client_message_broker_1.FnArg(newPath, serializer_1.PRIMITIVE)];
            var args = new client_message_broker_1.UiArguments("setPathname", fnArgs);
            this._broker.runOnService(args, null);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebWorkerPlatformLocation.prototype, "search", {
        get: function () {
            if (this._location === null) {
                return null;
            }
            return this._location.search;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WebWorkerPlatformLocation.prototype, "hash", {
        get: function () {
            if (this._location === null) {
                return null;
            }
            return this._location.hash;
        },
        enumerable: true,
        configurable: true
    });
    WebWorkerPlatformLocation.prototype.pushState = function (state, title, url) {
        var fnArgs = [new client_message_broker_1.FnArg(state, serializer_1.PRIMITIVE), new client_message_broker_1.FnArg(title, serializer_1.PRIMITIVE), new client_message_broker_1.FnArg(url, serializer_1.PRIMITIVE)];
        var args = new client_message_broker_1.UiArguments("pushState", fnArgs);
        this._broker.runOnService(args, null);
    };
    WebWorkerPlatformLocation.prototype.replaceState = function (state, title, url) {
        var fnArgs = [new client_message_broker_1.FnArg(state, serializer_1.PRIMITIVE), new client_message_broker_1.FnArg(title, serializer_1.PRIMITIVE), new client_message_broker_1.FnArg(url, serializer_1.PRIMITIVE)];
        var args = new client_message_broker_1.UiArguments("replaceState", fnArgs);
        this._broker.runOnService(args, null);
    };
    WebWorkerPlatformLocation.prototype.forward = function () {
        var args = new client_message_broker_1.UiArguments("forward");
        this._broker.runOnService(args, null);
    };
    WebWorkerPlatformLocation.prototype.back = function () {
        var args = new client_message_broker_1.UiArguments("back");
        this._broker.runOnService(args, null);
    };
    WebWorkerPlatformLocation = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [client_message_broker_1.ClientMessageBrokerFactory, message_bus_1.MessageBus, serializer_1.Serializer])
    ], WebWorkerPlatformLocation);
    return WebWorkerPlatformLocation;
})(platform_location_1.PlatformLocation);
exports.WebWorkerPlatformLocation = WebWorkerPlatformLocation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm1fbG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvd29ya2VyL3BsYXRmb3JtX2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbIldlYldvcmtlclBsYXRmb3JtTG9jYXRpb24iLCJXZWJXb3JrZXJQbGF0Zm9ybUxvY2F0aW9uLmNvbnN0cnVjdG9yIiwiV2ViV29ya2VyUGxhdGZvcm1Mb2NhdGlvbi5pbml0IiwiV2ViV29ya2VyUGxhdGZvcm1Mb2NhdGlvbi5nZXRCYXNlSHJlZkZyb21ET00iLCJXZWJXb3JrZXJQbGF0Zm9ybUxvY2F0aW9uLm9uUG9wU3RhdGUiLCJXZWJXb3JrZXJQbGF0Zm9ybUxvY2F0aW9uLm9uSGFzaENoYW5nZSIsIldlYldvcmtlclBsYXRmb3JtTG9jYXRpb24ucGF0aG5hbWUiLCJXZWJXb3JrZXJQbGF0Zm9ybUxvY2F0aW9uLnNlYXJjaCIsIldlYldvcmtlclBsYXRmb3JtTG9jYXRpb24uaGFzaCIsIldlYldvcmtlclBsYXRmb3JtTG9jYXRpb24ucHVzaFN0YXRlIiwiV2ViV29ya2VyUGxhdGZvcm1Mb2NhdGlvbi5yZXBsYWNlU3RhdGUiLCJXZWJXb3JrZXJQbGF0Zm9ybUxvY2F0aW9uLmZvcndhcmQiLCJXZWJXb3JrZXJQbGF0Zm9ybUxvY2F0aW9uLmJhY2siXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFDaEQsa0NBSU8sdUNBQXVDLENBQUMsQ0FBQTtBQUMvQyxzQ0FLTyx1REFBdUQsQ0FBQyxDQUFBO0FBQy9ELDhCQUE2QiwrQ0FBK0MsQ0FBQyxDQUFBO0FBQzdFLGlDQUEyQixrREFBa0QsQ0FBQyxDQUFBO0FBQzlFLHNCQUF1RSwyQkFBMkIsQ0FBQyxDQUFBO0FBQ25HLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELDJCQUFvQyw0Q0FBNEMsQ0FBQyxDQUFBO0FBQ2pGLDRCQUF5Qiw2Q0FBNkMs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QSxDQUFDQTtJQUN4Q0EsQ0FBQ0E7SUFoSEhaO1FBQUNBLGVBQVVBLEVBQUVBOztrQ0FpSFpBO0lBQURBLGdDQUFDQTtBQUFEQSxDQUFDQSxBQWpIRCxFQUMrQyxvQ0FBZ0IsRUFnSDlEO0FBaEhZLGlDQUF5Qiw0QkFnSHJDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7XG4gIFBsYXRmb3JtTG9jYXRpb24sXG4gIFVybENoYW5nZUV2ZW50LFxuICBVcmxDaGFuZ2VMaXN0ZW5lclxufSBmcm9tICdhbmd1bGFyMi9zcmMvcm91dGVyL3BsYXRmb3JtX2xvY2F0aW9uJztcbmltcG9ydCB7XG4gIEZuQXJnLFxuICBVaUFyZ3VtZW50cyxcbiAgQ2xpZW50TWVzc2FnZUJyb2tlcixcbiAgQ2xpZW50TWVzc2FnZUJyb2tlckZhY3Rvcnlcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9jbGllbnRfbWVzc2FnZV9icm9rZXInO1xuaW1wb3J0IHtST1VURVJfQ0hBTk5FTH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdpbmdfYXBpJztcbmltcG9ydCB7TG9jYXRpb25UeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3NlcmlhbGl6ZWRfdHlwZXMnO1xuaW1wb3J0IHtQcm9taXNlLCBQcm9taXNlV3JhcHBlciwgRXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1BSSU1JVElWRSwgU2VyaWFsaXplcn0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9zZXJpYWxpemVyJztcbmltcG9ydCB7TWVzc2FnZUJ1c30gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdlX2J1cyc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1N0cmluZ1dyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge2Rlc2VyaWFsaXplR2VuZXJpY0V2ZW50fSBmcm9tICcuL2V2ZW50X2Rlc2VyaWFsaXplcic7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBXZWJXb3JrZXJQbGF0Zm9ybUxvY2F0aW9uIGV4dGVuZHMgUGxhdGZvcm1Mb2NhdGlvbiB7XG4gIHByaXZhdGUgX2Jyb2tlcjogQ2xpZW50TWVzc2FnZUJyb2tlcjtcbiAgcHJpdmF0ZSBfcG9wU3RhdGVMaXN0ZW5lcnM6IEFycmF5PEZ1bmN0aW9uPiA9IFtdO1xuICBwcml2YXRlIF9oYXNoQ2hhbmdlTGlzdGVuZXJzOiBBcnJheTxGdW5jdGlvbj4gPSBbXTtcbiAgcHJpdmF0ZSBfbG9jYXRpb246IExvY2F0aW9uVHlwZSA9IG51bGw7XG4gIHByaXZhdGUgX2NoYW5uZWxTb3VyY2U6IEV2ZW50RW1pdHRlcjxPYmplY3Q+O1xuXG4gIGNvbnN0cnVjdG9yKGJyb2tlckZhY3Rvcnk6IENsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5LCBidXM6IE1lc3NhZ2VCdXMsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3NlcmlhbGl6ZXI6IFNlcmlhbGl6ZXIpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX2Jyb2tlciA9IGJyb2tlckZhY3RvcnkuY3JlYXRlTWVzc2FnZUJyb2tlcihST1VURVJfQ0hBTk5FTCk7XG5cbiAgICB0aGlzLl9jaGFubmVsU291cmNlID0gYnVzLmZyb20oUk9VVEVSX0NIQU5ORUwpO1xuICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZSh0aGlzLl9jaGFubmVsU291cmNlLCAobXNnOiB7W2tleTogc3RyaW5nXTogYW55fSkgPT4ge1xuICAgICAgdmFyIGxpc3RlbmVyczogQXJyYXk8RnVuY3Rpb24+ID0gbnVsbDtcbiAgICAgIGlmIChTdHJpbmdNYXBXcmFwcGVyLmNvbnRhaW5zKG1zZywgJ2V2ZW50JykpIHtcbiAgICAgICAgbGV0IHR5cGU6IHN0cmluZyA9IG1zZ1snZXZlbnQnXVsndHlwZSddO1xuICAgICAgICBpZiAoU3RyaW5nV3JhcHBlci5lcXVhbHModHlwZSwgXCJwb3BzdGF0ZVwiKSkge1xuICAgICAgICAgIGxpc3RlbmVycyA9IHRoaXMuX3BvcFN0YXRlTGlzdGVuZXJzO1xuICAgICAgICB9IGVsc2UgaWYgKFN0cmluZ1dyYXBwZXIuZXF1YWxzKHR5cGUsIFwiaGFzaGNoYW5nZVwiKSkge1xuICAgICAgICAgIGxpc3RlbmVycyA9IHRoaXMuX2hhc2hDaGFuZ2VMaXN0ZW5lcnM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobGlzdGVuZXJzICE9PSBudWxsKSB7XG4gICAgICAgICAgbGV0IGUgPSBkZXNlcmlhbGl6ZUdlbmVyaWNFdmVudChtc2dbJ2V2ZW50J10pO1xuICAgICAgICAgIC8vIFRoZXJlIHdhcyBhIHBvcFN0YXRlIG9yIGhhc2hDaGFuZ2UgZXZlbnQsIHNvIHRoZSBsb2NhdGlvbiBvYmplY3QgdGhhcyBiZWVuIHVwZGF0ZWRcbiAgICAgICAgICB0aGlzLl9sb2NhdGlvbiA9IHRoaXMuX3NlcmlhbGl6ZXIuZGVzZXJpYWxpemUobXNnWydsb2NhdGlvbiddLCBMb2NhdGlvblR5cGUpO1xuICAgICAgICAgIGxpc3RlbmVycy5mb3JFYWNoKChmbjogRnVuY3Rpb24pID0+IGZuKGUpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqKi9cbiAgaW5pdCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICB2YXIgYXJnczogVWlBcmd1bWVudHMgPSBuZXcgVWlBcmd1bWVudHMoXCJnZXRMb2NhdGlvblwiKTtcblxuICAgIHZhciBsb2NhdGlvblByb21pc2U6IFByb21pc2U8TG9jYXRpb25UeXBlPiA9IHRoaXMuX2Jyb2tlci5ydW5PblNlcnZpY2UoYXJncywgTG9jYXRpb25UeXBlKTtcbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIudGhlbihsb2NhdGlvblByb21pc2UsICh2YWw6IExvY2F0aW9uVHlwZSk6IGJvb2xlYW4gPT4ge1xuICAgICAgdGhpcy5fbG9jYXRpb24gPSB2YWw7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LCAoZXJyKTogYm9vbGVhbiA9PiB7IHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGVycik7IH0pO1xuICB9XG5cbiAgZ2V0QmFzZUhyZWZGcm9tRE9NKCk6IHN0cmluZyB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgIFwiQXR0ZW1wdCB0byBnZXQgYmFzZSBocmVmIGZyb20gRE9NIGZyb20gV2ViV29ya2VyLiBZb3UgbXVzdCBlaXRoZXIgcHJvdmlkZSBhIHZhbHVlIGZvciB0aGUgQVBQX0JBU0VfSFJFRiB0b2tlbiB0aHJvdWdoIERJIG9yIHVzZSB0aGUgaGFzaCBsb2NhdGlvbiBzdHJhdGVneS5cIik7XG4gIH1cblxuICBvblBvcFN0YXRlKGZuOiBVcmxDaGFuZ2VMaXN0ZW5lcik6IHZvaWQgeyB0aGlzLl9wb3BTdGF0ZUxpc3RlbmVycy5wdXNoKGZuKTsgfVxuXG4gIG9uSGFzaENoYW5nZShmbjogVXJsQ2hhbmdlTGlzdGVuZXIpOiB2b2lkIHsgdGhpcy5faGFzaENoYW5nZUxpc3RlbmVycy5wdXNoKGZuKTsgfVxuXG4gIGdldCBwYXRobmFtZSgpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLl9sb2NhdGlvbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2xvY2F0aW9uLnBhdGhuYW1lO1xuICB9XG5cbiAgZ2V0IHNlYXJjaCgpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLl9sb2NhdGlvbiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2xvY2F0aW9uLnNlYXJjaDtcbiAgfVxuXG4gIGdldCBoYXNoKCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuX2xvY2F0aW9uID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbG9jYXRpb24uaGFzaDtcbiAgfVxuXG4gIHNldCBwYXRobmFtZShuZXdQYXRoOiBzdHJpbmcpIHtcbiAgICBpZiAodGhpcy5fbG9jYXRpb24gPT09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFwiQXR0ZW1wdCB0byBzZXQgcGF0aG5hbWUgYmVmb3JlIHZhbHVlIGlzIG9idGFpbmVkIGZyb20gVUlcIik7XG4gICAgfVxuXG4gICAgdGhpcy5fbG9jYXRpb24ucGF0aG5hbWUgPSBuZXdQYXRoO1xuXG4gICAgdmFyIGZuQXJncyA9IFtuZXcgRm5BcmcobmV3UGF0aCwgUFJJTUlUSVZFKV07XG4gICAgdmFyIGFyZ3MgPSBuZXcgVWlBcmd1bWVudHMoXCJzZXRQYXRobmFtZVwiLCBmbkFyZ3MpO1xuICAgIHRoaXMuX2Jyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG4gIH1cblxuICBwdXNoU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB2YXIgZm5BcmdzID1cbiAgICAgICAgW25ldyBGbkFyZyhzdGF0ZSwgUFJJTUlUSVZFKSwgbmV3IEZuQXJnKHRpdGxlLCBQUklNSVRJVkUpLCBuZXcgRm5BcmcodXJsLCBQUklNSVRJVkUpXTtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cyhcInB1c2hTdGF0ZVwiLCBmbkFyZ3MpO1xuICAgIHRoaXMuX2Jyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG4gIH1cblxuICByZXBsYWNlU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgdXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB2YXIgZm5BcmdzID1cbiAgICAgICAgW25ldyBGbkFyZyhzdGF0ZSwgUFJJTUlUSVZFKSwgbmV3IEZuQXJnKHRpdGxlLCBQUklNSVRJVkUpLCBuZXcgRm5BcmcodXJsLCBQUklNSVRJVkUpXTtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cyhcInJlcGxhY2VTdGF0ZVwiLCBmbkFyZ3MpO1xuICAgIHRoaXMuX2Jyb2tlci5ydW5PblNlcnZpY2UoYXJncywgbnVsbCk7XG4gIH1cblxuICBmb3J3YXJkKCk6IHZvaWQge1xuICAgIHZhciBhcmdzID0gbmV3IFVpQXJndW1lbnRzKFwiZm9yd2FyZFwiKTtcbiAgICB0aGlzLl9icm9rZXIucnVuT25TZXJ2aWNlKGFyZ3MsIG51bGwpO1xuICB9XG5cbiAgYmFjaygpOiB2b2lkIHtcbiAgICB2YXIgYXJncyA9IG5ldyBVaUFyZ3VtZW50cyhcImJhY2tcIik7XG4gICAgdGhpcy5fYnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBudWxsKTtcbiAgfVxufVxuIl19