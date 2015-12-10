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
// #docregion LowerUpperPipe
export let LowerUpperPipeExample = class {
    change(value) { this.value = value; }
};
LowerUpperPipeExample = __decorate([
    Component({
        selector: 'lowerupper-example',
        template: `<div>
    <label>Name: </label><input #name (keyup)="change(name.value)" type="text"></input>
    <p>In lowercase: <pre>'{{value | lowercase}}'</pre></p>
    <p>In uppercase: <pre>'{{value | uppercase}}'</pre></p>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], LowerUpperPipeExample);
// #enddocregion
export let AppCmp = class {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        directives: [LowerUpperPipeExample],
        template: ` 
    <h1>LowercasePipe &amp; UppercasePipe Example</h1>
    <lowerupper-example></lowerupper-example>
  `
    }), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    bootstrap(AppCmp);
}
