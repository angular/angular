var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var reflection_1 = require('angular2/src/core/reflection/reflection');
var reflection_capabilities_1 = require('angular2/src/core/reflection/reflection_capabilities');
var reflector_common_1 = require('./reflector_common');
var lang_1 = require('angular2/src/facade/lang');
var AType = (function () {
    function AType(value) {
        this.value = value;
    }
    return AType;
})();
var ClassWithDecorators = (function () {
    function ClassWithDecorators(a, b) {
        this.a = a;
        this.b = b;
    }
    Object.defineProperty(ClassWithDecorators.prototype, "c", {
        set: function (value) {
        },
        enumerable: true,
        configurable: true
    });
    __decorate([
        reflector_common_1.PropDecorator("p1"),
        reflector_common_1.PropDecorator("p2"), 
        __metadata('design:type', Object)
    ], ClassWithDecorators.prototype, "a");
    Object.defineProperty(ClassWithDecorators.prototype, "c",
        __decorate([
            reflector_common_1.PropDecorator("p3"), 
            __metadata('design:type', Object), 
            __metadata('design:paramtypes', [Object])
        ], ClassWithDecorators.prototype, "c", Object.getOwnPropertyDescriptor(ClassWithDecorators.prototype, "c")));
    ClassWithDecorators = __decorate([
        reflector_common_1.ClassDecorator('class'),
        __param(0, reflector_common_1.ParamDecorator("a")),
        __param(1, reflector_common_1.ParamDecorator("b")), 
        __metadata('design:paramtypes', [AType, AType])
    ], ClassWithDecorators);
    return ClassWithDecorators;
})();
var ClassWithoutDecorators = (function () {
    function ClassWithoutDecorators(a, b) {
    }
    return ClassWithoutDecorators;
})();
var TestObj = (function () {
    function TestObj(a, b) {
        this.a = a;
        this.b = b;
    }
    TestObj.prototype.identity = function (arg) { return arg; };
    return TestObj;
})();
var Interface = (function () {
    function Interface() {
    }
    return Interface;
})();
var Interface2 = (function () {
    function Interface2() {
    }
    return Interface2;
})();
var SuperClassImplementingInterface = (function () {
    function SuperClassImplementingInterface() {
    }
    return SuperClassImplementingInterface;
})();
var ClassImplementingInterface = (function (_super) {
    __extends(ClassImplementingInterface, _super);
    function ClassImplementingInterface() {
        _super.apply(this, arguments);
    }
    return ClassImplementingInterface;
})(SuperClassImplementingInterface);
function main() {
    testing_internal_1.describe('Reflector', function () {
        var reflector;
        testing_internal_1.beforeEach(function () { reflector = new reflection_1.Reflector(new reflection_capabilities_1.ReflectionCapabilities()); });
        testing_internal_1.describe("usage tracking", function () {
            testing_internal_1.beforeEach(function () { reflector = new reflection_1.Reflector(null); });
            testing_internal_1.it("should be disabled by default", function () {
                testing_internal_1.expect(function () { return reflector.listUnusedKeys(); }).toThrowError('Usage tracking is disabled');
            });
            testing_internal_1.it("should report unused keys", function () {
                reflector.trackUsage();
                testing_internal_1.expect(reflector.listUnusedKeys()).toEqual([]);
                reflector.registerType(AType, new reflection_1.ReflectionInfo(null, null, function () { return "AType"; }));
                reflector.registerType(TestObj, new reflection_1.ReflectionInfo(null, null, function () { return "TestObj"; }));
                testing_internal_1.expect(reflector.listUnusedKeys()).toEqual([AType, TestObj]);
                reflector.factory(AType);
                testing_internal_1.expect(reflector.listUnusedKeys()).toEqual([TestObj]);
                reflector.factory(TestObj);
                testing_internal_1.expect(reflector.listUnusedKeys()).toEqual([]);
            });
        });
        testing_internal_1.describe("factory", function () {
            testing_internal_1.it("should create a factory for the given type", function () {
                var obj = reflector.factory(TestObj)(1, 2);
                testing_internal_1.expect(obj.a).toEqual(1);
                testing_internal_1.expect(obj.b).toEqual(2);
            });
            // Makes Edge to disconnect when running the full unit test campaign
            // TODO: remove when issue is solved: https://github.com/angular/angular/issues/4756
            if (!testing_internal_1.browserDetection.isEdge) {
                testing_internal_1.it("should check args from no to max", function () {
                    var f = function (t) { return reflector.factory(t); };
                    var checkArgs = function (obj, args) { return testing_internal_1.expect(obj.args).toEqual(args); };
                    // clang-format off
                    checkArgs(f(TestObjWith00Args)(), []);
                    checkArgs(f(TestObjWith01Args)(1), [1]);
                    checkArgs(f(TestObjWith02Args)(1, 2), [1, 2]);
                    checkArgs(f(TestObjWith03Args)(1, 2, 3), [1, 2, 3]);
                    checkArgs(f(TestObjWith04Args)(1, 2, 3, 4), [1, 2, 3, 4]);
                    checkArgs(f(TestObjWith05Args)(1, 2, 3, 4, 5), [1, 2, 3, 4, 5]);
                    checkArgs(f(TestObjWith06Args)(1, 2, 3, 4, 5, 6), [1, 2, 3, 4, 5, 6]);
                    checkArgs(f(TestObjWith07Args)(1, 2, 3, 4, 5, 6, 7), [1, 2, 3, 4, 5, 6, 7]);
                    checkArgs(f(TestObjWith08Args)(1, 2, 3, 4, 5, 6, 7, 8), [1, 2, 3, 4, 5, 6, 7, 8]);
                    checkArgs(f(TestObjWith09Args)(1, 2, 3, 4, 5, 6, 7, 8, 9), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
                    checkArgs(f(TestObjWith10Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
                    checkArgs(f(TestObjWith11Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
                    checkArgs(f(TestObjWith12Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
                    checkArgs(f(TestObjWith13Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
                    checkArgs(f(TestObjWith14Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
                    checkArgs(f(TestObjWith15Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
                    checkArgs(f(TestObjWith16Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
                    checkArgs(f(TestObjWith17Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);
                    checkArgs(f(TestObjWith18Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
                    checkArgs(f(TestObjWith19Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
                    checkArgs(f(TestObjWith20Args)(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
                    // clang-format on
                });
            }
            testing_internal_1.it("should throw when more than 20 arguments", function () { testing_internal_1.expect(function () { return reflector.factory(TestObjWith21Args); }).toThrowError(); });
            testing_internal_1.it("should return a registered factory if available", function () {
                reflector.registerType(TestObj, new reflection_1.ReflectionInfo(null, null, function () { return "fake"; }));
                testing_internal_1.expect(reflector.factory(TestObj)()).toEqual("fake");
            });
        });
        testing_internal_1.describe("parameters", function () {
            testing_internal_1.it("should return an array of parameters for a type", function () {
                var p = reflector.parameters(ClassWithDecorators);
                testing_internal_1.expect(p).toEqual([[AType, reflector_common_1.paramDecorator('a')], [AType, reflector_common_1.paramDecorator('b')]]);
            });
            testing_internal_1.it("should work for a class without annotations", function () {
                var p = reflector.parameters(ClassWithoutDecorators);
                testing_internal_1.expect(p.length).toEqual(2);
            });
            testing_internal_1.it("should return registered parameters if available", function () {
                reflector.registerType(TestObj, new reflection_1.ReflectionInfo(null, [[1], [2]]));
                testing_internal_1.expect(reflector.parameters(TestObj)).toEqual([[1], [2]]);
            });
            testing_internal_1.it("should return an empty list when no paramters field in the stored type info", function () {
                reflector.registerType(TestObj, new reflection_1.ReflectionInfo());
                testing_internal_1.expect(reflector.parameters(TestObj)).toEqual([]);
            });
        });
        testing_internal_1.describe("propMetadata", function () {
            testing_internal_1.it("should return a string map of prop metadata for the given class", function () {
                var p = reflector.propMetadata(ClassWithDecorators);
                testing_internal_1.expect(p["a"]).toEqual([reflector_common_1.propDecorator("p1"), reflector_common_1.propDecorator("p2")]);
                testing_internal_1.expect(p["c"]).toEqual([reflector_common_1.propDecorator("p3")]);
            });
            testing_internal_1.it("should return registered meta if available", function () {
                reflector.registerType(TestObj, new reflection_1.ReflectionInfo(null, null, null, null, { "a": [1, 2] }));
                testing_internal_1.expect(reflector.propMetadata(TestObj)).toEqual({ "a": [1, 2] });
            });
            if (lang_1.IS_DART) {
                testing_internal_1.it("should merge metadata from getters and setters", function () {
                    var p = reflector.propMetadata(reflector_common_1.HasGetterAndSetterDecorators);
                    testing_internal_1.expect(p["a"]).toEqual([reflector_common_1.propDecorator("get"), reflector_common_1.propDecorator("set")]);
                });
            }
        });
        testing_internal_1.describe("annotations", function () {
            testing_internal_1.it("should return an array of annotations for a type", function () {
                var p = reflector.annotations(ClassWithDecorators);
                testing_internal_1.expect(p).toEqual([reflector_common_1.classDecorator('class')]);
            });
            testing_internal_1.it("should return registered annotations if available", function () {
                reflector.registerType(TestObj, new reflection_1.ReflectionInfo([1, 2]));
                testing_internal_1.expect(reflector.annotations(TestObj)).toEqual([1, 2]);
            });
            testing_internal_1.it("should work for a class without annotations", function () {
                var p = reflector.annotations(ClassWithoutDecorators);
                testing_internal_1.expect(p).toEqual([]);
            });
        });
        if (lang_1.IS_DART) {
            testing_internal_1.describe("interfaces", function () {
                testing_internal_1.it("should return an array of interfaces for a type", function () {
                    var p = reflector.interfaces(ClassImplementingInterface);
                    testing_internal_1.expect(p).toEqual([Interface, Interface2]);
                });
                testing_internal_1.it("should return an empty array otherwise", function () {
                    var p = reflector.interfaces(ClassWithDecorators);
                    testing_internal_1.expect(p).toEqual([]);
                });
            });
        }
        testing_internal_1.describe("getter", function () {
            testing_internal_1.it("returns a function reading a property", function () {
                var getA = reflector.getter('a');
                testing_internal_1.expect(getA(new TestObj(1, 2))).toEqual(1);
            });
            testing_internal_1.it("should return a registered getter if available", function () {
                reflector.registerGetters({ "abc": function (obj) { return "fake"; } });
                testing_internal_1.expect(reflector.getter("abc")("anything")).toEqual("fake");
            });
        });
        testing_internal_1.describe("setter", function () {
            testing_internal_1.it("returns a function setting a property", function () {
                var setA = reflector.setter('a');
                var obj = new TestObj(1, 2);
                setA(obj, 100);
                testing_internal_1.expect(obj.a).toEqual(100);
            });
            testing_internal_1.it("should return a registered setter if available", function () {
                var updateMe;
                reflector.registerSetters({ "abc": function (obj, value) { updateMe = value; } });
                reflector.setter("abc")("anything", "fake");
                testing_internal_1.expect(updateMe).toEqual("fake");
            });
        });
        testing_internal_1.describe("method", function () {
            testing_internal_1.it("returns a function invoking a method", function () {
                var func = reflector.method('identity');
                var obj = new TestObj(1, 2);
                testing_internal_1.expect(func(obj, ['value'])).toEqual('value');
            });
            testing_internal_1.it("should return a registered method if available", function () {
                reflector.registerMethods({ "abc": function (obj, args) { return args; } });
                testing_internal_1.expect(reflector.method("abc")("anything", ["fake"])).toEqual(['fake']);
            });
        });
        if (lang_1.IS_DART) {
            testing_internal_1.describe("importUri", function () {
                testing_internal_1.it("should return the importUri for a type", function () {
                    testing_internal_1.expect(reflector.importUri(TestObjWith00Args)
                        .endsWith('base/dist/dart/angular2/test/core/reflection/reflector_spec.dart'))
                        .toBe(true);
                });
            });
        }
    });
}
exports.main = main;
var TestObjWith00Args = (function () {
    function TestObjWith00Args() {
        this.args = [];
    }
    return TestObjWith00Args;
})();
var TestObjWith01Args = (function () {
    function TestObjWith01Args(a1) {
        this.args = [a1];
    }
    return TestObjWith01Args;
})();
var TestObjWith02Args = (function () {
    function TestObjWith02Args(a1, a2) {
        this.args = [a1, a2];
    }
    return TestObjWith02Args;
})();
var TestObjWith03Args = (function () {
    function TestObjWith03Args(a1, a2, a3) {
        this.args = [a1, a2, a3];
    }
    return TestObjWith03Args;
})();
var TestObjWith04Args = (function () {
    function TestObjWith04Args(a1, a2, a3, a4) {
        this.args = [a1, a2, a3, a4];
    }
    return TestObjWith04Args;
})();
var TestObjWith05Args = (function () {
    function TestObjWith05Args(a1, a2, a3, a4, a5) {
        this.args = [a1, a2, a3, a4, a5];
    }
    return TestObjWith05Args;
})();
var TestObjWith06Args = (function () {
    function TestObjWith06Args(a1, a2, a3, a4, a5, a6) {
        this.args = [a1, a2, a3, a4, a5, a6];
    }
    return TestObjWith06Args;
})();
var TestObjWith07Args = (function () {
    function TestObjWith07Args(a1, a2, a3, a4, a5, a6, a7) {
        this.args = [a1, a2, a3, a4, a5, a6, a7];
    }
    return TestObjWith07Args;
})();
var TestObjWith08Args = (function () {
    function TestObjWith08Args(a1, a2, a3, a4, a5, a6, a7, a8) {
        this.args = [a1, a2, a3, a4, a5, a6, a7, a8];
    }
    return TestObjWith08Args;
})();
var TestObjWith09Args = (function () {
    function TestObjWith09Args(a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        this.args = [a1, a2, a3, a4, a5, a6, a7, a8, a9];
    }
    return TestObjWith09Args;
})();
var TestObjWith10Args = (function () {
    function TestObjWith10Args(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
        this.args = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10];
    }
    return TestObjWith10Args;
})();
var TestObjWith11Args = (function () {
    function TestObjWith11Args(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11) {
        this.args = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11];
    }
    return TestObjWith11Args;
})();
var TestObjWith12Args = (function () {
    function TestObjWith12Args(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12) {
        this.args = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12];
    }
    return TestObjWith12Args;
})();
var TestObjWith13Args = (function () {
    function TestObjWith13Args(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13) {
        this.args = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13];
    }
    return TestObjWith13Args;
})();
var TestObjWith14Args = (function () {
    function TestObjWith14Args(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14) {
        this.args = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14];
    }
    return TestObjWith14Args;
})();
var TestObjWith15Args = (function () {
    function TestObjWith15Args(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15) {
        this.args = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15];
    }
    return TestObjWith15Args;
})();
var TestObjWith16Args = (function () {
    function TestObjWith16Args(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16) {
        this.args = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16];
    }
    return TestObjWith16Args;
})();
var TestObjWith17Args = (function () {
    function TestObjWith17Args(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17) {
        this.args = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17];
    }
    return TestObjWith17Args;
})();
var TestObjWith18Args = (function () {
    function TestObjWith18Args(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18) {
        this.args = [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18];
    }
    return TestObjWith18Args;
})();
var TestObjWith19Args = (function () {
    function TestObjWith19Args(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19) {
        this.args =
            [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19];
    }
    return TestObjWith19Args;
})();
var TestObjWith20Args = (function () {
    function TestObjWith20Args(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20) {
        this.args =
            [a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20];
    }
    return TestObjWith20Args;
})();
var TestObjWith21Args = (function () {
    function TestObjWith21Args(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21) {
        this.args = [
            a1,
            a2,
            a3,
            a4,
            a5,
            a6,
            a7,
            a8,
            a9,
            a10,
            a11,
            a12,
            a13,
            a14,
            a15,
            a16,
            a17,
            a18,
            a19,
            a20,
            a21
        ];
    }
    return TestObjWith21Args;
})();
//# sourceMappingURL=reflector_spec.js.map