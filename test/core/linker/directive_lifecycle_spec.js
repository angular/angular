var testing_internal_1 = require('angular2/testing_internal');
var directive_lifecycle_reflector_1 = require('angular2/src/core/linker/directive_lifecycle_reflector');
var interfaces_1 = require('angular2/src/core/linker/interfaces');
function main() {
    testing_internal_1.describe('Create DirectiveMetadata', function () {
        testing_internal_1.describe('lifecycle', function () {
            testing_internal_1.describe("onChanges", function () {
                testing_internal_1.it("should be true when the directive has the onChanges method", function () {
                    testing_internal_1.expect(directive_lifecycle_reflector_1.hasLifecycleHook(interfaces_1.LifecycleHooks.OnChanges, DirectiveWithOnChangesMethod))
                        .toBe(true);
                });
                testing_internal_1.it("should be false otherwise", function () {
                    testing_internal_1.expect(directive_lifecycle_reflector_1.hasLifecycleHook(interfaces_1.LifecycleHooks.OnChanges, DirectiveNoHooks)).toBe(false);
                });
            });
            testing_internal_1.describe("onDestroy", function () {
                testing_internal_1.it("should be true when the directive has the onDestroy method", function () {
                    testing_internal_1.expect(directive_lifecycle_reflector_1.hasLifecycleHook(interfaces_1.LifecycleHooks.OnDestroy, DirectiveWithOnDestroyMethod))
                        .toBe(true);
                });
                testing_internal_1.it("should be false otherwise", function () {
                    testing_internal_1.expect(directive_lifecycle_reflector_1.hasLifecycleHook(interfaces_1.LifecycleHooks.OnDestroy, DirectiveNoHooks)).toBe(false);
                });
            });
            testing_internal_1.describe("onInit", function () {
                testing_internal_1.it("should be true when the directive has the onInit method", function () {
                    testing_internal_1.expect(directive_lifecycle_reflector_1.hasLifecycleHook(interfaces_1.LifecycleHooks.OnInit, DirectiveWithOnInitMethod)).toBe(true);
                });
                testing_internal_1.it("should be false otherwise", function () {
                    testing_internal_1.expect(directive_lifecycle_reflector_1.hasLifecycleHook(interfaces_1.LifecycleHooks.OnInit, DirectiveNoHooks)).toBe(false);
                });
            });
            testing_internal_1.describe("doCheck", function () {
                testing_internal_1.it("should be true when the directive has the doCheck method", function () {
                    testing_internal_1.expect(directive_lifecycle_reflector_1.hasLifecycleHook(interfaces_1.LifecycleHooks.DoCheck, DirectiveWithOnCheckMethod)).toBe(true);
                });
                testing_internal_1.it("should be false otherwise", function () {
                    testing_internal_1.expect(directive_lifecycle_reflector_1.hasLifecycleHook(interfaces_1.LifecycleHooks.DoCheck, DirectiveNoHooks)).toBe(false);
                });
            });
            testing_internal_1.describe("afterContentInit", function () {
                testing_internal_1.it("should be true when the directive has the afterContentInit method", function () {
                    testing_internal_1.expect(directive_lifecycle_reflector_1.hasLifecycleHook(interfaces_1.LifecycleHooks.AfterContentInit, DirectiveWithAfterContentInitMethod))
                        .toBe(true);
                });
                testing_internal_1.it("should be false otherwise", function () {
                    testing_internal_1.expect(directive_lifecycle_reflector_1.hasLifecycleHook(interfaces_1.LifecycleHooks.AfterContentInit, DirectiveNoHooks)).toBe(false);
                });
            });
            testing_internal_1.describe("afterContentChecked", function () {
                testing_internal_1.it("should be true when the directive has the afterContentChecked method", function () {
                    testing_internal_1.expect(directive_lifecycle_reflector_1.hasLifecycleHook(interfaces_1.LifecycleHooks.AfterContentChecked, DirectiveWithAfterContentCheckedMethod))
                        .toBe(true);
                });
                testing_internal_1.it("should be false otherwise", function () {
                    testing_internal_1.expect(directive_lifecycle_reflector_1.hasLifecycleHook(interfaces_1.LifecycleHooks.AfterContentChecked, DirectiveNoHooks))
                        .toBe(false);
                });
            });
            testing_internal_1.describe("afterViewInit", function () {
                testing_internal_1.it("should be true when the directive has the afterViewInit method", function () {
                    testing_internal_1.expect(directive_lifecycle_reflector_1.hasLifecycleHook(interfaces_1.LifecycleHooks.AfterViewInit, DirectiveWithAfterViewInitMethod))
                        .toBe(true);
                });
                testing_internal_1.it("should be false otherwise", function () {
                    testing_internal_1.expect(directive_lifecycle_reflector_1.hasLifecycleHook(interfaces_1.LifecycleHooks.AfterViewInit, DirectiveNoHooks)).toBe(false);
                });
            });
            testing_internal_1.describe("afterViewChecked", function () {
                testing_internal_1.it("should be true when the directive has the afterViewChecked method", function () {
                    testing_internal_1.expect(directive_lifecycle_reflector_1.hasLifecycleHook(interfaces_1.LifecycleHooks.AfterViewChecked, DirectiveWithAfterViewCheckedMethod))
                        .toBe(true);
                });
                testing_internal_1.it("should be false otherwise", function () {
                    testing_internal_1.expect(directive_lifecycle_reflector_1.hasLifecycleHook(interfaces_1.LifecycleHooks.AfterViewChecked, DirectiveNoHooks)).toBe(false);
                });
            });
        });
    });
}
exports.main = main;
var DirectiveNoHooks = (function () {
    function DirectiveNoHooks() {
    }
    return DirectiveNoHooks;
})();
var DirectiveWithOnChangesMethod = (function () {
    function DirectiveWithOnChangesMethod() {
    }
    DirectiveWithOnChangesMethod.prototype.onChanges = function (_) { };
    return DirectiveWithOnChangesMethod;
})();
var DirectiveWithOnInitMethod = (function () {
    function DirectiveWithOnInitMethod() {
    }
    DirectiveWithOnInitMethod.prototype.onInit = function () { };
    return DirectiveWithOnInitMethod;
})();
var DirectiveWithOnCheckMethod = (function () {
    function DirectiveWithOnCheckMethod() {
    }
    DirectiveWithOnCheckMethod.prototype.doCheck = function () { };
    return DirectiveWithOnCheckMethod;
})();
var DirectiveWithOnDestroyMethod = (function () {
    function DirectiveWithOnDestroyMethod() {
    }
    DirectiveWithOnDestroyMethod.prototype.onDestroy = function () { };
    return DirectiveWithOnDestroyMethod;
})();
var DirectiveWithAfterContentInitMethod = (function () {
    function DirectiveWithAfterContentInitMethod() {
    }
    DirectiveWithAfterContentInitMethod.prototype.afterContentInit = function () { };
    return DirectiveWithAfterContentInitMethod;
})();
var DirectiveWithAfterContentCheckedMethod = (function () {
    function DirectiveWithAfterContentCheckedMethod() {
    }
    DirectiveWithAfterContentCheckedMethod.prototype.afterContentChecked = function () { };
    return DirectiveWithAfterContentCheckedMethod;
})();
var DirectiveWithAfterViewInitMethod = (function () {
    function DirectiveWithAfterViewInitMethod() {
    }
    DirectiveWithAfterViewInitMethod.prototype.afterViewInit = function () { };
    return DirectiveWithAfterViewInitMethod;
})();
var DirectiveWithAfterViewCheckedMethod = (function () {
    function DirectiveWithAfterViewCheckedMethod() {
    }
    DirectiveWithAfterViewCheckedMethod.prototype.afterViewChecked = function () { };
    return DirectiveWithAfterViewCheckedMethod;
})();
//# sourceMappingURL=directive_lifecycle_spec.js.map