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
var testing_internal_1 = require('angular2/testing_internal');
var core_1 = require('angular2/core');
var metadata_1 = require('angular2/src/core/metadata');
var ChildComp = (function () {
    function ChildComp() {
        this.childBinding = 'Child';
    }
    ChildComp = __decorate([
        metadata_1.Component({ selector: 'child-comp' }),
        metadata_1.View({ template: "<span>Original {{childBinding}}</span>", directives: [] }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], ChildComp);
    return ChildComp;
})();
var MockChildComp = (function () {
    function MockChildComp() {
    }
    MockChildComp = __decorate([
        metadata_1.Component({ selector: 'child-comp' }),
        metadata_1.View({ template: "<span>Mock</span>" }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MockChildComp);
    return MockChildComp;
})();
var ParentComp = (function () {
    function ParentComp() {
    }
    ParentComp = __decorate([
        metadata_1.Component({ selector: 'parent-comp' }),
        metadata_1.View({ template: "Parent(<child-comp></child-comp>)", directives: [ChildComp] }),
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
        metadata_1.Component({ selector: 'my-if-comp' }),
        metadata_1.View({ template: "MyIf(<span *ng-if=\"showMore\">More</span>)", directives: [core_1.NgIf] }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MyIfComp);
    return MyIfComp;
})();
var ChildChildComp = (function () {
    function ChildChildComp() {
    }
    ChildChildComp = __decorate([
        metadata_1.Component({ selector: 'child-child-comp' }),
        metadata_1.View({ template: "<span>ChildChild</span>" }),
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
        metadata_1.Component({ selector: 'child-comp' }),
        metadata_1.View({
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
        metadata_1.Component({ selector: 'child-child-comp' }),
        metadata_1.View({ template: "<span>ChildChild Mock</span>" }),
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], MockChildChildComp);
    return MockChildChildComp;
})();
var FancyService = (function () {
    function FancyService() {
        this.value = 'real value';
    }
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
var TestBindingsComp = (function () {
    function TestBindingsComp(fancyService) {
        this.fancyService = fancyService;
    }
    TestBindingsComp = __decorate([
        metadata_1.Component({ selector: 'my-service-comp', bindings: [FancyService] }),
        metadata_1.View({ template: "injected value: {{fancyService.value}}" }), 
        __metadata('design:paramtypes', [FancyService])
    ], TestBindingsComp);
    return TestBindingsComp;
})();
var TestViewBindingsComp = (function () {
    function TestViewBindingsComp(fancyService) {
        this.fancyService = fancyService;
    }
    TestViewBindingsComp = __decorate([
        metadata_1.Component({ selector: 'my-service-comp', viewProviders: [FancyService] }),
        metadata_1.View({ template: "injected value: {{fancyService.value}}" }), 
        __metadata('design:paramtypes', [FancyService])
    ], TestViewBindingsComp);
    return TestViewBindingsComp;
})();
function main() {
    testing_internal_1.describe('test component builder', function () {
        testing_internal_1.it('should instantiate a component with valid DOM', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.createAsync(ChildComp).then(function (componentFixture) {
                componentFixture.detectChanges();
                testing_internal_1.expect(componentFixture.debugElement.nativeElement).toHaveText('Original Child');
                async.done();
            });
        }));
        testing_internal_1.it('should allow changing members of the component', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.createAsync(MyIfComp).then(function (componentFixture) {
                componentFixture.detectChanges();
                testing_internal_1.expect(componentFixture.debugElement.nativeElement).toHaveText('MyIf()');
                componentFixture.debugElement.componentInstance.showMore = true;
                componentFixture.detectChanges();
                testing_internal_1.expect(componentFixture.debugElement.nativeElement).toHaveText('MyIf(More)');
                async.done();
            });
        }));
        testing_internal_1.it('should override a template', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideTemplate(MockChildComp, '<span>Mock</span>')
                .createAsync(MockChildComp)
                .then(function (componentFixture) {
                componentFixture.detectChanges();
                testing_internal_1.expect(componentFixture.debugElement.nativeElement).toHaveText('Mock');
                async.done();
            });
        }));
        testing_internal_1.it('should override a view', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideView(ChildComp, new metadata_1.ViewMetadata({ template: '<span>Modified {{childBinding}}</span>' }))
                .createAsync(ChildComp)
                .then(function (componentFixture) {
                componentFixture.detectChanges();
                testing_internal_1.expect(componentFixture.debugElement.nativeElement).toHaveText('Modified Child');
                async.done();
            });
        }));
        testing_internal_1.it('should override component dependencies', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideDirective(ParentComp, ChildComp, MockChildComp)
                .createAsync(ParentComp)
                .then(function (componentFixture) {
                componentFixture.detectChanges();
                testing_internal_1.expect(componentFixture.debugElement.nativeElement).toHaveText('Parent(Mock)');
                async.done();
            });
        }));
        testing_internal_1.it("should override child component's dependencies", testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideDirective(ParentComp, ChildComp, ChildWithChildComp)
                .overrideDirective(ChildWithChildComp, ChildChildComp, MockChildChildComp)
                .createAsync(ParentComp)
                .then(function (componentFixture) {
                componentFixture.detectChanges();
                testing_internal_1.expect(componentFixture.debugElement.nativeElement)
                    .toHaveText('Parent(Original Child(ChildChild Mock))');
                async.done();
            });
        }));
        testing_internal_1.it('should override a provider', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideProviders(TestBindingsComp, [core_1.provide(FancyService, { useClass: MockFancyService })])
                .createAsync(TestBindingsComp)
                .then(function (componentFixture) {
                componentFixture.detectChanges();
                testing_internal_1.expect(componentFixture.debugElement.nativeElement)
                    .toHaveText('injected value: mocked out value');
                async.done();
            });
        }));
        testing_internal_1.it('should override a viewBinding', testing_internal_1.inject([testing_internal_1.TestComponentBuilder, testing_internal_1.AsyncTestCompleter], function (tcb, async) {
            tcb.overrideViewProviders(TestViewBindingsComp, [core_1.provide(FancyService, { useClass: MockFancyService })])
                .createAsync(TestViewBindingsComp)
                .then(function (componentFixture) {
                componentFixture.detectChanges();
                testing_internal_1.expect(componentFixture.debugElement.nativeElement)
                    .toHaveText('injected value: mocked out value');
                async.done();
            });
        }));
    });
}
exports.main = main;
//# sourceMappingURL=test_component_builder_spec.js.map