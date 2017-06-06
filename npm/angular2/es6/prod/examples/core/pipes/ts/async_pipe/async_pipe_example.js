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
import { Observable } from 'rxjs/Rx';
// #docregion AsyncPipe
export let AsyncPipeExample = class AsyncPipeExample {
    constructor() {
        this.greeting = null;
        this.arrived = false;
        this.resolve = null;
        this.reset();
    }
    reset() {
        this.arrived = false;
        this.greeting = new Promise((resolve, reject) => { this.resolve = resolve; });
    }
    clicked() {
        if (this.arrived) {
            this.reset();
        }
        else {
            this.resolve("hi there!");
            this.arrived = true;
        }
    }
};
AsyncPipeExample = __decorate([
    Component({
        selector: 'async-example',
        template: `<div>
    <p>Wait for it... {{ greeting | async }}</p>
    <button (click)="clicked()">{{ arrived ? 'Reset' : 'Resolve' }}</button>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], AsyncPipeExample);
// #enddocregion
// #docregion AsyncPipeObservable
let Task = class Task {
    constructor() {
        this.time = new Observable((observer) => {
            setInterval(() => observer.next(new Date().getTime()), 500);
        });
    }
};
Task = __decorate([
    Component({ selector: "task-cmp", template: "Time: {{ time | async }}" }), 
    __metadata('design:paramtypes', [])
], Task);
// #enddocregion
export let AppCmp = class AppCmp {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        directives: [AsyncPipeExample],
        template: `
    <h1>AsyncPipe Example</h1>
    <async-example></async-example>
  `
    }), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    bootstrap(AppCmp);
}
