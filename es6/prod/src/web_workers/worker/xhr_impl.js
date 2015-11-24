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
//# sourceMappingURL=xhr_impl.js.map