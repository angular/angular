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
import { Component } from 'angular2/angular2';
import { bootstrap } from 'angular2/bootstrap';
// #docregion DatePipe
export let DatePipeExample = class {
    constructor() {
        this.today = Date.now();
    }
};
DatePipeExample = __decorate([
    Component({
        selector: 'date-example',
        template: `<div>
    <p>Today is {{today | date}}</p>
    <p>Or if you prefer, {{today | date:'fullDate'}}</p>
    <p>The time is {{today | date:'jmZ'}}</p>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], DatePipeExample);
// #enddocregion
export let AppCmp = class {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        directives: [DatePipeExample],
        template: `
    <h1>DatePipe Example</h1>
    <date-example></date-example>
  `
    }), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    bootstrap(AppCmp);
}
