var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Observable } from 'angular2/core';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcGlwZV9leGFtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvZXhhbXBsZXMvY29yZS9waXBlcy90cy9hc3luY19waXBlL2FzeW5jX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6WyJBc3luY1BpcGVFeGFtcGxlIiwiQXN5bmNQaXBlRXhhbXBsZS5jb25zdHJ1Y3RvciIsIkFzeW5jUGlwZUV4YW1wbGUucmVzZXQiLCJBc3luY1BpcGVFeGFtcGxlLmNsaWNrZWQiLCJUYXNrIiwiVGFzay5jb25zdHJ1Y3RvciIsIkFwcENtcCIsIm1haW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFXLFVBQVUsRUFBQyxNQUFNLGVBQWU7T0FDckQsRUFBQyxTQUFTLEVBQUMsTUFBTSxvQkFBb0I7QUFFNUMsdUJBQXVCO0FBQ3ZCO0lBYUVBO1FBTEFDLGFBQVFBLEdBQW9CQSxJQUFJQSxDQUFDQTtRQUNqQ0EsWUFBT0EsR0FBWUEsS0FBS0EsQ0FBQ0E7UUFFakJBLFlBQU9BLEdBQWFBLElBQUlBLENBQUNBO1FBRWpCQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtJQUFDQSxDQUFDQTtJQUUvQkQsS0FBS0E7UUFDSEUsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDckJBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLE9BQU9BLENBQVNBLENBQUNBLE9BQU9BLEVBQUVBLE1BQU1BLE9BQU9BLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ3hGQSxDQUFDQTtJQUVERixPQUFPQTtRQUNMRyxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNqQkEsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7UUFDZkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDMUJBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBO1FBQ3RCQSxDQUFDQTtJQUNIQSxDQUFDQTtBQUNISCxDQUFDQTtBQTVCRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxlQUFlO1FBQ3pCLFFBQVEsRUFBRTs7O1NBR0g7S0FDUixDQUFDOztxQkFzQkQ7QUFDRCxnQkFBZ0I7QUFFaEIsaUNBQWlDO0FBQ2pDO0lBQUFJO1FBRUVDLFNBQUlBLEdBQUdBLElBQUlBLFVBQVVBLENBQ2pCQSxRQUFRQSxNQUFNQSxXQUFXQSxDQUFDQSxDQUFDQSxJQUFJQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxFQUFFQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNuRkEsQ0FBQ0E7QUFBREQsQ0FBQ0E7QUFKRDtJQUFDLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLDBCQUEwQixFQUFDLENBQUM7O1NBSXZFO0FBQ0QsZ0JBQWdCO0FBRWhCO0FBU0FFLENBQUNBO0FBVEQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsYUFBYTtRQUN2QixVQUFVLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztRQUM5QixRQUFRLEVBQUU7OztHQUdUO0tBQ0YsQ0FBQzs7V0FFRDtBQUVEO0lBQ0VDLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0FBQ3BCQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBwcm92aWRlLCBPYnNlcnZhYmxlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9ib290c3RyYXAnO1xuXG4vLyAjZG9jcmVnaW9uIEFzeW5jUGlwZVxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnYXN5bmMtZXhhbXBsZScsXG4gIHRlbXBsYXRlOiBgPGRpdj5cbiAgICA8cD5XYWl0IGZvciBpdC4uLiB7eyBncmVldGluZyB8IGFzeW5jIH19PC9wPlxuICAgIDxidXR0b24gKGNsaWNrKT1cImNsaWNrZWQoKVwiPnt7IGFycml2ZWQgPyAnUmVzZXQnIDogJ1Jlc29sdmUnIH19PC9idXR0b24+XG4gIDwvZGl2PmBcbn0pXG5leHBvcnQgY2xhc3MgQXN5bmNQaXBlRXhhbXBsZSB7XG4gIGdyZWV0aW5nOiBQcm9taXNlPHN0cmluZz4gPSBudWxsO1xuICBhcnJpdmVkOiBib29sZWFuID0gZmFsc2U7XG5cbiAgcHJpdmF0ZSByZXNvbHZlOiBGdW5jdGlvbiA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoKSB7IHRoaXMucmVzZXQoKTsgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuYXJyaXZlZCA9IGZhbHNlO1xuICAgIHRoaXMuZ3JlZXRpbmcgPSBuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHsgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTsgfSk7XG4gIH1cblxuICBjbGlja2VkKCkge1xuICAgIGlmICh0aGlzLmFycml2ZWQpIHtcbiAgICAgIHRoaXMucmVzZXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZXNvbHZlKFwiaGkgdGhlcmUhXCIpO1xuICAgICAgdGhpcy5hcnJpdmVkID0gdHJ1ZTtcbiAgICB9XG4gIH1cbn1cbi8vICNlbmRkb2NyZWdpb25cblxuLy8gI2RvY3JlZ2lvbiBBc3luY1BpcGVPYnNlcnZhYmxlXG5AQ29tcG9uZW50KHtzZWxlY3RvcjogXCJ0YXNrLWNtcFwiLCB0ZW1wbGF0ZTogXCJUaW1lOiB7eyB0aW1lIHwgYXN5bmMgfX1cIn0pXG5jbGFzcyBUYXNrIHtcbiAgdGltZSA9IG5ldyBPYnNlcnZhYmxlPG51bWJlcj4oXG4gICAgICBvYnNlcnZlciA9PiB7IHNldEludGVydmFsKF8gPT4gb2JzZXJ2ZXIubmV4dChuZXcgRGF0ZSgpLmdldFRpbWUoKSksIDUwMCk7IH0pO1xufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdleGFtcGxlLWFwcCcsXG4gIGRpcmVjdGl2ZXM6IFtBc3luY1BpcGVFeGFtcGxlXSxcbiAgdGVtcGxhdGU6IGBcbiAgICA8aDE+QXN5bmNQaXBlIEV4YW1wbGU8L2gxPlxuICAgIDxhc3luYy1leGFtcGxlPjwvYXN5bmMtZXhhbXBsZT5cbiAgYFxufSlcbmV4cG9ydCBjbGFzcyBBcHBDbXAge1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFpbigpIHtcbiAgYm9vdHN0cmFwKEFwcENtcCk7XG59XG4iXX0=