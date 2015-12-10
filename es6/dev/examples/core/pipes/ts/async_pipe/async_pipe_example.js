var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Observable } from 'angular2/angular2';
import { bootstrap } from 'angular2/bootstrap';
// #docregion AsyncPipe
export let AsyncPipeExample = class {
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
let Task = class {
    constructor() {
        this.time = new Observable(observer => { setInterval(_ => observer.next(new Date().getTime()), 500); });
    }
};
Task = __decorate([
    Component({ selector: "task-cmp", template: "Time: {{ time | async }}" }), 
    __metadata('design:paramtypes', [])
], Task);
// #enddocregion
export let AppCmp = class {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcGlwZV9leGFtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvZXhhbXBsZXMvY29yZS9waXBlcy90cy9hc3luY19waXBlL2FzeW5jX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6WyJBc3luY1BpcGVFeGFtcGxlIiwiQXN5bmNQaXBlRXhhbXBsZS5jb25zdHJ1Y3RvciIsIkFzeW5jUGlwZUV4YW1wbGUucmVzZXQiLCJBc3luY1BpcGVFeGFtcGxlLmNsaWNrZWQiLCJUYXNrIiwiVGFzay5jb25zdHJ1Y3RvciIsIkFwcENtcCIsIm1haW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFXLFVBQVUsRUFBQyxNQUFNLG1CQUFtQjtPQUN6RCxFQUFDLFNBQVMsRUFBQyxNQUFNLG9CQUFvQjtBQUU1Qyx1QkFBdUI7QUFDdkI7SUFhRUE7UUFMQUMsYUFBUUEsR0FBb0JBLElBQUlBLENBQUNBO1FBQ2pDQSxZQUFPQSxHQUFZQSxLQUFLQSxDQUFDQTtRQUVqQkEsWUFBT0EsR0FBYUEsSUFBSUEsQ0FBQ0E7UUFFakJBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBO0lBQUNBLENBQUNBO0lBRS9CRCxLQUFLQTtRQUNIRSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUNyQkEsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsSUFBSUEsT0FBT0EsQ0FBU0EsQ0FBQ0EsT0FBT0EsRUFBRUEsTUFBTUEsT0FBT0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDeEZBLENBQUNBO0lBRURGLE9BQU9BO1FBQ0xHLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO1lBQ2pCQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtRQUNmQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUMxQkEsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDdEJBLENBQUNBO0lBQ0hBLENBQUNBO0FBQ0hILENBQUNBO0FBNUJEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGVBQWU7UUFDekIsUUFBUSxFQUFFOzs7U0FHSDtLQUNSLENBQUM7O3FCQXNCRDtBQUNELGdCQUFnQjtBQUVoQixpQ0FBaUM7QUFDakM7SUFBQUk7UUFFRUMsU0FBSUEsR0FBR0EsSUFBSUEsVUFBVUEsQ0FDakJBLFFBQVFBLE1BQU1BLFdBQVdBLENBQUNBLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLEVBQUVBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ25GQSxDQUFDQTtBQUFERCxDQUFDQTtBQUpEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsMEJBQTBCLEVBQUMsQ0FBQzs7U0FJdkU7QUFDRCxnQkFBZ0I7QUFFaEI7QUFTQUUsQ0FBQ0E7QUFURDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxhQUFhO1FBQ3ZCLFVBQVUsRUFBRSxDQUFDLGdCQUFnQixDQUFDO1FBQzlCLFFBQVEsRUFBRTs7O0dBR1Q7S0FDRixDQUFDOztXQUVEO0FBRUQ7SUFDRUMsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7QUFDcEJBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIHByb3ZpZGUsIE9ic2VydmFibGV9IGZyb20gJ2FuZ3VsYXIyL2FuZ3VsYXIyJztcbmltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9ib290c3RyYXAnO1xuXG4vLyAjZG9jcmVnaW9uIEFzeW5jUGlwZVxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnYXN5bmMtZXhhbXBsZScsXG4gIHRlbXBsYXRlOiBgPGRpdj5cbiAgICA8cD5XYWl0IGZvciBpdC4uLiB7eyBncmVldGluZyB8IGFzeW5jIH19PC9wPlxuICAgIDxidXR0b24gKGNsaWNrKT1cImNsaWNrZWQoKVwiPnt7IGFycml2ZWQgPyAnUmVzZXQnIDogJ1Jlc29sdmUnIH19PC9idXR0b24+IFxuICA8L2Rpdj5gXG59KVxuZXhwb3J0IGNsYXNzIEFzeW5jUGlwZUV4YW1wbGUge1xuICBncmVldGluZzogUHJvbWlzZTxzdHJpbmc+ID0gbnVsbDtcbiAgYXJyaXZlZDogYm9vbGVhbiA9IGZhbHNlO1xuXG4gIHByaXZhdGUgcmVzb2x2ZTogRnVuY3Rpb24gPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKCkgeyB0aGlzLnJlc2V0KCk7IH1cblxuICByZXNldCgpIHtcbiAgICB0aGlzLmFycml2ZWQgPSBmYWxzZTtcbiAgICB0aGlzLmdyZWV0aW5nID0gbmV3IFByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7IHRoaXMucmVzb2x2ZSA9IHJlc29sdmU7IH0pO1xuICB9XG5cbiAgY2xpY2tlZCgpIHtcbiAgICBpZiAodGhpcy5hcnJpdmVkKSB7XG4gICAgICB0aGlzLnJlc2V0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVzb2x2ZShcImhpIHRoZXJlIVwiKTtcbiAgICAgIHRoaXMuYXJyaXZlZCA9IHRydWU7XG4gICAgfVxuICB9XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cbi8vICNkb2NyZWdpb24gQXN5bmNQaXBlT2JzZXJ2YWJsZVxuQENvbXBvbmVudCh7c2VsZWN0b3I6IFwidGFzay1jbXBcIiwgdGVtcGxhdGU6IFwiVGltZToge3sgdGltZSB8IGFzeW5jIH19XCJ9KVxuY2xhc3MgVGFzayB7XG4gIHRpbWUgPSBuZXcgT2JzZXJ2YWJsZTxudW1iZXI+KFxuICAgICAgb2JzZXJ2ZXIgPT4geyBzZXRJbnRlcnZhbChfID0+IG9ic2VydmVyLm5leHQobmV3IERhdGUoKS5nZXRUaW1lKCkpLCA1MDApOyB9KTtcbn1cbi8vICNlbmRkb2NyZWdpb25cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZXhhbXBsZS1hcHAnLFxuICBkaXJlY3RpdmVzOiBbQXN5bmNQaXBlRXhhbXBsZV0sXG4gIHRlbXBsYXRlOiBgIFxuICAgIDxoMT5Bc3luY1BpcGUgRXhhbXBsZTwvaDE+XG4gICAgPGFzeW5jLWV4YW1wbGU+PC9hc3luYy1leGFtcGxlPlxuICBgXG59KVxuZXhwb3J0IGNsYXNzIEFwcENtcCB7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWluKCkge1xuICBib290c3RyYXAoQXBwQ21wKTtcbn1cbiJdfQ==