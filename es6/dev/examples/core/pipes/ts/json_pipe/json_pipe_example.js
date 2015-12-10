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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbl9waXBlX2V4YW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9leGFtcGxlcy9jb3JlL3BpcGVzL3RzL2pzb25fcGlwZS9qc29uX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6WyJKc29uUGlwZUV4YW1wbGUiLCJKc29uUGlwZUV4YW1wbGUuY29uc3RydWN0b3IiLCJBcHBDbXAiLCJtYWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFVLE1BQU0sbUJBQW1CO09BQzdDLEVBQUMsU0FBUyxFQUFDLE1BQU0sb0JBQW9CO0FBRTVDLHNCQUFzQjtBQUN0QjtJQUFBQTtRQVVFQyxXQUFNQSxHQUFXQSxFQUFDQSxHQUFHQSxFQUFFQSxLQUFLQSxFQUFFQSxHQUFHQSxFQUFFQSxLQUFLQSxFQUFFQSxNQUFNQSxFQUFFQSxFQUFDQSxHQUFHQSxFQUFFQSxDQUFDQSxFQUFFQSxPQUFPQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUFDQSxFQUFDQSxDQUFBQTtJQUN2RkEsQ0FBQ0E7QUFBREQsQ0FBQ0E7QUFYRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxjQUFjO1FBQ3hCLFFBQVEsRUFBRTs7Ozs7U0FLSDtLQUNSLENBQUM7O29CQUdEO0FBQ0QsZ0JBQWdCO0FBRWhCO0FBU0FFLENBQUNBO0FBVEQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsYUFBYTtRQUN2QixVQUFVLEVBQUUsQ0FBQyxlQUFlLENBQUM7UUFDN0IsUUFBUSxFQUFFOzs7R0FHVDtLQUNGLENBQUM7O1dBRUQ7QUFFRDtJQUNFQyxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtBQUNwQkEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudCwgcHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL2Jvb3RzdHJhcCc7XG5cbi8vICNkb2NyZWdpb24gSnNvblBpcGVcbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2pzb24tZXhhbXBsZScsXG4gIHRlbXBsYXRlOiBgPGRpdj5cbiAgICA8cD5XaXRob3V0IEpTT04gcGlwZTo8L3A+XG4gICAgPHByZT57e29iamVjdH19PC9wcmU+XG4gICAgPHA+V2l0aCBKU09OIHBpcGU6PC9wPlxuICAgIDxwcmU+e3tvYmplY3QgfCBqc29ufX08L3ByZT5cbiAgPC9kaXY+YFxufSlcbmV4cG9ydCBjbGFzcyBKc29uUGlwZUV4YW1wbGUge1xuICBvYmplY3Q6IE9iamVjdCA9IHtmb286ICdiYXInLCBiYXo6ICdxdXgnLCBuZXN0ZWQ6IHt4eXo6IDMsIG51bWJlcnM6IFsxLCAyLCAzLCA0LCA1XX19XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2V4YW1wbGUtYXBwJyxcbiAgZGlyZWN0aXZlczogW0pzb25QaXBlRXhhbXBsZV0sXG4gIHRlbXBsYXRlOiBgIFxuICAgIDxoMT5Kc29uUGlwZSBFeGFtcGxlPC9oMT5cbiAgICA8anNvbi1leGFtcGxlPjwvanNvbi1leGFtcGxlPlxuICBgXG59KVxuZXhwb3J0IGNsYXNzIEFwcENtcCB7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWluKCkge1xuICBib290c3RyYXAoQXBwQ21wKTtcbn1cbiJdfQ==