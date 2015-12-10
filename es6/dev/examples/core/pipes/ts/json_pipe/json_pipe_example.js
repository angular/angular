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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbl9waXBlX2V4YW1wbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9leGFtcGxlcy9jb3JlL3BpcGVzL3RzL2pzb25fcGlwZS9qc29uX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6WyJKc29uUGlwZUV4YW1wbGUiLCJKc29uUGlwZUV4YW1wbGUuY29uc3RydWN0b3IiLCJBcHBDbXAiLCJtYWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBVSxNQUFNLGVBQWU7T0FDekMsRUFBQyxTQUFTLEVBQUMsTUFBTSxvQkFBb0I7QUFFNUMsc0JBQXNCO0FBQ3RCO0lBQUFBO1FBVUVDLFdBQU1BLEdBQVdBLEVBQUNBLEdBQUdBLEVBQUVBLEtBQUtBLEVBQUVBLEdBQUdBLEVBQUVBLEtBQUtBLEVBQUVBLE1BQU1BLEVBQUVBLEVBQUNBLEdBQUdBLEVBQUVBLENBQUNBLEVBQUVBLE9BQU9BLEVBQUVBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLEVBQUNBLEVBQUNBLENBQUFBO0lBQ3ZGQSxDQUFDQTtBQUFERCxDQUFDQTtBQVhEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGNBQWM7UUFDeEIsUUFBUSxFQUFFOzs7OztTQUtIO0tBQ1IsQ0FBQzs7b0JBR0Q7QUFDRCxnQkFBZ0I7QUFFaEI7QUFTQUUsQ0FBQ0E7QUFURDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxhQUFhO1FBQ3ZCLFVBQVUsRUFBRSxDQUFDLGVBQWUsQ0FBQztRQUM3QixRQUFRLEVBQUU7OztHQUdUO0tBQ0YsQ0FBQzs7V0FFRDtBQUVEO0lBQ0VDLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0FBQ3BCQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBwcm92aWRlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9ib290c3RyYXAnO1xuXG4vLyAjZG9jcmVnaW9uIEpzb25QaXBlXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdqc29uLWV4YW1wbGUnLFxuICB0ZW1wbGF0ZTogYDxkaXY+XG4gICAgPHA+V2l0aG91dCBKU09OIHBpcGU6PC9wPlxuICAgIDxwcmU+e3tvYmplY3R9fTwvcHJlPlxuICAgIDxwPldpdGggSlNPTiBwaXBlOjwvcD5cbiAgICA8cHJlPnt7b2JqZWN0IHwganNvbn19PC9wcmU+XG4gIDwvZGl2PmBcbn0pXG5leHBvcnQgY2xhc3MgSnNvblBpcGVFeGFtcGxlIHtcbiAgb2JqZWN0OiBPYmplY3QgPSB7Zm9vOiAnYmFyJywgYmF6OiAncXV4JywgbmVzdGVkOiB7eHl6OiAzLCBudW1iZXJzOiBbMSwgMiwgMywgNCwgNV19fVxufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdleGFtcGxlLWFwcCcsXG4gIGRpcmVjdGl2ZXM6IFtKc29uUGlwZUV4YW1wbGVdLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxoMT5Kc29uUGlwZSBFeGFtcGxlPC9oMT5cbiAgICA8anNvbi1leGFtcGxlPjwvanNvbi1leGFtcGxlPlxuICBgXG59KVxuZXhwb3J0IGNsYXNzIEFwcENtcCB7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWluKCkge1xuICBib290c3RyYXAoQXBwQ21wKTtcbn1cbiJdfQ==