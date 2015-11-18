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
// #docregion SlicePipe_string
var SlicePipeStringExample = (function () {
    function SlicePipeStringExample() {
        this.str = 'abcdefghij';
    }
    SlicePipeStringExample = __decorate([
        angular2_1.Component({
            selector: 'slice-string-example',
            template: "<div>\n    <p>{{str}}[0:4]: '{{str | slice:0:4}}' - output is expected to be 'abcd'</p>\n    <p>{{str}}[4:0]: '{{str | slice:4:0}}' - output is expected to be ''</p>\n    <p>{{str}}[-4]: '{{str | slice:-4}}' - output is expected to be 'ghij'</p>\n    <p>{{str}}[-4:-2]: '{{str | slice:-4:-2}}' - output is expected to be 'gh'</p>\n    <p>{{str}}[-100]: '{{str | slice:-100}}' - output is expected to be 'abcdefghij'</p>\n    <p>{{str}}[100]: '{{str | slice:100}}' - output is expected to be ''</p>\n  </div>"
        }), 
        __metadata('design:paramtypes', [])
    ], SlicePipeStringExample);
    return SlicePipeStringExample;
})();
exports.SlicePipeStringExample = SlicePipeStringExample;
// #enddocregion
// #docregion SlicePipe_list
var SlicePipeListExample = (function () {
    function SlicePipeListExample() {
        this.collection = ['a', 'b', 'c', 'd'];
    }
    SlicePipeListExample = __decorate([
        angular2_1.Component({
            selector: 'slice-list-example',
            template: "<div>\n    <li *ng-for=\"var i of collection | slice:1:3\">{{i}}</li>\n  </div>"
        }), 
        __metadata('design:paramtypes', [])
    ], SlicePipeListExample);
    return SlicePipeListExample;
})();
exports.SlicePipeListExample = SlicePipeListExample;
// #enddocregion
var AppCmp = (function () {
    function AppCmp() {
    }
    AppCmp = __decorate([
        angular2_1.Component({
            selector: 'example-app',
            directives: [SlicePipeListExample, SlicePipeStringExample],
            template: " \n    <h1>SlicePipe Examples</h1>\n    <slice-list-example></slice-list-example>\n    <slice-string-example></slice-string-example>\n  "
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
//# sourceMappingURL=slice_pipe_example.js.map