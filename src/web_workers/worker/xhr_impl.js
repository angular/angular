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
var xhr_1 = require('angular2/src/compiler/xhr');
var client_message_broker_1 = require('angular2/src/web_workers/shared/client_message_broker');
var messaging_api_1 = require('angular2/src/web_workers/shared/messaging_api');
/**
 * Implementation of compiler/xhr that relays XHR requests to the UI side where they are sent
 * and the result is proxied back to the worker
 */
var WebWorkerXHRImpl = (function (_super) {
    __extends(WebWorkerXHRImpl, _super);
    function WebWorkerXHRImpl(messageBrokerFactory) {
        _super.call(this);
        this._messageBroker = messageBrokerFactory.createMessageBroker(messaging_api_1.XHR_CHANNEL);
    }
    WebWorkerXHRImpl.prototype.get = function (url) {
        var fnArgs = [new client_message_broker_1.FnArg(url, null)];
        var args = new client_message_broker_1.UiArguments("get", fnArgs);
        return this._messageBroker.runOnService(args, String);
    };
    WebWorkerXHRImpl = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [client_message_broker_1.ClientMessageBrokerFactory])
    ], WebWorkerXHRImpl);
    return WebWorkerXHRImpl;
})(xhr_1.XHR);
exports.WebWorkerXHRImpl = WebWorkerXHRImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyX2ltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvd29ya2VyL3hocl9pbXBsLnRzIl0sIm5hbWVzIjpbIldlYldvcmtlclhIUkltcGwiLCJXZWJXb3JrZXJYSFJJbXBsLmNvbnN0cnVjdG9yIiwiV2ViV29ya2VyWEhSSW1wbC5nZXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsbUJBQXlCLHNCQUFzQixDQUFDLENBQUE7QUFFaEQsb0JBQWtCLDJCQUEyQixDQUFDLENBQUE7QUFDOUMsc0NBS08sdURBQXVELENBQUMsQ0FBQTtBQUMvRCw4QkFBMEIsK0NBQStDLENBQUMsQ0FBQTtBQUUxRTs7O0dBR0c7QUFDSDtJQUNzQ0Esb0NBQUdBO0lBR3ZDQSwwQkFBWUEsb0JBQWdEQTtRQUMxREMsaUJBQU9BLENBQUNBO1FBQ1JBLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLG9CQUFvQkEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSwyQkFBV0EsQ0FBQ0EsQ0FBQ0E7SUFDOUVBLENBQUNBO0lBRURELDhCQUFHQSxHQUFIQSxVQUFJQSxHQUFXQTtRQUNiRSxJQUFJQSxNQUFNQSxHQUFZQSxDQUFDQSxJQUFJQSw2QkFBS0EsQ0FBQ0EsR0FBR0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDN0NBLElBQUlBLElBQUlBLEdBQWdCQSxJQUFJQSxtQ0FBV0EsQ0FBQ0EsS0FBS0EsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFDdkRBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO0lBQ3hEQSxDQUFDQTtJQWJIRjtRQUFDQSxlQUFVQSxFQUFFQTs7eUJBY1pBO0lBQURBLHVCQUFDQTtBQUFEQSxDQUFDQSxBQWRELEVBQ3NDLFNBQUcsRUFheEM7QUFiWSx3QkFBZ0IsbUJBYTVCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7UHJvbWlzZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1hIUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3hocic7XG5pbXBvcnQge1xuICBGbkFyZyxcbiAgVWlBcmd1bWVudHMsXG4gIENsaWVudE1lc3NhZ2VCcm9rZXIsXG4gIENsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5XG59IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvY2xpZW50X21lc3NhZ2VfYnJva2VyJztcbmltcG9ydCB7WEhSX0NIQU5ORUx9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvbWVzc2FnaW5nX2FwaSc7XG5cbi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgY29tcGlsZXIveGhyIHRoYXQgcmVsYXlzIFhIUiByZXF1ZXN0cyB0byB0aGUgVUkgc2lkZSB3aGVyZSB0aGV5IGFyZSBzZW50XG4gKiBhbmQgdGhlIHJlc3VsdCBpcyBwcm94aWVkIGJhY2sgdG8gdGhlIHdvcmtlclxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgV2ViV29ya2VyWEhSSW1wbCBleHRlbmRzIFhIUiB7XG4gIHByaXZhdGUgX21lc3NhZ2VCcm9rZXI6IENsaWVudE1lc3NhZ2VCcm9rZXI7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZUJyb2tlckZhY3Rvcnk6IENsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyID0gbWVzc2FnZUJyb2tlckZhY3RvcnkuY3JlYXRlTWVzc2FnZUJyb2tlcihYSFJfQ0hBTk5FTCk7XG4gIH1cblxuICBnZXQodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHZhciBmbkFyZ3M6IEZuQXJnW10gPSBbbmV3IEZuQXJnKHVybCwgbnVsbCldO1xuICAgIHZhciBhcmdzOiBVaUFyZ3VtZW50cyA9IG5ldyBVaUFyZ3VtZW50cyhcImdldFwiLCBmbkFyZ3MpO1xuICAgIHJldHVybiB0aGlzLl9tZXNzYWdlQnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBTdHJpbmcpO1xuICB9XG59XG4iXX0=