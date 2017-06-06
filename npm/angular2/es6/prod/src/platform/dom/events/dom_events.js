var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
import { Injectable } from 'angular2/core';
import { EventManagerPlugin } from './event_manager';
export let DomEventsPlugin = class DomEventsPlugin extends EventManagerPlugin {
    // This plugin should come last in the list of plugins, because it accepts all
    // events.
    supports(eventName) { return true; }
    addEventListener(element, eventName, handler) {
        var zone = this.manager.getZone();
        var outsideHandler = (event) => zone.runGuarded(() => handler(event));
        return this.manager.getZone().runOutsideAngular(() => DOM.onAndCancel(element, eventName, outsideHandler));
    }
    addGlobalEventListener(target, eventName, handler) {
        var element = DOM.getGlobalEventTarget(target);
        var zone = this.manager.getZone();
        var outsideHandler = (event) => zone.runGuarded(() => handler(event));
        return this.manager.getZone().runOutsideAngular(() => DOM.onAndCancel(element, eventName, outsideHandler));
    }
};
DomEventsPlugin = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], DomEventsPlugin);
