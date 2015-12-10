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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG93ZXJ1cHBlcl9waXBlX2V4YW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9leGFtcGxlcy9jb3JlL3BpcGVzL3RzL2xvd2VydXBwZXJfcGlwZS9sb3dlcnVwcGVyX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6WyJMb3dlclVwcGVyUGlwZUV4YW1wbGUiLCJMb3dlclVwcGVyUGlwZUV4YW1wbGUuY2hhbmdlIiwiQXBwQ21wIiwibWFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxTQUFTLEVBQVUsTUFBTSxlQUFlO09BQ3pDLEVBQUMsU0FBUyxFQUFDLE1BQU0sb0JBQW9CO0FBRTVDLDRCQUE0QjtBQUM1QjtJQVVFQSxNQUFNQSxDQUFDQSxLQUFLQSxJQUFJQyxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUN2Q0QsQ0FBQ0E7QUFYRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxvQkFBb0I7UUFDOUIsUUFBUSxFQUFFOzs7O1NBSUg7S0FDUixDQUFDOzswQkFJRDtBQUNELGdCQUFnQjtBQUVoQjtBQVNBRSxDQUFDQTtBQVREO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGFBQWE7UUFDdkIsVUFBVSxFQUFFLENBQUMscUJBQXFCLENBQUM7UUFDbkMsUUFBUSxFQUFFOzs7R0FHVDtLQUNGLENBQUM7O1dBRUQ7QUFFRDtJQUNFQyxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtBQUNwQkEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudCwgcHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvYm9vdHN0cmFwJztcblxuLy8gI2RvY3JlZ2lvbiBMb3dlclVwcGVyUGlwZVxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbG93ZXJ1cHBlci1leGFtcGxlJyxcbiAgdGVtcGxhdGU6IGA8ZGl2PlxuICAgIDxsYWJlbD5OYW1lOiA8L2xhYmVsPjxpbnB1dCAjbmFtZSAoa2V5dXApPVwiY2hhbmdlKG5hbWUudmFsdWUpXCIgdHlwZT1cInRleHRcIj48L2lucHV0PlxuICAgIDxwPkluIGxvd2VyY2FzZTogPHByZT4ne3t2YWx1ZSB8IGxvd2VyY2FzZX19JzwvcHJlPjwvcD5cbiAgICA8cD5JbiB1cHBlcmNhc2U6IDxwcmU+J3t7dmFsdWUgfCB1cHBlcmNhc2V9fSc8L3ByZT48L3A+XG4gIDwvZGl2PmBcbn0pXG5leHBvcnQgY2xhc3MgTG93ZXJVcHBlclBpcGVFeGFtcGxlIHtcbiAgdmFsdWU6IHN0cmluZztcbiAgY2hhbmdlKHZhbHVlKSB7IHRoaXMudmFsdWUgPSB2YWx1ZTsgfVxufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdleGFtcGxlLWFwcCcsXG4gIGRpcmVjdGl2ZXM6IFtMb3dlclVwcGVyUGlwZUV4YW1wbGVdLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxoMT5Mb3dlcmNhc2VQaXBlICZhbXA7IFVwcGVyY2FzZVBpcGUgRXhhbXBsZTwvaDE+XG4gICAgPGxvd2VydXBwZXItZXhhbXBsZT48L2xvd2VydXBwZXItZXhhbXBsZT5cbiAgYFxufSlcbmV4cG9ydCBjbGFzcyBBcHBDbXAge1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFpbigpIHtcbiAgYm9vdHN0cmFwKEFwcENtcCk7XG59XG4iXX0=