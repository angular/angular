var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, createPlatform, coreLoadAndBootstrap, ReflectiveInjector } from 'angular2/core';
import { BROWSER_PROVIDERS, BROWSER_APP_PROVIDERS } from 'angular2/platform/browser';
var appProviders = [];
// #docregion longform
let MyApp = class MyApp {
};
MyApp = __decorate([
    Component({ selector: 'my-app', template: 'Hello World' }), 
    __metadata('design:paramtypes', [])
], MyApp);
var platform = createPlatform(ReflectiveInjector.resolveAndCreate(BROWSER_PROVIDERS));
var appInjector = ReflectiveInjector.resolveAndCreate([BROWSER_APP_PROVIDERS, appProviders], platform.injector);
coreLoadAndBootstrap(appInjector, MyApp);
// #enddocregion
