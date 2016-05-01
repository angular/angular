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
import { FnArg, UiArguments, ClientMessageBrokerFactory } from 'angular2/src/web_workers/shared/client_message_broker';
import { PlatformLocation } from 'angular2/platform/common';
import { ROUTER_CHANNEL } from 'angular2/src/web_workers/shared/messaging_api';
import { LocationType } from 'angular2/src/web_workers/shared/serialized_types';
import { PromiseWrapper, ObservableWrapper } from 'angular2/src/facade/async';
import { BaseException } from 'angular2/src/facade/exceptions';
import { PRIMITIVE, Serializer } from 'angular2/src/web_workers/shared/serializer';
import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { StringWrapper } from 'angular2/src/facade/lang';
import { deserializeGenericEvent } from './event_deserializer';
export let WebWorkerPlatformLocation = class WebWorkerPlatformLocation extends PlatformLocation {
    constructor(brokerFactory, bus, _serializer) {
        super();
        this._serializer = _serializer;
        this._popStateListeners = [];
        this._hashChangeListeners = [];
        this._location = null;
        this._broker = brokerFactory.createMessageBroker(ROUTER_CHANNEL);
        this._channelSource = bus.from(ROUTER_CHANNEL);
        ObservableWrapper.subscribe(this._channelSource, (msg) => {
            var listeners = null;
            if (StringMapWrapper.contains(msg, 'event')) {
                let type = msg['event']['type'];
                if (StringWrapper.equals(type, "popstate")) {
                    listeners = this._popStateListeners;
                }
                else if (StringWrapper.equals(type, "hashchange")) {
                    listeners = this._hashChangeListeners;
                }
                if (listeners !== null) {
                    let e = deserializeGenericEvent(msg['event']);
                    // There was a popState or hashChange event, so the location object thas been updated
                    this._location = this._serializer.deserialize(msg['location'], LocationType);
                    listeners.forEach((fn) => fn(e));
                }
            }
        });
    }
    /** @internal **/
    init() {
        var args = new UiArguments("getLocation");
        var locationPromise = this._broker.runOnService(args, LocationType);
        return PromiseWrapper.then(locationPromise, (val) => {
            this._location = val;
            return true;
        }, (err) => { throw new BaseException(err); });
    }
    getBaseHrefFromDOM() {
        throw new BaseException("Attempt to get base href from DOM from WebWorker. You must either provide a value for the APP_BASE_HREF token through DI or use the hash location strategy.");
    }
    onPopState(fn) { this._popStateListeners.push(fn); }
    onHashChange(fn) { this._hashChangeListeners.push(fn); }
    get pathname() {
        if (this._location === null) {
            return null;
        }
        return this._location.pathname;
    }
    get search() {
        if (this._location === null) {
            return null;
        }
        return this._location.search;
    }
    get hash() {
        if (this._location === null) {
            return null;
        }
        return this._location.hash;
    }
    set pathname(newPath) {
        if (this._location === null) {
            throw new BaseException("Attempt to set pathname before value is obtained from UI");
        }
        this._location.pathname = newPath;
        var fnArgs = [new FnArg(newPath, PRIMITIVE)];
        var args = new UiArguments("setPathname", fnArgs);
        this._broker.runOnService(args, null);
    }
    pushState(state, title, url) {
        var fnArgs = [new FnArg(state, PRIMITIVE), new FnArg(title, PRIMITIVE), new FnArg(url, PRIMITIVE)];
        var args = new UiArguments("pushState", fnArgs);
        this._broker.runOnService(args, null);
    }
    replaceState(state, title, url) {
        var fnArgs = [new FnArg(state, PRIMITIVE), new FnArg(title, PRIMITIVE), new FnArg(url, PRIMITIVE)];
        var args = new UiArguments("replaceState", fnArgs);
        this._broker.runOnService(args, null);
    }
    forward() {
        var args = new UiArguments("forward");
        this._broker.runOnService(args, null);
    }
    back() {
        var args = new UiArguments("back");
        this._broker.runOnService(args, null);
    }
};
WebWorkerPlatformLocation = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [ClientMessageBrokerFactory, MessageBus, Serializer])
], WebWorkerPlatformLocation);
