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
export let WebWorkerXHRImpl = class WebWorkerXHRImpl extends XHR {
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
