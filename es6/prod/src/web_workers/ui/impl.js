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
