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
// #docregion SlicePipe_string
export let SlicePipeStringExample = class SlicePipeStringExample {
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
export let SlicePipeListExample = class SlicePipeListExample {
    constructor() {
        this.collection = ['a', 'b', 'c', 'd'];
    }
};
SlicePipeListExample = __decorate([
    Component({
        selector: 'slice-list-example',
        template: `<div>
    <li *ngFor="let  i of collection | slice:1:3">{{i}}</li>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], SlicePipeListExample);
// #enddocregion
export let AppCmp = class AppCmp {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpY2VfcGlwZV9leGFtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvZXhhbXBsZXMvY29yZS9waXBlcy90cy9zbGljZV9waXBlL3NsaWNlX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBVSxNQUFNLGVBQWU7T0FDekMsRUFBQyxTQUFTLEVBQUMsTUFBTSwyQkFBMkI7QUFFbkQsOEJBQThCO0FBWTlCO0lBQUE7UUFDRSxRQUFHLEdBQVcsWUFBWSxDQUFDO0lBQzdCLENBQUM7QUFBRCxDQUFDO0FBYkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsc0JBQXNCO1FBQ2hDLFFBQVEsRUFBRTs7Ozs7OztTQU9IO0tBQ1IsQ0FBQzs7MEJBQUE7QUFJRixnQkFBZ0I7QUFFaEIsNEJBQTRCO0FBTzVCO0lBQUE7UUFDRSxlQUFVLEdBQWEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUM5QyxDQUFDO0FBQUQsQ0FBQztBQVJEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLG9CQUFvQjtRQUM5QixRQUFRLEVBQUU7O1NBRUg7S0FDUixDQUFDOzt3QkFBQTtBQUlGLGdCQUFnQjtBQVdoQjtBQUNBLENBQUM7QUFWRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxhQUFhO1FBQ3ZCLFVBQVUsRUFBRSxDQUFDLG9CQUFvQixFQUFFLHNCQUFzQixDQUFDO1FBQzFELFFBQVEsRUFBRTs7OztHQUlUO0tBQ0YsQ0FBQzs7VUFBQTtBQUlGO0lBQ0UsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudCwgcHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG5cbi8vICNkb2NyZWdpb24gU2xpY2VQaXBlX3N0cmluZ1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnc2xpY2Utc3RyaW5nLWV4YW1wbGUnLFxuICB0ZW1wbGF0ZTogYDxkaXY+XG4gICAgPHA+e3tzdHJ9fVswOjRdOiAne3tzdHIgfCBzbGljZTowOjR9fScgLSBvdXRwdXQgaXMgZXhwZWN0ZWQgdG8gYmUgJ2FiY2QnPC9wPlxuICAgIDxwPnt7c3RyfX1bNDowXTogJ3t7c3RyIHwgc2xpY2U6NDowfX0nIC0gb3V0cHV0IGlzIGV4cGVjdGVkIHRvIGJlICcnPC9wPlxuICAgIDxwPnt7c3RyfX1bLTRdOiAne3tzdHIgfCBzbGljZTotNH19JyAtIG91dHB1dCBpcyBleHBlY3RlZCB0byBiZSAnZ2hpaic8L3A+XG4gICAgPHA+e3tzdHJ9fVstNDotMl06ICd7e3N0ciB8IHNsaWNlOi00Oi0yfX0nIC0gb3V0cHV0IGlzIGV4cGVjdGVkIHRvIGJlICdnaCc8L3A+XG4gICAgPHA+e3tzdHJ9fVstMTAwXTogJ3t7c3RyIHwgc2xpY2U6LTEwMH19JyAtIG91dHB1dCBpcyBleHBlY3RlZCB0byBiZSAnYWJjZGVmZ2hpaic8L3A+XG4gICAgPHA+e3tzdHJ9fVsxMDBdOiAne3tzdHIgfCBzbGljZToxMDB9fScgLSBvdXRwdXQgaXMgZXhwZWN0ZWQgdG8gYmUgJyc8L3A+XG4gIDwvZGl2PmBcbn0pXG5leHBvcnQgY2xhc3MgU2xpY2VQaXBlU3RyaW5nRXhhbXBsZSB7XG4gIHN0cjogc3RyaW5nID0gJ2FiY2RlZmdoaWonO1xufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG4vLyAjZG9jcmVnaW9uIFNsaWNlUGlwZV9saXN0XG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdzbGljZS1saXN0LWV4YW1wbGUnLFxuICB0ZW1wbGF0ZTogYDxkaXY+XG4gICAgPGxpICpuZ0Zvcj1cImxldCAgaSBvZiBjb2xsZWN0aW9uIHwgc2xpY2U6MTozXCI+e3tpfX08L2xpPlxuICA8L2Rpdj5gXG59KVxuZXhwb3J0IGNsYXNzIFNsaWNlUGlwZUxpc3RFeGFtcGxlIHtcbiAgY29sbGVjdGlvbjogc3RyaW5nW10gPSBbJ2EnLCAnYicsICdjJywgJ2QnXTtcbn1cbi8vICNlbmRkb2NyZWdpb25cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZXhhbXBsZS1hcHAnLFxuICBkaXJlY3RpdmVzOiBbU2xpY2VQaXBlTGlzdEV4YW1wbGUsIFNsaWNlUGlwZVN0cmluZ0V4YW1wbGVdLFxuICB0ZW1wbGF0ZTogYFxuICAgIDxoMT5TbGljZVBpcGUgRXhhbXBsZXM8L2gxPlxuICAgIDxzbGljZS1saXN0LWV4YW1wbGU+PC9zbGljZS1saXN0LWV4YW1wbGU+XG4gICAgPHNsaWNlLXN0cmluZy1leGFtcGxlPjwvc2xpY2Utc3RyaW5nLWV4YW1wbGU+XG4gIGBcbn0pXG5leHBvcnQgY2xhc3MgQXBwQ21wIHtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1haW4oKSB7XG4gIGJvb3RzdHJhcChBcHBDbXApO1xufVxuIl19