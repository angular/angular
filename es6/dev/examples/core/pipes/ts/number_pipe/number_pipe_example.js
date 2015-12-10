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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3BpcGVfZXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL2V4YW1wbGVzL2NvcmUvcGlwZXMvdHMvbnVtYmVyX3BpcGUvbnVtYmVyX3BpcGVfZXhhbXBsZS50cyJdLCJuYW1lcyI6WyJOdW1iZXJQaXBlRXhhbXBsZSIsIk51bWJlclBpcGVFeGFtcGxlLmNvbnN0cnVjdG9yIiwiUGVyY2VudFBpcGVFeGFtcGxlIiwiUGVyY2VudFBpcGVFeGFtcGxlLmNvbnN0cnVjdG9yIiwiQ3VycmVuY3lQaXBlRXhhbXBsZSIsIkN1cnJlbmN5UGlwZUV4YW1wbGUuY29uc3RydWN0b3IiLCJBcHBDbXAiLCJtYWluIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFVLE1BQU0sbUJBQW1CO09BQzdDLEVBQUMsU0FBUyxFQUFDLE1BQU0sb0JBQW9CO0FBRTVDLHdCQUF3QjtBQUN4QjtJQUFBQTtRQVVFQyxPQUFFQSxHQUFXQSxLQUFLQSxDQUFDQTtRQUNuQkEsTUFBQ0EsR0FBV0EsaUJBQWlCQSxDQUFDQTtJQUNoQ0EsQ0FBQ0E7QUFBREQsQ0FBQ0E7QUFaRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxnQkFBZ0I7UUFDMUIsUUFBUSxFQUFFOzs7OztTQUtIO0tBQ1IsQ0FBQzs7c0JBSUQ7QUFDRCxnQkFBZ0I7QUFFaEIseUJBQXlCO0FBQ3pCO0lBQUFFO1FBUUVDLE1BQUNBLEdBQVdBLEtBQUtBLENBQUNBO1FBQ2xCQSxNQUFDQSxHQUFXQSxNQUFNQSxDQUFDQTtJQUNyQkEsQ0FBQ0E7QUFBREQsQ0FBQ0E7QUFWRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRSxpQkFBaUI7UUFDM0IsUUFBUSxFQUFFOzs7U0FHSDtLQUNSLENBQUM7O3VCQUlEO0FBQ0QsZ0JBQWdCO0FBRWhCLDBCQUEwQjtBQUMxQjtJQUFBRTtRQVFFQyxNQUFDQSxHQUFXQSxLQUFLQSxDQUFDQTtRQUNsQkEsTUFBQ0EsR0FBV0EsTUFBTUEsQ0FBQ0E7SUFDckJBLENBQUNBO0FBQURELENBQUNBO0FBVkQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsa0JBQWtCO1FBQzVCLFFBQVEsRUFBRTs7O1NBR0g7S0FDUixDQUFDOzt3QkFJRDtBQUNELGdCQUFnQjtBQUVoQjtBQWNBRSxDQUFDQTtBQWREO0lBQUMsU0FBUyxDQUFDO1FBQ1QsUUFBUSxFQUFFLGFBQWE7UUFDdkIsVUFBVSxFQUFFLENBQUMsaUJBQWlCLEVBQUUsa0JBQWtCLEVBQUUsbUJBQW1CLENBQUM7UUFDeEUsUUFBUSxFQUFFOzs7Ozs7OztHQVFUO0tBQ0YsQ0FBQzs7V0FFRDtBQUVEO0lBQ0VDLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO0FBQ3BCQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7Q29tcG9uZW50LCBwcm92aWRlfSBmcm9tICdhbmd1bGFyMi9hbmd1bGFyMic7XG5pbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvYm9vdHN0cmFwJztcblxuLy8gI2RvY3JlZ2lvbiBOdW1iZXJQaXBlXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdudW1iZXItZXhhbXBsZScsXG4gIHRlbXBsYXRlOiBgPGRpdj5cbiAgICA8cD5lIChubyBmb3JtYXR0aW5nKToge3tlfX08L3A+XG4gICAgPHA+ZSAoMy4xLTUpOiB7e2UgfCBudW1iZXI6JzMuMS01J319PC9wPlxuICAgIDxwPnBpIChubyBmb3JtYXR0aW5nKToge3twaX19PC9wPlxuICAgIDxwPnBpICgzLjUtNSk6IHt7cGkgfCBudW1iZXI6JzMuNS01J319PC9wPlxuICA8L2Rpdj5gXG59KVxuZXhwb3J0IGNsYXNzIE51bWJlclBpcGVFeGFtcGxlIHtcbiAgcGk6IG51bWJlciA9IDMuMTQxO1xuICBlOiBudW1iZXIgPSAyLjcxODI4MTgyODQ1OTA0NTtcbn1cbi8vICNlbmRkb2NyZWdpb25cblxuLy8gI2RvY3JlZ2lvbiBQZXJjZW50UGlwZVxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAncGVyY2VudC1leGFtcGxlJyxcbiAgdGVtcGxhdGU6IGA8ZGl2PlxuICAgIDxwPkE6IHt7YSB8IHBlcmNlbnR9fTwvcD5cbiAgICA8cD5COiB7e2IgfCBwZXJjZW50Oic0LjMtNSd9fTwvcD5cbiAgPC9kaXY+YFxufSlcbmV4cG9ydCBjbGFzcyBQZXJjZW50UGlwZUV4YW1wbGUge1xuICBhOiBudW1iZXIgPSAwLjI1OTtcbiAgYjogbnVtYmVyID0gMS4zNDk1O1xufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG4vLyAjZG9jcmVnaW9uIEN1cnJlbmN5UGlwZVxuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnY3VycmVuY3ktZXhhbXBsZScsXG4gIHRlbXBsYXRlOiBgPGRpdj5cbiAgICA8cD5BOiB7e2EgfCBjdXJyZW5jeTonVVNEJzpmYWxzZX19PC9wPlxuICAgIDxwPkI6IHt7YiB8IGN1cnJlbmN5OidVU0QnOnRydWU6JzQuMi0yJ319PC9wPlxuICA8L2Rpdj5gXG59KVxuZXhwb3J0IGNsYXNzIEN1cnJlbmN5UGlwZUV4YW1wbGUge1xuICBhOiBudW1iZXIgPSAwLjI1OTtcbiAgYjogbnVtYmVyID0gMS4zNDk1O1xufVxuLy8gI2VuZGRvY3JlZ2lvblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdleGFtcGxlLWFwcCcsXG4gIGRpcmVjdGl2ZXM6IFtOdW1iZXJQaXBlRXhhbXBsZSwgUGVyY2VudFBpcGVFeGFtcGxlLCBDdXJyZW5jeVBpcGVFeGFtcGxlXSxcbiAgdGVtcGxhdGU6IGAgXG4gICAgPGgxPk51bWVyaWMgUGlwZSBFeGFtcGxlczwvaDE+XG4gICAgPGgyPk51bWJlclBpcGUgRXhhbXBsZTwvaDI+XG4gICAgPG51bWJlci1leGFtcGxlPjwvbnVtYmVyLWV4YW1wbGU+XG4gICAgPGgyPlBlcmNlbnRQaXBlIEV4YW1wbGU8L2gyPlxuICAgIDxwZXJjZW50LWV4YW1wbGU+PC9wZXJjZW50LWV4YW1wbGU+XG4gICAgPGgyPkN1cnJlbmN5UGlwZUV4YW1wbGU8L2gyPlxuICAgIDxjdXJyZW5jeS1leGFtcGxlPjwvY3VycmVuY3ktZXhhbXBsZT5cbiAgYFxufSlcbmV4cG9ydCBjbGFzcyBBcHBDbXAge1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFpbigpIHtcbiAgYm9vdHN0cmFwKEFwcENtcCk7XG59XG4iXX0=