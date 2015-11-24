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
        this.resolved = false;
        this.promise = null;
        this.resolve = null;
        this.reset();
    }
    reset() {
        this.resolved = false;
        this.promise = new Promise((resolve, reject) => { this.resolve = resolve; });
    }
    clicked() {
        if (this.resolved) {
            this.reset();
        }
        else {
            this.resolve("resolved!");
            this.resolved = true;
        }
    }
};
AsyncPipeExample = __decorate([
    Component({
        selector: 'async-example',
        template: `<div>
    <p>Wait for it... {{promise | async}}</p>
    <button (click)="clicked()">{{resolved ? 'Reset' : 'Resolve'}}</button> 
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcGlwZV9leGFtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvZXhhbXBsZXMvY29yZS9waXBlcy90cy9hc3luY19waXBlL2FzeW5jX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6WyJBc3luY1BpcGVFeGFtcGxlIiwiQXN5bmNQaXBlRXhhbXBsZS5jb25zdHJ1Y3RvciIsIkFzeW5jUGlwZUV4YW1wbGUucmVzZXQiLCJBc3luY1BpcGVFeGFtcGxlLmNsaWNrZWQiLCJUYXNrIiwiVGFzay5jb25zdHJ1Y3RvciIsIkFwcENtcCIsIm1haW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O09BQU8sRUFBQyxTQUFTLEVBQVcsVUFBVSxFQUFDLE1BQU0sbUJBQW1CO09BQ3pELEVBQUMsU0FBUyxFQUFDLE1BQU0sb0JBQW9CO0FBRTVDLHVCQUF1QjtBQUN2QjtJQVlFQTtRQUpBQyxhQUFRQSxHQUFZQSxLQUFLQSxDQUFDQTtRQUMxQkEsWUFBT0EsR0FBb0JBLElBQUlBLENBQUNBO1FBQ2hDQSxZQUFPQSxHQUFhQSxJQUFJQSxDQUFDQTtRQUVUQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtJQUFDQSxDQUFDQTtJQUUvQkQsS0FBS0E7UUFDSEUsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDdEJBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLE9BQU9BLENBQVNBLENBQUNBLE9BQU9BLEVBQUVBLE1BQU1BLE9BQU9BLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ3ZGQSxDQUFDQTtJQUVERixPQUFPQTtRQUNMRyxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQkEsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7UUFDZkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDMUJBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3ZCQSxDQUFDQTtJQUNIQSxDQUFDQTtBQUNISCxDQUFDQTtBQTNCRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxlQUFlO1FBQ3pCLFFBQVEsRUFBRTs7O1NBR0g7S0FDUixDQUFDOztxQkFxQkQ7QUFDRCxnQkFBZ0I7QUFFaEIsaUNBQWlDO0FBQ2pDO0lBQUFJO1FBRUVDLFNBQUlBLEdBQUdBLElBQUlBLFVBQVVBLENBQ2pCQSxRQUFRQSxNQUFNQSxXQUFXQSxDQUFDQSxDQUFDQSxJQUFJQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxJQUFJQSxFQUFFQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNuRkEsQ0FBQ0E7QUFBREQsQ0FBQ0E7QUFKRDtJQUFDLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLDBCQUEwQixFQUFDLENBQUM7O1NBSXZFO0FBQ0QsZ0JBQWdCO0FBRWhCO0FBU0FFLENBQUNBO0FBVEQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsYUFBYTtRQUN2QixVQUFVLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztRQUM5QixRQUFRLEVBQUU7OztHQUdUO0tBQ0YsQ0FBQzs7V0FFRDtBQUVEO0lBQ0VDLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0FBQ3BCQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBwcm92aWRlLCBPYnNlcnZhYmxlfSBmcm9tICdhbmd1bGFyMi9hbmd1bGFyMic7XG5pbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvYm9vdHN0cmFwJztcblxuLy8gI2RvY3JlZ2lvbiBBc3luY1BpcGVcbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2FzeW5jLWV4YW1wbGUnLFxuICB0ZW1wbGF0ZTogYDxkaXY+XG4gICAgPHA+V2FpdCBmb3IgaXQuLi4ge3twcm9taXNlIHwgYXN5bmN9fTwvcD5cbiAgICA8YnV0dG9uIChjbGljayk9XCJjbGlja2VkKClcIj57e3Jlc29sdmVkID8gJ1Jlc2V0JyA6ICdSZXNvbHZlJ319PC9idXR0b24+IFxuICA8L2Rpdj5gXG59KVxuZXhwb3J0IGNsYXNzIEFzeW5jUGlwZUV4YW1wbGUge1xuICByZXNvbHZlZDogYm9vbGVhbiA9IGZhbHNlO1xuICBwcm9taXNlOiBQcm9taXNlPHN0cmluZz4gPSBudWxsO1xuICByZXNvbHZlOiBGdW5jdGlvbiA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoKSB7IHRoaXMucmVzZXQoKTsgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMucmVzb2x2ZWQgPSBmYWxzZTtcbiAgICB0aGlzLnByb21pc2UgPSBuZXcgUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHsgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTsgfSk7XG4gIH1cblxuICBjbGlja2VkKCkge1xuICAgIGlmICh0aGlzLnJlc29sdmVkKSB7XG4gICAgICB0aGlzLnJlc2V0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVzb2x2ZShcInJlc29sdmVkIVwiKTtcbiAgICAgIHRoaXMucmVzb2x2ZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG4vLyAjZG9jcmVnaW9uIEFzeW5jUGlwZU9ic2VydmFibGVcbkBDb21wb25lbnQoe3NlbGVjdG9yOiBcInRhc2stY21wXCIsIHRlbXBsYXRlOiBcIlRpbWU6IHt7IHRpbWUgfCBhc3luYyB9fVwifSlcbmNsYXNzIFRhc2sge1xuICB0aW1lID0gbmV3IE9ic2VydmFibGU8bnVtYmVyPihcbiAgICAgIG9ic2VydmVyID0+IHsgc2V0SW50ZXJ2YWwoXyA9PiBvYnNlcnZlci5uZXh0KG5ldyBEYXRlKCkuZ2V0VGltZSgpKSwgNTAwKTsgfSk7XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2V4YW1wbGUtYXBwJyxcbiAgZGlyZWN0aXZlczogW0FzeW5jUGlwZUV4YW1wbGVdLFxuICB0ZW1wbGF0ZTogYCBcbiAgICA8aDE+QXN5bmNQaXBlIEV4YW1wbGU8L2gxPlxuICAgIDxhc3luYy1leGFtcGxlPjwvYXN5bmMtZXhhbXBsZT5cbiAgYFxufSlcbmV4cG9ydCBjbGFzcyBBcHBDbXAge1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFpbigpIHtcbiAgYm9vdHN0cmFwKEFwcENtcCk7XG59XG4iXX0=