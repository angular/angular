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
var core_1 = require('angular2/core');
function main() {
    testing_internal_1.describe("SlicePipe", function () {
        var list;
        var str;
        var pipe;
        testing_internal_1.beforeEach(function () {
            list = [1, 2, 3, 4, 5];
            str = 'tuvwxyz';
            pipe = new core_1.SlicePipe();
        });
        testing_internal_1.describe("supports", function () {
            testing_internal_1.it("should support strings", function () { testing_internal_1.expect(pipe.supports(str)).toBe(true); });
            testing_internal_1.it("should support lists", function () { testing_internal_1.expect(pipe.supports(list)).toBe(true); });
            testing_internal_1.it("should not support other objects", function () {
                testing_internal_1.expect(pipe.supports(new Object())).toBe(false);
                testing_internal_1.expect(pipe.supports(null)).toBe(false);
            });
        });
        testing_internal_1.describe("transform", function () {
            testing_internal_1.it('should return all items after START index when START is positive and END is omitted', function () {
                testing_internal_1.expect(pipe.transform(list, [3])).toEqual([4, 5]);
                testing_internal_1.expect(pipe.transform(str, [3])).toEqual('wxyz');
            });
            testing_internal_1.it('should return last START items when START is negative and END is omitted', function () {
                testing_internal_1.expect(pipe.transform(list, [-3])).toEqual([3, 4, 5]);
                testing_internal_1.expect(pipe.transform(str, [-3])).toEqual('xyz');
            });
            testing_internal_1.it('should return all items between START and END index when START and END are positive', function () {
                testing_internal_1.expect(pipe.transform(list, [1, 3])).toEqual([2, 3]);
                testing_internal_1.expect(pipe.transform(str, [1, 3])).toEqual('uv');
            });
            testing_internal_1.it('should return all items between START and END from the end when START and END are negative', function () {
                testing_internal_1.expect(pipe.transform(list, [-4, -2])).toEqual([2, 3]);
                testing_internal_1.expect(pipe.transform(str, [-4, -2])).toEqual('wx');
            });
            testing_internal_1.it('should return an empty value if START is greater than END', function () {
                testing_internal_1.expect(pipe.transform(list, [4, 2])).toEqual([]);
                testing_internal_1.expect(pipe.transform(str, [4, 2])).toEqual('');
            });
            testing_internal_1.it('should return an empty value if START greater than input length', function () {
                testing_internal_1.expect(pipe.transform(list, [99])).toEqual([]);
                testing_internal_1.expect(pipe.transform(str, [99])).toEqual('');
            });
            // Makes Edge to disconnect when running the full unit test campaign
            // TODO: remove when issue is solved: https://github.com/angular/angular/issues/4756
            if (!testing_internal_1.browserDetection.isEdge) {
                testing_internal_1.it('should return entire input if START is negative and greater than input length', function () {
                    testing_internal_1.expect(pipe.transform(list, [-99])).toEqual([1, 2, 3, 4, 5]);
                    testing_internal_1.expect(pipe.transform(str, [-99])).toEqual('tuvwxyz');
                });
                testing_internal_1.it('should not modify the input list', function () {
                    testing_internal_1.expect(pipe.transform(list, [2])).toEqual([3, 4, 5]);
                    testing_internal_1.expect(list).toEqual([1, 2, 3, 4, 5]);
                });
            }
        });
        testing_internal_1.describe('integration', function () {
            testing_internal_1.it('should work with mutable arrays', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
                tcb.createAsync(TestComp).then(function (fixture) {
                    var mutable = [1, 2];
                    fixture.debugElement.componentInstance.data = mutable;
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('2');
                    mutable.push(3);
                    fixture.detectChanges();
                    testing_internal_1.expect(fixture.debugElement.nativeElement).toHaveText('2,3');
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
        core_1.Component({ selector: 'test-comp', template: '{{(data | slice:1).join(",") }}', pipes: [core_1.SlicePipe] }), 
        __metadata('design:paramtypes', [])
    ], TestComp);
    return TestComp;
})();
//# sourceMappingURL=slice_pipe_spec.js.map