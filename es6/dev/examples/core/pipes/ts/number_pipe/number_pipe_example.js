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
// #docregion NumberPipe
export let NumberPipeExample = class {
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
export let PercentPipeExample = class {
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
export let CurrencyPipeExample = class {
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
export let AppCmp = class {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3BpcGVfZXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL2V4YW1wbGVzL2NvcmUvcGlwZXMvdHMvbnVtYmVyX3BpcGUvbnVtYmVyX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6WyJOdW1iZXJQaXBlRXhhbXBsZSIsIk51bWJlclBpcGVFeGFtcGxlLmNvbnN0cnVjdG9yIiwiUGVyY2VudFBpcGVFeGFtcGxlIiwiUGVyY2VudFBpcGVFeGFtcGxlLmNvbnN0cnVjdG9yIiwiQ3VycmVuY3lQaXBlRXhhbXBsZSIsIkN1cnJlbmN5UGlwZUV4YW1wbGUuY29uc3RydWN0b3IiLCJBcHBDbXAiLCJtYWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLFNBQVMsRUFBVSxNQUFNLGVBQWU7T0FDekMsRUFBQyxTQUFTLEVBQUMsTUFBTSxvQkFBb0I7QUFFNUMsd0JBQXdCO0FBQ3hCO0lBQUFBO1FBVUVDLE9BQUVBLEdBQVdBLEtBQUtBLENBQUNBO1FBQ25CQSxNQUFDQSxHQUFXQSxpQkFBaUJBLENBQUNBO0lBQ2hDQSxDQUFDQTtBQUFERCxDQUFDQTtBQVpEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGdCQUFnQjtRQUMxQixRQUFRLEVBQUU7Ozs7O1NBS0g7S0FDUixDQUFDOztzQkFJRDtBQUNELGdCQUFnQjtBQUVoQix5QkFBeUI7QUFDekI7SUFBQUU7UUFRRUMsTUFBQ0EsR0FBV0EsS0FBS0EsQ0FBQ0E7UUFDbEJBLE1BQUNBLEdBQVdBLE1BQU1BLENBQUNBO0lBQ3JCQSxDQUFDQTtBQUFERCxDQUFDQTtBQVZEO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGlCQUFpQjtRQUMzQixRQUFRLEVBQUU7OztTQUdIO0tBQ1IsQ0FBQzs7dUJBSUQ7QUFDRCxnQkFBZ0I7QUFFaEIsMEJBQTBCO0FBQzFCO0lBQUFFO1FBUUVDLE1BQUNBLEdBQVdBLEtBQUtBLENBQUNBO1FBQ2xCQSxNQUFDQSxHQUFXQSxNQUFNQSxDQUFDQTtJQUNyQkEsQ0FBQ0E7QUFBREQsQ0FBQ0E7QUFWRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxrQkFBa0I7UUFDNUIsUUFBUSxFQUFFOzs7U0FHSDtLQUNSLENBQUM7O3dCQUlEO0FBQ0QsZ0JBQWdCO0FBRWhCO0FBY0FFLENBQUNBO0FBZEQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsYUFBYTtRQUN2QixVQUFVLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxrQkFBa0IsRUFBRSxtQkFBbUIsQ0FBQztRQUN4RSxRQUFRLEVBQUU7Ozs7Ozs7O0dBUVQ7S0FDRixDQUFDOztXQUVEO0FBRUQ7SUFDRUMsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7QUFDcEJBLENBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDb21wb25lbnQsIHByb3ZpZGV9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL2Jvb3RzdHJhcCc7XG5cbi8vICNkb2NyZWdpb24gTnVtYmVyUGlwZVxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbnVtYmVyLWV4YW1wbGUnLFxuICB0ZW1wbGF0ZTogYDxkaXY+XG4gICAgPHA+ZSAobm8gZm9ybWF0dGluZyk6IHt7ZX19PC9wPlxuICAgIDxwPmUgKDMuMS01KToge3tlIHwgbnVtYmVyOiczLjEtNSd9fTwvcD5cbiAgICA8cD5waSAobm8gZm9ybWF0dGluZyk6IHt7cGl9fTwvcD5cbiAgICA8cD5waSAoMy41LTUpOiB7e3BpIHwgbnVtYmVyOiczLjUtNSd9fTwvcD5cbiAgPC9kaXY+YFxufSlcbmV4cG9ydCBjbGFzcyBOdW1iZXJQaXBlRXhhbXBsZSB7XG4gIHBpOiBudW1iZXIgPSAzLjE0MTtcbiAgZTogbnVtYmVyID0gMi43MTgyODE4Mjg0NTkwNDU7XG59XG4vLyAjZW5kZG9jcmVnaW9uXG5cbi8vICNkb2NyZWdpb24gUGVyY2VudFBpcGVcbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ3BlcmNlbnQtZXhhbXBsZScsXG4gIHRlbXBsYXRlOiBgPGRpdj5cbiAgICA8cD5BOiB7e2EgfCBwZXJjZW50fX08L3A+XG4gICAgPHA+Qjoge3tiIHwgcGVyY2VudDonNC4zLTUnfX08L3A+XG4gIDwvZGl2PmBcbn0pXG5leHBvcnQgY2xhc3MgUGVyY2VudFBpcGVFeGFtcGxlIHtcbiAgYTogbnVtYmVyID0gMC4yNTk7XG4gIGI6IG51bWJlciA9IDEuMzQ5NTtcbn1cbi8vICNlbmRkb2NyZWdpb25cblxuLy8gI2RvY3JlZ2lvbiBDdXJyZW5jeVBpcGVcbkBDb21wb25lbnQoe1xuICBzZWxlY3RvcjogJ2N1cnJlbmN5LWV4YW1wbGUnLFxuICB0ZW1wbGF0ZTogYDxkaXY+XG4gICAgPHA+QToge3thIHwgY3VycmVuY3k6J1VTRCc6ZmFsc2V9fTwvcD5cbiAgICA8cD5COiB7e2IgfCBjdXJyZW5jeTonVVNEJzp0cnVlOic0LjItMid9fTwvcD5cbiAgPC9kaXY+YFxufSlcbmV4cG9ydCBjbGFzcyBDdXJyZW5jeVBpcGVFeGFtcGxlIHtcbiAgYTogbnVtYmVyID0gMC4yNTk7XG4gIGI6IG51bWJlciA9IDEuMzQ5NTtcbn1cbi8vICNlbmRkb2NyZWdpb25cblxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnZXhhbXBsZS1hcHAnLFxuICBkaXJlY3RpdmVzOiBbTnVtYmVyUGlwZUV4YW1wbGUsIFBlcmNlbnRQaXBlRXhhbXBsZSwgQ3VycmVuY3lQaXBlRXhhbXBsZV0sXG4gIHRlbXBsYXRlOiBgXG4gICAgPGgxPk51bWVyaWMgUGlwZSBFeGFtcGxlczwvaDE+XG4gICAgPGgyPk51bWJlclBpcGUgRXhhbXBsZTwvaDI+XG4gICAgPG51bWJlci1leGFtcGxlPjwvbnVtYmVyLWV4YW1wbGU+XG4gICAgPGgyPlBlcmNlbnRQaXBlIEV4YW1wbGU8L2gyPlxuICAgIDxwZXJjZW50LWV4YW1wbGU+PC9wZXJjZW50LWV4YW1wbGU+XG4gICAgPGgyPkN1cnJlbmN5UGlwZUV4YW1wbGU8L2gyPlxuICAgIDxjdXJyZW5jeS1leGFtcGxlPjwvY3VycmVuY3ktZXhhbXBsZT5cbiAgYFxufSlcbmV4cG9ydCBjbGFzcyBBcHBDbXAge1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFpbigpIHtcbiAgYm9vdHN0cmFwKEFwcENtcCk7XG59XG4iXX0=