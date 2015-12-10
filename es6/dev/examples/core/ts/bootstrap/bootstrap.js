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
import { bootstrap } from 'angular2/platform/browser';
// #docregion bootstrap
let MyApp = class {
    constructor() {
        this.name = 'World';
    }
};
MyApp = __decorate([
    Component({ selector: 'my-app', template: 'Hello {{ name }}!' }), 
    __metadata('design:paramtypes', [])
], MyApp);
function main() {
    return bootstrap(MyApp);
}
// #enddocregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9vdHN0cmFwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvZXhhbXBsZXMvY29yZS90cy9ib290c3RyYXAvYm9vdHN0cmFwLnRzIl0sIm5hbWVzIjpbIk15QXBwIiwiTXlBcHAuY29uc3RydWN0b3IiLCJtYWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBQyxNQUFNLGVBQWU7T0FDaEMsRUFBQyxTQUFTLEVBQUMsTUFBTSwyQkFBMkI7QUFFbkQsdUJBQXVCO0FBQ3ZCO0lBQUFBO1FBRUVDLFNBQUlBLEdBQVdBLE9BQU9BLENBQUNBO0lBQ3pCQSxDQUFDQTtBQUFERCxDQUFDQTtBQUhEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsbUJBQW1CLEVBQUMsQ0FBQzs7VUFHOUQ7QUFFRDtJQUNFRSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtBQUMxQkEsQ0FBQ0E7QUFDRCxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG5cbi8vICNkb2NyZWdpb24gYm9vdHN0cmFwXG5AQ29tcG9uZW50KHtzZWxlY3RvcjogJ215LWFwcCcsIHRlbXBsYXRlOiAnSGVsbG8ge3sgbmFtZSB9fSEnfSlcbmNsYXNzIE15QXBwIHtcbiAgbmFtZTogc3RyaW5nID0gJ1dvcmxkJztcbn1cblxuZnVuY3Rpb24gbWFpbigpIHtcbiAgcmV0dXJuIGJvb3RzdHJhcChNeUFwcCk7XG59XG4vLyAjZW5kZG9jcmVnaW9uXG4iXX0=