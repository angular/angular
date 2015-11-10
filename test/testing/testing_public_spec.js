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
var testing_1 = require('angular2/testing');
var core_1 = require('angular2/core');
var angular2_1 = require('angular2/angular2');
var xhr_1 = require('angular2/src/compiler/xhr');
var xhr_impl_1 = require('angular2/src/compiler/xhr_impl');
// Services, and components for the tests.
var ChildComp = (function () {
    function ChildComp() {
        this.childBinding = 'Child';
    }
    ChildComp = __decorate([
        angular2_1.Component({ selector: 'child-comp' }),
        angular2_1.View({ template: "<span>Original {{childBinding}}</span>", directives: [] }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ChildComp);
    return ChildComp;
})();
var MockChildComp = (function () {
    function MockChildComp() {
    }
    MockChildComp = __decorate([
        angular2_1.Component({ selector: 'child-comp' }),
        angular2_1.View({ template: "<span>Mock</span>" }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MockChildComp);
    return MockChildComp;
})();
var ParentComp = (function () {
    function ParentComp() {
    }
    ParentComp = __decorate([
        angular2_1.Component({ selector: 'parent-comp' }),
        angular2_1.View({ template: "Parent(<child-comp></child-comp>)", directives: [ChildComp] }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ParentComp);
    return ParentComp;
})();
var MyIfComp = (function () {
    function MyIfComp() {
        this.showMore = false;
    }
    MyIfComp = __decorate([
        angular2_1.Component({ selector: 'my-if-comp' }),
        angular2_1.View({ template: "MyIf(<span *ng-if=\"showMore\">More</span>)", directives: [core_1.NgIf] }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MyIfComp);
    return MyIfComp;
})();
var ChildChildComp = (function () {
    function ChildChildComp() {
    }
    ChildChildComp = __decorate([
        angular2_1.Component({ selector: 'child-child-comp' }),
        angular2_1.View({ template: "<span>ChildChild</span>" }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ChildChildComp);
    return ChildChildComp;
})();
var ChildWithChildComp = (function () {
    function ChildWithChildComp() {
        this.childBinding = 'Child';
    }
    ChildWithChildComp = __decorate([
        angular2_1.Component({ selector: 'child-comp' }),
        angular2_1.View({
            template: "<span>Original {{childBinding}}(<child-child-comp></child-child-comp>)</span>",
            directives: [ChildChildComp]
        }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ChildWithChildComp);
    return ChildWithChildComp;
})();
var MockChildChildComp = (function () {
    function MockChildChildComp() {
    }
    MockChildChildComp = __decorate([
        angular2_1.Component({ selector: 'child-child-comp' }),
        angular2_1.View({ template: "<span>ChildChild Mock</span>" }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MockChildChildComp);
    return MockChildChildComp;
})();
var FancyService = (function () {
    function FancyService() {
        this.value = 'real value';
    }
    FancyService.prototype.getAsyncValue = function () { return Promise.resolve('async value'); };
    return FancyService;
})();
var MockFancyService = (function (_super) {
    __extends(MockFancyService, _super);
    function MockFancyService() {
        _super.apply(this, arguments);
        this.value = 'mocked out value';
    }
    return MockFancyService;
})(FancyService);
var TestProvidersComp = (function () {
    function TestProvidersComp(fancyService) {
        this.fancyService = fancyService;
    }
    TestProvidersComp = __decorate([
        angular2_1.Component({ selector: 'my-service-comp', providers: [FancyService] }),
        angular2_1.View({ template: "injected value: {{fancyService.value}}" }), 
        __metadata('design:paramtypes', [FancyService])
    ], TestProvidersComp);
    return TestProvidersComp;
})();
var TestViewProvidersComp = (function () {
    function TestViewProvidersComp(fancyService) {
        this.fancyService = fancyService;
    }
    TestViewProvidersComp = __decorate([
        angular2_1.Component({ selector: 'my-service-comp', viewProviders: [FancyService] }),
        angular2_1.View({ template: "injected value: {{fancyService.value}}" }), 
        __metadata('design:paramtypes', [FancyService])
    ], TestViewProvidersComp);
    return TestViewProvidersComp;
})();
function main() {
    testing_1.describe('angular2 jasmine matchers', function () {
        testing_1.describe('toHaveCssClass', function () {
            testing_1.it('should assert that the CSS class is present', function () {
                var el = document.createElement('div');
                el.classList.add('matias');
                testing_1.expect(el).toHaveCssClass('matias');
            });
            testing_1.it('should assert that the CSS class is not present', function () {
                var el = document.createElement('div');
                el.classList.add('matias');
                testing_1.expect(el).not.toHaveCssClass('fatias');
            });
        });
    });
    testing_1.describe('using the test injector with the inject helper', function () {
        testing_1.it('should run normal tests', function () { testing_1.expect(true).toEqual(true); });
        testing_1.it('should run normal async tests', function (done) {
            setTimeout(function () {
                testing_1.expect(true).toEqual(true);
                done();
            }, 0);
        });
        testing_1.it('provides a real XHR instance', testing_1.inject([xhr_1.XHR], function (xhr) { testing_1.expect(xhr).toBeAnInstanceOf(xhr_impl_1.XHRImpl); }));
        testing_1.describe('setting up Providers', function () {
            testing_1.beforeEachProviders(function () { return [core_1.bind(FancyService).toValue(new FancyService())]; });
            testing_1.it('should use set up providers', testing_1.inject([FancyService], function (service) { testing_1.expect(service.value).toEqual('real value'); }));
            testing_1.it('should wait until returned promises', testing_1.injectAsync([FancyService], function (service) {
                return service.getAsyncValue().then(function (value) { testing_1.expect(value).toEqual('async value'); });
            }));
            testing_1.describe('using beforeEach', function () {
                testing_1.beforeEach(testing_1.inject([FancyService], function (service) { service.value = 'value modified in beforeEach'; }));
                testing_1.it('should use modified providers', testing_1.inject([FancyService], function (service) {
                    testing_1.expect(service.value).toEqual('value modified in beforeEach');
                }));
            });
            testing_1.describe('using async beforeEach', function () {
                testing_1.beforeEach(testing_1.injectAsync([FancyService], function (service) {
                    return service.getAsyncValue().then(function (value) { service.value = value; });
                }));
                testing_1.it('should use asynchronously modified value', testing_1.inject([FancyService], function (service) { testing_1.expect(service.value).toEqual('async value'); }));
            });
        });
    });
    testing_1.describe('errors', function () {
        var originalJasmineIt;
        var originalJasmineBeforeEach;
        var patchJasmineIt = function () {
            originalJasmineIt = jasmine.getEnv().it;
            jasmine.getEnv().it = function (description, fn) {
                var done = function () { };
                done.fail = function (err) { throw new Error(err); };
                fn(done);
                return null;
            };
        };
        var restoreJasmineIt = function () { jasmine.getEnv().it = originalJasmineIt; };
        var patchJasmineBeforeEach = function () {
            originalJasmineBeforeEach = jasmine.getEnv().beforeEach;
            jasmine.getEnv().beforeEach = function (fn) {
                var done = function () { };
                done.fail = function (err) { throw new Error(err); };
                fn(done);
                return null;
            };
        };
        var restoreJasmineBeforeEach = function () { jasmine.getEnv().beforeEach = originalJasmineBeforeEach; };
        testing_1.it('should fail when return was forgotten in it', function () {
            testing_1.expect(function () {
                patchJasmineIt();
                testing_1.it('forgets to return a promise', testing_1.injectAsync([], function () { return true; }));
            })
                .toThrowError('Error: injectAsync was expected to return a promise, but the ' +
                ' returned value was: true');
            restoreJasmineIt();
        });
        testing_1.it('should fail when synchronous spec returns promise', function () {
            testing_1.expect(function () {
                patchJasmineIt();
                testing_1.it('returns an extra promise', testing_1.inject([], function () { return Promise.resolve('true'); }));
            }).toThrowError('inject returned a promise. Did you mean to use injectAsync?');
            restoreJasmineIt();
        });
        testing_1.it('should fail when return was forgotten in beforeEach', function () {
            testing_1.expect(function () {
                patchJasmineBeforeEach();
                testing_1.beforeEach(testing_1.injectAsync([], function () { return true; }));
            })
                .toThrowError('Error: injectAsync was expected to return a promise, but the ' +
                ' returned value was: true');
            restoreJasmineBeforeEach();
        });
        testing_1.it('should fail when synchronous beforeEach returns promise', function () {
            testing_1.expect(function () {
                patchJasmineBeforeEach();
                testing_1.beforeEach(testing_1.inject([], function () { return Promise.resolve('true'); }));
            }).toThrowError('inject returned a promise. Did you mean to use injectAsync?');
            restoreJasmineBeforeEach();
        });
        testing_1.describe('using beforeEachProviders', function () {
            testing_1.beforeEachProviders(function () { return [core_1.bind(FancyService).toValue(new FancyService())]; });
            testing_1.beforeEach(testing_1.inject([FancyService], function (service) { testing_1.expect(service.value).toEqual('real value'); }));
            testing_1.describe('nested beforeEachProviders', function () {
                testing_1.it('should fail when the injector has already been used', function () {
                    testing_1.expect(function () {
                        patchJasmineBeforeEach();
                        testing_1.beforeEachProviders(function () { return [core_1.bind(FancyService).toValue(new FancyService())]; });
                    })
                        .toThrowError('beforeEachProviders was called after the injector had been used ' +
                        'in a beforeEach or it block. This invalidates the test injector');
                    restoreJasmineBeforeEach();
                });
            });
        });
    });
    testing_1.describe('test component builder', function () {
        testing_1.it('should instantiate a component with valid DOM', testing_1.injectAsync([testing_1.TestComponentBuilder], function (tcb) {
            return tcb.createAsync(ChildComp).then(function (componentFixture) {
                componentFixture.detectChanges();
                testing_1.expect(componentFixture.debugElement.nativeElement).toHaveText('Original Child');
            });
        }));
        testing_1.it('should allow changing members of the component', testing_1.injectAsync([testing_1.TestComponentBuilder], function (tcb) {
            return tcb.createAsync(MyIfComp).then(function (componentFixture) {
                componentFixture.detectChanges();
                testing_1.expect(componentFixture.debugElement.nativeElement).toHaveText('MyIf()');
                componentFixture.debugElement.componentInstance.showMore = true;
                componentFixture.detectChanges();
                testing_1.expect(componentFixture.debugElement.nativeElement).toHaveText('MyIf(More)');
            });
        }));
        testing_1.it('should override a template', testing_1.injectAsync([testing_1.TestComponentBuilder], function (tcb) {
            return tcb.overrideTemplate(MockChildComp, '<span>Mock</span>')
                .createAsync(MockChildComp)
                .then(function (componentFixture) {
                componentFixture.detectChanges();
                testing_1.expect(componentFixture.debugElement.nativeElement).toHaveText('Mock');
            });
        }));
        testing_1.it('should override a view', testing_1.injectAsync([testing_1.TestComponentBuilder], function (tcb) {
            return tcb.overrideView(ChildComp, new angular2_1.ViewMetadata({ template: '<span>Modified {{childBinding}}</span>' }))
                .createAsync(ChildComp)
                .then(function (componentFixture) {
                componentFixture.detectChanges();
                testing_1.expect(componentFixture.debugElement.nativeElement).toHaveText('Modified Child');
            });
        }));
        testing_1.it('should override component dependencies', testing_1.injectAsync([testing_1.TestComponentBuilder], function (tcb) {
            return tcb.overrideDirective(ParentComp, ChildComp, MockChildComp)
                .createAsync(ParentComp)
                .then(function (componentFixture) {
                componentFixture.detectChanges();
                testing_1.expect(componentFixture.debugElement.nativeElement).toHaveText('Parent(Mock)');
            });
        }));
        testing_1.it("should override child component's dependencies", testing_1.injectAsync([testing_1.TestComponentBuilder], function (tcb) {
            return tcb.overrideDirective(ParentComp, ChildComp, ChildWithChildComp)
                .overrideDirective(ChildWithChildComp, ChildChildComp, MockChildChildComp)
                .createAsync(ParentComp)
                .then(function (componentFixture) {
                componentFixture.detectChanges();
                testing_1.expect(componentFixture.debugElement.nativeElement)
                    .toHaveText('Parent(Original Child(ChildChild Mock))');
            });
        }));
        testing_1.it('should override a provider', testing_1.injectAsync([testing_1.TestComponentBuilder], function (tcb) {
            return tcb.overrideProviders(TestProvidersComp, [core_1.bind(FancyService).toClass(MockFancyService)])
                .createAsync(TestProvidersComp)
                .then(function (componentFixture) {
                componentFixture.detectChanges();
                testing_1.expect(componentFixture.debugElement.nativeElement)
                    .toHaveText('injected value: mocked out value');
            });
        }));
        testing_1.it('should override a viewProvider', testing_1.injectAsync([testing_1.TestComponentBuilder], function (tcb) {
            return tcb.overrideViewProviders(TestViewProvidersComp, [core_1.bind(FancyService).toClass(MockFancyService)])
                .createAsync(TestViewProvidersComp)
                .then(function (componentFixture) {
                componentFixture.detectChanges();
                testing_1.expect(componentFixture.debugElement.nativeElement)
                    .toHaveText('injected value: mocked out value');
            });
        }));
    });
}
exports.main = main;
//# sourceMappingURL=testing_public_spec.js.map