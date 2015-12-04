'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
var serializer_1 = require('angular2/src/web_workers/shared/serializer');
var messaging_api_1 = require('angular2/src/web_workers/shared/messaging_api');
var xhr_1 = require('angular2/src/compiler/xhr');
var service_message_broker_1 = require('angular2/src/web_workers/shared/service_message_broker');
var bind_1 = require('./bind');
var MessageBasedXHRImpl = (function () {
    function MessageBasedXHRImpl(_brokerFactory, _xhr) {
        this._brokerFactory = _brokerFactory;
        this._xhr = _xhr;
    }
    MessageBasedXHRImpl.prototype.start = function () {
        var broker = this._brokerFactory.createMessageBroker(messaging_api_1.XHR_CHANNEL);
        broker.registerMethod("get", [serializer_1.PRIMITIVE], bind_1.bind(this._xhr.get, this._xhr), serializer_1.PRIMITIVE);
    };
    MessageBasedXHRImpl = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [service_message_broker_1.ServiceMessageBrokerFactory, xhr_1.XHR])
    ], MessageBasedXHRImpl);
    return MessageBasedXHRImpl;
})();
exports.MessageBasedXHRImpl = MessageBasedXHRImpl;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyX2ltcGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvdWkveGhyX2ltcGwudHMiXSwibmFtZXMiOlsiTWVzc2FnZUJhc2VkWEhSSW1wbCIsIk1lc3NhZ2VCYXNlZFhIUkltcGwuY29uc3RydWN0b3IiLCJNZXNzYWdlQmFzZWRYSFJJbXBsLnN0YXJ0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBQ2hELDJCQUF3Qiw0Q0FBNEMsQ0FBQyxDQUFBO0FBQ3JFLDhCQUEwQiwrQ0FBK0MsQ0FBQyxDQUFBO0FBQzFFLG9CQUFrQiwyQkFBMkIsQ0FBQyxDQUFBO0FBQzlDLHVDQUEwQyx3REFBd0QsQ0FBQyxDQUFBO0FBQ25HLHFCQUFtQixRQUFRLENBQUMsQ0FBQTtBQUU1QjtJQUVFQSw2QkFBb0JBLGNBQTJDQSxFQUFVQSxJQUFTQTtRQUE5REMsbUJBQWNBLEdBQWRBLGNBQWNBLENBQTZCQTtRQUFVQSxTQUFJQSxHQUFKQSxJQUFJQSxDQUFLQTtJQUFHQSxDQUFDQTtJQUV0RkQsbUNBQUtBLEdBQUxBO1FBQ0VFLElBQUlBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsMkJBQVdBLENBQUNBLENBQUNBO1FBQ2xFQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQSxzQkFBU0EsQ0FBQ0EsRUFBRUEsV0FBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsRUFBRUEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsc0JBQVNBLENBQUNBLENBQUNBO0lBQ3ZGQSxDQUFDQTtJQVBIRjtRQUFDQSxlQUFVQSxFQUFFQTs7NEJBUVpBO0lBQURBLDBCQUFDQTtBQUFEQSxDQUFDQSxBQVJELElBUUM7QUFQWSwyQkFBbUIsc0JBTy9CLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7UFJJTUlUSVZFfSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3NlcmlhbGl6ZXInO1xuaW1wb3J0IHtYSFJfQ0hBTk5FTH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdpbmdfYXBpJztcbmltcG9ydCB7WEhSfSBmcm9tICdhbmd1bGFyMi9zcmMvY29tcGlsZXIveGhyJztcbmltcG9ydCB7U2VydmljZU1lc3NhZ2VCcm9rZXJGYWN0b3J5fSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3NlcnZpY2VfbWVzc2FnZV9icm9rZXInO1xuaW1wb3J0IHtiaW5kfSBmcm9tICcuL2JpbmQnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTWVzc2FnZUJhc2VkWEhSSW1wbCB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX2Jyb2tlckZhY3Rvcnk6IFNlcnZpY2VNZXNzYWdlQnJva2VyRmFjdG9yeSwgcHJpdmF0ZSBfeGhyOiBYSFIpIHt9XG5cbiAgc3RhcnQoKTogdm9pZCB7XG4gICAgdmFyIGJyb2tlciA9IHRoaXMuX2Jyb2tlckZhY3RvcnkuY3JlYXRlTWVzc2FnZUJyb2tlcihYSFJfQ0hBTk5FTCk7XG4gICAgYnJva2VyLnJlZ2lzdGVyTWV0aG9kKFwiZ2V0XCIsIFtQUklNSVRJVkVdLCBiaW5kKHRoaXMuX3hoci5nZXQsIHRoaXMuX3hociksIFBSSU1JVElWRSk7XG4gIH1cbn1cbiJdfQ==