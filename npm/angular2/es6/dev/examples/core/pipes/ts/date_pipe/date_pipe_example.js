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
// #docregion DatePipe
export let DatePipeExample = class DatePipeExample {
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
export let AppCmp = class AppCmp {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZV9waXBlX2V4YW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9leGFtcGxlcy9jb3JlL3BpcGVzL3RzL2RhdGVfcGlwZS9kYXRlX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBVSxNQUFNLGVBQWU7T0FDekMsRUFBQyxTQUFTLEVBQUMsTUFBTSwyQkFBMkI7QUFFbkQsc0JBQXNCO0FBU3RCO0lBQUE7UUFDRSxVQUFLLEdBQVcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQzdCLENBQUM7QUFBRCxDQUFDO0FBVkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsY0FBYztRQUN4QixRQUFRLEVBQUU7Ozs7U0FJSDtLQUNSLENBQUM7O21CQUFBO0FBSUYsZ0JBQWdCO0FBVWhCO0FBQ0EsQ0FBQztBQVREO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGFBQWE7UUFDdkIsVUFBVSxFQUFFLENBQUMsZUFBZSxDQUFDO1FBQzdCLFFBQVEsRUFBRTs7O0dBR1Q7S0FDRixDQUFDOztVQUFBO0FBSUY7SUFDRSxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDcEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBwcm92aWRlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9icm93c2VyJztcblxuLy8gI2RvY3JlZ2lvbiBEYXRlUGlwZVxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZGF0ZS1leGFtcGxlJyxcbiAgdGVtcGxhdGU6IGA8ZGl2PlxuICAgIDxwPlRvZGF5IGlzIHt7dG9kYXkgfCBkYXRlfX08L3A+XG4gICAgPHA+T3IgaWYgeW91IHByZWZlciwge3t0b2RheSB8IGRhdGU6J2Z1bGxEYXRlJ319PC9wPlxuICAgIDxwPlRoZSB0aW1lIGlzIHt7dG9kYXkgfCBkYXRlOidqbVonfX08L3A+XG4gIDwvZGl2PmBcbn0pXG5leHBvcnQgY2xhc3MgRGF0ZVBpcGVFeGFtcGxlIHtcbiAgdG9kYXk6IG51bWJlciA9IERhdGUubm93KCk7XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2V4YW1wbGUtYXBwJyxcbiAgZGlyZWN0aXZlczogW0RhdGVQaXBlRXhhbXBsZV0sXG4gIHRlbXBsYXRlOiBgXG4gICAgPGgxPkRhdGVQaXBlIEV4YW1wbGU8L2gxPlxuICAgIDxkYXRlLWV4YW1wbGU+PC9kYXRlLWV4YW1wbGU+XG4gIGBcbn0pXG5leHBvcnQgY2xhc3MgQXBwQ21wIHtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1haW4oKSB7XG4gIGJvb3RzdHJhcChBcHBDbXApO1xufVxuIl19