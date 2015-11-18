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
// #docregion LowerUpperPipe
var LowerUpperPipeExample = (function () {
    function LowerUpperPipeExample() {
    }
    LowerUpperPipeExample.prototype.change = function (value) { this.value = value; };
    LowerUpperPipeExample = __decorate([
        angular2_1.Component({
            selector: 'lowerupper-example',
            template: "<div>\n    <label>Name: </label><input #name (keyup)=\"change(name.value)\" type=\"text\"></input>\n    <p>In lowercase: <pre>'{{value | lowercase}}'</pre></p>\n    <p>In uppercase: <pre>'{{value | uppercase}}'</pre></p>\n  </div>"
        }), 
        __metadata('design:paramtypes', [])
    ], LowerUpperPipeExample);
    return LowerUpperPipeExample;
})();
exports.LowerUpperPipeExample = LowerUpperPipeExample;
// #enddocregion
var AppCmp = (function () {
    function AppCmp() {
    }
    AppCmp = __decorate([
        angular2_1.Component({
            selector: 'example-app',
            directives: [LowerUpperPipeExample],
            template: " \n    <h1>LowercasePipe &amp; UppercasePipe Example</h1>\n    <lowerupper-example></lowerupper-example>\n  "
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
//# sourceMappingURL=lowerupper_pipe_example.js.map