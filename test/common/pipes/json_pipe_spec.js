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
var lang_1 = require('angular2/src/facade/lang');
var core_1 = require('angular2/core');
function main() {
    testing_internal_1.describe("JsonPipe", function () {
        var regNewLine = '\n';
        var inceptionObj;
        var inceptionObjString;
        var pipe;
        function normalize(obj) { return lang_1.StringWrapper.replace(obj, regNewLine, ''); }
        testing_internal_1.beforeEach(function () {
            inceptionObj = { dream: { dream: { dream: 'Limbo' } } };
            inceptionObjString = "{\n" + "  \"dream\": {\n" + "    \"dream\": {\n" +
                "      \"dream\": \"Limbo\"\n" + "    }\n" + "  }\n" + "}";
            pipe = new core_1.JsonPipe();
        });
        testing_internal_1.describe("transform", function () {
            testing_internal_1.it("should return JSON-formatted string", function () { testing_internal_1.expect(pipe.transform(inceptionObj)).toEqual(inceptionObjString); });
            testing_internal_1.it("should return JSON-formatted string even when normalized", function () {
                var dream1 = normalize(pipe.transform(inceptionObj));
                var dream2 = normalize(inceptionObjString);
                testing_internal_1.expect(dream1).toEqual(dream2);
            });
            testing_internal_1.it("should return JSON-formatted string similar to Json.stringify", function () {
                var dream1 = normalize(pipe.transform(inceptionObj));
                var dream2 = normalize(lang_1.Json.stringify(inceptionObj));
                testing_internal_1.expect(dream1).toEqual(dream2);
            });
        });
        testing_internal_1.describe('integration', function () {
            testing_internal_1.it('should work with mutable objects', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.createAsync(TestComp).then(function (fixture) {
                    var mutable = [1];
                    fixture.debugElement.componentInstance.data = mutable;
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText("[\n  1\n]");
                    mutable.push(2);
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText("[\n  1,\n  2\n]");
                    async.done();
                });
            }));
        });
    });
}
exports.main = main;
var TestComp = (function () {
    function TestComp() {
    }
    TestComp = __decorate([
        core_1.Component({ selector: 'test-comp', template: '{{data | json}}', pipes: [core_1.JsonPipe] }), 
        __metadata('design:paramtypes', [])
    ], TestComp);
    return TestComp;
})();
//# sourceMappingURL=json_pipe_spec.js.map