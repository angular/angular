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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var testing_internal_1 = require('angular2/testing_internal');
var core_1 = require('angular2/core');
var debug_1 = require('angular2/src/core/debug');
function main() {
    testing_internal_1.describe("forwardRef integration", function () {
        testing_internal_1.it('should instantiate components which are declared using forwardRef', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.createAsync(App).then(function (tc) {
                tc.detectChanges();
                testing_internal_1.expect(debug_1.asNativeElements(tc.debugElement.componentViewChildren))
                    .toHaveText('frame(lock)');
                async.done();
            });
        }));
    });
}
exports.main = main;
var App = (function () {
    function App() {
    }
    App = __decorate([
        core_1.Component({ selector: 'app', viewProviders: [core_1.forwardRef(function () { return Frame; })] }),
        core_1.View({
            template: "<door><lock></lock></door>",
            directives: [core_1.forwardRef(function () { return Door; }), core_1.forwardRef(function () { return Lock; })],
        }), 
        __metadata('design:paramtypes', [])
    ], App);
    return App;
})();
var Door = (function () {
    function Door(locks, frame) {
        this.frame = frame;
        this.locks = locks;
    }
    Door = __decorate([
        core_1.Component({ selector: 'Lock' }),
        core_1.View({
            directives: [core_1.NgFor],
            template: "{{frame.name}}(<span *ng-for=\"var lock of locks\">{{lock.name}}</span>)",
        }),
        __param(0, core_1.Query(core_1.forwardRef(function () { return Lock; }))),
        __param(1, core_1.Inject(core_1.forwardRef(function () { return Frame; }))), 
        __metadata('design:paramtypes', [core_1.QueryList, Frame])
    ], Door);
    return Door;
})();
var Frame = (function () {
    function Frame() {
        this.name = 'frame';
    }
    return Frame;
})();
var Lock = (function () {
    function Lock() {
        this.name = 'lock';
    }
    Lock = __decorate([
        core_1.Directive({ selector: 'lock' }), 
        __metadata('design:paramtypes', [])
    ], Lock);
    return Lock;
})();
//# sourceMappingURL=forward_ref_integration_spec.js.map