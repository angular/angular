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
import { bootstrap } from 'angular2/bootstrap';
// #docregion NumberPipe
export let NumberPipeExample = class {
    constructor() {
        this.pi = 3.141;
        this.e = 2.718281828459045;
    }
};
NumberPipeExample = __decorate([
    Component({
        selector: 'number-example',
        template: `<div>
    <p>e (no formatting): {{e}}</p>
    <p>e (3.1-5): {{e | number:'3.1-5'}}</p>
    <p>pi (no formatting): {{pi}}</p>
    <p>pi (3.5-5): {{pi | number:'3.5-5'}}</p>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], NumberPipeExample);
// #enddocregion
// #docregion PercentPipe
export let PercentPipeExample = class {
    constructor() {
        this.a = 0.259;
        this.b = 1.3495;
    }
};
PercentPipeExample = __decorate([
    Component({
        selector: 'percent-example',
        template: `<div>
    <p>A: {{a | percent}}</p>
    <p>B: {{b | percent:'4.3-5'}}</p>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], PercentPipeExample);
// #enddocregion
// #docregion CurrencyPipe
export let CurrencyPipeExample = class {
    constructor() {
        this.a = 0.259;
        this.b = 1.3495;
    }
};
CurrencyPipeExample = __decorate([
    Component({
        selector: 'currency-example',
        template: `<div>
    <p>A: {{a | currency:'USD':false}}</p>
    <p>B: {{b | currency:'USD':true:'4.2-2'}}</p>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], CurrencyPipeExample);
// #enddocregion
export let AppCmp = class {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        directives: [NumberPipeExample, PercentPipeExample, CurrencyPipeExample],
        template: `
    <h1>Numeric Pipe Examples</h1>
    <h2>NumberPipe Example</h2>
    <number-example></number-example>
    <h2>PercentPipe Example</h2>
    <percent-example></percent-example>
    <h2>CurrencyPipeExample</h2>
    <currency-example></currency-example>
  `
    }), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    bootstrap(AppCmp);
}
