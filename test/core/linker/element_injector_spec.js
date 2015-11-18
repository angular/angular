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
// TODO(tbosch): clang-format screws this up, see https://github.com/angular/clang-format/issues/11.
// Enable clang-format here again when this is fixed.
// clang-format off
var testing_internal_1 = require('angular2/testing_internal');
var spies_1 = require('../spies');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var element_injector_1 = require('angular2/src/core/linker/element_injector');
var metadata_1 = require('angular2/src/core/metadata');
var core_1 = require('angular2/core');
var view_container_ref_1 = require('angular2/src/core/linker/view_container_ref');
var template_ref_1 = require('angular2/src/core/linker/template_ref');
var element_ref_1 = require('angular2/src/core/linker/element_ref');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var query_list_1 = require('angular2/src/core/linker/query_list');
function createDummyView(detector) {
    if (detector === void 0) { detector = null; }
    var res = new spies_1.SpyView();
    res.prop("changeDetector", detector);
    res.prop("elementOffset", 0);
    res.prop("elementInjectors", []);
    res.prop("viewContainers", []);
    res.prop("ownBindersCount", 0);
    return res;
}
function addInj(view, inj) {
    var injs = view.elementInjectors;
    injs.push(inj);
    var containers = view.viewContainers;
    containers.push(null);
    view.prop("ownBindersCount", view.ownBindersCount + 1);
}
var SimpleDirective = (function () {
    function SimpleDirective() {
    }
    SimpleDirective = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], SimpleDirective);
    return SimpleDirective;
})();
var SimpleService = (function () {
    function SimpleService() {
    }
    return SimpleService;
})();
var SomeOtherDirective = (function () {
    function SomeOtherDirective() {
    }
    SomeOtherDirective = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], SomeOtherDirective);
    return SomeOtherDirective;
})();
var _constructionCount = 0;
var CountingDirective = (function () {
    function CountingDirective() {
        this.count = _constructionCount;
        _constructionCount += 1;
    }
    CountingDirective = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], CountingDirective);
    return CountingDirective;
})();
var FancyCountingDirective = (function (_super) {
    __extends(FancyCountingDirective, _super);
    function FancyCountingDirective() {
        _super.call(this);
    }
    FancyCountingDirective = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], FancyCountingDirective);
    return FancyCountingDirective;
})(CountingDirective);
var NeedsDirective = (function () {
    function NeedsDirective(dependency) {
        this.dependency = dependency;
    }
    NeedsDirective = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Self()), 
        __metadata('design:paramtypes', [SimpleDirective])
    ], NeedsDirective);
    return NeedsDirective;
})();
var OptionallyNeedsDirective = (function () {
    function OptionallyNeedsDirective(dependency) {
        this.dependency = dependency;
    }
    OptionallyNeedsDirective = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Self()),
        __param(0, core_1.Optional()), 
        __metadata('design:paramtypes', [SimpleDirective])
    ], OptionallyNeedsDirective);
    return OptionallyNeedsDirective;
})();
var NeeedsDirectiveFromHost = (function () {
    function NeeedsDirectiveFromHost(dependency) {
        this.dependency = dependency;
    }
    NeeedsDirectiveFromHost = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Host()), 
        __metadata('design:paramtypes', [SimpleDirective])
    ], NeeedsDirectiveFromHost);
    return NeeedsDirectiveFromHost;
})();
var NeedsDirectiveFromHostShadowDom = (function () {
    function NeedsDirectiveFromHostShadowDom(dependency) {
        this.dependency = dependency;
    }
    NeedsDirectiveFromHostShadowDom = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [SimpleDirective])
    ], NeedsDirectiveFromHostShadowDom);
    return NeedsDirectiveFromHostShadowDom;
})();
var NeedsService = (function () {
    function NeedsService(service) {
        this.service = service;
    }
    NeedsService = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject("service")), 
        __metadata('design:paramtypes', [Object])
    ], NeedsService);
    return NeedsService;
})();
var NeedsServiceFromHost = (function () {
    function NeedsServiceFromHost(service) {
        this.service = service;
    }
    NeedsServiceFromHost = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Host()),
        __param(0, core_1.Inject("service")), 
        __metadata('design:paramtypes', [Object])
    ], NeedsServiceFromHost);
    return NeedsServiceFromHost;
})();
var HasEventEmitter = (function () {
    function HasEventEmitter() {
        this.emitter = "emitter";
    }
    return HasEventEmitter;
})();
var NeedsAttribute = (function () {
    function NeedsAttribute(typeAttribute, titleAttribute, fooAttribute) {
        this.typeAttribute = typeAttribute;
        this.titleAttribute = titleAttribute;
        this.fooAttribute = fooAttribute;
    }
    NeedsAttribute = __decorate([
        __param(0, metadata_1.Attribute('type')),
        __param(1, metadata_1.Attribute('title')),
        __param(2, metadata_1.Attribute('foo')), 
        __metadata('design:paramtypes', [String, String, String])
    ], NeedsAttribute);
    return NeedsAttribute;
})();
var NeedsAttributeNoType = (function () {
    function NeedsAttributeNoType(fooAttribute) {
        this.fooAttribute = fooAttribute;
    }
    NeedsAttributeNoType = __decorate([
        core_1.Injectable(),
        __param(0, metadata_1.Attribute('foo')), 
        __metadata('design:paramtypes', [Object])
    ], NeedsAttributeNoType);
    return NeedsAttributeNoType;
})();
var NeedsQuery = (function () {
    function NeedsQuery(query) {
        this.query = query;
    }
    NeedsQuery = __decorate([
        core_1.Injectable(),
        __param(0, metadata_1.Query(CountingDirective)), 
        __metadata('design:paramtypes', [query_list_1.QueryList])
    ], NeedsQuery);
    return NeedsQuery;
})();
var NeedsViewQuery = (function () {
    function NeedsViewQuery(query) {
        this.query = query;
    }
    NeedsViewQuery = __decorate([
        core_1.Injectable(),
        __param(0, metadata_1.ViewQuery(CountingDirective)), 
        __metadata('design:paramtypes', [query_list_1.QueryList])
    ], NeedsViewQuery);
    return NeedsViewQuery;
})();
var NeedsQueryByVarBindings = (function () {
    function NeedsQueryByVarBindings(query) {
        this.query = query;
    }
    NeedsQueryByVarBindings = __decorate([
        core_1.Injectable(),
        __param(0, metadata_1.Query("one,two")), 
        __metadata('design:paramtypes', [query_list_1.QueryList])
    ], NeedsQueryByVarBindings);
    return NeedsQueryByVarBindings;
})();
var NeedsTemplateRefQuery = (function () {
    function NeedsTemplateRefQuery(query) {
        this.query = query;
    }
    NeedsTemplateRefQuery = __decorate([
        core_1.Injectable(),
        __param(0, metadata_1.Query(template_ref_1.TemplateRef)), 
        __metadata('design:paramtypes', [query_list_1.QueryList])
    ], NeedsTemplateRefQuery);
    return NeedsTemplateRefQuery;
})();
var NeedsElementRef = (function () {
    function NeedsElementRef(ref) {
        this.elementRef = ref;
    }
    NeedsElementRef = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [element_ref_1.ElementRef])
    ], NeedsElementRef);
    return NeedsElementRef;
})();
var NeedsViewContainer = (function () {
    function NeedsViewContainer(vc) {
        this.viewContainer = vc;
    }
    NeedsViewContainer = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [view_container_ref_1.ViewContainerRef])
    ], NeedsViewContainer);
    return NeedsViewContainer;
})();
var NeedsTemplateRef = (function () {
    function NeedsTemplateRef(ref) {
        this.templateRef = ref;
    }
    NeedsTemplateRef = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [template_ref_1.TemplateRef])
    ], NeedsTemplateRef);
    return NeedsTemplateRef;
})();
var OptionallyInjectsTemplateRef = (function () {
    function OptionallyInjectsTemplateRef(ref) {
        this.templateRef = ref;
    }
    OptionallyInjectsTemplateRef = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Optional()), 
        __metadata('design:paramtypes', [template_ref_1.TemplateRef])
    ], OptionallyInjectsTemplateRef);
    return OptionallyInjectsTemplateRef;
})();
var DirectiveNeedsChangeDetectorRef = (function () {
    function DirectiveNeedsChangeDetectorRef(changeDetectorRef) {
        this.changeDetectorRef = changeDetectorRef;
    }
    DirectiveNeedsChangeDetectorRef = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [change_detection_1.ChangeDetectorRef])
    ], DirectiveNeedsChangeDetectorRef);
    return DirectiveNeedsChangeDetectorRef;
})();
var ComponentNeedsChangeDetectorRef = (function () {
    function ComponentNeedsChangeDetectorRef(changeDetectorRef) {
        this.changeDetectorRef = changeDetectorRef;
    }
    ComponentNeedsChangeDetectorRef = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [change_detection_1.ChangeDetectorRef])
    ], ComponentNeedsChangeDetectorRef);
    return ComponentNeedsChangeDetectorRef;
})();
var PipeNeedsChangeDetectorRef = (function () {
    function PipeNeedsChangeDetectorRef(changeDetectorRef) {
        this.changeDetectorRef = changeDetectorRef;
    }
    PipeNeedsChangeDetectorRef = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [change_detection_1.ChangeDetectorRef])
    ], PipeNeedsChangeDetectorRef);
    return PipeNeedsChangeDetectorRef;
})();
var A_Needs_B = (function () {
    function A_Needs_B(dep) {
    }
    return A_Needs_B;
})();
var B_Needs_A = (function () {
    function B_Needs_A(dep) {
    }
    return B_Needs_A;
})();
var DirectiveWithDestroy = (function () {
    function DirectiveWithDestroy() {
        this.onDestroyCounter = 0;
    }
    DirectiveWithDestroy.prototype.onDestroy = function () { this.onDestroyCounter++; };
    return DirectiveWithDestroy;
})();
function main() {
    var defaultPreBuiltObjects = new element_injector_1.PreBuiltObjects(null, createDummyView(), new spies_1.SpyElementRef(), null);
    // An injector with more than 10 providers will switch to the dynamic strategy
    var dynamicProviders = [];
    for (var i = 0; i < 20; i++) {
        dynamicProviders.push(core_1.provide(i, { useValue: i }));
    }
    function createPei(parent, index, providers, distance, hasShadowRoot, dirVariableBindings) {
        if (distance === void 0) { distance = 1; }
        if (hasShadowRoot === void 0) { hasShadowRoot = false; }
        if (dirVariableBindings === void 0) { dirVariableBindings = null; }
        var directiveProvider = providers.map(function (b) {
            if (b instanceof element_injector_1.DirectiveProvider)
                return b;
            if (b instanceof core_1.Provider)
                return element_injector_1.DirectiveProvider.createFromProvider(b, null);
            return element_injector_1.DirectiveProvider.createFromType(b, null);
        });
        return element_injector_1.ProtoElementInjector.create(parent, index, directiveProvider, hasShadowRoot, distance, dirVariableBindings);
    }
    function injector(providers, imperativelyCreatedInjector, isComponent, preBuiltObjects, attributes, dirVariableBindings) {
        if (imperativelyCreatedInjector === void 0) { imperativelyCreatedInjector = null; }
        if (isComponent === void 0) { isComponent = false; }
        if (preBuiltObjects === void 0) { preBuiltObjects = null; }
        if (attributes === void 0) { attributes = null; }
        if (dirVariableBindings === void 0) { dirVariableBindings = null; }
        var proto = createPei(null, 0, providers, 0, isComponent, dirVariableBindings);
        proto.attributes = attributes;
        var inj = proto.instantiate(null);
        var preBuilt = lang_1.isPresent(preBuiltObjects) ? preBuiltObjects : defaultPreBuiltObjects;
        inj.hydrate(imperativelyCreatedInjector, null, preBuilt);
        return inj;
    }
    function parentChildInjectors(parentProviders, childProviders, parentPreBuildObjects, imperativelyCreatedInjector) {
        if (parentPreBuildObjects === void 0) { parentPreBuildObjects = null; }
        if (imperativelyCreatedInjector === void 0) { imperativelyCreatedInjector = null; }
        if (lang_1.isBlank(parentPreBuildObjects))
            parentPreBuildObjects = defaultPreBuiltObjects;
        var protoParent = createPei(null, 0, parentProviders);
        var parent = protoParent.instantiate(null);
        parent.hydrate(null, null, parentPreBuildObjects);
        var protoChild = createPei(protoParent, 1, childProviders, 1, false);
        var child = protoChild.instantiate(parent);
        child.hydrate(imperativelyCreatedInjector, null, defaultPreBuiltObjects);
        return child;
    }
    function hostShadowInjectors(hostProviders, shadowProviders, imperativelyCreatedInjector) {
        if (imperativelyCreatedInjector === void 0) { imperativelyCreatedInjector = null; }
        var protoHost = createPei(null, 0, hostProviders, 0, true);
        var host = protoHost.instantiate(null);
        host.hydrate(null, null, defaultPreBuiltObjects);
        var protoShadow = createPei(null, 0, shadowProviders, 0, false);
        var shadow = protoShadow.instantiate(null);
        shadow.hydrate(imperativelyCreatedInjector, host, null);
        return shadow;
    }
    testing_internal_1.describe('TreeNodes', function () {
        var root, child;
        testing_internal_1.beforeEach(function () {
            root = new element_injector_1.TreeNode(null);
            child = new element_injector_1.TreeNode(root);
        });
        testing_internal_1.it('should support removing and adding the parent', function () {
            testing_internal_1.expect(child.parent).toEqual(root);
            child.remove();
            testing_internal_1.expect(child.parent).toEqual(null);
            root.addChild(child);
            testing_internal_1.expect(child.parent).toEqual(root);
        });
    });
    testing_internal_1.describe("ProtoElementInjector", function () {
        testing_internal_1.describe("direct parent", function () {
            testing_internal_1.it("should return parent proto injector when distance is 1", function () {
                var distance = 1;
                var protoParent = createPei(null, 0, []);
                var protoChild = createPei(protoParent, 0, [], distance, false);
                testing_internal_1.expect(protoChild.directParent()).toEqual(protoParent);
            });
            testing_internal_1.it("should return null otherwise", function () {
                var distance = 2;
                var protoParent = createPei(null, 0, []);
                var protoChild = createPei(protoParent, 0, [], distance, false);
                testing_internal_1.expect(protoChild.directParent()).toEqual(null);
            });
        });
        testing_internal_1.describe('inline strategy', function () {
            testing_internal_1.it("should allow for direct access using getProviderAtIndex", function () {
                var proto = createPei(null, 0, [core_1.provide(SimpleDirective, { useClass: SimpleDirective })]);
                testing_internal_1.expect(proto.getProviderAtIndex(0)).toBeAnInstanceOf(element_injector_1.DirectiveProvider);
                testing_internal_1.expect(function () { return proto.getProviderAtIndex(-1); }).toThrowError('Index -1 is out-of-bounds.');
                testing_internal_1.expect(function () { return proto.getProviderAtIndex(10); }).toThrowError('Index 10 is out-of-bounds.');
            });
        });
        testing_internal_1.describe('dynamic strategy', function () {
            testing_internal_1.it("should allow for direct access using getProviderAtIndex", function () {
                var proto = createPei(null, 0, dynamicProviders);
                testing_internal_1.expect(proto.getProviderAtIndex(0)).toBeAnInstanceOf(element_injector_1.DirectiveProvider);
                testing_internal_1.expect(function () { return proto.getProviderAtIndex(-1); }).toThrowError('Index -1 is out-of-bounds.');
                testing_internal_1.expect(function () { return proto.getProviderAtIndex(dynamicProviders.length - 1); }).not.toThrow();
                testing_internal_1.expect(function () { return proto.getProviderAtIndex(dynamicProviders.length); })
                    .toThrowError("Index " + dynamicProviders.length + " is out-of-bounds.");
            });
        });
        testing_internal_1.describe('event emitters', function () {
            testing_internal_1.it('should return a list of event accessors', function () {
                var provider = element_injector_1.DirectiveProvider.createFromType(HasEventEmitter, new metadata_1.DirectiveMetadata({ outputs: ['emitter'] }));
                var inj = createPei(null, 0, [provider]);
                testing_internal_1.expect(inj.eventEmitterAccessors.length).toEqual(1);
                var accessor = inj.eventEmitterAccessors[0][0];
                testing_internal_1.expect(accessor.eventName).toEqual('emitter');
                testing_internal_1.expect(accessor.getter(new HasEventEmitter())).toEqual('emitter');
            });
            testing_internal_1.it('should allow a different event vs field name', function () {
                var provider = element_injector_1.DirectiveProvider.createFromType(HasEventEmitter, new metadata_1.DirectiveMetadata({ outputs: ['emitter: publicEmitter'] }));
                var inj = createPei(null, 0, [provider]);
                testing_internal_1.expect(inj.eventEmitterAccessors.length).toEqual(1);
                var accessor = inj.eventEmitterAccessors[0][0];
                testing_internal_1.expect(accessor.eventName).toEqual('publicEmitter');
                testing_internal_1.expect(accessor.getter(new HasEventEmitter())).toEqual('emitter');
            });
        });
        testing_internal_1.describe(".create", function () {
            testing_internal_1.it("should collect providers from all directives", function () {
                var pei = createPei(null, 0, [
                    element_injector_1.DirectiveProvider.createFromType(SimpleDirective, new metadata_1.ComponentMetadata({ providers: [core_1.provide('injectable1', { useValue: 'injectable1' })] })),
                    element_injector_1.DirectiveProvider.createFromType(SomeOtherDirective, new metadata_1.ComponentMetadata({
                        providers: [core_1.provide('injectable2', { useValue: 'injectable2' })]
                    }))
                ]);
                testing_internal_1.expect(pei.getProviderAtIndex(0).key.token).toBe(SimpleDirective);
                testing_internal_1.expect(pei.getProviderAtIndex(1).key.token).toBe(SomeOtherDirective);
                testing_internal_1.expect(pei.getProviderAtIndex(2).key.token).toEqual("injectable1");
                testing_internal_1.expect(pei.getProviderAtIndex(3).key.token).toEqual("injectable2");
            });
            testing_internal_1.it("should collect view providers from the component", function () {
                var pei = createPei(null, 0, [element_injector_1.DirectiveProvider.createFromType(SimpleDirective, new metadata_1.ComponentMetadata({
                        viewProviders: [core_1.provide('injectable1', { useValue: 'injectable1' })]
                    }))], 0, true);
                testing_internal_1.expect(pei.getProviderAtIndex(0).key.token).toBe(SimpleDirective);
                testing_internal_1.expect(pei.getProviderAtIndex(1).key.token).toEqual("injectable1");
            });
            testing_internal_1.it("should flatten nested arrays", function () {
                var pei = createPei(null, 0, [
                    element_injector_1.DirectiveProvider.createFromType(SimpleDirective, new metadata_1.ComponentMetadata({
                        viewProviders: [[[core_1.provide('view', { useValue: 'view' })]]],
                        providers: [[[core_1.provide('host', { useValue: 'host' })]]]
                    }))
                ], 0, true);
                testing_internal_1.expect(pei.getProviderAtIndex(0).key.token).toBe(SimpleDirective);
                testing_internal_1.expect(pei.getProviderAtIndex(1).key.token).toEqual("view");
                testing_internal_1.expect(pei.getProviderAtIndex(2).key.token).toEqual("host");
            });
            testing_internal_1.it('should support an arbitrary number of providers', function () {
                var pei = createPei(null, 0, dynamicProviders);
                for (var i = 0; i < dynamicProviders.length; i++) {
                    testing_internal_1.expect(pei.getProviderAtIndex(i).key.token).toBe(i);
                }
            });
        });
    });
    testing_internal_1.describe("ElementInjector", function () {
        testing_internal_1.describe("instantiate", function () {
            testing_internal_1.it("should create an element injector", function () {
                var protoParent = createPei(null, 0, []);
                var protoChild1 = createPei(protoParent, 1, []);
                var protoChild2 = createPei(protoParent, 2, []);
                var p = protoParent.instantiate(null);
                var c1 = protoChild1.instantiate(p);
                var c2 = protoChild2.instantiate(p);
                testing_internal_1.expect(c1.parent).toEqual(p);
                testing_internal_1.expect(c2.parent).toEqual(p);
                testing_internal_1.expect(lang_1.isBlank(p.parent)).toBeTruthy();
            });
            testing_internal_1.describe("direct parent", function () {
                testing_internal_1.it("should return parent injector when distance is 1", function () {
                    var distance = 1;
                    var protoParent = createPei(null, 0, []);
                    var protoChild = createPei(protoParent, 1, [], distance);
                    var p = protoParent.instantiate(null);
                    var c = protoChild.instantiate(p);
                    testing_internal_1.expect(c.directParent()).toEqual(p);
                });
                testing_internal_1.it("should return null otherwise", function () {
                    var distance = 2;
                    var protoParent = createPei(null, 0, []);
                    var protoChild = createPei(protoParent, 1, [], distance);
                    var p = protoParent.instantiate(null);
                    var c = protoChild.instantiate(p);
                    testing_internal_1.expect(c.directParent()).toEqual(null);
                });
            });
        });
        testing_internal_1.describe("hasBindings", function () {
            testing_internal_1.it("should be true when there are providers", function () {
                var p = createPei(null, 0, [SimpleDirective]);
                testing_internal_1.expect(p.hasBindings).toBeTruthy();
            });
            testing_internal_1.it("should be false otherwise", function () {
                var p = createPei(null, 0, []);
                testing_internal_1.expect(p.hasBindings).toBeFalsy();
            });
        });
        testing_internal_1.describe("hasInstances", function () {
            testing_internal_1.it("should be false when no directives are instantiated", function () { testing_internal_1.expect(injector([]).hasInstances()).toBe(false); });
            testing_internal_1.it("should be true when directives are instantiated", function () { testing_internal_1.expect(injector([SimpleDirective]).hasInstances()).toBe(true); });
        });
        [{ strategy: 'inline', providers: [] }, { strategy: 'dynamic',
                providers: dynamicProviders }].forEach(function (context) {
            var extraProviders = context['providers'];
            testing_internal_1.describe(context['strategy'] + " strategy", function () {
                testing_internal_1.describe("hydrate", function () {
                    testing_internal_1.it("should instantiate directives that have no dependencies", function () {
                        var providers = collection_1.ListWrapper.concat([SimpleDirective], extraProviders);
                        var inj = injector(providers);
                        testing_internal_1.expect(inj.get(SimpleDirective)).toBeAnInstanceOf(SimpleDirective);
                    });
                    testing_internal_1.it("should instantiate directives that depend on an arbitrary number of directives", function () {
                        var providers = collection_1.ListWrapper.concat([SimpleDirective, NeedsDirective], extraProviders);
                        var inj = injector(providers);
                        var d = inj.get(NeedsDirective);
                        testing_internal_1.expect(d).toBeAnInstanceOf(NeedsDirective);
                        testing_internal_1.expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
                    });
                    testing_internal_1.it("should instantiate providers that have dependencies with set visibility", function () {
                        var childInj = parentChildInjectors(collection_1.ListWrapper.concat([element_injector_1.DirectiveProvider.createFromType(SimpleDirective, new metadata_1.ComponentMetadata({
                                providers: [core_1.provide('injectable1', { useValue: 'injectable1' })]
                            }))], extraProviders), [element_injector_1.DirectiveProvider.createFromType(SimpleDirective, new metadata_1.ComponentMetadata({
                                providers: [
                                    core_1.provide('injectable1', { useValue: 'new-injectable1' }),
                                    core_1.provide('injectable2', { useFactory: function (val) { return (val + "-injectable2"); },
                                        deps: [[new core_1.InjectMetadata('injectable1'), new core_1.SkipSelfMetadata()]] })
                                ]
                            }))]);
                        testing_internal_1.expect(childInj.get('injectable2')).toEqual('injectable1-injectable2');
                    });
                    testing_internal_1.it("should instantiate providers that have dependencies", function () {
                        var providers = [
                            core_1.provide('injectable1', { useValue: 'injectable1' }),
                            core_1.provide('injectable2', { useFactory: function (val) { return (val + "-injectable2"); },
                                deps: ['injectable1'] })
                        ];
                        var inj = injector(collection_1.ListWrapper.concat([element_injector_1.DirectiveProvider.createFromType(SimpleDirective, new metadata_1.DirectiveMetadata({ providers: providers }))], extraProviders));
                        testing_internal_1.expect(inj.get('injectable2')).toEqual('injectable1-injectable2');
                    });
                    testing_internal_1.it("should instantiate viewProviders that have dependencies", function () {
                        var viewProviders = [
                            core_1.provide('injectable1', { useValue: 'injectable1' }),
                            core_1.provide('injectable2', { useFactory: function (val) { return (val + "-injectable2"); },
                                deps: ['injectable1'] })
                        ];
                        var inj = injector(collection_1.ListWrapper.concat([element_injector_1.DirectiveProvider.createFromType(SimpleDirective, new metadata_1.ComponentMetadata({
                                viewProviders: viewProviders }))], extraProviders), null, true);
                        testing_internal_1.expect(inj.get('injectable2')).toEqual('injectable1-injectable2');
                    });
                    testing_internal_1.it("should instantiate components that depend on viewProviders providers", function () {
                        var inj = injector(collection_1.ListWrapper.concat([element_injector_1.DirectiveProvider.createFromType(NeedsService, new metadata_1.ComponentMetadata({
                                viewProviders: [core_1.provide('service', { useValue: 'service' })]
                            }))], extraProviders), null, true);
                        testing_internal_1.expect(inj.get(NeedsService).service).toEqual('service');
                    });
                    testing_internal_1.it("should instantiate providers lazily", function () {
                        var created = false;
                        var inj = injector(collection_1.ListWrapper.concat([element_injector_1.DirectiveProvider.createFromType(SimpleDirective, new metadata_1.ComponentMetadata({
                                providers: [core_1.provide('service', { useFactory: function () { return created = true; } })]
                            }))], extraProviders), null, true);
                        testing_internal_1.expect(created).toBe(false);
                        inj.get('service');
                        testing_internal_1.expect(created).toBe(true);
                    });
                    testing_internal_1.it("should instantiate view providers lazily", function () {
                        var created = false;
                        var inj = injector(collection_1.ListWrapper.concat([element_injector_1.DirectiveProvider.createFromType(SimpleDirective, new metadata_1.ComponentMetadata({
                                viewProviders: [core_1.provide('service', { useFactory: function () { return created = true; } })]
                            }))], extraProviders), null, true);
                        testing_internal_1.expect(created).toBe(false);
                        inj.get('service');
                        testing_internal_1.expect(created).toBe(true);
                    });
                    testing_internal_1.it("should not instantiate other directives that depend on viewProviders providers", function () {
                        var directiveAnnotation = new metadata_1.ComponentMetadata({
                            viewProviders: collection_1.ListWrapper.concat([core_1.provide("service", { useValue: "service" })], extraProviders)
                        });
                        var componentDirective = element_injector_1.DirectiveProvider.createFromType(SimpleDirective, directiveAnnotation);
                        testing_internal_1.expect(function () { injector([componentDirective, NeedsService], null); })
                            .toThrowError(testing_internal_1.containsRegexp("No provider for service! (" + lang_1.stringify(NeedsService) + " -> service)"));
                    });
                    testing_internal_1.it("should instantiate directives that depend on providers of other directives", function () {
                        var shadowInj = hostShadowInjectors(collection_1.ListWrapper.concat([element_injector_1.DirectiveProvider.createFromType(SimpleDirective, new metadata_1.ComponentMetadata({
                                providers: [core_1.provide('service', { useValue: 'hostService' })] }))], extraProviders), collection_1.ListWrapper.concat([NeedsService], extraProviders));
                        testing_internal_1.expect(shadowInj.get(NeedsService).service).toEqual('hostService');
                    });
                    testing_internal_1.it("should instantiate directives that depend on imperatively created injector providers (bootstrap)", function () {
                        var imperativelyCreatedInjector = core_1.Injector.resolveAndCreate([
                            core_1.provide("service", { useValue: 'appService' })
                        ]);
                        var inj = injector([NeedsService], imperativelyCreatedInjector);
                        testing_internal_1.expect(inj.get(NeedsService).service).toEqual('appService');
                        testing_internal_1.expect(function () { return injector([NeedsServiceFromHost], imperativelyCreatedInjector); }).toThrowError();
                    });
                    testing_internal_1.it("should instantiate directives that depend on imperatively created injector providers (root injector)", function () {
                        var imperativelyCreatedInjector = core_1.Injector.resolveAndCreate([
                            core_1.provide("service", { useValue: 'appService' })
                        ]);
                        var inj = hostShadowInjectors([SimpleDirective], [NeedsService, NeedsServiceFromHost], imperativelyCreatedInjector);
                        testing_internal_1.expect(inj.get(NeedsService).service).toEqual('appService');
                        testing_internal_1.expect(inj.get(NeedsServiceFromHost).service).toEqual('appService');
                    });
                    testing_internal_1.it("should instantiate directives that depend on imperatively created injector providers (child injector)", function () {
                        var imperativelyCreatedInjector = core_1.Injector.resolveAndCreate([
                            core_1.provide("service", { useValue: 'appService' })
                        ]);
                        var inj = parentChildInjectors([], [NeedsService, NeedsServiceFromHost], null, imperativelyCreatedInjector);
                        testing_internal_1.expect(inj.get(NeedsService).service).toEqual('appService');
                        testing_internal_1.expect(inj.get(NeedsServiceFromHost).service).toEqual('appService');
                    });
                    testing_internal_1.it("should prioritize viewProviders over providers for the same provider", function () {
                        var inj = injector(collection_1.ListWrapper.concat([element_injector_1.DirectiveProvider.createFromType(NeedsService, new metadata_1.ComponentMetadata({
                                providers: [core_1.provide('service', { useValue: 'hostService' })],
                                viewProviders: [core_1.provide('service', { useValue: 'viewService' })] }))], extraProviders), null, true);
                        testing_internal_1.expect(inj.get(NeedsService).service).toEqual('viewService');
                    });
                    testing_internal_1.it("should prioritize directive providers over component providers", function () {
                        var component = element_injector_1.DirectiveProvider.createFromType(NeedsService, new metadata_1.ComponentMetadata({
                            providers: [core_1.provide('service', { useValue: 'compService' })] }));
                        var directive = element_injector_1.DirectiveProvider.createFromType(SomeOtherDirective, new metadata_1.DirectiveMetadata({
                            providers: [core_1.provide('service', { useValue: 'dirService' })] }));
                        var inj = injector(collection_1.ListWrapper.concat([component, directive], extraProviders), null, true);
                        testing_internal_1.expect(inj.get(NeedsService).service).toEqual('dirService');
                    });
                    testing_internal_1.it("should not instantiate a directive in a view that has a host dependency on providers" +
                        " of the component", function () {
                        testing_internal_1.expect(function () {
                            hostShadowInjectors(collection_1.ListWrapper.concat([
                                element_injector_1.DirectiveProvider.createFromType(SomeOtherDirective, new metadata_1.DirectiveMetadata({
                                    providers: [core_1.provide('service', { useValue: 'hostService' })] }))], extraProviders), collection_1.ListWrapper.concat([NeedsServiceFromHost], extraProviders));
                        }).toThrowError(new RegExp("No provider for service!"));
                    });
                    testing_internal_1.it("should not instantiate a directive in a view that has a host dependency on providers" +
                        " of a decorator directive", function () {
                        testing_internal_1.expect(function () {
                            hostShadowInjectors(collection_1.ListWrapper.concat([
                                SimpleDirective,
                                element_injector_1.DirectiveProvider.createFromType(SomeOtherDirective, new metadata_1.DirectiveMetadata({
                                    providers: [core_1.provide('service', { useValue: 'hostService' })] }))], extraProviders), collection_1.ListWrapper.concat([NeedsServiceFromHost], extraProviders));
                        }).toThrowError(new RegExp("No provider for service!"));
                    });
                    testing_internal_1.it("should instantiate directives that depend on pre built objects", function () {
                        var templateRef = new template_ref_1.TemplateRef_(new spies_1.SpyElementRef());
                        var providers = collection_1.ListWrapper.concat([NeedsTemplateRef], extraProviders);
                        var inj = injector(providers, null, false, new element_injector_1.PreBuiltObjects(null, null, null, templateRef));
                        testing_internal_1.expect(inj.get(NeedsTemplateRef).templateRef).toEqual(templateRef);
                    });
                    testing_internal_1.it("should get directives", function () {
                        var child = hostShadowInjectors(collection_1.ListWrapper.concat([SomeOtherDirective, SimpleDirective], extraProviders), [NeedsDirectiveFromHostShadowDom]);
                        var d = child.get(NeedsDirectiveFromHostShadowDom);
                        testing_internal_1.expect(d).toBeAnInstanceOf(NeedsDirectiveFromHostShadowDom);
                        testing_internal_1.expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
                    });
                    testing_internal_1.it("should get directives from the host", function () {
                        var child = parentChildInjectors(collection_1.ListWrapper.concat([SimpleDirective], extraProviders), [NeeedsDirectiveFromHost]);
                        var d = child.get(NeeedsDirectiveFromHost);
                        testing_internal_1.expect(d).toBeAnInstanceOf(NeeedsDirectiveFromHost);
                        testing_internal_1.expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
                    });
                    testing_internal_1.it("should throw when a dependency cannot be resolved", function () {
                        testing_internal_1.expect(function () { return injector(collection_1.ListWrapper.concat([NeeedsDirectiveFromHost], extraProviders)); })
                            .toThrowError(testing_internal_1.containsRegexp("No provider for " + lang_1.stringify(SimpleDirective) + "! (" + lang_1.stringify(NeeedsDirectiveFromHost) + " -> " + lang_1.stringify(SimpleDirective) + ")"));
                    });
                    testing_internal_1.it("should inject null when an optional dependency cannot be resolved", function () {
                        var inj = injector(collection_1.ListWrapper.concat([OptionallyNeedsDirective], extraProviders));
                        var d = inj.get(OptionallyNeedsDirective);
                        testing_internal_1.expect(d.dependency).toEqual(null);
                    });
                    testing_internal_1.it("should accept providers instead of types", function () {
                        var inj = injector(collection_1.ListWrapper.concat([core_1.provide(SimpleDirective, { useClass: SimpleDirective })], extraProviders));
                        testing_internal_1.expect(inj.get(SimpleDirective)).toBeAnInstanceOf(SimpleDirective);
                    });
                    testing_internal_1.it("should allow for direct access using getDirectiveAtIndex", function () {
                        var providers = collection_1.ListWrapper.concat([core_1.provide(SimpleDirective, { useClass: SimpleDirective })], extraProviders);
                        var inj = injector(providers);
                        var firsIndexOut = providers.length > 10 ? providers.length : 10;
                        testing_internal_1.expect(inj.getDirectiveAtIndex(0)).toBeAnInstanceOf(SimpleDirective);
                        testing_internal_1.expect(function () { return inj.getDirectiveAtIndex(-1); }).toThrowError('Index -1 is out-of-bounds.');
                        testing_internal_1.expect(function () { return inj.getDirectiveAtIndex(firsIndexOut); })
                            .toThrowError("Index " + firsIndexOut + " is out-of-bounds.");
                    });
                    testing_internal_1.it("should instantiate directives that depend on the containing component", function () {
                        var directiveProvider = element_injector_1.DirectiveProvider.createFromType(SimpleDirective, new metadata_1.ComponentMetadata());
                        var shadow = hostShadowInjectors(collection_1.ListWrapper.concat([directiveProvider], extraProviders), [NeeedsDirectiveFromHost]);
                        var d = shadow.get(NeeedsDirectiveFromHost);
                        testing_internal_1.expect(d).toBeAnInstanceOf(NeeedsDirectiveFromHost);
                        testing_internal_1.expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
                    });
                    testing_internal_1.it("should not instantiate directives that depend on other directives in the containing component's ElementInjector", function () {
                        var directiveProvider = element_injector_1.DirectiveProvider.createFromType(SomeOtherDirective, new metadata_1.ComponentMetadata());
                        testing_internal_1.expect(function () {
                            hostShadowInjectors(collection_1.ListWrapper.concat([directiveProvider, SimpleDirective], extraProviders), [NeedsDirective]);
                        })
                            .toThrowError(testing_internal_1.containsRegexp("No provider for " + lang_1.stringify(SimpleDirective) + "! (" + lang_1.stringify(NeedsDirective) + " -> " + lang_1.stringify(SimpleDirective) + ")"));
                    });
                });
                testing_internal_1.describe("getRootViewInjectors", function () {
                    testing_internal_1.it("should return an empty array if there is no nested view", function () {
                        var inj = injector(extraProviders);
                        testing_internal_1.expect(inj.getRootViewInjectors()).toEqual([]);
                    });
                    testing_internal_1.it("should return an empty array on a dehydrated view", function () {
                        var inj = injector(extraProviders);
                        inj.dehydrate();
                        testing_internal_1.expect(inj.getRootViewInjectors()).toEqual([]);
                    });
                });
                testing_internal_1.describe("dehydrate", function () {
                    function cycleHydrate(inj, host) {
                        if (host === void 0) { host = null; }
                        // Each injection supports 3 query slots, so we cycle 4 times.
                        for (var i = 0; i < 4; i++) {
                            inj.dehydrate();
                            inj.hydrate(null, host, defaultPreBuiltObjects);
                        }
                    }
                    testing_internal_1.it("should handle repeated hydration / dehydration", function () {
                        var inj = injector(extraProviders);
                        cycleHydrate(inj);
                    });
                    testing_internal_1.it("should handle repeated hydration / dehydration with query present", function () {
                        var inj = injector(collection_1.ListWrapper.concat([NeedsQuery], extraProviders));
                        cycleHydrate(inj);
                    });
                    testing_internal_1.it("should handle repeated hydration / dehydration with view query present", function () {
                        var inj = injector(extraProviders);
                        var host = injector(collection_1.ListWrapper.concat([NeedsViewQuery], extraProviders));
                        cycleHydrate(inj, host);
                    });
                });
                testing_internal_1.describe("lifecycle", function () {
                    testing_internal_1.it("should call onDestroy on directives subscribed to this event", function () {
                        var inj = injector(collection_1.ListWrapper.concat([element_injector_1.DirectiveProvider.createFromType(DirectiveWithDestroy, new metadata_1.DirectiveMetadata())], extraProviders));
                        var destroy = inj.get(DirectiveWithDestroy);
                        inj.dehydrate();
                        testing_internal_1.expect(destroy.onDestroyCounter).toBe(1);
                    });
                    testing_internal_1.it("should work with services", function () {
                        var inj = injector(collection_1.ListWrapper.concat([element_injector_1.DirectiveProvider.createFromType(SimpleDirective, new metadata_1.DirectiveMetadata({ providers: [SimpleService] }))], extraProviders));
                        inj.dehydrate();
                    });
                });
                testing_internal_1.describe('static attributes', function () {
                    testing_internal_1.it('should be injectable', function () {
                        var attributes = new Map();
                        attributes.set('type', 'text');
                        attributes.set('title', '');
                        var inj = injector(collection_1.ListWrapper.concat([NeedsAttribute], extraProviders), null, false, null, attributes);
                        var needsAttribute = inj.get(NeedsAttribute);
                        testing_internal_1.expect(needsAttribute.typeAttribute).toEqual('text');
                        testing_internal_1.expect(needsAttribute.titleAttribute).toEqual('');
                        testing_internal_1.expect(needsAttribute.fooAttribute).toEqual(null);
                    });
                    testing_internal_1.it('should be injectable without type annotation', function () {
                        var attributes = new Map();
                        attributes.set('foo', 'bar');
                        var inj = injector(collection_1.ListWrapper.concat([NeedsAttributeNoType], extraProviders), null, false, null, attributes);
                        var needsAttribute = inj.get(NeedsAttributeNoType);
                        testing_internal_1.expect(needsAttribute.fooAttribute).toEqual('bar');
                    });
                });
                testing_internal_1.describe("refs", function () {
                    testing_internal_1.it("should inject ElementRef", function () {
                        var inj = injector(collection_1.ListWrapper.concat([NeedsElementRef], extraProviders));
                        testing_internal_1.expect(inj.get(NeedsElementRef).elementRef).toBe(defaultPreBuiltObjects.elementRef);
                    });
                    testing_internal_1.it("should inject ChangeDetectorRef of the component's view into the component", function () {
                        var cd = new change_detection_1.DynamicChangeDetector(null, null, 0, [], [], null, [], [], [], null);
                        var view = createDummyView();
                        var childView = createDummyView(cd);
                        view.spy('getNestedView').andReturn(childView);
                        var provider = element_injector_1.DirectiveProvider.createFromType(ComponentNeedsChangeDetectorRef, new metadata_1.ComponentMetadata());
                        var inj = injector(collection_1.ListWrapper.concat([provider], extraProviders), null, true, new element_injector_1.PreBuiltObjects(null, view, new spies_1.SpyElementRef(), null));
                        testing_internal_1.expect(inj.get(ComponentNeedsChangeDetectorRef).changeDetectorRef).toBe(cd.ref);
                    });
                    testing_internal_1.it("should inject ChangeDetectorRef of the containing component into directives", function () {
                        var cd = new change_detection_1.DynamicChangeDetector(null, null, 0, [], [], null, [], [], [], null);
                        var view = createDummyView(cd);
                        var provider = element_injector_1.DirectiveProvider.createFromType(DirectiveNeedsChangeDetectorRef, new metadata_1.DirectiveMetadata());
                        var inj = injector(collection_1.ListWrapper.concat([provider], extraProviders), null, false, new element_injector_1.PreBuiltObjects(null, view, new spies_1.SpyElementRef(), null));
                        testing_internal_1.expect(inj.get(DirectiveNeedsChangeDetectorRef).changeDetectorRef).toBe(cd.ref);
                    });
                    testing_internal_1.it('should inject ViewContainerRef', function () {
                        var inj = injector(collection_1.ListWrapper.concat([NeedsViewContainer], extraProviders));
                        testing_internal_1.expect(inj.get(NeedsViewContainer).viewContainer).toBeAnInstanceOf(view_container_ref_1.ViewContainerRef_);
                    });
                    testing_internal_1.it("should inject TemplateRef", function () {
                        var templateRef = new template_ref_1.TemplateRef_(new spies_1.SpyElementRef());
                        var inj = injector(collection_1.ListWrapper.concat([NeedsTemplateRef], extraProviders), null, false, new element_injector_1.PreBuiltObjects(null, null, null, templateRef));
                        testing_internal_1.expect(inj.get(NeedsTemplateRef).templateRef).toEqual(templateRef);
                    });
                    testing_internal_1.it("should throw if there is no TemplateRef", function () {
                        testing_internal_1.expect(function () { return injector(collection_1.ListWrapper.concat([NeedsTemplateRef], extraProviders)); })
                            .toThrowError("No provider for TemplateRef! (" + lang_1.stringify(NeedsTemplateRef) + " -> TemplateRef)");
                    });
                    testing_internal_1.it('should inject null if there is no TemplateRef when the dependency is optional', function () {
                        var inj = injector(collection_1.ListWrapper.concat([OptionallyInjectsTemplateRef], extraProviders));
                        var instance = inj.get(OptionallyInjectsTemplateRef);
                        testing_internal_1.expect(instance.templateRef).toBeNull();
                    });
                });
                testing_internal_1.describe('queries', function () {
                    var dummyView;
                    var preBuildObjects;
                    testing_internal_1.beforeEach(function () {
                        _constructionCount = 0;
                        dummyView = createDummyView();
                        preBuildObjects = new element_injector_1.PreBuiltObjects(null, dummyView, new spies_1.SpyElementRef(), null);
                    });
                    function expectDirectives(query, type, expectedIndex) {
                        var currentCount = 0;
                        testing_internal_1.expect(query.length).toEqual(expectedIndex.length);
                        collection_1.iterateListLike(query, function (i) {
                            testing_internal_1.expect(i).toBeAnInstanceOf(type);
                            testing_internal_1.expect(i.count).toBe(expectedIndex[currentCount]);
                            currentCount += 1;
                        });
                    }
                    testing_internal_1.it('should be injectable', function () {
                        var inj = injector(collection_1.ListWrapper.concat([NeedsQuery], extraProviders), null, false, preBuildObjects);
                        testing_internal_1.expect(inj.get(NeedsQuery).query).toBeAnInstanceOf(query_list_1.QueryList);
                    });
                    testing_internal_1.it('should contain directives on the same injector', function () {
                        var inj = injector(collection_1.ListWrapper.concat([
                            NeedsQuery,
                            CountingDirective
                        ], extraProviders), null, false, preBuildObjects);
                        addInj(dummyView, inj);
                        inj.afterContentChecked();
                        expectDirectives(inj.get(NeedsQuery).query, CountingDirective, [0]);
                    });
                    testing_internal_1.it('should contain PreBuiltObjects on the same injector', function () {
                        var preBuiltObjects = new element_injector_1.PreBuiltObjects(null, dummyView, null, new template_ref_1.TemplateRef_(new spies_1.SpyElementRef()));
                        var inj = injector(collection_1.ListWrapper.concat([
                            NeedsTemplateRefQuery
                        ], extraProviders), null, false, preBuiltObjects);
                        addInj(dummyView, inj);
                        inj.afterContentChecked();
                        testing_internal_1.expect(inj.get(NeedsTemplateRefQuery).query.first).toBe(preBuiltObjects.templateRef);
                    });
                    testing_internal_1.it('should contain the element when no directives are bound to the var provider', function () {
                        var dirs = [NeedsQueryByVarBindings];
                        var dirVariableBindings = collection_1.MapWrapper.createFromStringMap({
                            "one": null // element
                        });
                        var inj = injector(dirs.concat(extraProviders), null, false, preBuildObjects, null, dirVariableBindings);
                        addInj(dummyView, inj);
                        inj.afterContentChecked();
                        testing_internal_1.expect(inj.get(NeedsQueryByVarBindings).query.first).toBe(preBuildObjects.elementRef);
                    });
                    testing_internal_1.it('should contain directives on the same injector when querying by variable providers' +
                        'in the order of var providers specified in the query', function () {
                        var dirs = [NeedsQueryByVarBindings, NeedsDirective, SimpleDirective];
                        var dirVariableBindings = collection_1.MapWrapper.createFromStringMap({
                            "one": 2,
                            "two": 1 // 1 is the index of NeedsDirective
                        });
                        var inj = injector(dirs.concat(extraProviders), null, false, preBuildObjects, null, dirVariableBindings);
                        addInj(dummyView, inj);
                        inj.afterContentChecked();
                        // NeedsQueryByVarBindings queries "one,two", so SimpleDirective should be before NeedsDirective
                        testing_internal_1.expect(inj.get(NeedsQueryByVarBindings).query.first).toBeAnInstanceOf(SimpleDirective);
                        testing_internal_1.expect(inj.get(NeedsQueryByVarBindings).query.last).toBeAnInstanceOf(NeedsDirective);
                    });
                    testing_internal_1.it('should contain directives on the same and a child injector in construction order', function () {
                        var protoParent = createPei(null, 0, [NeedsQuery, CountingDirective]);
                        var protoChild = createPei(protoParent, 1, collection_1.ListWrapper.concat([CountingDirective], extraProviders));
                        var parent = protoParent.instantiate(null);
                        var child = protoChild.instantiate(parent);
                        parent.hydrate(null, null, preBuildObjects);
                        child.hydrate(null, null, preBuildObjects);
                        addInj(dummyView, parent);
                        addInj(dummyView, child);
                        parent.afterContentChecked();
                        expectDirectives(parent.get(NeedsQuery).query, CountingDirective, [0, 1]);
                    });
                });
            });
        });
    });
}
exports.main = main;
var ContextWithHandler = (function () {
    function ContextWithHandler(handler) {
        this.handler = handler;
    }
    return ContextWithHandler;
})();
//# sourceMappingURL=element_injector_spec.js.map