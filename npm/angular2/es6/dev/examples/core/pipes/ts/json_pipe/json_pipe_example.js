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
// #docregion JsonPipe
export let JsonPipeExample = class JsonPipeExample {
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
export let AppCmp = class AppCmp {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbl9waXBlX2V4YW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9leGFtcGxlcy9jb3JlL3BpcGVzL3RzL2pzb25fcGlwZS9qc29uX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBVSxNQUFNLGVBQWU7T0FDekMsRUFBQyxTQUFTLEVBQUMsTUFBTSwyQkFBMkI7QUFFbkQsc0JBQXNCO0FBVXRCO0lBQUE7UUFDRSxXQUFNLEdBQVcsRUFBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEVBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUMsRUFBQyxDQUFBO0lBQ3ZGLENBQUM7QUFBRCxDQUFDO0FBWEQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsY0FBYztRQUN4QixRQUFRLEVBQUU7Ozs7O1NBS0g7S0FDUixDQUFDOzttQkFBQTtBQUlGLGdCQUFnQjtBQVVoQjtBQUNBLENBQUM7QUFURDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxhQUFhO1FBQ3ZCLFVBQVUsRUFBRSxDQUFDLGVBQWUsQ0FBQztRQUM3QixRQUFRLEVBQUU7OztHQUdUO0tBQ0YsQ0FBQzs7VUFBQTtBQUlGO0lBQ0UsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudCwgcHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG5cbi8vICNkb2NyZWdpb24gSnNvblBpcGVcbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2pzb24tZXhhbXBsZScsXG4gIHRlbXBsYXRlOiBgPGRpdj5cbiAgICA8cD5XaXRob3V0IEpTT04gcGlwZTo8L3A+XG4gICAgPHByZT57e29iamVjdH19PC9wcmU+XG4gICAgPHA+V2l0aCBKU09OIHBpcGU6PC9wPlxuICAgIDxwcmU+e3tvYmplY3QgfCBqc29ufX08L3ByZT5cbiAgPC9kaXY+YFxufSlcbmV4cG9ydCBjbGFzcyBKc29uUGlwZUV4YW1wbGUge1xuICBvYmplY3Q6IE9iamVjdCA9IHtmb286ICdiYXInLCBiYXo6ICdxdXgnLCBuZXN0ZWQ6IHt4eXo6IDMsIG51bWJlcnM6IFsxLCAyLCAzLCA0LCA1XX19XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2V4YW1wbGUtYXBwJyxcbiAgZGlyZWN0aXZlczogW0pzb25QaXBlRXhhbXBsZV0sXG4gIHRlbXBsYXRlOiBgXG4gICAgPGgxPkpzb25QaXBlIEV4YW1wbGU8L2gxPlxuICAgIDxqc29uLWV4YW1wbGU+PC9qc29uLWV4YW1wbGU+XG4gIGBcbn0pXG5leHBvcnQgY2xhc3MgQXBwQ21wIHtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1haW4oKSB7XG4gIGJvb3RzdHJhcChBcHBDbXApO1xufVxuIl19