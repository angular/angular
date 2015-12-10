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
    <li *ng-for="var i of collection | slice:1:3">{{i}}</li>
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpY2VfcGlwZV9leGFtcGxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvZXhhbXBsZXMvY29yZS9waXBlcy90cy9zbGljZV9waXBlL3NsaWNlX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6WyJTbGljZVBpcGVTdHJpbmdFeGFtcGxlIiwiU2xpY2VQaXBlU3RyaW5nRXhhbXBsZS5jb25zdHJ1Y3RvciIsIlNsaWNlUGlwZUxpc3RFeGFtcGxlIiwiU2xpY2VQaXBlTGlzdEV4YW1wbGUuY29uc3RydWN0b3IiLCJBcHBDbXAiLCJtYWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFVLE1BQU0sbUJBQW1CO09BQzdDLEVBQUMsU0FBUyxFQUFDLE1BQU0sb0JBQW9CO0FBRTVDLDhCQUE4QjtBQUM5QjtJQUFBQTtRQVlFQyxRQUFHQSxHQUFXQSxZQUFZQSxDQUFDQTtJQUM3QkEsQ0FBQ0E7QUFBREQsQ0FBQ0E7QUFiRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxzQkFBc0I7UUFDaEMsUUFBUSxFQUFFOzs7Ozs7O1NBT0g7S0FDUixDQUFDOzsyQkFHRDtBQUNELGdCQUFnQjtBQUVoQiw0QkFBNEI7QUFDNUI7SUFBQUU7UUFPRUMsZUFBVUEsR0FBYUEsQ0FBQ0EsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDOUNBLENBQUNBO0FBQURELENBQUNBO0FBUkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsb0JBQW9CO1FBQzlCLFFBQVEsRUFBRTs7U0FFSDtLQUNSLENBQUM7O3lCQUdEO0FBQ0QsZ0JBQWdCO0FBRWhCO0FBVUFFLENBQUNBO0FBVkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsYUFBYTtRQUN2QixVQUFVLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxzQkFBc0IsQ0FBQztRQUMxRCxRQUFRLEVBQUU7Ozs7R0FJVDtLQUNGLENBQUM7O1dBRUQ7QUFFRDtJQUNFQyxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtBQUNwQkEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudCwgcHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL2Jvb3RzdHJhcCc7XG5cbi8vICNkb2NyZWdpb24gU2xpY2VQaXBlX3N0cmluZ1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnc2xpY2Utc3RyaW5nLWV4YW1wbGUnLFxuICB0ZW1wbGF0ZTogYDxkaXY+XG4gICAgPHA+e3tzdHJ9fVswOjRdOiAne3tzdHIgfCBzbGljZTowOjR9fScgLSBvdXRwdXQgaXMgZXhwZWN0ZWQgdG8gYmUgJ2FiY2QnPC9wPlxuICAgIDxwPnt7c3RyfX1bNDowXTogJ3t7c3RyIHwgc2xpY2U6NDowfX0nIC0gb3V0cHV0IGlzIGV4cGVjdGVkIHRvIGJlICcnPC9wPlxuICAgIDxwPnt7c3RyfX1bLTRdOiAne3tzdHIgfCBzbGljZTotNH19JyAtIG91dHB1dCBpcyBleHBlY3RlZCB0byBiZSAnZ2hpaic8L3A+XG4gICAgPHA+e3tzdHJ9fVstNDotMl06ICd7e3N0ciB8IHNsaWNlOi00Oi0yfX0nIC0gb3V0cHV0IGlzIGV4cGVjdGVkIHRvIGJlICdnaCc8L3A+XG4gICAgPHA+e3tzdHJ9fVstMTAwXTogJ3t7c3RyIHwgc2xpY2U6LTEwMH19JyAtIG91dHB1dCBpcyBleHBlY3RlZCB0byBiZSAnYWJjZGVmZ2hpaic8L3A+XG4gICAgPHA+e3tzdHJ9fVsxMDBdOiAne3tzdHIgfCBzbGljZToxMDB9fScgLSBvdXRwdXQgaXMgZXhwZWN0ZWQgdG8gYmUgJyc8L3A+XG4gIDwvZGl2PmBcbn0pXG5leHBvcnQgY2xhc3MgU2xpY2VQaXBlU3RyaW5nRXhhbXBsZSB7XG4gIHN0cjogc3RyaW5nID0gJ2FiY2RlZmdoaWonO1xufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG4vLyAjZG9jcmVnaW9uIFNsaWNlUGlwZV9saXN0XG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdzbGljZS1saXN0LWV4YW1wbGUnLFxuICB0ZW1wbGF0ZTogYDxkaXY+XG4gICAgPGxpICpuZy1mb3I9XCJ2YXIgaSBvZiBjb2xsZWN0aW9uIHwgc2xpY2U6MTozXCI+e3tpfX08L2xpPlxuICA8L2Rpdj5gXG59KVxuZXhwb3J0IGNsYXNzIFNsaWNlUGlwZUxpc3RFeGFtcGxlIHtcbiAgY29sbGVjdGlvbjogc3RyaW5nW10gPSBbJ2EnLCAnYicsICdjJywgJ2QnXTtcbn1cbi8vICNlbmRkb2NyZWdpb25cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZXhhbXBsZS1hcHAnLFxuICBkaXJlY3RpdmVzOiBbU2xpY2VQaXBlTGlzdEV4YW1wbGUsIFNsaWNlUGlwZVN0cmluZ0V4YW1wbGVdLFxuICB0ZW1wbGF0ZTogYCBcbiAgICA8aDE+U2xpY2VQaXBlIEV4YW1wbGVzPC9oMT5cbiAgICA8c2xpY2UtbGlzdC1leGFtcGxlPjwvc2xpY2UtbGlzdC1leGFtcGxlPlxuICAgIDxzbGljZS1zdHJpbmctZXhhbXBsZT48L3NsaWNlLXN0cmluZy1leGFtcGxlPlxuICBgXG59KVxuZXhwb3J0IGNsYXNzIEFwcENtcCB7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWluKCkge1xuICBib290c3RyYXAoQXBwQ21wKTtcbn1cbiJdfQ==