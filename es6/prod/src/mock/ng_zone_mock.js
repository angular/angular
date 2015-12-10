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
import { NgZone } from 'angular2/src/core/zone/ng_zone';
import { EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
export let MockNgZone = class extends NgZone {
    constructor() {
        super({ enableLongStackTrace: false });
        this._mockOnEventDone = new EventEmitter(false);
    }
    get onEventDone() { return this._mockOnEventDone; }
    run(fn) { return fn(); }
    runOutsideAngular(fn) { return fn(); }
    simulateZoneExit() { ObservableWrapper.callNext(this.onEventDone, null); }
};
MockNgZone = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], MockNgZone);
