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
// #docregion AsyncPipe
var AsyncPipeExample = (function () {
    function AsyncPipeExample() {
        this.resolved = false;
        this.promise = null;
        this.resolve = null;
        this.reset();
    }
    AsyncPipeExample.prototype.reset = function () {
        var _this = this;
        this.resolved = false;
        this.promise = new Promise(function (resolve, reject) { _this.resolve = resolve; });
    };
    AsyncPipeExample.prototype.clicked = function () {
        if (this.resolved) {
            this.reset();
        }
        else {
            this.resolve("resolved!");
            this.resolved = true;
        }
    };
    AsyncPipeExample = __decorate([
        angular2_1.Component({
            selector: 'async-example',
            template: "<div>\n    <p>Wait for it... {{promise | async}}</p>\n    <button (click)=\"clicked()\">{{resolved ? 'Reset' : 'Resolve'}}</button> \n  </div>"
        }), 
        __metadata('design:paramtypes', [])
    ], AsyncPipeExample);
    return AsyncPipeExample;
})();
exports.AsyncPipeExample = AsyncPipeExample;
// #enddocregion
// #docregion AsyncPipeObservable
var Task = (function () {
    function Task() {
        this.time = new angular2_1.Observable(function (observer) { setInterval(function (_) { return observer.next(new Date().getTime()); }, 500); });
    }
    Task = __decorate([
        angular2_1.Component({ selector: "task-cmp", template: "Time: {{ time | async }}" }), 
        __metadata('design:paramtypes', [])
    ], Task);
    return Task;
})();
// #enddocregion
var AppCmp = (function () {
    function AppCmp() {
    }
    AppCmp = __decorate([
        angular2_1.Component({
            selector: 'example-app',
            directives: [AsyncPipeExample],
            template: " \n    <h1>AsyncPipe Example</h1>\n    <async-example></async-example>\n  "
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
//# sourceMappingURL=async_pipe_example.js.map