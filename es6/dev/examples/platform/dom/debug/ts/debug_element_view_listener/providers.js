var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from 'angular2/core';
import { bootstrap, ELEMENT_PROBE_PROVIDERS } from 'angular2/platform/browser';
let MyAppComponent = class {
};
MyAppComponent = __decorate([
    Component({ selector: 'my-component' }), 
    __metadata('design:paramtypes', [])
], MyAppComponent);
// #docregion providers
bootstrap(MyAppComponent, [ELEMENT_PROBE_PROVIDERS]);
// #enddocregion 
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdmlkZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvZXhhbXBsZXMvcGxhdGZvcm0vZG9tL2RlYnVnL3RzL2RlYnVnX2VsZW1lbnRfdmlld19saXN0ZW5lci9wcm92aWRlcnMudHMiXSwibmFtZXMiOlsiTXlBcHBDb21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZUFBZTtPQUNoQyxFQUFDLFNBQVMsRUFBRSx1QkFBdUIsRUFBQyxNQUFNLDJCQUEyQjtBQUU1RTtBQUVBQSxDQUFDQTtBQUZEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLGNBQWMsRUFBQyxDQUFDOzttQkFFckM7QUFFRCx1QkFBdUI7QUFDdkIsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDLHVCQUF1QixDQUFDLENBQUMsQ0FBQztBQUNyRCxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2Jvb3RzdHJhcCwgRUxFTUVOVF9QUk9CRV9QUk9WSURFUlN9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuXG5AQ29tcG9uZW50KHtzZWxlY3RvcjogJ215LWNvbXBvbmVudCd9KVxuY2xhc3MgTXlBcHBDb21wb25lbnQge1xufVxuXG4vLyAjZG9jcmVnaW9uIHByb3ZpZGVyc1xuYm9vdHN0cmFwKE15QXBwQ29tcG9uZW50LCBbRUxFTUVOVF9QUk9CRV9QUk9WSURFUlNdKTtcbi8vICNlbmRkb2NyZWdpb24iXX0=