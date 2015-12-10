var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { XHR } from 'angular2/src/compiler/xhr';
import { FnArg, UiArguments, ClientMessageBrokerFactory } from 'angular2/src/web_workers/shared/client_message_broker';
import { XHR_CHANNEL } from 'angular2/src/web_workers/shared/messaging_api';
/**
 * Implementation of compiler/xhr that relays XHR requests to the UI side where they are sent
 * and the result is proxied back to the worker
 */
export let WebWorkerXHRImpl = class extends XHR {
    constructor(messageBrokerFactory) {
        super();
        this._messageBroker = messageBrokerFactory.createMessageBroker(XHR_CHANNEL);
    }
    get(url) {
        var fnArgs = [new FnArg(url, null)];
        var args = new UiArguments("get", fnArgs);
        return this._messageBroker.runOnService(args, String);
    }
};
WebWorkerXHRImpl = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [ClientMessageBrokerFactory])
], WebWorkerXHRImpl);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyX2ltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvd29ya2VyL3hocl9pbXBsLnRzIl0sIm5hbWVzIjpbIldlYldvcmtlclhIUkltcGwiLCJXZWJXb3JrZXJYSFJJbXBsLmNvbnN0cnVjdG9yIiwiV2ViV29ya2VyWEhSSW1wbC5nZXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO09BRXhDLEVBQUMsR0FBRyxFQUFDLE1BQU0sMkJBQTJCO09BQ3RDLEVBQ0wsS0FBSyxFQUNMLFdBQVcsRUFFWCwwQkFBMEIsRUFDM0IsTUFBTSx1REFBdUQ7T0FDdkQsRUFBQyxXQUFXLEVBQUMsTUFBTSwrQ0FBK0M7QUFFekU7OztHQUdHO0FBQ0gsNENBQ3NDLEdBQUc7SUFHdkNBLFlBQVlBLG9CQUFnREE7UUFDMURDLE9BQU9BLENBQUNBO1FBQ1JBLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLG9CQUFvQkEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtJQUM5RUEsQ0FBQ0E7SUFFREQsR0FBR0EsQ0FBQ0EsR0FBV0E7UUFDYkUsSUFBSUEsTUFBTUEsR0FBWUEsQ0FBQ0EsSUFBSUEsS0FBS0EsQ0FBQ0EsR0FBR0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDN0NBLElBQUlBLElBQUlBLEdBQWdCQSxJQUFJQSxXQUFXQSxDQUFDQSxLQUFLQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUN2REEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsSUFBSUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDeERBLENBQUNBO0FBQ0hGLENBQUNBO0FBZEQ7SUFBQyxVQUFVLEVBQUU7O3FCQWNaO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7UHJvbWlzZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1hIUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3hocic7XG5pbXBvcnQge1xuICBGbkFyZyxcbiAgVWlBcmd1bWVudHMsXG4gIENsaWVudE1lc3NhZ2VCcm9rZXIsXG4gIENsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5XG59IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvY2xpZW50X21lc3NhZ2VfYnJva2VyJztcbmltcG9ydCB7WEhSX0NIQU5ORUx9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvbWVzc2FnaW5nX2FwaSc7XG5cbi8qKlxuICogSW1wbGVtZW50YXRpb24gb2YgY29tcGlsZXIveGhyIHRoYXQgcmVsYXlzIFhIUiByZXF1ZXN0cyB0byB0aGUgVUkgc2lkZSB3aGVyZSB0aGV5IGFyZSBzZW50XG4gKiBhbmQgdGhlIHJlc3VsdCBpcyBwcm94aWVkIGJhY2sgdG8gdGhlIHdvcmtlclxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgV2ViV29ya2VyWEhSSW1wbCBleHRlbmRzIFhIUiB7XG4gIHByaXZhdGUgX21lc3NhZ2VCcm9rZXI6IENsaWVudE1lc3NhZ2VCcm9rZXI7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZUJyb2tlckZhY3Rvcnk6IENsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9tZXNzYWdlQnJva2VyID0gbWVzc2FnZUJyb2tlckZhY3RvcnkuY3JlYXRlTWVzc2FnZUJyb2tlcihYSFJfQ0hBTk5FTCk7XG4gIH1cblxuICBnZXQodXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHZhciBmbkFyZ3M6IEZuQXJnW10gPSBbbmV3IEZuQXJnKHVybCwgbnVsbCldO1xuICAgIHZhciBhcmdzOiBVaUFyZ3VtZW50cyA9IG5ldyBVaUFyZ3VtZW50cyhcImdldFwiLCBmbkFyZ3MpO1xuICAgIHJldHVybiB0aGlzLl9tZXNzYWdlQnJva2VyLnJ1bk9uU2VydmljZShhcmdzLCBTdHJpbmcpO1xuICB9XG59XG4iXX0=