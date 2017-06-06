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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXN5bmNfcGlwZV9leGFtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvZXhhbXBsZXMvY29yZS9waXBlcy90cy9hc3luY19waXBlL2FzeW5jX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBVSxNQUFNLGVBQWU7T0FDekMsRUFBQyxTQUFTLEVBQUMsTUFBTSwyQkFBMkI7T0FDNUMsRUFBQyxVQUFVLEVBQWEsTUFBTSxTQUFTO0FBRTlDLHVCQUF1QjtBQVF2QjtJQU1FO1FBTEEsYUFBUSxHQUFvQixJQUFJLENBQUM7UUFDakMsWUFBTyxHQUFZLEtBQUssQ0FBQztRQUVqQixZQUFPLEdBQWEsSUFBSSxDQUFDO1FBRWpCLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUFDLENBQUM7SUFFL0IsS0FBSztRQUNILElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxPQUFPLENBQVMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxPQUFPLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEYsQ0FBQztJQUVELE9BQU87UUFDTCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNqQixJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDZixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDTixJQUFJLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQTVCRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxlQUFlO1FBQ3pCLFFBQVEsRUFBRTs7O1NBR0g7S0FDUixDQUFDOztvQkFBQTtBQXVCRixnQkFBZ0I7QUFFaEIsaUNBQWlDO0FBRWpDO0lBQUE7UUFDRSxTQUFJLEdBQUcsSUFBSSxVQUFVLENBQVMsQ0FBQyxRQUE0QjtZQUN6RCxXQUFXLENBQUMsTUFBTSxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM5RCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7QUFBRCxDQUFDO0FBTEQ7SUFBQyxTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSwwQkFBMEIsRUFBQyxDQUFDOztRQUFBO0FBTXhFLGdCQUFnQjtBQVVoQjtBQUNBLENBQUM7QUFURDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxhQUFhO1FBQ3ZCLFVBQVUsRUFBRSxDQUFDLGdCQUFnQixDQUFDO1FBQzlCLFFBQVEsRUFBRTs7O0dBR1Q7S0FDRixDQUFDOztVQUFBO0FBSUY7SUFDRSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBwcm92aWRlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9icm93c2VyJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgU3Vic2NyaWJlcn0gZnJvbSAncnhqcy9SeCc7XG5cbi8vICNkb2NyZWdpb24gQXN5bmNQaXBlXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdhc3luYy1leGFtcGxlJyxcbiAgdGVtcGxhdGU6IGA8ZGl2PlxuICAgIDxwPldhaXQgZm9yIGl0Li4uIHt7IGdyZWV0aW5nIHwgYXN5bmMgfX08L3A+XG4gICAgPGJ1dHRvbiAoY2xpY2spPVwiY2xpY2tlZCgpXCI+e3sgYXJyaXZlZCA/ICdSZXNldCcgOiAnUmVzb2x2ZScgfX08L2J1dHRvbj5cbiAgPC9kaXY+YFxufSlcbmV4cG9ydCBjbGFzcyBBc3luY1BpcGVFeGFtcGxlIHtcbiAgZ3JlZXRpbmc6IFByb21pc2U8c3RyaW5nPiA9IG51bGw7XG4gIGFycml2ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcblxuICBwcml2YXRlIHJlc29sdmU6IEZ1bmN0aW9uID0gbnVsbDtcblxuICBjb25zdHJ1Y3RvcigpIHsgdGhpcy5yZXNldCgpOyB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5hcnJpdmVkID0gZmFsc2U7XG4gICAgdGhpcy5ncmVldGluZyA9IG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4geyB0aGlzLnJlc29sdmUgPSByZXNvbHZlOyB9KTtcbiAgfVxuXG4gIGNsaWNrZWQoKSB7XG4gICAgaWYgKHRoaXMuYXJyaXZlZCkge1xuICAgICAgdGhpcy5yZXNldCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlc29sdmUoXCJoaSB0aGVyZSFcIik7XG4gICAgICB0aGlzLmFycml2ZWQgPSB0cnVlO1xuICAgIH1cbiAgfVxufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG4vLyAjZG9jcmVnaW9uIEFzeW5jUGlwZU9ic2VydmFibGVcbkBDb21wb25lbnQoe3NlbGVjdG9yOiBcInRhc2stY21wXCIsIHRlbXBsYXRlOiBcIlRpbWU6IHt7IHRpbWUgfCBhc3luYyB9fVwifSlcbmNsYXNzIFRhc2sge1xuICB0aW1lID0gbmV3IE9ic2VydmFibGU8bnVtYmVyPigob2JzZXJ2ZXI6IFN1YnNjcmliZXI8bnVtYmVyPikgPT4ge1xuICAgIHNldEludGVydmFsKCgpID0+IG9ic2VydmVyLm5leHQobmV3IERhdGUoKS5nZXRUaW1lKCkpLCA1MDApO1xuICB9KTtcbn1cbi8vICNlbmRkb2NyZWdpb25cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZXhhbXBsZS1hcHAnLFxuICBkaXJlY3RpdmVzOiBbQXN5bmNQaXBlRXhhbXBsZV0sXG4gIHRlbXBsYXRlOiBgXG4gICAgPGgxPkFzeW5jUGlwZSBFeGFtcGxlPC9oMT5cbiAgICA8YXN5bmMtZXhhbXBsZT48L2FzeW5jLWV4YW1wbGU+XG4gIGBcbn0pXG5leHBvcnQgY2xhc3MgQXBwQ21wIHtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1haW4oKSB7XG4gIGJvb3RzdHJhcChBcHBDbXApO1xufVxuIl19