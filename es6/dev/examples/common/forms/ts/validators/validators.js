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
let MinLengthTestComponent = class {
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
let MaxLengthTestComponent = class {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmFsaWRhdG9ycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL2V4YW1wbGVzL2NvbW1vbi9mb3Jtcy90cy92YWxpZGF0b3JzL3ZhbGlkYXRvcnMudHMiXSwibmFtZXMiOlsiTWluTGVuZ3RoVGVzdENvbXBvbmVudCIsIk1heExlbmd0aFRlc3RDb21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFDLE1BQU0sZUFBZTtPQUNoQyxFQUFDLGtCQUFrQixFQUFFLGtCQUFrQixFQUFDLE1BQU0saUJBQWlCO0FBRXRFLGlCQUFpQjtBQUNqQjtBQVVBQSxDQUFDQTtBQVZEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLFNBQVM7UUFDbkIsVUFBVSxFQUFFLENBQUMsa0JBQWtCLENBQUM7UUFDaEMsUUFBUSxFQUFFOzs7O0NBSVg7S0FDQSxDQUFDOzsyQkFFRDtBQUNELGdCQUFnQjtBQUVoQixpQkFBaUI7QUFDakI7QUFVQUMsQ0FBQ0E7QUFWRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxTQUFTO1FBQ25CLFVBQVUsRUFBRSxDQUFDLGtCQUFrQixDQUFDO1FBQ2hDLFFBQVEsRUFBRTs7OztDQUlYO0tBQ0EsQ0FBQzs7MkJBRUQ7QUFDRCxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge01pbkxlbmd0aFZhbGlkYXRvciwgTWF4TGVuZ3RoVmFsaWRhdG9yfSBmcm9tICdhbmd1bGFyMi9jb21tb24nO1xuXG4vLyAjZG9jcmVnaW9uIG1pblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbWluLWNtcCcsXG4gIGRpcmVjdGl2ZXM6IFtNaW5MZW5ndGhWYWxpZGF0b3JdLFxuICB0ZW1wbGF0ZTogYFxuPGZvcm0+XG4gIDxwPlllYXI6IDxpbnB1dCBuZ0NvbnRyb2w9XCJ5ZWFyXCIgbWlubGVuZ3RoPVwiMlwiPjwvcD5cbjwvZm9ybT5cbmBcbn0pXG5jbGFzcyBNaW5MZW5ndGhUZXN0Q29tcG9uZW50IHtcbn1cbi8vICNlbmRkb2NyZWdpb25cblxuLy8gI2RvY3JlZ2lvbiBtYXhcbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ21heC1jbXAnLFxuICBkaXJlY3RpdmVzOiBbTWF4TGVuZ3RoVmFsaWRhdG9yXSxcbiAgdGVtcGxhdGU6IGBcbjxmb3JtPlxuICA8cD5ZZWFyOiA8aW5wdXQgbmdDb250cm9sPVwieWVhclwiIG1heGxlbmd0aD1cIjRcIj48L3A+XG48L2Zvcm0+XG5gXG59KVxuY2xhc3MgTWF4TGVuZ3RoVGVzdENvbXBvbmVudCB7XG59XG4vLyAjZW5kZG9jcmVnaW9uXG4iXX0=