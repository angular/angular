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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9leGFtcGxlcy9jb3JlL3RzL3BsYXRmb3JtL3BsYXRmb3JtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFFLGNBQWMsRUFBRSxvQkFBb0IsRUFBRSxrQkFBa0IsRUFBQyxNQUFNLGVBQWU7T0FDMUYsRUFBQyxpQkFBaUIsRUFBRSxxQkFBcUIsRUFBQyxNQUFNLDJCQUEyQjtBQUVsRixJQUFJLFlBQVksR0FBVSxFQUFFLENBQUM7QUFFN0Isc0JBQXNCO0FBRXRCO0FBQ0EsQ0FBQztBQUZEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFDLENBQUM7O1NBQUE7QUFJekQsSUFBSSxRQUFRLEdBQUcsY0FBYyxDQUFDLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztBQUN0RixJQUFJLFdBQVcsR0FDWCxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLHFCQUFxQixFQUFFLFlBQVksQ0FBQyxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNsRyxvQkFBb0IsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDekMsZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIGNyZWF0ZVBsYXRmb3JtLCBjb3JlTG9hZEFuZEJvb3RzdHJhcCwgUmVmbGVjdGl2ZUluamVjdG9yfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7QlJPV1NFUl9QUk9WSURFUlMsIEJST1dTRVJfQVBQX1BST1ZJREVSU30gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG5cbnZhciBhcHBQcm92aWRlcnM6IGFueVtdID0gW107XG5cbi8vICNkb2NyZWdpb24gbG9uZ2Zvcm1cbkBDb21wb25lbnQoe3NlbGVjdG9yOiAnbXktYXBwJywgdGVtcGxhdGU6ICdIZWxsbyBXb3JsZCd9KVxuY2xhc3MgTXlBcHAge1xufVxuXG52YXIgcGxhdGZvcm0gPSBjcmVhdGVQbGF0Zm9ybShSZWZsZWN0aXZlSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShCUk9XU0VSX1BST1ZJREVSUykpO1xudmFyIGFwcEluamVjdG9yID1cbiAgICBSZWZsZWN0aXZlSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbQlJPV1NFUl9BUFBfUFJPVklERVJTLCBhcHBQcm92aWRlcnNdLCBwbGF0Zm9ybS5pbmplY3Rvcik7XG5jb3JlTG9hZEFuZEJvb3RzdHJhcChhcHBJbmplY3RvciwgTXlBcHApO1xuLy8gI2VuZGRvY3JlZ2lvblxuIl19