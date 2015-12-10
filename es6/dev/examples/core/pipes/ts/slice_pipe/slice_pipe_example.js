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
// #docregion SlicePipe_string
export let SlicePipeStringExample = class {
    constructor() {
        this.str = 'abcdefghij';
    }
};
SlicePipeStringExample = __decorate([
    Component({
        selector: 'slice-string-example',
        template: `<div>
    <p>{{str}}[0:4]: '{{str | slice:0:4}}' - output is expected to be 'abcd'</p>
    <p>{{str}}[4:0]: '{{str | slice:4:0}}' - output is expected to be ''</p>
    <p>{{str}}[-4]: '{{str | slice:-4}}' - output is expected to be 'ghij'</p>
    <p>{{str}}[-4:-2]: '{{str | slice:-4:-2}}' - output is expected to be 'gh'</p>
    <p>{{str}}[-100]: '{{str | slice:-100}}' - output is expected to be 'abcdefghij'</p>
    <p>{{str}}[100]: '{{str | slice:100}}' - output is expected to be ''</p>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], SlicePipeStringExample);
// #enddocregion
// #docregion SlicePipe_list
export let SlicePipeListExample = class {
    constructor() {
        this.collection = ['a', 'b', 'c', 'd'];
    }
};
SlicePipeListExample = __decorate([
    Component({
        selector: 'slice-list-example',
        template: `<div>
    <li *ngFor="var i of collection | slice:1:3">{{i}}</li>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], SlicePipeListExample);
// #enddocregion
export let AppCmp = class {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        directives: [SlicePipeListExample, SlicePipeStringExample],
        template: `
    <h1>SlicePipe Examples</h1>
    <slice-list-example></slice-list-example>
    <slice-string-example></slice-string-example>
  `
    }), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    bootstrap(AppCmp);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpY2VfcGlwZV9leGFtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvZXhhbXBsZXMvY29yZS9waXBlcy90cy9zbGljZV9waXBlL3NsaWNlX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6WyJTbGljZVBpcGVTdHJpbmdFeGFtcGxlIiwiU2xpY2VQaXBlU3RyaW5nRXhhbXBsZS5jb25zdHJ1Y3RvciIsIlNsaWNlUGlwZUxpc3RFeGFtcGxlIiwiU2xpY2VQaXBlTGlzdEV4YW1wbGUuY29uc3RydWN0b3IiLCJBcHBDbXAiLCJtYWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBVSxNQUFNLGVBQWU7T0FDekMsRUFBQyxTQUFTLEVBQUMsTUFBTSxvQkFBb0I7QUFFNUMsOEJBQThCO0FBQzlCO0lBQUFBO1FBWUVDLFFBQUdBLEdBQVdBLFlBQVlBLENBQUNBO0lBQzdCQSxDQUFDQTtBQUFERCxDQUFDQTtBQWJEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLHNCQUFzQjtRQUNoQyxRQUFRLEVBQUU7Ozs7Ozs7U0FPSDtLQUNSLENBQUM7OzJCQUdEO0FBQ0QsZ0JBQWdCO0FBRWhCLDRCQUE0QjtBQUM1QjtJQUFBRTtRQU9FQyxlQUFVQSxHQUFhQSxDQUFDQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUM5Q0EsQ0FBQ0E7QUFBREQsQ0FBQ0E7QUFSRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxvQkFBb0I7UUFDOUIsUUFBUSxFQUFFOztTQUVIO0tBQ1IsQ0FBQzs7eUJBR0Q7QUFDRCxnQkFBZ0I7QUFFaEI7QUFVQUUsQ0FBQ0E7QUFWRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxhQUFhO1FBQ3ZCLFVBQVUsRUFBRSxDQUFDLG9CQUFvQixFQUFFLHNCQUFzQixDQUFDO1FBQzFELFFBQVEsRUFBRTs7OztHQUlUO0tBQ0YsQ0FBQzs7V0FFRDtBQUVEO0lBQ0VDLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0FBQ3BCQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBwcm92aWRlfSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9ib290c3RyYXAnO1xuXG4vLyAjZG9jcmVnaW9uIFNsaWNlUGlwZV9zdHJpbmdcbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3NsaWNlLXN0cmluZy1leGFtcGxlJyxcbiAgdGVtcGxhdGU6IGA8ZGl2PlxuICAgIDxwPnt7c3RyfX1bMDo0XTogJ3t7c3RyIHwgc2xpY2U6MDo0fX0nIC0gb3V0cHV0IGlzIGV4cGVjdGVkIHRvIGJlICdhYmNkJzwvcD5cbiAgICA8cD57e3N0cn19WzQ6MF06ICd7e3N0ciB8IHNsaWNlOjQ6MH19JyAtIG91dHB1dCBpcyBleHBlY3RlZCB0byBiZSAnJzwvcD5cbiAgICA8cD57e3N0cn19Wy00XTogJ3t7c3RyIHwgc2xpY2U6LTR9fScgLSBvdXRwdXQgaXMgZXhwZWN0ZWQgdG8gYmUgJ2doaWonPC9wPlxuICAgIDxwPnt7c3RyfX1bLTQ6LTJdOiAne3tzdHIgfCBzbGljZTotNDotMn19JyAtIG91dHB1dCBpcyBleHBlY3RlZCB0byBiZSAnZ2gnPC9wPlxuICAgIDxwPnt7c3RyfX1bLTEwMF06ICd7e3N0ciB8IHNsaWNlOi0xMDB9fScgLSBvdXRwdXQgaXMgZXhwZWN0ZWQgdG8gYmUgJ2FiY2RlZmdoaWonPC9wPlxuICAgIDxwPnt7c3RyfX1bMTAwXTogJ3t7c3RyIHwgc2xpY2U6MTAwfX0nIC0gb3V0cHV0IGlzIGV4cGVjdGVkIHRvIGJlICcnPC9wPlxuICA8L2Rpdj5gXG59KVxuZXhwb3J0IGNsYXNzIFNsaWNlUGlwZVN0cmluZ0V4YW1wbGUge1xuICBzdHI6IHN0cmluZyA9ICdhYmNkZWZnaGlqJztcbn1cbi8vICNlbmRkb2NyZWdpb25cblxuLy8gI2RvY3JlZ2lvbiBTbGljZVBpcGVfbGlzdFxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnc2xpY2UtbGlzdC1leGFtcGxlJyxcbiAgdGVtcGxhdGU6IGA8ZGl2PlxuICAgIDxsaSAqbmdGb3I9XCJ2YXIgaSBvZiBjb2xsZWN0aW9uIHwgc2xpY2U6MTozXCI+e3tpfX08L2xpPlxuICA8L2Rpdj5gXG59KVxuZXhwb3J0IGNsYXNzIFNsaWNlUGlwZUxpc3RFeGFtcGxlIHtcbiAgY29sbGVjdGlvbjogc3RyaW5nW10gPSBbJ2EnLCAnYicsICdjJywgJ2QnXTtcbn1cbi8vICNlbmRkb2NyZWdpb25cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZXhhbXBsZS1hcHAnLFxuICBkaXJlY3RpdmVzOiBbU2xpY2VQaXBlTGlzdEV4YW1wbGUsIFNsaWNlUGlwZVN0cmluZ0V4YW1wbGVdLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxoMT5TbGljZVBpcGUgRXhhbXBsZXM8L2gxPlxuICAgIDxzbGljZS1saXN0LWV4YW1wbGU+PC9zbGljZS1saXN0LWV4YW1wbGU+XG4gICAgPHNsaWNlLXN0cmluZy1leGFtcGxlPjwvc2xpY2Utc3RyaW5nLWV4YW1wbGU+XG4gIGBcbn0pXG5leHBvcnQgY2xhc3MgQXBwQ21wIHtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1haW4oKSB7XG4gIGJvb3RzdHJhcChBcHBDbXApO1xufVxuIl19