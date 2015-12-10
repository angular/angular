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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcGlwZV9leGFtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvZXhhbXBsZXMvY29yZS9waXBlcy90cy9hc3luY19waXBlL2FzeW5jX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6WyJBc3luY1BpcGVFeGFtcGxlIiwiQXN5bmNQaXBlRXhhbXBsZS5jb25zdHJ1Y3RvciIsIkFzeW5jUGlwZUV4YW1wbGUucmVzZXQiLCJBc3luY1BpcGVFeGFtcGxlLmNsaWNrZWQiLCJUYXNrIiwiVGFzay5jb25zdHJ1Y3RvciIsIkFwcENtcCIsIm1haW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxTQUFTLEVBQVcsVUFBVSxFQUFDLE1BQU0sbUJBQW1CO09BQ3pELEVBQUMsU0FBUyxFQUFDLE1BQU0sb0JBQW9CO0FBRTVDLHVCQUF1QjtBQUN2QjtJQWFFQTtRQUxBQyxhQUFRQSxHQUFvQkEsSUFBSUEsQ0FBQ0E7UUFDakNBLFlBQU9BLEdBQVlBLEtBQUtBLENBQUNBO1FBRWpCQSxZQUFPQSxHQUFhQSxJQUFJQSxDQUFDQTtRQUVqQkEsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7SUFBQ0EsQ0FBQ0E7SUFFL0JELEtBQUtBO1FBQ0hFLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLEtBQUtBLENBQUNBO1FBQ3JCQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSxPQUFPQSxDQUFTQSxDQUFDQSxPQUFPQSxFQUFFQSxNQUFNQSxPQUFPQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUN4RkEsQ0FBQ0E7SUFFREYsT0FBT0E7UUFDTEcsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakJBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBO1FBQ2ZBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQzFCQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUN0QkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7QUFDSEgsQ0FBQ0E7QUE1QkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsZUFBZTtRQUN6QixRQUFRLEVBQUU7OztTQUdIO0tBQ1IsQ0FBQzs7cUJBc0JEO0FBQ0QsZ0JBQWdCO0FBRWhCLGlDQUFpQztBQUNqQztJQUFBSTtRQUVFQyxTQUFJQSxHQUFHQSxJQUFJQSxVQUFVQSxDQUNqQkEsUUFBUUEsTUFBTUEsV0FBV0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsRUFBRUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDbkZBLENBQUNBO0FBQURELENBQUNBO0FBSkQ7SUFBQyxTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSwwQkFBMEIsRUFBQyxDQUFDOztTQUl2RTtBQUNELGdCQUFnQjtBQUVoQjtBQVNBRSxDQUFDQTtBQVREO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGFBQWE7UUFDdkIsVUFBVSxFQUFFLENBQUMsZ0JBQWdCLENBQUM7UUFDOUIsUUFBUSxFQUFFOzs7R0FHVDtLQUNGLENBQUM7O1dBRUQ7QUFFRDtJQUNFQyxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtBQUNwQkEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudCwgcHJvdmlkZSwgT2JzZXJ2YWJsZX0gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL2Jvb3RzdHJhcCc7XG5cbi8vICNkb2NyZWdpb24gQXN5bmNQaXBlXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdhc3luYy1leGFtcGxlJyxcbiAgdGVtcGxhdGU6IGA8ZGl2PlxuICAgIDxwPldhaXQgZm9yIGl0Li4uIHt7IGdyZWV0aW5nIHwgYXN5bmMgfX08L3A+XG4gICAgPGJ1dHRvbiAoY2xpY2spPVwiY2xpY2tlZCgpXCI+e3sgYXJyaXZlZCA/ICdSZXNldCcgOiAnUmVzb2x2ZScgfX08L2J1dHRvbj4gXG4gIDwvZGl2PmBcbn0pXG5leHBvcnQgY2xhc3MgQXN5bmNQaXBlRXhhbXBsZSB7XG4gIGdyZWV0aW5nOiBQcm9taXNlPHN0cmluZz4gPSBudWxsO1xuICBhcnJpdmVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSByZXNvbHZlOiBGdW5jdGlvbiA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoKSB7IHRoaXMucmVzZXQoKTsgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuYXJyaXZlZCA9IGZhbHNlO1xuICAgIHRoaXMuZ3JlZXRpbmcgPSBuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHsgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTsgfSk7XG4gIH1cblxuICBjbGlja2VkKCkge1xuICAgIGlmICh0aGlzLmFycml2ZWQpIHtcbiAgICAgIHRoaXMucmVzZXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZXNvbHZlKFwiaGkgdGhlcmUhXCIpO1xuICAgICAgdGhpcy5hcnJpdmVkID0gdHJ1ZTtcbiAgICB9XG4gIH1cbn1cbi8vICNlbmRkb2NyZWdpb25cblxuLy8gI2RvY3JlZ2lvbiBBc3luY1BpcGVPYnNlcnZhYmxlXG5AQ29tcG9uZW50KHtzZWxlY3RvcjogXCJ0YXNrLWNtcFwiLCB0ZW1wbGF0ZTogXCJUaW1lOiB7eyB0aW1lIHwgYXN5bmMgfX1cIn0pXG5jbGFzcyBUYXNrIHtcbiAgdGltZSA9IG5ldyBPYnNlcnZhYmxlPG51bWJlcj4oXG4gICAgICBvYnNlcnZlciA9PiB7IHNldEludGVydmFsKF8gPT4gb2JzZXJ2ZXIubmV4dChuZXcgRGF0ZSgpLmdldFRpbWUoKSksIDUwMCk7IH0pO1xufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdleGFtcGxlLWFwcCcsXG4gIGRpcmVjdGl2ZXM6IFtBc3luY1BpcGVFeGFtcGxlXSxcbiAgdGVtcGxhdGU6IGAgXG4gICAgPGgxPkFzeW5jUGlwZSBFeGFtcGxlPC9oMT5cbiAgICA8YXN5bmMtZXhhbXBsZT48L2FzeW5jLWV4YW1wbGU+XG4gIGBcbn0pXG5leHBvcnQgY2xhc3MgQXBwQ21wIHtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1haW4oKSB7XG4gIGJvb3RzdHJhcChBcHBDbXApO1xufVxuIl19