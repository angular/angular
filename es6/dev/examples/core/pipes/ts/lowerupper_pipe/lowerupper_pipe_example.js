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
// #docregion LowerUpperPipe
export let LowerUpperPipeExample = class {
    change(value) { this.value = value; }
};
LowerUpperPipeExample = __decorate([
    Component({
        selector: 'lowerupper-example',
        template: `<div>
    <label>Name: </label><input #name (keyup)="change(name.value)" type="text"></input>
    <p>In lowercase: <pre>'{{value | lowercase}}'</pre></p>
    <p>In uppercase: <pre>'{{value | uppercase}}'</pre></p>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], LowerUpperPipeExample);
// #enddocregion
export let AppCmp = class {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        directives: [LowerUpperPipeExample],
        template: ` 
    <h1>LowercasePipe &amp; UppercasePipe Example</h1>
    <lowerupper-example></lowerupper-example>
  `
    }), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    bootstrap(AppCmp);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG93ZXJ1cHBlcl9waXBlX2V4YW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9leGFtcGxlcy9jb3JlL3BpcGVzL3RzL2xvd2VydXBwZXJfcGlwZS9sb3dlcnVwcGVyX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6WyJMb3dlclVwcGVyUGlwZUV4YW1wbGUiLCJMb3dlclVwcGVyUGlwZUV4YW1wbGUuY2hhbmdlIiwiQXBwQ21wIiwibWFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBVSxNQUFNLG1CQUFtQjtPQUM3QyxFQUFDLFNBQVMsRUFBQyxNQUFNLG9CQUFvQjtBQUU1Qyw0QkFBNEI7QUFDNUI7SUFVRUEsTUFBTUEsQ0FBQ0EsS0FBS0EsSUFBSUMsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDdkNELENBQUNBO0FBWEQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsb0JBQW9CO1FBQzlCLFFBQVEsRUFBRTs7OztTQUlIO0tBQ1IsQ0FBQzs7MEJBSUQ7QUFDRCxnQkFBZ0I7QUFFaEI7QUFTQUUsQ0FBQ0E7QUFURDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxhQUFhO1FBQ3ZCLFVBQVUsRUFBRSxDQUFDLHFCQUFxQixDQUFDO1FBQ25DLFFBQVEsRUFBRTs7O0dBR1Q7S0FDRixDQUFDOztXQUVEO0FBRUQ7SUFDRUMsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7QUFDcEJBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIHByb3ZpZGV9IGZyb20gJ2FuZ3VsYXIyL2FuZ3VsYXIyJztcbmltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9ib290c3RyYXAnO1xuXG4vLyAjZG9jcmVnaW9uIExvd2VyVXBwZXJQaXBlXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdsb3dlcnVwcGVyLWV4YW1wbGUnLFxuICB0ZW1wbGF0ZTogYDxkaXY+XG4gICAgPGxhYmVsPk5hbWU6IDwvbGFiZWw+PGlucHV0ICNuYW1lIChrZXl1cCk9XCJjaGFuZ2UobmFtZS52YWx1ZSlcIiB0eXBlPVwidGV4dFwiPjwvaW5wdXQ+XG4gICAgPHA+SW4gbG93ZXJjYXNlOiA8cHJlPid7e3ZhbHVlIHwgbG93ZXJjYXNlfX0nPC9wcmU+PC9wPlxuICAgIDxwPkluIHVwcGVyY2FzZTogPHByZT4ne3t2YWx1ZSB8IHVwcGVyY2FzZX19JzwvcHJlPjwvcD5cbiAgPC9kaXY+YFxufSlcbmV4cG9ydCBjbGFzcyBMb3dlclVwcGVyUGlwZUV4YW1wbGUge1xuICB2YWx1ZTogc3RyaW5nO1xuICBjaGFuZ2UodmFsdWUpIHsgdGhpcy52YWx1ZSA9IHZhbHVlOyB9XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2V4YW1wbGUtYXBwJyxcbiAgZGlyZWN0aXZlczogW0xvd2VyVXBwZXJQaXBlRXhhbXBsZV0sXG4gIHRlbXBsYXRlOiBgIFxuICAgIDxoMT5Mb3dlcmNhc2VQaXBlICZhbXA7IFVwcGVyY2FzZVBpcGUgRXhhbXBsZTwvaDE+XG4gICAgPGxvd2VydXBwZXItZXhhbXBsZT48L2xvd2VydXBwZXItZXhhbXBsZT5cbiAgYFxufSlcbmV4cG9ydCBjbGFzcyBBcHBDbXAge1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFpbigpIHtcbiAgYm9vdHN0cmFwKEFwcENtcCk7XG59XG4iXX0=