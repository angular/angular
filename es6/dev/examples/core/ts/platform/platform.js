var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, platform } from 'angular2/core';
import { BROWSER_PROVIDERS, BROWSER_APP_PROVIDERS } from 'angular2/platform/browser';
var appProviders = [];
// #docregion longform
let MyApp = class {
};
MyApp = __decorate([
    Component({ selector: 'my-app', template: 'Hello World' }), 
    __metadata('design:paramtypes', [])
], MyApp);
var app = platform(BROWSER_PROVIDERS).application([BROWSER_APP_PROVIDERS, appProviders]);
app.bootstrap(MyApp);
// #enddocregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9leGFtcGxlcy9jb3JlL3RzL3BsYXRmb3JtL3BsYXRmb3JtLnRzIl0sIm5hbWVzIjpbIk15QXBwIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlO09BQzFDLEVBQUMsaUJBQWlCLEVBQUUscUJBQXFCLEVBQUMsTUFBTSwyQkFBMkI7QUFFbEYsSUFBSSxZQUFZLEdBQVUsRUFBRSxDQUFDO0FBRTdCLHNCQUFzQjtBQUN0QjtBQUVBQSxDQUFDQTtBQUZEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFDLENBQUM7O1VBRXhEO0FBRUQsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMscUJBQXFCLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQztBQUN6RixHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3JCLGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBwbGF0Zm9ybX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0JST1dTRVJfUFJPVklERVJTLCBCUk9XU0VSX0FQUF9QUk9WSURFUlN9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuXG52YXIgYXBwUHJvdmlkZXJzOiBhbnlbXSA9IFtdO1xuXG4vLyAjZG9jcmVnaW9uIGxvbmdmb3JtXG5AQ29tcG9uZW50KHtzZWxlY3RvcjogJ215LWFwcCcsIHRlbXBsYXRlOiAnSGVsbG8gV29ybGQnfSlcbmNsYXNzIE15QXBwIHtcbn1cblxudmFyIGFwcCA9IHBsYXRmb3JtKEJST1dTRVJfUFJPVklERVJTKS5hcHBsaWNhdGlvbihbQlJPV1NFUl9BUFBfUFJPVklERVJTLCBhcHBQcm92aWRlcnNdKTtcbmFwcC5ib290c3RyYXAoTXlBcHApO1xuLy8gI2VuZGRvY3JlZ2lvblxuIl19