/*
 * This file is the entry point for the main thread
 * It takes care of spawning the worker and sending it the initial init message
 * It also acts and the messenger between the worker thread and the renderer running on the UI
 * thread
*/
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
import { createInjector } from "./di_bindings";
import { createNgZone } from 'angular2/src/core/application_ref';
import { Injectable } from 'angular2/src/core/di';
import { BrowserDomAdapter } from 'angular2/src/platform/browser/browser_adapter';
import { wtfInit } from 'angular2/src/core/profile/wtf_init';
import { WebWorkerSetup } from 'angular2/src/web_workers/ui/setup';
import { MessageBasedRenderer } from 'angular2/src/web_workers/ui/renderer';
import { MessageBasedXHRImpl } from 'angular2/src/web_workers/ui/xhr_impl';
import { ClientMessageBrokerFactory } from 'angular2/src/web_workers/shared/client_message_broker';
import { ServiceMessageBrokerFactory } from 'angular2/src/web_workers/shared/service_message_broker';
/**
 * Creates a zone, sets up the DI providers
 * And then creates a new WebWorkerMain object to handle messages from the worker
 */
export function bootstrapUICommon(bus) {
    BrowserDomAdapter.makeCurrent();
    var zone = createNgZone();
    wtfInit();
    bus.attachToZone(zone);
    return zone.run(() => {
        var injector = createInjector(zone, bus);
        injector.get(MessageBasedRenderer).start();
        injector.get(MessageBasedXHRImpl).start();
        injector.get(WebWorkerSetup).start();
        return injector.get(WebWorkerApplication);
    });
}
export let WebWorkerApplication = class {
    constructor(_clientMessageBrokerFactory, _serviceMessageBrokerFactory) {
        this._clientMessageBrokerFactory = _clientMessageBrokerFactory;
        this._serviceMessageBrokerFactory = _serviceMessageBrokerFactory;
    }
    createClientMessageBroker(channel, runInZone = true) {
        return this._clientMessageBrokerFactory.createMessageBroker(channel, runInZone);
    }
    createServiceMessageBroker(channel, runInZone = true) {
        return this._serviceMessageBrokerFactory.createMessageBroker(channel, runInZone);
    }
};
WebWorkerApplication = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [ClientMessageBrokerFactory, ServiceMessageBrokerFactory])
], WebWorkerApplication);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1wbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy91aS9pbXBsLnRzIl0sIm5hbWVzIjpbImJvb3RzdHJhcFVJQ29tbW9uIiwiV2ViV29ya2VyQXBwbGljYXRpb24iLCJXZWJXb3JrZXJBcHBsaWNhdGlvbi5jb25zdHJ1Y3RvciIsIldlYldvcmtlckFwcGxpY2F0aW9uLmNyZWF0ZUNsaWVudE1lc3NhZ2VCcm9rZXIiLCJXZWJXb3JrZXJBcHBsaWNhdGlvbi5jcmVhdGVTZXJ2aWNlTWVzc2FnZUJyb2tlciJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0VBS0U7Ozs7Ozs7Ozs7OztPQUVLLEVBQUMsY0FBYyxFQUFDLE1BQU0sZUFBZTtPQUVyQyxFQUFDLFlBQVksRUFBQyxNQUFNLG1DQUFtQztPQUN2RCxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtPQUN4QyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sK0NBQStDO09BQ3hFLEVBQUMsT0FBTyxFQUFDLE1BQU0sb0NBQW9DO09BQ25ELEVBQUMsY0FBYyxFQUFDLE1BQU0sbUNBQW1DO09BQ3pELEVBQUMsb0JBQW9CLEVBQUMsTUFBTSxzQ0FBc0M7T0FDbEUsRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHNDQUFzQztPQUNqRSxFQUNMLDBCQUEwQixFQUUzQixNQUFNLHVEQUF1RDtPQUN2RCxFQUNMLDJCQUEyQixFQUU1QixNQUFNLHdEQUF3RDtBQUUvRDs7O0dBR0c7QUFDSCxrQ0FBa0MsR0FBZTtJQUMvQ0EsaUJBQWlCQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtJQUNoQ0EsSUFBSUEsSUFBSUEsR0FBR0EsWUFBWUEsRUFBRUEsQ0FBQ0E7SUFDMUJBLE9BQU9BLEVBQUVBLENBQUNBO0lBQ1ZBLEdBQUdBLENBQUNBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO0lBQ3ZCQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQTtRQUNkQSxJQUFJQSxRQUFRQSxHQUFHQSxjQUFjQSxDQUFDQSxJQUFJQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUN6Q0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtRQUMzQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtRQUMxQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7UUFDckNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLEdBQUdBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0E7SUFDNUNBLENBQUNBLENBQUNBLENBQUNBO0FBQ0xBLENBQUNBO0FBRUQ7SUFFRUMsWUFBb0JBLDJCQUF1REEsRUFDdkRBLDRCQUF5REE7UUFEekRDLGdDQUEyQkEsR0FBM0JBLDJCQUEyQkEsQ0FBNEJBO1FBQ3ZEQSxpQ0FBNEJBLEdBQTVCQSw0QkFBNEJBLENBQTZCQTtJQUFHQSxDQUFDQTtJQUVqRkQseUJBQXlCQSxDQUFDQSxPQUFlQSxFQUFFQSxTQUFTQSxHQUFZQSxJQUFJQTtRQUNsRUUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsMkJBQTJCQSxDQUFDQSxtQkFBbUJBLENBQUNBLE9BQU9BLEVBQUVBLFNBQVNBLENBQUNBLENBQUNBO0lBQ2xGQSxDQUFDQTtJQUVERiwwQkFBMEJBLENBQUNBLE9BQWVBLEVBQUVBLFNBQVNBLEdBQVlBLElBQUlBO1FBQ25FRyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSw0QkFBNEJBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsT0FBT0EsRUFBRUEsU0FBU0EsQ0FBQ0EsQ0FBQ0E7SUFDbkZBLENBQUNBO0FBQ0hILENBQUNBO0FBWkQ7SUFBQyxVQUFVLEVBQUU7O3lCQVlaO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogVGhpcyBmaWxlIGlzIHRoZSBlbnRyeSBwb2ludCBmb3IgdGhlIG1haW4gdGhyZWFkXG4gKiBJdCB0YWtlcyBjYXJlIG9mIHNwYXduaW5nIHRoZSB3b3JrZXIgYW5kIHNlbmRpbmcgaXQgdGhlIGluaXRpYWwgaW5pdCBtZXNzYWdlXG4gKiBJdCBhbHNvIGFjdHMgYW5kIHRoZSBtZXNzZW5nZXIgYmV0d2VlbiB0aGUgd29ya2VyIHRocmVhZCBhbmQgdGhlIHJlbmRlcmVyIHJ1bm5pbmcgb24gdGhlIFVJXG4gKiB0aHJlYWRcbiovXG5cbmltcG9ydCB7Y3JlYXRlSW5qZWN0b3J9IGZyb20gXCIuL2RpX2JpbmRpbmdzXCI7XG5pbXBvcnQge01lc3NhZ2VCdXMsIE1lc3NhZ2VCdXNTaW5rfSBmcm9tIFwiYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdlX2J1c1wiO1xuaW1wb3J0IHtjcmVhdGVOZ1pvbmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2FwcGxpY2F0aW9uX3JlZic7XG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7QnJvd3NlckRvbUFkYXB0ZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9icm93c2VyL2Jyb3dzZXJfYWRhcHRlcic7XG5pbXBvcnQge3d0ZkluaXR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3Byb2ZpbGUvd3RmX2luaXQnO1xuaW1wb3J0IHtXZWJXb3JrZXJTZXR1cH0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3VpL3NldHVwJztcbmltcG9ydCB7TWVzc2FnZUJhc2VkUmVuZGVyZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy91aS9yZW5kZXJlcic7XG5pbXBvcnQge01lc3NhZ2VCYXNlZFhIUkltcGx9IGZyb20gJ2FuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy91aS94aHJfaW1wbCc7XG5pbXBvcnQge1xuICBDbGllbnRNZXNzYWdlQnJva2VyRmFjdG9yeSxcbiAgQ2xpZW50TWVzc2FnZUJyb2tlcixcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9jbGllbnRfbWVzc2FnZV9icm9rZXInO1xuaW1wb3J0IHtcbiAgU2VydmljZU1lc3NhZ2VCcm9rZXJGYWN0b3J5LFxuICBTZXJ2aWNlTWVzc2FnZUJyb2tlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3NlcnZpY2VfbWVzc2FnZV9icm9rZXInO1xuXG4vKipcbiAqIENyZWF0ZXMgYSB6b25lLCBzZXRzIHVwIHRoZSBESSBwcm92aWRlcnNcbiAqIEFuZCB0aGVuIGNyZWF0ZXMgYSBuZXcgV2ViV29ya2VyTWFpbiBvYmplY3QgdG8gaGFuZGxlIG1lc3NhZ2VzIGZyb20gdGhlIHdvcmtlclxuICovXG5leHBvcnQgZnVuY3Rpb24gYm9vdHN0cmFwVUlDb21tb24oYnVzOiBNZXNzYWdlQnVzKTogV2ViV29ya2VyQXBwbGljYXRpb24ge1xuICBCcm93c2VyRG9tQWRhcHRlci5tYWtlQ3VycmVudCgpO1xuICB2YXIgem9uZSA9IGNyZWF0ZU5nWm9uZSgpO1xuICB3dGZJbml0KCk7XG4gIGJ1cy5hdHRhY2hUb1pvbmUoem9uZSk7XG4gIHJldHVybiB6b25lLnJ1bigoKSA9PiB7XG4gICAgdmFyIGluamVjdG9yID0gY3JlYXRlSW5qZWN0b3Ioem9uZSwgYnVzKTtcbiAgICBpbmplY3Rvci5nZXQoTWVzc2FnZUJhc2VkUmVuZGVyZXIpLnN0YXJ0KCk7XG4gICAgaW5qZWN0b3IuZ2V0KE1lc3NhZ2VCYXNlZFhIUkltcGwpLnN0YXJ0KCk7XG4gICAgaW5qZWN0b3IuZ2V0KFdlYldvcmtlclNldHVwKS5zdGFydCgpO1xuICAgIHJldHVybiBpbmplY3Rvci5nZXQoV2ViV29ya2VyQXBwbGljYXRpb24pO1xuICB9KTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFdlYldvcmtlckFwcGxpY2F0aW9uIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfY2xpZW50TWVzc2FnZUJyb2tlckZhY3Rvcnk6IENsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5LFxuICAgICAgICAgICAgICBwcml2YXRlIF9zZXJ2aWNlTWVzc2FnZUJyb2tlckZhY3Rvcnk6IFNlcnZpY2VNZXNzYWdlQnJva2VyRmFjdG9yeSkge31cblxuICBjcmVhdGVDbGllbnRNZXNzYWdlQnJva2VyKGNoYW5uZWw6IHN0cmluZywgcnVuSW5ab25lOiBib29sZWFuID0gdHJ1ZSk6IENsaWVudE1lc3NhZ2VCcm9rZXIge1xuICAgIHJldHVybiB0aGlzLl9jbGllbnRNZXNzYWdlQnJva2VyRmFjdG9yeS5jcmVhdGVNZXNzYWdlQnJva2VyKGNoYW5uZWwsIHJ1bkluWm9uZSk7XG4gIH1cblxuICBjcmVhdGVTZXJ2aWNlTWVzc2FnZUJyb2tlcihjaGFubmVsOiBzdHJpbmcsIHJ1bkluWm9uZTogYm9vbGVhbiA9IHRydWUpOiBTZXJ2aWNlTWVzc2FnZUJyb2tlciB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZpY2VNZXNzYWdlQnJva2VyRmFjdG9yeS5jcmVhdGVNZXNzYWdlQnJva2VyKGNoYW5uZWwsIHJ1bkluWm9uZSk7XG4gIH1cbn1cbiJdfQ==