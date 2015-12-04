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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyX2ltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvd29ya2VyL3hocl9pbXBsLnRzIl0sIm5hbWVzIjpbIldlYldvcmtlclhIUkltcGwiLCJXZWJXb3JrZXJYSFJJbXBsLmNvbnN0cnVjdG9yIiwiV2ViV29ya2VyWEhSSW1wbC5nZXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxtQkFBeUIsc0JBQXNCLENBQUMsQ0FBQTtBQUVoRCxvQkFBa0IsMkJBQTJCLENBQUMsQ0FBQTtBQUM5QyxzQ0FLTyx1REFBdUQsQ0FBQyxDQUFBO0FBQy9ELDhCQUEwQiwrQ0FBK0MsQ0FBQyxDQUFBO0FBRTFFOzs7R0FHRztBQUNIO0lBQ3NDQSxvQ0FBR0E7SUFHdkNBLDBCQUFZQSxvQkFBZ0RBO1FBQzFEQyxpQkFBT0EsQ0FBQ0E7UUFDUkEsSUFBSUEsQ0FBQ0EsY0FBY0EsR0FBR0Esb0JBQW9CQSxDQUFDQSxtQkFBbUJBLENBQUNBLDJCQUFXQSxDQUFDQSxDQUFDQTtJQUM5RUEsQ0FBQ0E7SUFFREQsOEJBQUdBLEdBQUhBLFVBQUlBLEdBQVdBO1FBQ2JFLElBQUlBLE1BQU1BLEdBQVlBLENBQUNBLElBQUlBLDZCQUFLQSxDQUFDQSxHQUFHQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM3Q0EsSUFBSUEsSUFBSUEsR0FBZ0JBLElBQUlBLG1DQUFXQSxDQUFDQSxLQUFLQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUN2REEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsSUFBSUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDeERBLENBQUNBO0lBYkhGO1FBQUNBLGVBQVVBLEVBQUVBOzt5QkFjWkE7SUFBREEsdUJBQUNBO0FBQURBLENBQUNBLEFBZEQsRUFDc0MsU0FBRyxFQWF4QztBQWJZLHdCQUFnQixtQkFhNUIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtQcm9taXNlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7WEhSfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIveGhyJztcbmltcG9ydCB7XG4gIEZuQXJnLFxuICBVaUFyZ3VtZW50cyxcbiAgQ2xpZW50TWVzc2FnZUJyb2tlcixcbiAgQ2xpZW50TWVzc2FnZUJyb2tlckZhY3Rvcnlcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9jbGllbnRfbWVzc2FnZV9icm9rZXInO1xuaW1wb3J0IHtYSFJfQ0hBTk5FTH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdpbmdfYXBpJztcblxuLyoqXG4gKiBJbXBsZW1lbnRhdGlvbiBvZiBjb21waWxlci94aHIgdGhhdCByZWxheXMgWEhSIHJlcXVlc3RzIHRvIHRoZSBVSSBzaWRlIHdoZXJlIHRoZXkgYXJlIHNlbnRcbiAqIGFuZCB0aGUgcmVzdWx0IGlzIHByb3hpZWQgYmFjayB0byB0aGUgd29ya2VyXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBXZWJXb3JrZXJYSFJJbXBsIGV4dGVuZHMgWEhSIHtcbiAgcHJpdmF0ZSBfbWVzc2FnZUJyb2tlcjogQ2xpZW50TWVzc2FnZUJyb2tlcjtcblxuICBjb25zdHJ1Y3RvcihtZXNzYWdlQnJva2VyRmFjdG9yeTogQ2xpZW50TWVzc2FnZUJyb2tlckZhY3RvcnkpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX21lc3NhZ2VCcm9rZXIgPSBtZXNzYWdlQnJva2VyRmFjdG9yeS5jcmVhdGVNZXNzYWdlQnJva2VyKFhIUl9DSEFOTkVMKTtcbiAgfVxuXG4gIGdldCh1cmw6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgdmFyIGZuQXJnczogRm5BcmdbXSA9IFtuZXcgRm5BcmcodXJsLCBudWxsKV07XG4gICAgdmFyIGFyZ3M6IFVpQXJndW1lbnRzID0gbmV3IFVpQXJndW1lbnRzKFwiZ2V0XCIsIGZuQXJncyk7XG4gICAgcmV0dXJuIHRoaXMuX21lc3NhZ2VCcm9rZXIucnVuT25TZXJ2aWNlKGFyZ3MsIFN0cmluZyk7XG4gIH1cbn1cbiJdfQ==