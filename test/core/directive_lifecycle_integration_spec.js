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
var testing_internal_1 = require('angular2/testing_internal');
var metadata_1 = require('angular2/src/core/metadata');
function main() {
    testing_internal_1.describe('directive lifecycle integration spec', function () {
        testing_internal_1.it('should invoke lifecycle methods onChanges > onInit > doCheck > afterContentChecked', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.Log, testing_internal_1.AsyncTestCompleter], function (tcb, log, async) {
            tcb.overrideView(MyComp, new metadata_1.ViewMetadata({ template: '<div [field]="123" lifecycle></div>', directives: [LifecycleCmp] }))
                .createAsync(MyComp)
                .then(function (tc) {
                tc.detectChanges();
                testing_internal_1.expect(log.result())
                    .toEqual("onChanges; onInit; doCheck; afterContentInit; afterContentChecked; child_doCheck; " +
                    "afterViewInit; afterViewChecked");
                log.clear();
                tc.detectChanges();
                testing_internal_1.expect(log.result())
                    .toEqual("doCheck; afterContentChecked; child_doCheck; afterViewChecked");
                async.done();
            });
        }));
    });
}
exports.main = main;
var LifecycleDir = (function () {
    function LifecycleDir(_log) {
        this._log = _log;
    }
    LifecycleDir.prototype.doCheck = function () { this._log.add("child_doCheck"); };
    LifecycleDir = __decorate([
        metadata_1.Directive({ selector: '[lifecycle-dir]' }), 
        __metadata('design:paramtypes', [testing_internal_1.Log])
    ], LifecycleDir);
    return LifecycleDir;
})();
var LifecycleCmp = (function () {
    function LifecycleCmp(_log) {
        this._log = _log;
    }
    LifecycleCmp.prototype.onChanges = function (_) { this._log.add("onChanges"); };
    LifecycleCmp.prototype.onInit = function () { this._log.add("onInit"); };
    LifecycleCmp.prototype.doCheck = function () { this._log.add("doCheck"); };
    LifecycleCmp.prototype.afterContentInit = function () { this._log.add("afterContentInit"); };
    LifecycleCmp.prototype.afterContentChecked = function () { this._log.add("afterContentChecked"); };
    LifecycleCmp.prototype.afterViewInit = function () { this._log.add("afterViewInit"); };
    LifecycleCmp.prototype.afterViewChecked = function () { this._log.add("afterViewChecked"); };
    LifecycleCmp = __decorate([
        metadata_1.Component({ selector: "[lifecycle]", inputs: ['field'] }),
        metadata_1.View({ template: "<div lifecycle-dir></div>", directives: [LifecycleDir] }), 
        __metadata('design:paramtypes', [testing_internal_1.Log])
    ], LifecycleCmp);
    return LifecycleCmp;
})();
var MyComp = (function () {
    function MyComp() {
    }
    MyComp = __decorate([
        metadata_1.Component({ selector: 'my-comp' }),
        metadata_1.View({ directives: [] }), 
        __metadata('design:paramtypes', [])
    ], MyComp);
    return MyComp;
})();
//# sourceMappingURL=directive_lifecycle_integration_spec.js.map