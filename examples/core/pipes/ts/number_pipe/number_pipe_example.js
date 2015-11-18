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
var angular2_1 = require('angular2/angular2');
var bootstrap_1 = require('angular2/bootstrap');
// #docregion NumberPipe
var NumberPipeExample = (function () {
    function NumberPipeExample() {
        this.pi = 3.141;
        this.e = 2.718281828459045;
    }
    NumberPipeExample = __decorate([
        angular2_1.Component({
            selector: 'number-example',
            template: "<div>\n    <p>e (no formatting): {{e}}</p>\n    <p>e (3.1-5): {{e | number:'3.1-5'}}</p>\n    <p>pi (no formatting): {{pi}}</p>\n    <p>pi (3.5-5): {{pi | number:'3.5-5'}}</p>\n  </div>"
        }), 
        __metadata('design:paramtypes', [])
    ], NumberPipeExample);
    return NumberPipeExample;
})();
exports.NumberPipeExample = NumberPipeExample;
// #enddocregion
// #docregion PercentPipe
var PercentPipeExample = (function () {
    function PercentPipeExample() {
        this.a = 0.259;
        this.b = 1.3495;
    }
    PercentPipeExample = __decorate([
        angular2_1.Component({
            selector: 'percent-example',
            template: "<div>\n    <p>A: {{a | percent}}</p>\n    <p>B: {{b | percent:'4.3-5'}}</p>\n  </div>"
        }), 
        __metadata('design:paramtypes', [])
    ], PercentPipeExample);
    return PercentPipeExample;
})();
exports.PercentPipeExample = PercentPipeExample;
// #enddocregion
// #docregion CurrencyPipe
var CurrencyPipeExample = (function () {
    function CurrencyPipeExample() {
        this.a = 0.259;
        this.b = 1.3495;
    }
    CurrencyPipeExample = __decorate([
        angular2_1.Component({
            selector: 'currency-example',
            template: "<div>\n    <p>A: {{a | currency:'USD':false}}</p>\n    <p>B: {{b | currency:'USD':true:'4.2-2'}}</p>\n  </div>"
        }), 
        __metadata('design:paramtypes', [])
    ], CurrencyPipeExample);
    return CurrencyPipeExample;
})();
exports.CurrencyPipeExample = CurrencyPipeExample;
// #enddocregion
var AppCmp = (function () {
    function AppCmp() {
    }
    AppCmp = __decorate([
        angular2_1.Component({
            selector: 'example-app',
            directives: [NumberPipeExample, PercentPipeExample, CurrencyPipeExample],
            template: " \n    <h1>Numeric Pipe Examples</h1>\n    <h2>NumberPipe Example</h2>\n    <number-example></number-example>\n    <h2>PercentPipe Example</h2>\n    <percent-example></percent-example>\n    <h2>CurrencyPipeExample</h2>\n    <currency-example></currency-example>\n  "
        }), 
        __metadata('design:paramtypes', [])
    ], AppCmp);
    return AppCmp;
})();
exports.AppCmp = AppCmp;
function main() {
    bootstrap_1.bootstrap(AppCmp);
}
exports.main = main;
//# sourceMappingURL=number_pipe_example.js.map