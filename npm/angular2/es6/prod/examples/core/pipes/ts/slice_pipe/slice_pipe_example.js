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
// #docregion SlicePipe_string
export let SlicePipeStringExample = class SlicePipeStringExample {
    constructor() {
        this.str = 'abcdefghij';
    }
};
SlicePipeStringExample = __decorate([
    Component({
        selector: 'slice-string-example',
        template: `<div>
    <p>{{str}}[0:4]: '{{str | slice:0:4}}' - output is expected to be 'abcd'</p>
    <p>{{str}}[4:0]: '{{str | slice:4:0}}' - output is expected to be ''</p>
    <p>{{str}}[-4]: '{{str | slice:-4}}' - output is expected to be 'ghij'</p>
    <p>{{str}}[-4:-2]: '{{str | slice:-4:-2}}' - output is expected to be 'gh'</p>
    <p>{{str}}[-100]: '{{str | slice:-100}}' - output is expected to be 'abcdefghij'</p>
    <p>{{str}}[100]: '{{str | slice:100}}' - output is expected to be ''</p>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], SlicePipeStringExample);
// #enddocregion
// #docregion SlicePipe_list
export let SlicePipeListExample = class SlicePipeListExample {
    constructor() {
        this.collection = ['a', 'b', 'c', 'd'];
    }
};
SlicePipeListExample = __decorate([
    Component({
        selector: 'slice-list-example',
        template: `<div>
    <li *ngFor="let  i of collection | slice:1:3">{{i}}</li>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], SlicePipeListExample);
// #enddocregion
export let AppCmp = class AppCmp {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        directives: [SlicePipeListExample, SlicePipeStringExample],
        template: `
    <h1>SlicePipe Examples</h1>
    <slice-list-example></slice-list-example>
    <slice-string-example></slice-string-example>
  `
    }), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    bootstrap(AppCmp);
}
