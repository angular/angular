var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from 'angular2/angular2';
import { bootstrap } from 'angular2/bootstrap';
// #docregion JsonPipe
export let JsonPipeExample = class {
    constructor() {
        this.object = { foo: 'bar', baz: 'qux', nested: { xyz: 3, numbers: [1, 2, 3, 4, 5] } };
    }
};
JsonPipeExample = __decorate([
    Component({
        selector: 'json-example',
        template: `<div>
    <p>Without JSON pipe:</p>
    <pre>{{object}}</pre>
    <p>With JSON pipe:</p>
    <pre>{{object | json}}</pre>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], JsonPipeExample);
// #enddocregion
export let AppCmp = class {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        directives: [JsonPipeExample],
        template: ` 
    <h1>JsonPipe Example</h1>
    <json-example></json-example>
  `
    }), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    bootstrap(AppCmp);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbl9waXBlX2V4YW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9leGFtcGxlcy9jb3JlL3BpcGVzL3RzL2pzb25fcGlwZS9qc29uX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6WyJKc29uUGlwZUV4YW1wbGUiLCJKc29uUGlwZUV4YW1wbGUuY29uc3RydWN0b3IiLCJBcHBDbXAiLCJtYWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBVSxNQUFNLG1CQUFtQjtPQUM3QyxFQUFDLFNBQVMsRUFBQyxNQUFNLG9CQUFvQjtBQUU1QyxzQkFBc0I7QUFDdEI7SUFBQUE7UUFVRUMsV0FBTUEsR0FBV0EsRUFBQ0EsR0FBR0EsRUFBRUEsS0FBS0EsRUFBRUEsR0FBR0EsRUFBRUEsS0FBS0EsRUFBRUEsTUFBTUEsRUFBRUEsRUFBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0EsRUFBRUEsT0FBT0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsRUFBQ0EsRUFBQ0EsQ0FBQUE7SUFDdkZBLENBQUNBO0FBQURELENBQUNBO0FBWEQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsY0FBYztRQUN4QixRQUFRLEVBQUU7Ozs7O1NBS0g7S0FDUixDQUFDOztvQkFHRDtBQUNELGdCQUFnQjtBQUVoQjtBQVNBRSxDQUFDQTtBQVREO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGFBQWE7UUFDdkIsVUFBVSxFQUFFLENBQUMsZUFBZSxDQUFDO1FBQzdCLFFBQVEsRUFBRTs7O0dBR1Q7S0FDRixDQUFDOztXQUVEO0FBRUQ7SUFDRUMsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7QUFDcEJBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIHByb3ZpZGV9IGZyb20gJ2FuZ3VsYXIyL2FuZ3VsYXIyJztcbmltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9ib290c3RyYXAnO1xuXG4vLyAjZG9jcmVnaW9uIEpzb25QaXBlXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdqc29uLWV4YW1wbGUnLFxuICB0ZW1wbGF0ZTogYDxkaXY+XG4gICAgPHA+V2l0aG91dCBKU09OIHBpcGU6PC9wPlxuICAgIDxwcmU+e3tvYmplY3R9fTwvcHJlPlxuICAgIDxwPldpdGggSlNPTiBwaXBlOjwvcD5cbiAgICA8cHJlPnt7b2JqZWN0IHwganNvbn19PC9wcmU+XG4gIDwvZGl2PmBcbn0pXG5leHBvcnQgY2xhc3MgSnNvblBpcGVFeGFtcGxlIHtcbiAgb2JqZWN0OiBPYmplY3QgPSB7Zm9vOiAnYmFyJywgYmF6OiAncXV4JywgbmVzdGVkOiB7eHl6OiAzLCBudW1iZXJzOiBbMSwgMiwgMywgNCwgNV19fVxufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdleGFtcGxlLWFwcCcsXG4gIGRpcmVjdGl2ZXM6IFtKc29uUGlwZUV4YW1wbGVdLFxuICB0ZW1wbGF0ZTogYCBcbiAgICA8aDE+SnNvblBpcGUgRXhhbXBsZTwvaDE+XG4gICAgPGpzb24tZXhhbXBsZT48L2pzb24tZXhhbXBsZT5cbiAgYFxufSlcbmV4cG9ydCBjbGFzcyBBcHBDbXAge1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFpbigpIHtcbiAgYm9vdHN0cmFwKEFwcENtcCk7XG59XG4iXX0=