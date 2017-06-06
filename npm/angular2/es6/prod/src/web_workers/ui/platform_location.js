var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BrowserPlatformLocation } from 'angular2/src/platform/browser/location/browser_platform_location';
import { Injectable } from 'angular2/src/core/di';
import { ROUTER_CHANNEL } from 'angular2/src/web_workers/shared/messaging_api';
import { ServiceMessageBrokerFactory } from 'angular2/src/web_workers/shared/service_message_broker';
import { PRIMITIVE, Serializer } from 'angular2/src/web_workers/shared/serializer';
import { bind } from './bind';
import { LocationType } from 'angular2/src/web_workers/shared/serialized_types';
import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
import { ObservableWrapper, PromiseWrapper } from 'angular2/src/facade/async';
export let MessageBasedPlatformLocation = class MessageBasedPlatformLocation {
    constructor(_brokerFactory, _platformLocation, bus, _serializer) {
        this._brokerFactory = _brokerFactory;
        this._platformLocation = _platformLocation;
        this._serializer = _serializer;
        this._platformLocation.onPopState(bind(this._sendUrlChangeEvent, this));
        this._platformLocation.onHashChange(bind(this._sendUrlChangeEvent, this));
        this._broker = this._brokerFactory.createMessageBroker(ROUTER_CHANNEL);
        this._channelSink = bus.to(ROUTER_CHANNEL);
    }
    start() {
        this._broker.registerMethod("getLocation", null, bind(this._getLocation, this), LocationType);
        this._broker.registerMethod("setPathname", [PRIMITIVE], bind(this._setPathname, this));
        this._broker.registerMethod("pushState", [PRIMITIVE, PRIMITIVE, PRIMITIVE], bind(this._platformLocation.pushState, this._platformLocation));
        this._broker.registerMethod("replaceState", [PRIMITIVE, PRIMITIVE, PRIMITIVE], bind(this._platformLocation.replaceState, this._platformLocation));
        this._broker.registerMethod("forward", null, bind(this._platformLocation.forward, this._platformLocation));
        this._broker.registerMethod("back", null, bind(this._platformLocation.back, this._platformLocation));
    }
    _getLocation() {
        return PromiseWrapper.resolve(this._platformLocation.location);
    }
    _sendUrlChangeEvent(e) {
        let loc = this._serializer.serialize(this._platformLocation.location, LocationType);
        let serializedEvent = { 'type': e.type };
        ObservableWrapper.callEmit(this._channelSink, { 'event': serializedEvent, 'location': loc });
    }
    _setPathname(pathname) { this._platformLocation.pathname = pathname; }
};
MessageBasedPlatformLocation = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [ServiceMessageBrokerFactory, BrowserPlatformLocation, MessageBus, Serializer])
], MessageBasedPlatformLocation);
