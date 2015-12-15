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
import { MinLengthValidator, MaxLengthValidator } from 'angular2/common';
// #docregion min
let MinLengthTestComponent = class {
};
MinLengthTestComponent = __decorate([
    Component({
        selector: 'min-cmp',
        directives: [MinLengthValidator],
        template: `
<form>
  <p>Year: <input ngControl="year" minlength="2"></p>
</form>
`
    }), 
    __metadata('design:paramtypes', [])
], MinLengthTestComponent);
// #enddocregion
// #docregion max
let MaxLengthTestComponent = class {
};
MaxLengthTestComponent = __decorate([
    Component({
        selector: 'max-cmp',
        directives: [MaxLengthValidator],
        template: `
<form>
  <p>Year: <input ngControl="year" maxlength="4"></p>
</form>
`
    }), 
    __metadata('design:paramtypes', [])
], MaxLengthTestComponent);
// #enddocregion
