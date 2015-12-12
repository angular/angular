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
import { Observable } from 'rxjs/Observable';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcGlwZV9leGFtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvZXhhbXBsZXMvY29yZS9waXBlcy90cy9hc3luY19waXBlL2FzeW5jX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6WyJBc3luY1BpcGVFeGFtcGxlIiwiQXN5bmNQaXBlRXhhbXBsZS5jb25zdHJ1Y3RvciIsIkFzeW5jUGlwZUV4YW1wbGUucmVzZXQiLCJBc3luY1BpcGVFeGFtcGxlLmNsaWNrZWQiLCJUYXNrIiwiVGFzay5jb25zdHJ1Y3RvciIsIkFwcENtcCIsIm1haW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFVLE1BQU0sZUFBZTtPQUN6QyxFQUFDLFNBQVMsRUFBQyxNQUFNLG9CQUFvQjtPQUNyQyxFQUFDLFVBQVUsRUFBQyxNQUFNLGlCQUFpQjtBQUUxQyx1QkFBdUI7QUFDdkI7SUFhRUE7UUFMQUMsYUFBUUEsR0FBb0JBLElBQUlBLENBQUNBO1FBQ2pDQSxZQUFPQSxHQUFZQSxLQUFLQSxDQUFDQTtRQUVqQkEsWUFBT0EsR0FBYUEsSUFBSUEsQ0FBQ0E7UUFFakJBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBO0lBQUNBLENBQUNBO0lBRS9CRCxLQUFLQTtRQUNIRSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUNyQkEsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsSUFBSUEsT0FBT0EsQ0FBU0EsQ0FBQ0EsT0FBT0EsRUFBRUEsTUFBTUEsT0FBT0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDeEZBLENBQUNBO0lBRURGLE9BQU9BO1FBQ0xHLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO1lBQ2pCQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtRQUNmQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUMxQkEsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDdEJBLENBQUNBO0lBQ0hBLENBQUNBO0FBQ0hILENBQUNBO0FBNUJEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGVBQWU7UUFDekIsUUFBUSxFQUFFOzs7U0FHSDtLQUNSLENBQUM7O3FCQXNCRDtBQUNELGdCQUFnQjtBQUVoQixpQ0FBaUM7QUFDakM7SUFBQUk7UUFFRUMsU0FBSUEsR0FBR0EsSUFBSUEsVUFBVUEsQ0FDakJBLFFBQVFBLE1BQU1BLFdBQVdBLENBQUNBLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLEVBQUVBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ25GQSxDQUFDQTtBQUFERCxDQUFDQTtBQUpEO0lBQUMsU0FBUyxDQUFDLEVBQUMsUUFBUSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsMEJBQTBCLEVBQUMsQ0FBQzs7U0FJdkU7QUFDRCxnQkFBZ0I7QUFFaEI7QUFTQUUsQ0FBQ0E7QUFURDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxhQUFhO1FBQ3ZCLFVBQVUsRUFBRSxDQUFDLGdCQUFnQixDQUFDO1FBQzlCLFFBQVEsRUFBRTs7O0dBR1Q7S0FDRixDQUFDOztXQUVEO0FBRUQ7SUFDRUMsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7QUFDcEJBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIHByb3ZpZGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL2Jvb3RzdHJhcCc7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMvT2JzZXJ2YWJsZSc7XG5cbi8vICNkb2NyZWdpb24gQXN5bmNQaXBlXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdhc3luYy1leGFtcGxlJyxcbiAgdGVtcGxhdGU6IGA8ZGl2PlxuICAgIDxwPldhaXQgZm9yIGl0Li4uIHt7IGdyZWV0aW5nIHwgYXN5bmMgfX08L3A+XG4gICAgPGJ1dHRvbiAoY2xpY2spPVwiY2xpY2tlZCgpXCI+e3sgYXJyaXZlZCA/ICdSZXNldCcgOiAnUmVzb2x2ZScgfX08L2J1dHRvbj5cbiAgPC9kaXY+YFxufSlcbmV4cG9ydCBjbGFzcyBBc3luY1BpcGVFeGFtcGxlIHtcbiAgZ3JlZXRpbmc6IFByb21pc2U8c3RyaW5nPiA9IG51bGw7XG4gIGFycml2ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBwcml2YXRlIHJlc29sdmU6IEZ1bmN0aW9uID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcigpIHsgdGhpcy5yZXNldCgpOyB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5hcnJpdmVkID0gZmFsc2U7XG4gICAgdGhpcy5ncmVldGluZyA9IG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4geyB0aGlzLnJlc29sdmUgPSByZXNvbHZlOyB9KTtcbiAgfVxuXG4gIGNsaWNrZWQoKSB7XG4gICAgaWYgKHRoaXMuYXJyaXZlZCkge1xuICAgICAgdGhpcy5yZXNldCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlc29sdmUoXCJoaSB0aGVyZSFcIik7XG4gICAgICB0aGlzLmFycml2ZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG4vLyAjZG9jcmVnaW9uIEFzeW5jUGlwZU9ic2VydmFibGVcbkBDb21wb25lbnQoe3NlbGVjdG9yOiBcInRhc2stY21wXCIsIHRlbXBsYXRlOiBcIlRpbWU6IHt7IHRpbWUgfCBhc3luYyB9fVwifSlcbmNsYXNzIFRhc2sge1xuICB0aW1lID0gbmV3IE9ic2VydmFibGU8bnVtYmVyPihcbiAgICAgIG9ic2VydmVyID0+IHsgc2V0SW50ZXJ2YWwoXyA9PiBvYnNlcnZlci5uZXh0KG5ldyBEYXRlKCkuZ2V0VGltZSgpKSwgNTAwKTsgfSk7XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2V4YW1wbGUtYXBwJyxcbiAgZGlyZWN0aXZlczogW0FzeW5jUGlwZUV4YW1wbGVdLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxoMT5Bc3luY1BpcGUgRXhhbXBsZTwvaDE+XG4gICAgPGFzeW5jLWV4YW1wbGU+PC9hc3luYy1leGFtcGxlPlxuICBgXG59KVxuZXhwb3J0IGNsYXNzIEFwcENtcCB7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWluKCkge1xuICBib290c3RyYXAoQXBwQ21wKTtcbn1cbiJdfQ==