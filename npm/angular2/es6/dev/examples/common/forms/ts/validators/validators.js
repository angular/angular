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
import { MinLengthValidator, MaxLengthValidator } from 'angular2/common';
// #docregion min
let MinLengthTestComponent = class MinLengthTestComponent {
};
MinLengthTestComponent = __decorate([
    Component({
        selector: 'min-cmp',
        directives: [MinLengthValidator],
        template: `
<form>
  <p>Year: <input ngControl="year" minlength="2"></p>
</form>
`
    }), 
    __metadata('design:paramtypes', [])
], MinLengthTestComponent);
// #enddocregion
// #docregion max
let MaxLengthTestComponent = class MaxLengthTestComponent {
};
MaxLengthTestComponent = __decorate([
    Component({
        selector: 'max-cmp',
        directives: [MaxLengthValidator],
        template: `
<form>
  <p>Year: <input ngControl="year" maxlength="4"></p>
</form>
`
    }), 
    __metadata('design:paramtypes', [])
], MaxLengthTestComponent);
// #enddocregion
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL2V4YW1wbGVzL2NvbW1vbi9mb3Jtcy90cy92YWxpZGF0b3JzL3ZhbGlkYXRvcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxTQUFTLEVBQUMsTUFBTSxlQUFlO09BQ2hDLEVBQUMsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQUMsTUFBTSxpQkFBaUI7QUFFdEUsaUJBQWlCO0FBVWpCO0FBQ0EsQ0FBQztBQVZEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLFNBQVM7UUFDbkIsVUFBVSxFQUFFLENBQUMsa0JBQWtCLENBQUM7UUFDaEMsUUFBUSxFQUFFOzs7O0NBSVg7S0FDQSxDQUFDOzswQkFBQTtBQUdGLGdCQUFnQjtBQUVoQixpQkFBaUI7QUFVakI7QUFDQSxDQUFDO0FBVkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsU0FBUztRQUNuQixVQUFVLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQztRQUNoQyxRQUFRLEVBQUU7Ozs7Q0FJWDtLQUNBLENBQUM7OzBCQUFBO0FBR0YsZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtNaW5MZW5ndGhWYWxpZGF0b3IsIE1heExlbmd0aFZhbGlkYXRvcn0gZnJvbSAnYW5ndWxhcjIvY29tbW9uJztcblxuLy8gI2RvY3JlZ2lvbiBtaW5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ21pbi1jbXAnLFxuICBkaXJlY3RpdmVzOiBbTWluTGVuZ3RoVmFsaWRhdG9yXSxcbiAgdGVtcGxhdGU6IGBcbjxmb3JtPlxuICA8cD5ZZWFyOiA8aW5wdXQgbmdDb250cm9sPVwieWVhclwiIG1pbmxlbmd0aD1cIjJcIj48L3A+XG48L2Zvcm0+XG5gXG59KVxuY2xhc3MgTWluTGVuZ3RoVGVzdENvbXBvbmVudCB7XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cbi8vICNkb2NyZWdpb24gbWF4XG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdtYXgtY21wJyxcbiAgZGlyZWN0aXZlczogW01heExlbmd0aFZhbGlkYXRvcl0sXG4gIHRlbXBsYXRlOiBgXG48Zm9ybT5cbiAgPHA+WWVhcjogPGlucHV0IG5nQ29udHJvbD1cInllYXJcIiBtYXhsZW5ndGg9XCI0XCI+PC9wPlxuPC9mb3JtPlxuYFxufSlcbmNsYXNzIE1heExlbmd0aFRlc3RDb21wb25lbnQge1xufVxuLy8gI2VuZGRvY3JlZ2lvblxuIl19