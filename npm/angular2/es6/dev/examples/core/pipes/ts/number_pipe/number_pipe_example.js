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
// #docregion NumberPipe
export let NumberPipeExample = class NumberPipeExample {
    constructor() {
        this.pi = 3.141;
        this.e = 2.718281828459045;
    }
};
NumberPipeExample = __decorate([
    Component({
        selector: 'number-example',
        template: `<div>
    <p>e (no formatting): {{e}}</p>
    <p>e (3.1-5): {{e | number:'3.1-5'}}</p>
    <p>pi (no formatting): {{pi}}</p>
    <p>pi (3.5-5): {{pi | number:'3.5-5'}}</p>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], NumberPipeExample);
// #enddocregion
// #docregion PercentPipe
export let PercentPipeExample = class PercentPipeExample {
    constructor() {
        this.a = 0.259;
        this.b = 1.3495;
    }
};
PercentPipeExample = __decorate([
    Component({
        selector: 'percent-example',
        template: `<div>
    <p>A: {{a | percent}}</p>
    <p>B: {{b | percent:'4.3-5'}}</p>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], PercentPipeExample);
// #enddocregion
// #docregion CurrencyPipe
export let CurrencyPipeExample = class CurrencyPipeExample {
    constructor() {
        this.a = 0.259;
        this.b = 1.3495;
    }
};
CurrencyPipeExample = __decorate([
    Component({
        selector: 'currency-example',
        template: `<div>
    <p>A: {{a | currency:'USD':false}}</p>
    <p>B: {{b | currency:'USD':true:'4.2-2'}}</p>
  </div>`
    }), 
    __metadata('design:paramtypes', [])
], CurrencyPipeExample);
// #enddocregion
export let AppCmp = class AppCmp {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        directives: [NumberPipeExample, PercentPipeExample, CurrencyPipeExample],
        template: `
    <h1>Numeric Pipe Examples</h1>
    <h2>NumberPipe Example</h2>
    <number-example></number-example>
    <h2>PercentPipe Example</h2>
    <percent-example></percent-example>
    <h2>CurrencyPipeExample</h2>
    <currency-example></currency-example>
  `
    }), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    bootstrap(AppCmp);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3BpcGVfZXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtZ3RNN1FoRW4udG1wL2FuZ3VsYXIyL2V4YW1wbGVzL2NvcmUvcGlwZXMvdHMvbnVtYmVyX3BpcGUvbnVtYmVyX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBVSxNQUFNLGVBQWU7T0FDekMsRUFBQyxTQUFTLEVBQUMsTUFBTSwyQkFBMkI7QUFFbkQsd0JBQXdCO0FBVXhCO0lBQUE7UUFDRSxPQUFFLEdBQVcsS0FBSyxDQUFDO1FBQ25CLE1BQUMsR0FBVyxpQkFBaUIsQ0FBQztJQUNoQyxDQUFDO0FBQUQsQ0FBQztBQVpEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGdCQUFnQjtRQUMxQixRQUFRLEVBQUU7Ozs7O1NBS0g7S0FDUixDQUFDOztxQkFBQTtBQUtGLGdCQUFnQjtBQUVoQix5QkFBeUI7QUFRekI7SUFBQTtRQUNFLE1BQUMsR0FBVyxLQUFLLENBQUM7UUFDbEIsTUFBQyxHQUFXLE1BQU0sQ0FBQztJQUNyQixDQUFDO0FBQUQsQ0FBQztBQVZEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGlCQUFpQjtRQUMzQixRQUFRLEVBQUU7OztTQUdIO0tBQ1IsQ0FBQzs7c0JBQUE7QUFLRixnQkFBZ0I7QUFFaEIsMEJBQTBCO0FBUTFCO0lBQUE7UUFDRSxNQUFDLEdBQVcsS0FBSyxDQUFDO1FBQ2xCLE1BQUMsR0FBVyxNQUFNLENBQUM7SUFDckIsQ0FBQztBQUFELENBQUM7QUFWRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxrQkFBa0I7UUFDNUIsUUFBUSxFQUFFOzs7U0FHSDtLQUNSLENBQUM7O3VCQUFBO0FBS0YsZ0JBQWdCO0FBZWhCO0FBQ0EsQ0FBQztBQWREO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGFBQWE7UUFDdkIsVUFBVSxFQUFFLENBQUMsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsbUJBQW1CLENBQUM7UUFDeEUsUUFBUSxFQUFFOzs7Ozs7OztHQVFUO0tBQ0YsQ0FBQzs7VUFBQTtBQUlGO0lBQ0UsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudCwgcHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG5cbi8vICNkb2NyZWdpb24gTnVtYmVyUGlwZVxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbnVtYmVyLWV4YW1wbGUnLFxuICB0ZW1wbGF0ZTogYDxkaXY+XG4gICAgPHA+ZSAobm8gZm9ybWF0dGluZyk6IHt7ZX19PC9wPlxuICAgIDxwPmUgKDMuMS01KToge3tlIHwgbnVtYmVyOiczLjEtNSd9fTwvcD5cbiAgICA8cD5waSAobm8gZm9ybWF0dGluZyk6IHt7cGl9fTwvcD5cbiAgICA8cD5waSAoMy41LTUpOiB7e3BpIHwgbnVtYmVyOiczLjUtNSd9fTwvcD5cbiAgPC9kaXY+YFxufSlcbmV4cG9ydCBjbGFzcyBOdW1iZXJQaXBlRXhhbXBsZSB7XG4gIHBpOiBudW1iZXIgPSAzLjE0MTtcbiAgZTogbnVtYmVyID0gMi43MTgyODE4Mjg0NTkwNDU7XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cbi8vICNkb2NyZWdpb24gUGVyY2VudFBpcGVcbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3BlcmNlbnQtZXhhbXBsZScsXG4gIHRlbXBsYXRlOiBgPGRpdj5cbiAgICA8cD5BOiB7e2EgfCBwZXJjZW50fX08L3A+XG4gICAgPHA+Qjoge3tiIHwgcGVyY2VudDonNC4zLTUnfX08L3A+XG4gIDwvZGl2PmBcbn0pXG5leHBvcnQgY2xhc3MgUGVyY2VudFBpcGVFeGFtcGxlIHtcbiAgYTogbnVtYmVyID0gMC4yNTk7XG4gIGI6IG51bWJlciA9IDEuMzQ5NTtcbn1cbi8vICNlbmRkb2NyZWdpb25cblxuLy8gI2RvY3JlZ2lvbiBDdXJyZW5jeVBpcGVcbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2N1cnJlbmN5LWV4YW1wbGUnLFxuICB0ZW1wbGF0ZTogYDxkaXY+XG4gICAgPHA+QToge3thIHwgY3VycmVuY3k6J1VTRCc6ZmFsc2V9fTwvcD5cbiAgICA8cD5COiB7e2IgfCBjdXJyZW5jeTonVVNEJzp0cnVlOic0LjItMid9fTwvcD5cbiAgPC9kaXY+YFxufSlcbmV4cG9ydCBjbGFzcyBDdXJyZW5jeVBpcGVFeGFtcGxlIHtcbiAgYTogbnVtYmVyID0gMC4yNTk7XG4gIGI6IG51bWJlciA9IDEuMzQ5NTtcbn1cbi8vICNlbmRkb2NyZWdpb25cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZXhhbXBsZS1hcHAnLFxuICBkaXJlY3RpdmVzOiBbTnVtYmVyUGlwZUV4YW1wbGUsIFBlcmNlbnRQaXBlRXhhbXBsZSwgQ3VycmVuY3lQaXBlRXhhbXBsZV0sXG4gIHRlbXBsYXRlOiBgXG4gICAgPGgxPk51bWVyaWMgUGlwZSBFeGFtcGxlczwvaDE+XG4gICAgPGgyPk51bWJlclBpcGUgRXhhbXBsZTwvaDI+XG4gICAgPG51bWJlci1leGFtcGxlPjwvbnVtYmVyLWV4YW1wbGU+XG4gICAgPGgyPlBlcmNlbnRQaXBlIEV4YW1wbGU8L2gyPlxuICAgIDxwZXJjZW50LWV4YW1wbGU+PC9wZXJjZW50LWV4YW1wbGU+XG4gICAgPGgyPkN1cnJlbmN5UGlwZUV4YW1wbGU8L2gyPlxuICAgIDxjdXJyZW5jeS1leGFtcGxlPjwvY3VycmVuY3ktZXhhbXBsZT5cbiAgYFxufSlcbmV4cG9ydCBjbGFzcyBBcHBDbXAge1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFpbigpIHtcbiAgYm9vdHN0cmFwKEFwcENtcCk7XG59XG4iXX0=