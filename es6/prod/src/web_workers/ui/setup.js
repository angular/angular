var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { SETUP_CHANNEL } from 'angular2/src/web_workers/shared/messaging_api';
import { ObservableWrapper } from 'angular2/src/facade/async';
import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
import { AnchorBasedAppRootUrl } from 'angular2/src/compiler/anchor_based_app_root_url';
import { StringWrapper } from 'angular2/src/facade/lang';
import { Injectable } from 'angular2/src/core/di';
export let WebWorkerSetup = class {
    constructor(_bus, anchorBasedAppRootUrl) {
        this._bus = _bus;
        this.rootUrl = anchorBasedAppRootUrl.value;
    }
    start() {
        this._bus.initChannel(SETUP_CHANNEL, false);
        var sink = this._bus.to(SETUP_CHANNEL);
        var source = this._bus.from(SETUP_CHANNEL);
        ObservableWrapper.subscribe(source, (message) => {
            if (StringWrapper.equals(message, "ready")) {
                ObservableWrapper.callEmit(sink, { "rootUrl": this.rootUrl });
            }
        });
    }
};
WebWorkerSetup = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [MessageBus, AnchorBasedAppRootUrl])
], WebWorkerSetup);
