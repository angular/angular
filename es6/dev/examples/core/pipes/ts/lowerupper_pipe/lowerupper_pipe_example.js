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
    <label>Name: </label><input #name (keyup)="change(name.value)" type="text">
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG93ZXJ1cHBlcl9waXBlX2V4YW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9leGFtcGxlcy9jb3JlL3BpcGVzL3RzL2xvd2VydXBwZXJfcGlwZS9sb3dlcnVwcGVyX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6WyJMb3dlclVwcGVyUGlwZUV4YW1wbGUiLCJMb3dlclVwcGVyUGlwZUV4YW1wbGUuY2hhbmdlIiwiQXBwQ21wIiwibWFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxTQUFTLEVBQVUsTUFBTSxlQUFlO09BQ3pDLEVBQUMsU0FBUyxFQUFDLE1BQU0sb0JBQW9CO0FBRTVDLDRCQUE0QjtBQUM1QjtJQVVFQSxNQUFNQSxDQUFDQSxLQUFLQSxJQUFJQyxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUN2Q0QsQ0FBQ0E7QUFYRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxvQkFBb0I7UUFDOUIsUUFBUSxFQUFFOzs7O1NBSUg7S0FDUixDQUFDOzswQkFJRDtBQUNELGdCQUFnQjtBQUVoQjtBQVNBRSxDQUFDQTtBQVREO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGFBQWE7UUFDdkIsVUFBVSxFQUFFLENBQUMscUJBQXFCLENBQUM7UUFDbkMsUUFBUSxFQUFFOzs7R0FHVDtLQUNGLENBQUM7O1dBRUQ7QUFFRDtJQUNFQyxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtBQUNwQkEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudCwgcHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvYm9vdHN0cmFwJztcblxuLy8gI2RvY3JlZ2lvbiBMb3dlclVwcGVyUGlwZVxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbG93ZXJ1cHBlci1leGFtcGxlJyxcbiAgdGVtcGxhdGU6IGA8ZGl2PlxuICAgIDxsYWJlbD5OYW1lOiA8L2xhYmVsPjxpbnB1dCAjbmFtZSAoa2V5dXApPVwiY2hhbmdlKG5hbWUudmFsdWUpXCIgdHlwZT1cInRleHRcIj5cbiAgICA8cD5JbiBsb3dlcmNhc2U6IDxwcmU+J3t7dmFsdWUgfCBsb3dlcmNhc2V9fSc8L3ByZT48L3A+XG4gICAgPHA+SW4gdXBwZXJjYXNlOiA8cHJlPid7e3ZhbHVlIHwgdXBwZXJjYXNlfX0nPC9wcmU+PC9wPlxuICA8L2Rpdj5gXG59KVxuZXhwb3J0IGNsYXNzIExvd2VyVXBwZXJQaXBlRXhhbXBsZSB7XG4gIHZhbHVlOiBzdHJpbmc7XG4gIGNoYW5nZSh2YWx1ZSkgeyB0aGlzLnZhbHVlID0gdmFsdWU7IH1cbn1cbi8vICNlbmRkb2NyZWdpb25cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZXhhbXBsZS1hcHAnLFxuICBkaXJlY3RpdmVzOiBbTG93ZXJVcHBlclBpcGVFeGFtcGxlXSxcbiAgdGVtcGxhdGU6IGBcbiAgICA8aDE+TG93ZXJjYXNlUGlwZSAmYW1wOyBVcHBlcmNhc2VQaXBlIEV4YW1wbGU8L2gxPlxuICAgIDxsb3dlcnVwcGVyLWV4YW1wbGU+PC9sb3dlcnVwcGVyLWV4YW1wbGU+XG4gIGBcbn0pXG5leHBvcnQgY2xhc3MgQXBwQ21wIHtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1haW4oKSB7XG4gIGJvb3RzdHJhcChBcHBDbXApO1xufVxuIl19