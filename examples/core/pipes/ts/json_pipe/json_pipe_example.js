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
// #docregion JsonPipe
var JsonPipeExample = (function () {
    function JsonPipeExample() {
        this.object = { foo: 'bar', baz: 'qux', nested: { xyz: 3, numbers: [1, 2, 3, 4, 5] } };
    }
    JsonPipeExample = __decorate([
        angular2_1.Component({
            selector: 'json-example',
            template: "<div>\n    <p>Without JSON pipe:</p>\n    <pre>{{object}}</pre>\n    <p>With JSON pipe:</p>\n    <pre>{{object | json}}</pre>\n  </div>"
        }), 
        __metadata('design:paramtypes', [])
    ], JsonPipeExample);
    return JsonPipeExample;
})();
exports.JsonPipeExample = JsonPipeExample;
// #enddocregion
var AppCmp = (function () {
    function AppCmp() {
    }
    AppCmp = __decorate([
        angular2_1.Component({
            selector: 'example-app',
            directives: [JsonPipeExample],
            template: " \n    <h1>JsonPipe Example</h1>\n    <json-example></json-example>\n  "
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
//# sourceMappingURL=json_pipe_example.js.map