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
// #docregion DatePipe
export let DatePipeExample = class {
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
export let AppCmp = class {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZV9waXBlX2V4YW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9leGFtcGxlcy9jb3JlL3BpcGVzL3RzL2RhdGVfcGlwZS9kYXRlX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6WyJEYXRlUGlwZUV4YW1wbGUiLCJEYXRlUGlwZUV4YW1wbGUuY29uc3RydWN0b3IiLCJBcHBDbXAiLCJtYWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFVLE1BQU0sbUJBQW1CO09BQzdDLEVBQUMsU0FBUyxFQUFDLE1BQU0sb0JBQW9CO0FBRTVDLHNCQUFzQjtBQUN0QjtJQUFBQTtRQVNFQyxVQUFLQSxHQUFXQSxJQUFJQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQTtJQUM3QkEsQ0FBQ0E7QUFBREQsQ0FBQ0E7QUFWRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxjQUFjO1FBQ3hCLFFBQVEsRUFBRTs7OztTQUlIO0tBQ1IsQ0FBQzs7b0JBR0Q7QUFDRCxnQkFBZ0I7QUFFaEI7QUFTQUUsQ0FBQ0E7QUFURDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxhQUFhO1FBQ3ZCLFVBQVUsRUFBRSxDQUFDLGVBQWUsQ0FBQztRQUM3QixRQUFRLEVBQUU7OztHQUdUO0tBQ0YsQ0FBQzs7V0FFRDtBQUVEO0lBQ0VDLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0FBQ3BCQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBwcm92aWRlfSBmcm9tICdhbmd1bGFyMi9hbmd1bGFyMic7XG5pbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvYm9vdHN0cmFwJztcblxuLy8gI2RvY3JlZ2lvbiBEYXRlUGlwZVxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZGF0ZS1leGFtcGxlJyxcbiAgdGVtcGxhdGU6IGA8ZGl2PlxuICAgIDxwPlRvZGF5IGlzIHt7dG9kYXkgfCBkYXRlfX08L3A+XG4gICAgPHA+T3IgaWYgeW91IHByZWZlciwge3t0b2RheSB8IGRhdGU6J2Z1bGxEYXRlJ319PC9wPlxuICAgIDxwPlRoZSB0aW1lIGlzIHt7dG9kYXkgfCBkYXRlOidqbVonfX08L3A+XG4gIDwvZGl2PmBcbn0pXG5leHBvcnQgY2xhc3MgRGF0ZVBpcGVFeGFtcGxlIHtcbiAgdG9kYXk6IG51bWJlciA9IERhdGUubm93KCk7XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2V4YW1wbGUtYXBwJyxcbiAgZGlyZWN0aXZlczogW0RhdGVQaXBlRXhhbXBsZV0sXG4gIHRlbXBsYXRlOiBgXG4gICAgPGgxPkRhdGVQaXBlIEV4YW1wbGU8L2gxPlxuICAgIDxkYXRlLWV4YW1wbGU+PC9kYXRlLWV4YW1wbGU+XG4gIGBcbn0pXG5leHBvcnQgY2xhc3MgQXBwQ21wIHtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1haW4oKSB7XG4gIGJvb3RzdHJhcChBcHBDbXApO1xufVxuIl19