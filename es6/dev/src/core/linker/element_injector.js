import { isPresent, isBlank } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { ObservableWrapper } from 'angular2/src/facade/async';
import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { Injector, Key, Dependency, Provider, NoProviderError } from 'angular2/src/core/di';
import { UNDEFINED, ProtoInjector, Visibility, InjectorInlineStrategy, ProviderWithVisibility } from 'angular2/src/core/di/injector';
import { resolveProvider, ResolvedFactory, ResolvedProvider_ } from 'angular2/src/core/di/provider';
import { AttributeMetadata, QueryMetadata } from '../metadata/di';
import * as avmModule from './view_manager';
import { ViewContainerRef } from './view_container_ref';
import { ElementRef } from './element_ref';
import { TemplateRef } from './template_ref';
import { DirectiveMetadata, ComponentMetadata } from '../metadata/directives';
import { hasLifecycleHook } from './directive_lifecycle_reflector';
import { ChangeDetectorRef } from 'angular2/src/core/change_detection/change_detection';
import { QueryList } from './query_list';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { EventConfig } from 'angular2/src/core/linker/event_config';
import { PipeProvider } from 'angular2/src/core/pipes/pipe_provider';
import { LifecycleHooks } from './interfaces';
import { ViewContainerRef_ } from "./view_container_ref";
var _staticKeys;
export class StaticKeys {
    constructor() {
        this.viewManagerId = Key.get(avmModule.AppViewManager).id;
        this.templateRefId = Key.get(TemplateRef).id;
        this.viewContainerId = Key.get(ViewContainerRef).id;
        this.changeDetectorRefId = Key.get(ChangeDetectorRef).id;
        this.elementRefId = Key.get(ElementRef).id;
    }
    static instance() {
        if (isBlank(_staticKeys))
            _staticKeys = new StaticKeys();
        return _staticKeys;
    }
}
export class TreeNode {
    constructor(parent) {
        if (isPresent(parent)) {
            parent.addChild(this);
        }
        else {
            this._parent = null;
        }
    }
    addChild(child) { child._parent = this; }
    remove() { this._parent = null; }
    get parent() { return this._parent; }
}
export class DirectiveDependency extends Dependency {
    constructor(key, optional, lowerBoundVisibility, upperBoundVisibility, properties, attributeName, queryDecorator) {
        super(key, optional, lowerBoundVisibility, upperBoundVisibility, properties);
        this.attributeName = attributeName;
        this.queryDecorator = queryDecorator;
        this._verify();
    }
    /** @internal */
    _verify() {
        var count = 0;
        if (isPresent(this.queryDecorator))
            count++;
        if (isPresent(this.attributeName))
            count++;
        if (count > 1)
            throw new BaseException('A directive injectable can contain only one of the following @Attribute or @Query.');
    }
    static createFrom(d) {
        return new DirectiveDependency(d.key, d.optional, d.lowerBoundVisibility, d.upperBoundVisibility, d.properties, DirectiveDependency._attributeName(d.properties), DirectiveDependency._query(d.properties));
    }
    /** @internal */
    static _attributeName(properties) {
        var p = properties.find(p => p instanceof AttributeMetadata);
        return isPresent(p) ? p.attributeName : null;
    }
    /** @internal */
    static _query(properties) {
        return properties.find(p => p instanceof QueryMetadata);
    }
}
export class DirectiveProvider extends ResolvedProvider_ {
    constructor(key, factory, deps, metadata, providers, viewProviders) {
        super(key, [new ResolvedFactory(factory, deps)], false);
        this.metadata = metadata;
        this.providers = providers;
        this.viewProviders = viewProviders;
        this.callOnDestroy = hasLifecycleHook(LifecycleHooks.OnDestroy, key.token);
    }
    get displayName() { return this.key.displayName; }
    get queries() {
        if (isBlank(this.metadata.queries))
            return [];
        var res = [];
        StringMapWrapper.forEach(this.metadata.queries, (meta, fieldName) => {
            var setter = reflector.setter(fieldName);
            res.push(new QueryMetadataWithSetter(setter, meta));
        });
        return res;
    }
    get eventEmitters() {
        return isPresent(this.metadata) && isPresent(this.metadata.outputs) ? this.metadata.outputs :
            [];
    }
    static createFromProvider(provider, meta) {
        if (isBlank(meta)) {
            meta = new DirectiveMetadata();
        }
        var rb = resolveProvider(provider);
        var rf = rb.resolvedFactories[0];
        var deps = rf.dependencies.map(DirectiveDependency.createFrom);
        var providers = isPresent(meta.providers) ? meta.providers : [];
        var viewBindigs = meta instanceof ComponentMetadata && isPresent(meta.viewProviders) ?
            meta.viewProviders :
            [];
        return new DirectiveProvider(rb.key, rf.factory, deps, meta, providers, viewBindigs);
    }
    static createFromType(type, annotation) {
        var provider = new Provider(type, { useClass: type });
        return DirectiveProvider.createFromProvider(provider, annotation);
    }
}
// TODO(rado): benchmark and consider rolling in as ElementInjector fields.
export class PreBuiltObjects {
    constructor(viewManager, view, elementRef, templateRef) {
        this.viewManager = viewManager;
        this.view = view;
        this.elementRef = elementRef;
        this.templateRef = templateRef;
        this.nestedView = null;
    }
}
export class QueryMetadataWithSetter {
    constructor(setter, metadata) {
        this.setter = setter;
        this.metadata = metadata;
    }
}
export class EventEmitterAccessor {
    constructor(eventName, getter) {
        this.eventName = eventName;
        this.getter = getter;
    }
    subscribe(view, boundElementIndex, directive) {
        var eventEmitter = this.getter(directive);
        return ObservableWrapper.subscribe(eventEmitter, eventObj => view.triggerEventHandlers(this.eventName, eventObj, boundElementIndex));
    }
}
function _createEventEmitterAccessors(bwv) {
    var provider = bwv.provider;
    if (!(provider instanceof DirectiveProvider))
        return [];
    var db = provider;
    return db.eventEmitters.map(eventConfig => {
        var parsedEvent = EventConfig.parse(eventConfig);
        return new EventEmitterAccessor(parsedEvent.eventName, reflector.getter(parsedEvent.fieldName));
    });
}
function _createProtoQueryRefs(providers) {
    var res = [];
    ListWrapper.forEachWithIndex(providers, (b, i) => {
        if (b.provider instanceof DirectiveProvider) {
            var directiveProvider = b.provider;
            // field queries
            var queries = directiveProvider.queries;
            queries.forEach(q => res.push(new ProtoQueryRef(i, q.setter, q.metadata)));
            // queries passed into the constructor.
            // TODO: remove this after constructor queries are no longer supported
            var deps = directiveProvider.resolvedFactory.dependencies;
            deps.forEach(d => {
                if (isPresent(d.queryDecorator))
                    res.push(new ProtoQueryRef(i, null, d.queryDecorator));
            });
        }
    });
    return res;
}
export class ProtoElementInjector {
    constructor(parent, index, bwv, distanceToParent, _firstProviderIsComponent, directiveVariableBindings) {
        this.parent = parent;
        this.index = index;
        this.distanceToParent = distanceToParent;
        this.directiveVariableBindings = directiveVariableBindings;
        this._firstProviderIsComponent = _firstProviderIsComponent;
        var length = bwv.length;
        this.protoInjector = new ProtoInjector(bwv);
        this.eventEmitterAccessors = ListWrapper.createFixedSize(length);
        for (var i = 0; i < length; ++i) {
            this.eventEmitterAccessors[i] = _createEventEmitterAccessors(bwv[i]);
        }
        this.protoQueryRefs = _createProtoQueryRefs(bwv);
    }
    static create(parent, index, providers, firstProviderIsComponent, distanceToParent, directiveVariableBindings) {
        var bd = [];
        ProtoElementInjector._createDirectiveProviderWithVisibility(providers, bd, firstProviderIsComponent);
        if (firstProviderIsComponent) {
            ProtoElementInjector._createViewProvidersWithVisibility(providers, bd);
        }
        ProtoElementInjector._createProvidersWithVisibility(providers, bd);
        return new ProtoElementInjector(parent, index, bd, distanceToParent, firstProviderIsComponent, directiveVariableBindings);
    }
    static _createDirectiveProviderWithVisibility(dirProviders, bd, firstProviderIsComponent) {
        dirProviders.forEach(dirProvider => {
            bd.push(ProtoElementInjector._createProviderWithVisibility(firstProviderIsComponent, dirProvider, dirProviders, dirProvider));
        });
    }
    static _createProvidersWithVisibility(dirProviders, bd) {
        var providersFromAllDirectives = [];
        dirProviders.forEach(dirProvider => {
            providersFromAllDirectives =
                ListWrapper.concat(providersFromAllDirectives, dirProvider.providers);
        });
        var resolved = Injector.resolve(providersFromAllDirectives);
        resolved.forEach(b => bd.push(new ProviderWithVisibility(b, Visibility.Public)));
    }
    static _createProviderWithVisibility(firstProviderIsComponent, dirProvider, dirProviders, provider) {
        var isComponent = firstProviderIsComponent && dirProviders[0] === dirProvider;
        return new ProviderWithVisibility(provider, isComponent ? Visibility.PublicAndPrivate : Visibility.Public);
    }
    static _createViewProvidersWithVisibility(dirProviders, bd) {
        var resolvedViewProviders = Injector.resolve(dirProviders[0].viewProviders);
        resolvedViewProviders.forEach(b => bd.push(new ProviderWithVisibility(b, Visibility.Private)));
    }
    instantiate(parent) {
        return new ElementInjector(this, parent);
    }
    directParent() { return this.distanceToParent < 2 ? this.parent : null; }
    get hasBindings() { return this.eventEmitterAccessors.length > 0; }
    getProviderAtIndex(index) { return this.protoInjector.getProviderAtIndex(index); }
}
class _Context {
    constructor(element, componentElement, injector) {
        this.element = element;
        this.componentElement = componentElement;
        this.injector = injector;
    }
}
export class ElementInjector extends TreeNode {
    constructor(_proto, parent) {
        super(parent);
        this._preBuiltObjects = null;
        this._proto = _proto;
        this._injector =
            new Injector(this._proto.protoInjector, null, this, () => this._debugContext());
        // we couple ourselves to the injector strategy to avoid polymoprhic calls
        var injectorStrategy = this._injector.internalStrategy;
        this._strategy = injectorStrategy instanceof InjectorInlineStrategy ?
            new ElementInjectorInlineStrategy(injectorStrategy, this) :
            new ElementInjectorDynamicStrategy(injectorStrategy, this);
        this.hydrated = false;
        this._queryStrategy = this._buildQueryStrategy();
    }
    dehydrate() {
        this.hydrated = false;
        this._host = null;
        this._preBuiltObjects = null;
        this._strategy.callOnDestroy();
        this._strategy.dehydrate();
        this._queryStrategy.dehydrate();
    }
    hydrate(imperativelyCreatedInjector, host, preBuiltObjects) {
        this._host = host;
        this._preBuiltObjects = preBuiltObjects;
        this._reattachInjectors(imperativelyCreatedInjector);
        this._queryStrategy.hydrate();
        this._strategy.hydrate();
        this.hydrated = true;
    }
    _debugContext() {
        var p = this._preBuiltObjects;
        var index = p.elementRef.boundElementIndex - p.view.elementOffset;
        var c = this._preBuiltObjects.view.getDebugContext(index, null);
        return isPresent(c) ? new _Context(c.element, c.componentElement, c.injector) : null;
    }
    _reattachInjectors(imperativelyCreatedInjector) {
        // Dynamically-loaded component in the template. Not a root ElementInjector.
        if (isPresent(this._parent)) {
            if (isPresent(imperativelyCreatedInjector)) {
                // The imperative injector is similar to having an element between
                // the dynamic-loaded component and its parent => no boundaries.
                this._reattachInjector(this._injector, imperativelyCreatedInjector, false);
                this._reattachInjector(imperativelyCreatedInjector, this._parent._injector, false);
            }
            else {
                this._reattachInjector(this._injector, this._parent._injector, false);
            }
        }
        else if (isPresent(this._host)) {
            // The imperative injector is similar to having an element between
            // the dynamic-loaded component and its parent => no boundary between
            // the component and imperativelyCreatedInjector.
            // But since it is a root ElementInjector, we need to create a boundary
            // between imperativelyCreatedInjector and _host.
            if (isPresent(imperativelyCreatedInjector)) {
                this._reattachInjector(this._injector, imperativelyCreatedInjector, false);
                this._reattachInjector(imperativelyCreatedInjector, this._host._injector, true);
            }
            else {
                this._reattachInjector(this._injector, this._host._injector, true);
            }
        }
        else {
            if (isPresent(imperativelyCreatedInjector)) {
                this._reattachInjector(this._injector, imperativelyCreatedInjector, true);
            }
        }
    }
    _reattachInjector(injector, parentInjector, isBoundary) {
        injector.internalStrategy.attach(parentInjector, isBoundary);
    }
    hasVariableBinding(name) {
        var vb = this._proto.directiveVariableBindings;
        return isPresent(vb) && vb.has(name);
    }
    getVariableBinding(name) {
        var index = this._proto.directiveVariableBindings.get(name);
        return isPresent(index) ? this.getDirectiveAtIndex(index) : this.getElementRef();
    }
    get(token) { return this._injector.get(token); }
    hasDirective(type) { return isPresent(this._injector.getOptional(type)); }
    getEventEmitterAccessors() { return this._proto.eventEmitterAccessors; }
    getDirectiveVariableBindings() {
        return this._proto.directiveVariableBindings;
    }
    getComponent() { return this._strategy.getComponent(); }
    getInjector() { return this._injector; }
    getElementRef() { return this._preBuiltObjects.elementRef; }
    getViewContainerRef() {
        return new ViewContainerRef_(this._preBuiltObjects.viewManager, this.getElementRef());
    }
    getNestedView() { return this._preBuiltObjects.nestedView; }
    getView() { return this._preBuiltObjects.view; }
    directParent() { return this._proto.distanceToParent < 2 ? this.parent : null; }
    isComponentKey(key) { return this._strategy.isComponentKey(key); }
    getDependency(injector, provider, dep) {
        var key = dep.key;
        if (provider instanceof DirectiveProvider) {
            var dirDep = dep;
            var dirProvider = provider;
            var staticKeys = StaticKeys.instance();
            if (key.id === staticKeys.viewManagerId)
                return this._preBuiltObjects.viewManager;
            if (isPresent(dirDep.attributeName))
                return this._buildAttribute(dirDep);
            if (isPresent(dirDep.queryDecorator))
                return this._queryStrategy.findQuery(dirDep.queryDecorator).list;
            if (dirDep.key.id === StaticKeys.instance().changeDetectorRefId) {
                // We provide the component's view change detector to components and
                // the surrounding component's change detector to directives.
                if (dirProvider.metadata instanceof ComponentMetadata) {
                    var componentView = this._preBuiltObjects.view.getNestedView(this._preBuiltObjects.elementRef.boundElementIndex);
                    return componentView.changeDetector.ref;
                }
                else {
                    return this._preBuiltObjects.view.changeDetector.ref;
                }
            }
            if (dirDep.key.id === StaticKeys.instance().elementRefId) {
                return this.getElementRef();
            }
            if (dirDep.key.id === StaticKeys.instance().viewContainerId) {
                return this.getViewContainerRef();
            }
            if (dirDep.key.id === StaticKeys.instance().templateRefId) {
                if (isBlank(this._preBuiltObjects.templateRef)) {
                    if (dirDep.optional) {
                        return null;
                    }
                    throw new NoProviderError(null, dirDep.key);
                }
                return this._preBuiltObjects.templateRef;
            }
        }
        else if (provider instanceof PipeProvider) {
            if (dep.key.id === StaticKeys.instance().changeDetectorRefId) {
                var componentView = this._preBuiltObjects.view.getNestedView(this._preBuiltObjects.elementRef.boundElementIndex);
                return componentView.changeDetector.ref;
            }
        }
        return UNDEFINED;
    }
    _buildAttribute(dep) {
        var attributes = this._proto.attributes;
        if (isPresent(attributes) && attributes.has(dep.attributeName)) {
            return attributes.get(dep.attributeName);
        }
        else {
            return null;
        }
    }
    addDirectivesMatchingQuery(query, list) {
        var templateRef = isBlank(this._preBuiltObjects) ? null : this._preBuiltObjects.templateRef;
        if (query.selector === TemplateRef && isPresent(templateRef)) {
            list.push(templateRef);
        }
        this._strategy.addDirectivesMatchingQuery(query, list);
    }
    _buildQueryStrategy() {
        if (this._proto.protoQueryRefs.length === 0) {
            return _emptyQueryStrategy;
        }
        else if (this._proto.protoQueryRefs.length <=
            InlineQueryStrategy.NUMBER_OF_SUPPORTED_QUERIES) {
            return new InlineQueryStrategy(this);
        }
        else {
            return new DynamicQueryStrategy(this);
        }
    }
    link(parent) { parent.addChild(this); }
    unlink() { this.remove(); }
    getDirectiveAtIndex(index) { return this._injector.getAt(index); }
    hasInstances() { return this._proto.hasBindings && this.hydrated; }
    getHost() { return this._host; }
    getBoundElementIndex() { return this._proto.index; }
    getRootViewInjectors() {
        if (!this.hydrated)
            return [];
        var view = this._preBuiltObjects.view;
        var nestedView = view.getNestedView(view.elementOffset + this.getBoundElementIndex());
        return isPresent(nestedView) ? nestedView.rootElementInjectors : [];
    }
    ngAfterViewChecked() { this._queryStrategy.updateViewQueries(); }
    ngAfterContentChecked() { this._queryStrategy.updateContentQueries(); }
    traverseAndSetQueriesAsDirty() {
        var inj = this;
        while (isPresent(inj)) {
            inj._setQueriesAsDirty();
            inj = inj.parent;
        }
    }
    _setQueriesAsDirty() {
        this._queryStrategy.setContentQueriesAsDirty();
        if (isPresent(this._host))
            this._host._queryStrategy.setViewQueriesAsDirty();
    }
}
class _EmptyQueryStrategy {
    setContentQueriesAsDirty() { }
    setViewQueriesAsDirty() { }
    hydrate() { }
    dehydrate() { }
    updateContentQueries() { }
    updateViewQueries() { }
    findQuery(query) {
        throw new BaseException(`Cannot find query for directive ${query}.`);
    }
}
var _emptyQueryStrategy = new _EmptyQueryStrategy();
class InlineQueryStrategy {
    constructor(ei) {
        var protoRefs = ei._proto.protoQueryRefs;
        if (protoRefs.length > 0)
            this.query0 = new QueryRef(protoRefs[0], ei);
        if (protoRefs.length > 1)
            this.query1 = new QueryRef(protoRefs[1], ei);
        if (protoRefs.length > 2)
            this.query2 = new QueryRef(protoRefs[2], ei);
    }
    setContentQueriesAsDirty() {
        if (isPresent(this.query0) && !this.query0.isViewQuery)
            this.query0.dirty = true;
        if (isPresent(this.query1) && !this.query1.isViewQuery)
            this.query1.dirty = true;
        if (isPresent(this.query2) && !this.query2.isViewQuery)
            this.query2.dirty = true;
    }
    setViewQueriesAsDirty() {
        if (isPresent(this.query0) && this.query0.isViewQuery)
            this.query0.dirty = true;
        if (isPresent(this.query1) && this.query1.isViewQuery)
            this.query1.dirty = true;
        if (isPresent(this.query2) && this.query2.isViewQuery)
            this.query2.dirty = true;
    }
    hydrate() {
        if (isPresent(this.query0))
            this.query0.hydrate();
        if (isPresent(this.query1))
            this.query1.hydrate();
        if (isPresent(this.query2))
            this.query2.hydrate();
    }
    dehydrate() {
        if (isPresent(this.query0))
            this.query0.dehydrate();
        if (isPresent(this.query1))
            this.query1.dehydrate();
        if (isPresent(this.query2))
            this.query2.dehydrate();
    }
    updateContentQueries() {
        if (isPresent(this.query0) && !this.query0.isViewQuery) {
            this.query0.update();
        }
        if (isPresent(this.query1) && !this.query1.isViewQuery) {
            this.query1.update();
        }
        if (isPresent(this.query2) && !this.query2.isViewQuery) {
            this.query2.update();
        }
    }
    updateViewQueries() {
        if (isPresent(this.query0) && this.query0.isViewQuery) {
            this.query0.update();
        }
        if (isPresent(this.query1) && this.query1.isViewQuery) {
            this.query1.update();
        }
        if (isPresent(this.query2) && this.query2.isViewQuery) {
            this.query2.update();
        }
    }
    findQuery(query) {
        if (isPresent(this.query0) && this.query0.protoQueryRef.query === query) {
            return this.query0;
        }
        if (isPresent(this.query1) && this.query1.protoQueryRef.query === query) {
            return this.query1;
        }
        if (isPresent(this.query2) && this.query2.protoQueryRef.query === query) {
            return this.query2;
        }
        throw new BaseException(`Cannot find query for directive ${query}.`);
    }
}
InlineQueryStrategy.NUMBER_OF_SUPPORTED_QUERIES = 3;
class DynamicQueryStrategy {
    constructor(ei) {
        this.queries = ei._proto.protoQueryRefs.map(p => new QueryRef(p, ei));
    }
    setContentQueriesAsDirty() {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            if (!q.isViewQuery)
                q.dirty = true;
        }
    }
    setViewQueriesAsDirty() {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            if (q.isViewQuery)
                q.dirty = true;
        }
    }
    hydrate() {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            q.hydrate();
        }
    }
    dehydrate() {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            q.dehydrate();
        }
    }
    updateContentQueries() {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            if (!q.isViewQuery) {
                q.update();
            }
        }
    }
    updateViewQueries() {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            if (q.isViewQuery) {
                q.update();
            }
        }
    }
    findQuery(query) {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            if (q.protoQueryRef.query === query) {
                return q;
            }
        }
        throw new BaseException(`Cannot find query for directive ${query}.`);
    }
}
/**
 * Strategy used by the `ElementInjector` when the number of providers is 10 or less.
 * In such a case, inlining fields is beneficial for performances.
 */
class ElementInjectorInlineStrategy {
    constructor(injectorStrategy, _ei) {
        this.injectorStrategy = injectorStrategy;
        this._ei = _ei;
    }
    hydrate() {
        var i = this.injectorStrategy;
        var p = i.protoStrategy;
        i.resetConstructionCounter();
        if (p.provider0 instanceof DirectiveProvider && isPresent(p.keyId0) && i.obj0 === UNDEFINED)
            i.obj0 = i.instantiateProvider(p.provider0, p.visibility0);
        if (p.provider1 instanceof DirectiveProvider && isPresent(p.keyId1) && i.obj1 === UNDEFINED)
            i.obj1 = i.instantiateProvider(p.provider1, p.visibility1);
        if (p.provider2 instanceof DirectiveProvider && isPresent(p.keyId2) && i.obj2 === UNDEFINED)
            i.obj2 = i.instantiateProvider(p.provider2, p.visibility2);
        if (p.provider3 instanceof DirectiveProvider && isPresent(p.keyId3) && i.obj3 === UNDEFINED)
            i.obj3 = i.instantiateProvider(p.provider3, p.visibility3);
        if (p.provider4 instanceof DirectiveProvider && isPresent(p.keyId4) && i.obj4 === UNDEFINED)
            i.obj4 = i.instantiateProvider(p.provider4, p.visibility4);
        if (p.provider5 instanceof DirectiveProvider && isPresent(p.keyId5) && i.obj5 === UNDEFINED)
            i.obj5 = i.instantiateProvider(p.provider5, p.visibility5);
        if (p.provider6 instanceof DirectiveProvider && isPresent(p.keyId6) && i.obj6 === UNDEFINED)
            i.obj6 = i.instantiateProvider(p.provider6, p.visibility6);
        if (p.provider7 instanceof DirectiveProvider && isPresent(p.keyId7) && i.obj7 === UNDEFINED)
            i.obj7 = i.instantiateProvider(p.provider7, p.visibility7);
        if (p.provider8 instanceof DirectiveProvider && isPresent(p.keyId8) && i.obj8 === UNDEFINED)
            i.obj8 = i.instantiateProvider(p.provider8, p.visibility8);
        if (p.provider9 instanceof DirectiveProvider && isPresent(p.keyId9) && i.obj9 === UNDEFINED)
            i.obj9 = i.instantiateProvider(p.provider9, p.visibility9);
    }
    dehydrate() {
        var i = this.injectorStrategy;
        i.obj0 = UNDEFINED;
        i.obj1 = UNDEFINED;
        i.obj2 = UNDEFINED;
        i.obj3 = UNDEFINED;
        i.obj4 = UNDEFINED;
        i.obj5 = UNDEFINED;
        i.obj6 = UNDEFINED;
        i.obj7 = UNDEFINED;
        i.obj8 = UNDEFINED;
        i.obj9 = UNDEFINED;
    }
    callOnDestroy() {
        var i = this.injectorStrategy;
        var p = i.protoStrategy;
        if (p.provider0 instanceof DirectiveProvider &&
            p.provider0.callOnDestroy) {
            i.obj0.ngOnDestroy();
        }
        if (p.provider1 instanceof DirectiveProvider &&
            p.provider1.callOnDestroy) {
            i.obj1.ngOnDestroy();
        }
        if (p.provider2 instanceof DirectiveProvider &&
            p.provider2.callOnDestroy) {
            i.obj2.ngOnDestroy();
        }
        if (p.provider3 instanceof DirectiveProvider &&
            p.provider3.callOnDestroy) {
            i.obj3.ngOnDestroy();
        }
        if (p.provider4 instanceof DirectiveProvider &&
            p.provider4.callOnDestroy) {
            i.obj4.ngOnDestroy();
        }
        if (p.provider5 instanceof DirectiveProvider &&
            p.provider5.callOnDestroy) {
            i.obj5.ngOnDestroy();
        }
        if (p.provider6 instanceof DirectiveProvider &&
            p.provider6.callOnDestroy) {
            i.obj6.ngOnDestroy();
        }
        if (p.provider7 instanceof DirectiveProvider &&
            p.provider7.callOnDestroy) {
            i.obj7.ngOnDestroy();
        }
        if (p.provider8 instanceof DirectiveProvider &&
            p.provider8.callOnDestroy) {
            i.obj8.ngOnDestroy();
        }
        if (p.provider9 instanceof DirectiveProvider &&
            p.provider9.callOnDestroy) {
            i.obj9.ngOnDestroy();
        }
    }
    getComponent() { return this.injectorStrategy.obj0; }
    isComponentKey(key) {
        return this._ei._proto._firstProviderIsComponent && isPresent(key) &&
            key.id === this.injectorStrategy.protoStrategy.keyId0;
    }
    addDirectivesMatchingQuery(query, list) {
        var i = this.injectorStrategy;
        var p = i.protoStrategy;
        if (isPresent(p.provider0) && p.provider0.key.token === query.selector) {
            if (i.obj0 === UNDEFINED)
                i.obj0 = i.instantiateProvider(p.provider0, p.visibility0);
            list.push(i.obj0);
        }
        if (isPresent(p.provider1) && p.provider1.key.token === query.selector) {
            if (i.obj1 === UNDEFINED)
                i.obj1 = i.instantiateProvider(p.provider1, p.visibility1);
            list.push(i.obj1);
        }
        if (isPresent(p.provider2) && p.provider2.key.token === query.selector) {
            if (i.obj2 === UNDEFINED)
                i.obj2 = i.instantiateProvider(p.provider2, p.visibility2);
            list.push(i.obj2);
        }
        if (isPresent(p.provider3) && p.provider3.key.token === query.selector) {
            if (i.obj3 === UNDEFINED)
                i.obj3 = i.instantiateProvider(p.provider3, p.visibility3);
            list.push(i.obj3);
        }
        if (isPresent(p.provider4) && p.provider4.key.token === query.selector) {
            if (i.obj4 === UNDEFINED)
                i.obj4 = i.instantiateProvider(p.provider4, p.visibility4);
            list.push(i.obj4);
        }
        if (isPresent(p.provider5) && p.provider5.key.token === query.selector) {
            if (i.obj5 === UNDEFINED)
                i.obj5 = i.instantiateProvider(p.provider5, p.visibility5);
            list.push(i.obj5);
        }
        if (isPresent(p.provider6) && p.provider6.key.token === query.selector) {
            if (i.obj6 === UNDEFINED)
                i.obj6 = i.instantiateProvider(p.provider6, p.visibility6);
            list.push(i.obj6);
        }
        if (isPresent(p.provider7) && p.provider7.key.token === query.selector) {
            if (i.obj7 === UNDEFINED)
                i.obj7 = i.instantiateProvider(p.provider7, p.visibility7);
            list.push(i.obj7);
        }
        if (isPresent(p.provider8) && p.provider8.key.token === query.selector) {
            if (i.obj8 === UNDEFINED)
                i.obj8 = i.instantiateProvider(p.provider8, p.visibility8);
            list.push(i.obj8);
        }
        if (isPresent(p.provider9) && p.provider9.key.token === query.selector) {
            if (i.obj9 === UNDEFINED)
                i.obj9 = i.instantiateProvider(p.provider9, p.visibility9);
            list.push(i.obj9);
        }
    }
}
/**
 * Strategy used by the `ElementInjector` when the number of bindings is 11 or more.
 * In such a case, there are too many fields to inline (see ElementInjectorInlineStrategy).
 */
class ElementInjectorDynamicStrategy {
    constructor(injectorStrategy, _ei) {
        this.injectorStrategy = injectorStrategy;
        this._ei = _ei;
    }
    hydrate() {
        var inj = this.injectorStrategy;
        var p = inj.protoStrategy;
        inj.resetConstructionCounter();
        for (var i = 0; i < p.keyIds.length; i++) {
            if (p.providers[i] instanceof DirectiveProvider && isPresent(p.keyIds[i]) &&
                inj.objs[i] === UNDEFINED) {
                inj.objs[i] = inj.instantiateProvider(p.providers[i], p.visibilities[i]);
            }
        }
    }
    dehydrate() {
        var inj = this.injectorStrategy;
        ListWrapper.fill(inj.objs, UNDEFINED);
    }
    callOnDestroy() {
        var ist = this.injectorStrategy;
        var p = ist.protoStrategy;
        for (var i = 0; i < p.providers.length; i++) {
            if (p.providers[i] instanceof DirectiveProvider &&
                p.providers[i].callOnDestroy) {
                ist.objs[i].ngOnDestroy();
            }
        }
    }
    getComponent() { return this.injectorStrategy.objs[0]; }
    isComponentKey(key) {
        var p = this.injectorStrategy.protoStrategy;
        return this._ei._proto._firstProviderIsComponent && isPresent(key) && key.id === p.keyIds[0];
    }
    addDirectivesMatchingQuery(query, list) {
        var ist = this.injectorStrategy;
        var p = ist.protoStrategy;
        for (var i = 0; i < p.providers.length; i++) {
            if (p.providers[i].key.token === query.selector) {
                if (ist.objs[i] === UNDEFINED) {
                    ist.objs[i] = ist.instantiateProvider(p.providers[i], p.visibilities[i]);
                }
                list.push(ist.objs[i]);
            }
        }
    }
}
export class ProtoQueryRef {
    constructor(dirIndex, setter, query) {
        this.dirIndex = dirIndex;
        this.setter = setter;
        this.query = query;
    }
    get usesPropertySyntax() { return isPresent(this.setter); }
}
export class QueryRef {
    constructor(protoQueryRef, originator) {
        this.protoQueryRef = protoQueryRef;
        this.originator = originator;
    }
    get isViewQuery() { return this.protoQueryRef.query.isViewQuery; }
    update() {
        if (!this.dirty)
            return;
        this._update();
        this.dirty = false;
        // TODO delete the check once only field queries are supported
        if (this.protoQueryRef.usesPropertySyntax) {
            var dir = this.originator.getDirectiveAtIndex(this.protoQueryRef.dirIndex);
            if (this.protoQueryRef.query.first) {
                this.protoQueryRef.setter(dir, this.list.length > 0 ? this.list.first : null);
            }
            else {
                this.protoQueryRef.setter(dir, this.list);
            }
        }
        this.list.notifyOnChanges();
    }
    _update() {
        var aggregator = [];
        if (this.protoQueryRef.query.isViewQuery) {
            var view = this.originator.getView();
            // intentionally skipping originator for view queries.
            var nestedView = view.getNestedView(view.elementOffset + this.originator.getBoundElementIndex());
            if (isPresent(nestedView))
                this._visitView(nestedView, aggregator);
        }
        else {
            this._visit(this.originator, aggregator);
        }
        this.list.reset(aggregator);
    }
    ;
    _visit(inj, aggregator) {
        var view = inj.getView();
        var startIdx = view.elementOffset + inj._proto.index;
        for (var i = startIdx; i < view.elementOffset + view.ownBindersCount; i++) {
            var curInj = view.elementInjectors[i];
            if (isBlank(curInj))
                continue;
            // The first injector after inj, that is outside the subtree rooted at
            // inj has to have a null parent or a parent that is an ancestor of inj.
            if (i > startIdx && (isBlank(curInj) || isBlank(curInj.parent) ||
                view.elementOffset + curInj.parent._proto.index < startIdx)) {
                break;
            }
            if (!this.protoQueryRef.query.descendants &&
                !(curInj.parent == this.originator || curInj == this.originator))
                continue;
            // We visit the view container(VC) views right after the injector that contains
            // the VC. Theoretically, that might not be the right order if there are
            // child injectors of said injector. Not clear whether if such case can
            // even be constructed with the current apis.
            this._visitInjector(curInj, aggregator);
            var vc = view.viewContainers[i];
            if (isPresent(vc))
                this._visitViewContainer(vc, aggregator);
        }
    }
    _visitInjector(inj, aggregator) {
        if (this.protoQueryRef.query.isVarBindingQuery) {
            this._aggregateVariableBinding(inj, aggregator);
        }
        else {
            this._aggregateDirective(inj, aggregator);
        }
    }
    _visitViewContainer(vc, aggregator) {
        for (var j = 0; j < vc.views.length; j++) {
            this._visitView(vc.views[j], aggregator);
        }
    }
    _visitView(view, aggregator) {
        for (var i = view.elementOffset; i < view.elementOffset + view.ownBindersCount; i++) {
            var inj = view.elementInjectors[i];
            if (isBlank(inj))
                continue;
            this._visitInjector(inj, aggregator);
            var vc = view.viewContainers[i];
            if (isPresent(vc))
                this._visitViewContainer(vc, aggregator);
        }
    }
    _aggregateVariableBinding(inj, aggregator) {
        var vb = this.protoQueryRef.query.varBindings;
        for (var i = 0; i < vb.length; ++i) {
            if (inj.hasVariableBinding(vb[i])) {
                aggregator.push(inj.getVariableBinding(vb[i]));
            }
        }
    }
    _aggregateDirective(inj, aggregator) {
        inj.addDirectivesMatchingQuery(this.protoQueryRef.query, aggregator);
    }
    dehydrate() { this.list = null; }
    hydrate() {
        this.list = new QueryList();
        this.dirty = true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudF9pbmplY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9lbGVtZW50X2luamVjdG9yLnRzIl0sIm5hbWVzIjpbIlN0YXRpY0tleXMiLCJTdGF0aWNLZXlzLmNvbnN0cnVjdG9yIiwiU3RhdGljS2V5cy5pbnN0YW5jZSIsIlRyZWVOb2RlIiwiVHJlZU5vZGUuY29uc3RydWN0b3IiLCJUcmVlTm9kZS5hZGRDaGlsZCIsIlRyZWVOb2RlLnJlbW92ZSIsIlRyZWVOb2RlLnBhcmVudCIsIkRpcmVjdGl2ZURlcGVuZGVuY3kiLCJEaXJlY3RpdmVEZXBlbmRlbmN5LmNvbnN0cnVjdG9yIiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5fdmVyaWZ5IiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5jcmVhdGVGcm9tIiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5fYXR0cmlidXRlTmFtZSIsIkRpcmVjdGl2ZURlcGVuZGVuY3kuX3F1ZXJ5IiwiRGlyZWN0aXZlUHJvdmlkZXIiLCJEaXJlY3RpdmVQcm92aWRlci5jb25zdHJ1Y3RvciIsIkRpcmVjdGl2ZVByb3ZpZGVyLmRpc3BsYXlOYW1lIiwiRGlyZWN0aXZlUHJvdmlkZXIucXVlcmllcyIsIkRpcmVjdGl2ZVByb3ZpZGVyLmV2ZW50RW1pdHRlcnMiLCJEaXJlY3RpdmVQcm92aWRlci5jcmVhdGVGcm9tUHJvdmlkZXIiLCJEaXJlY3RpdmVQcm92aWRlci5jcmVhdGVGcm9tVHlwZSIsIlByZUJ1aWx0T2JqZWN0cyIsIlByZUJ1aWx0T2JqZWN0cy5jb25zdHJ1Y3RvciIsIlF1ZXJ5TWV0YWRhdGFXaXRoU2V0dGVyIiwiUXVlcnlNZXRhZGF0YVdpdGhTZXR0ZXIuY29uc3RydWN0b3IiLCJFdmVudEVtaXR0ZXJBY2Nlc3NvciIsIkV2ZW50RW1pdHRlckFjY2Vzc29yLmNvbnN0cnVjdG9yIiwiRXZlbnRFbWl0dGVyQWNjZXNzb3Iuc3Vic2NyaWJlIiwiX2NyZWF0ZUV2ZW50RW1pdHRlckFjY2Vzc29ycyIsIl9jcmVhdGVQcm90b1F1ZXJ5UmVmcyIsIlByb3RvRWxlbWVudEluamVjdG9yIiwiUHJvdG9FbGVtZW50SW5qZWN0b3IuY29uc3RydWN0b3IiLCJQcm90b0VsZW1lbnRJbmplY3Rvci5jcmVhdGUiLCJQcm90b0VsZW1lbnRJbmplY3Rvci5fY3JlYXRlRGlyZWN0aXZlUHJvdmlkZXJXaXRoVmlzaWJpbGl0eSIsIlByb3RvRWxlbWVudEluamVjdG9yLl9jcmVhdGVQcm92aWRlcnNXaXRoVmlzaWJpbGl0eSIsIlByb3RvRWxlbWVudEluamVjdG9yLl9jcmVhdGVQcm92aWRlcldpdGhWaXNpYmlsaXR5IiwiUHJvdG9FbGVtZW50SW5qZWN0b3IuX2NyZWF0ZVZpZXdQcm92aWRlcnNXaXRoVmlzaWJpbGl0eSIsIlByb3RvRWxlbWVudEluamVjdG9yLmluc3RhbnRpYXRlIiwiUHJvdG9FbGVtZW50SW5qZWN0b3IuZGlyZWN0UGFyZW50IiwiUHJvdG9FbGVtZW50SW5qZWN0b3IuaGFzQmluZGluZ3MiLCJQcm90b0VsZW1lbnRJbmplY3Rvci5nZXRQcm92aWRlckF0SW5kZXgiLCJfQ29udGV4dCIsIl9Db250ZXh0LmNvbnN0cnVjdG9yIiwiRWxlbWVudEluamVjdG9yIiwiRWxlbWVudEluamVjdG9yLmNvbnN0cnVjdG9yIiwiRWxlbWVudEluamVjdG9yLmRlaHlkcmF0ZSIsIkVsZW1lbnRJbmplY3Rvci5oeWRyYXRlIiwiRWxlbWVudEluamVjdG9yLl9kZWJ1Z0NvbnRleHQiLCJFbGVtZW50SW5qZWN0b3IuX3JlYXR0YWNoSW5qZWN0b3JzIiwiRWxlbWVudEluamVjdG9yLl9yZWF0dGFjaEluamVjdG9yIiwiRWxlbWVudEluamVjdG9yLmhhc1ZhcmlhYmxlQmluZGluZyIsIkVsZW1lbnRJbmplY3Rvci5nZXRWYXJpYWJsZUJpbmRpbmciLCJFbGVtZW50SW5qZWN0b3IuZ2V0IiwiRWxlbWVudEluamVjdG9yLmhhc0RpcmVjdGl2ZSIsIkVsZW1lbnRJbmplY3Rvci5nZXRFdmVudEVtaXR0ZXJBY2Nlc3NvcnMiLCJFbGVtZW50SW5qZWN0b3IuZ2V0RGlyZWN0aXZlVmFyaWFibGVCaW5kaW5ncyIsIkVsZW1lbnRJbmplY3Rvci5nZXRDb21wb25lbnQiLCJFbGVtZW50SW5qZWN0b3IuZ2V0SW5qZWN0b3IiLCJFbGVtZW50SW5qZWN0b3IuZ2V0RWxlbWVudFJlZiIsIkVsZW1lbnRJbmplY3Rvci5nZXRWaWV3Q29udGFpbmVyUmVmIiwiRWxlbWVudEluamVjdG9yLmdldE5lc3RlZFZpZXciLCJFbGVtZW50SW5qZWN0b3IuZ2V0VmlldyIsIkVsZW1lbnRJbmplY3Rvci5kaXJlY3RQYXJlbnQiLCJFbGVtZW50SW5qZWN0b3IuaXNDb21wb25lbnRLZXkiLCJFbGVtZW50SW5qZWN0b3IuZ2V0RGVwZW5kZW5jeSIsIkVsZW1lbnRJbmplY3Rvci5fYnVpbGRBdHRyaWJ1dGUiLCJFbGVtZW50SW5qZWN0b3IuYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkiLCJFbGVtZW50SW5qZWN0b3IuX2J1aWxkUXVlcnlTdHJhdGVneSIsIkVsZW1lbnRJbmplY3Rvci5saW5rIiwiRWxlbWVudEluamVjdG9yLnVubGluayIsIkVsZW1lbnRJbmplY3Rvci5nZXREaXJlY3RpdmVBdEluZGV4IiwiRWxlbWVudEluamVjdG9yLmhhc0luc3RhbmNlcyIsIkVsZW1lbnRJbmplY3Rvci5nZXRIb3N0IiwiRWxlbWVudEluamVjdG9yLmdldEJvdW5kRWxlbWVudEluZGV4IiwiRWxlbWVudEluamVjdG9yLmdldFJvb3RWaWV3SW5qZWN0b3JzIiwiRWxlbWVudEluamVjdG9yLm5nQWZ0ZXJWaWV3Q2hlY2tlZCIsIkVsZW1lbnRJbmplY3Rvci5uZ0FmdGVyQ29udGVudENoZWNrZWQiLCJFbGVtZW50SW5qZWN0b3IudHJhdmVyc2VBbmRTZXRRdWVyaWVzQXNEaXJ0eSIsIkVsZW1lbnRJbmplY3Rvci5fc2V0UXVlcmllc0FzRGlydHkiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5IiwiX0VtcHR5UXVlcnlTdHJhdGVneS5zZXRDb250ZW50UXVlcmllc0FzRGlydHkiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5LnNldFZpZXdRdWVyaWVzQXNEaXJ0eSIsIl9FbXB0eVF1ZXJ5U3RyYXRlZ3kuaHlkcmF0ZSIsIl9FbXB0eVF1ZXJ5U3RyYXRlZ3kuZGVoeWRyYXRlIiwiX0VtcHR5UXVlcnlTdHJhdGVneS51cGRhdGVDb250ZW50UXVlcmllcyIsIl9FbXB0eVF1ZXJ5U3RyYXRlZ3kudXBkYXRlVmlld1F1ZXJpZXMiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5LmZpbmRRdWVyeSIsIklubGluZVF1ZXJ5U3RyYXRlZ3kiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiSW5saW5lUXVlcnlTdHJhdGVneS5zZXRDb250ZW50UXVlcmllc0FzRGlydHkiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5LnNldFZpZXdRdWVyaWVzQXNEaXJ0eSIsIklubGluZVF1ZXJ5U3RyYXRlZ3kuaHlkcmF0ZSIsIklubGluZVF1ZXJ5U3RyYXRlZ3kuZGVoeWRyYXRlIiwiSW5saW5lUXVlcnlTdHJhdGVneS51cGRhdGVDb250ZW50UXVlcmllcyIsIklubGluZVF1ZXJ5U3RyYXRlZ3kudXBkYXRlVmlld1F1ZXJpZXMiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5LmZpbmRRdWVyeSIsIkR5bmFtaWNRdWVyeVN0cmF0ZWd5IiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kuY29uc3RydWN0b3IiLCJEeW5hbWljUXVlcnlTdHJhdGVneS5zZXRDb250ZW50UXVlcmllc0FzRGlydHkiLCJEeW5hbWljUXVlcnlTdHJhdGVneS5zZXRWaWV3UXVlcmllc0FzRGlydHkiLCJEeW5hbWljUXVlcnlTdHJhdGVneS5oeWRyYXRlIiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kuZGVoeWRyYXRlIiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kudXBkYXRlQ29udGVudFF1ZXJpZXMiLCJEeW5hbWljUXVlcnlTdHJhdGVneS51cGRhdGVWaWV3UXVlcmllcyIsIkR5bmFtaWNRdWVyeVN0cmF0ZWd5LmZpbmRRdWVyeSIsIkVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5IiwiRWxlbWVudEluamVjdG9ySW5saW5lU3RyYXRlZ3kuY29uc3RydWN0b3IiLCJFbGVtZW50SW5qZWN0b3JJbmxpbmVTdHJhdGVneS5oeWRyYXRlIiwiRWxlbWVudEluamVjdG9ySW5saW5lU3RyYXRlZ3kuZGVoeWRyYXRlIiwiRWxlbWVudEluamVjdG9ySW5saW5lU3RyYXRlZ3kuY2FsbE9uRGVzdHJveSIsIkVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5LmdldENvbXBvbmVudCIsIkVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5LmlzQ29tcG9uZW50S2V5IiwiRWxlbWVudEluamVjdG9ySW5saW5lU3RyYXRlZ3kuYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkiLCJFbGVtZW50SW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kiLCJFbGVtZW50SW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuY29uc3RydWN0b3IiLCJFbGVtZW50SW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuaHlkcmF0ZSIsIkVsZW1lbnRJbmplY3RvckR5bmFtaWNTdHJhdGVneS5kZWh5ZHJhdGUiLCJFbGVtZW50SW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuY2FsbE9uRGVzdHJveSIsIkVsZW1lbnRJbmplY3RvckR5bmFtaWNTdHJhdGVneS5nZXRDb21wb25lbnQiLCJFbGVtZW50SW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuaXNDb21wb25lbnRLZXkiLCJFbGVtZW50SW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkiLCJQcm90b1F1ZXJ5UmVmIiwiUHJvdG9RdWVyeVJlZi5jb25zdHJ1Y3RvciIsIlByb3RvUXVlcnlSZWYudXNlc1Byb3BlcnR5U3ludGF4IiwiUXVlcnlSZWYiLCJRdWVyeVJlZi5jb25zdHJ1Y3RvciIsIlF1ZXJ5UmVmLmlzVmlld1F1ZXJ5IiwiUXVlcnlSZWYudXBkYXRlIiwiUXVlcnlSZWYuX3VwZGF0ZSIsIlF1ZXJ5UmVmLl92aXNpdCIsIlF1ZXJ5UmVmLl92aXNpdEluamVjdG9yIiwiUXVlcnlSZWYuX3Zpc2l0Vmlld0NvbnRhaW5lciIsIlF1ZXJ5UmVmLl92aXNpdFZpZXciLCJRdWVyeVJlZi5fYWdncmVnYXRlVmFyaWFibGVCaW5kaW5nIiwiUXVlcnlSZWYuX2FnZ3JlZ2F0ZURpcmVjdGl2ZSIsIlF1ZXJ5UmVmLmRlaHlkcmF0ZSIsIlF1ZXJ5UmVmLmh5ZHJhdGUiXSwibWFwcGluZ3MiOiJPQUFPLEVBQ0wsU0FBUyxFQUNULE9BQU8sRUFLUixNQUFNLDBCQUEwQjtPQUMxQixFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNyRCxFQUFlLGlCQUFpQixFQUFDLE1BQU0sMkJBQTJCO09BQ2xFLEVBQUMsV0FBVyxFQUFjLGdCQUFnQixFQUFDLE1BQU0sZ0NBQWdDO09BQ2pGLEVBQ0wsUUFBUSxFQUNSLEdBQUcsRUFDSCxVQUFVLEVBRVYsUUFBUSxFQUVSLGVBQWUsRUFJaEIsTUFBTSxzQkFBc0I7T0FDdEIsRUFDTCxTQUFTLEVBQ1QsYUFBYSxFQUNiLFVBQVUsRUFDVixzQkFBc0IsRUFFdEIsc0JBQXNCLEVBRXZCLE1BQU0sK0JBQStCO09BQy9CLEVBQUMsZUFBZSxFQUFFLGVBQWUsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLCtCQUErQjtPQUUxRixFQUFDLGlCQUFpQixFQUFFLGFBQWEsRUFBQyxNQUFNLGdCQUFnQjtPQUd6QyxLQUFLLFNBQVMsTUFBTSxnQkFBZ0I7T0FDbkQsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQjtPQUM5QyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWU7T0FDakMsRUFBQyxXQUFXLEVBQUMsTUFBTSxnQkFBZ0I7T0FDbkMsRUFBQyxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLHdCQUF3QjtPQUNwRSxFQUFDLGdCQUFnQixFQUFDLE1BQU0saUNBQWlDO09BQ3pELEVBRUwsaUJBQWlCLEVBQ2xCLE1BQU0scURBQXFEO09BQ3JELEVBQUMsU0FBUyxFQUFDLE1BQU0sY0FBYztPQUMvQixFQUFDLFNBQVMsRUFBQyxNQUFNLHlDQUF5QztPQUUxRCxFQUFDLFdBQVcsRUFBQyxNQUFNLHVDQUF1QztPQUUxRCxFQUFDLFlBQVksRUFBQyxNQUFNLHVDQUF1QztPQUUzRCxFQUFDLGNBQWMsRUFBQyxNQUFNLGNBQWM7T0FDcEMsRUFBQyxpQkFBaUIsRUFBQyxNQUFNLHNCQUFzQjtBQUV0RCxJQUFJLFdBQVcsQ0FBQztBQUVoQjtJQU9FQTtRQUNFQyxJQUFJQSxDQUFDQSxhQUFhQSxHQUFHQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxTQUFTQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQTtRQUMxREEsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0E7UUFDN0NBLElBQUlBLENBQUNBLGVBQWVBLEdBQUdBLEdBQUdBLENBQUNBLEdBQUdBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0E7UUFDcERBLElBQUlBLENBQUNBLG1CQUFtQkEsR0FBR0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQTtRQUN6REEsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0E7SUFDN0NBLENBQUNBO0lBRURELE9BQU9BLFFBQVFBO1FBQ2JFLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQUNBLFdBQVdBLEdBQUdBLElBQUlBLFVBQVVBLEVBQUVBLENBQUNBO1FBQ3pEQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQTtJQUNyQkEsQ0FBQ0E7QUFDSEYsQ0FBQ0E7QUFFRDtJQUdFRyxZQUFZQSxNQUFTQTtRQUNuQkMsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdEJBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3hCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUN0QkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREQsUUFBUUEsQ0FBQ0EsS0FBUUEsSUFBVUUsS0FBS0EsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFbERGLE1BQU1BLEtBQVdHLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBRXZDSCxJQUFJQSxNQUFNQSxLQUFLSSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUN2Q0osQ0FBQ0E7QUFFRCx5Q0FBeUMsVUFBVTtJQUNqREssWUFBWUEsR0FBUUEsRUFBRUEsUUFBaUJBLEVBQUVBLG9CQUE0QkEsRUFDekRBLG9CQUE0QkEsRUFBRUEsVUFBaUJBLEVBQVNBLGFBQXFCQSxFQUN0RUEsY0FBNkJBO1FBQzlDQyxNQUFNQSxHQUFHQSxFQUFFQSxRQUFRQSxFQUFFQSxvQkFBb0JBLEVBQUVBLG9CQUFvQkEsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFGWEEsa0JBQWFBLEdBQWJBLGFBQWFBLENBQVFBO1FBQ3RFQSxtQkFBY0EsR0FBZEEsY0FBY0EsQ0FBZUE7UUFFOUNBLElBQUlBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO0lBQ2pCQSxDQUFDQTtJQUVERCxnQkFBZ0JBO0lBQ2hCQSxPQUFPQTtRQUNMRSxJQUFJQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNkQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQTtZQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtRQUM1Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7UUFDM0NBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBO1lBQ1pBLE1BQU1BLElBQUlBLGFBQWFBLENBQ25CQSxvRkFBb0ZBLENBQUNBLENBQUNBO0lBQzlGQSxDQUFDQTtJQUVERixPQUFPQSxVQUFVQSxDQUFDQSxDQUFhQTtRQUM3QkcsTUFBTUEsQ0FBQ0EsSUFBSUEsbUJBQW1CQSxDQUMxQkEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsQ0FBQ0Esb0JBQW9CQSxFQUFFQSxDQUFDQSxDQUFDQSxvQkFBb0JBLEVBQUVBLENBQUNBLENBQUNBLFVBQVVBLEVBQy9FQSxtQkFBbUJBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBLEVBQUVBLG1CQUFtQkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDbEdBLENBQUNBO0lBRURILGdCQUFnQkE7SUFDaEJBLE9BQU9BLGNBQWNBLENBQUNBLFVBQWlCQTtRQUNyQ0ksSUFBSUEsQ0FBQ0EsR0FBc0JBLFVBQVVBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0E7UUFDaEZBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLGFBQWFBLEdBQUdBLElBQUlBLENBQUNBO0lBQy9DQSxDQUFDQTtJQUVESixnQkFBZ0JBO0lBQ2hCQSxPQUFPQSxNQUFNQSxDQUFDQSxVQUFpQkE7UUFDN0JLLE1BQU1BLENBQWdCQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxhQUFhQSxDQUFDQSxDQUFDQTtJQUN6RUEsQ0FBQ0E7QUFDSEwsQ0FBQ0E7QUFFRCx1Q0FBdUMsaUJBQWlCO0lBR3RETSxZQUFZQSxHQUFRQSxFQUFFQSxPQUFpQkEsRUFBRUEsSUFBa0JBLEVBQVNBLFFBQTJCQSxFQUM1RUEsU0FBeUNBLEVBQ3pDQSxhQUE2Q0E7UUFDOURDLE1BQU1BLEdBQUdBLEVBQUVBLENBQUNBLElBQUlBLGVBQWVBLENBQUNBLE9BQU9BLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBSFVBLGFBQVFBLEdBQVJBLFFBQVFBLENBQW1CQTtRQUM1RUEsY0FBU0EsR0FBVEEsU0FBU0EsQ0FBZ0NBO1FBQ3pDQSxrQkFBYUEsR0FBYkEsYUFBYUEsQ0FBZ0NBO1FBRTlEQSxJQUFJQSxDQUFDQSxhQUFhQSxHQUFHQSxnQkFBZ0JBLENBQUNBLGNBQWNBLENBQUNBLFNBQVNBLEVBQUVBLEdBQUdBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO0lBQzdFQSxDQUFDQTtJQUVERCxJQUFJQSxXQUFXQSxLQUFhRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUUxREYsSUFBSUEsT0FBT0E7UUFDVEcsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7UUFFOUNBLElBQUlBLEdBQUdBLEdBQUdBLEVBQUVBLENBQUNBO1FBQ2JBLGdCQUFnQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0EsSUFBSUEsRUFBRUEsU0FBU0E7WUFDOURBLElBQUlBLE1BQU1BLEdBQUdBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1lBQ3pDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSx1QkFBdUJBLENBQUNBLE1BQU1BLEVBQUVBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1FBQ3REQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNIQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQTtJQUNiQSxDQUFDQTtJQUVESCxJQUFJQSxhQUFhQTtRQUNmSSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxPQUFPQTtZQUNyQkEsRUFBRUEsQ0FBQ0E7SUFDM0VBLENBQUNBO0lBRURKLE9BQU9BLGtCQUFrQkEsQ0FBQ0EsUUFBa0JBLEVBQUVBLElBQXVCQTtRQUNuRUssRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbEJBLElBQUlBLEdBQUdBLElBQUlBLGlCQUFpQkEsRUFBRUEsQ0FBQ0E7UUFDakNBLENBQUNBO1FBRURBLElBQUlBLEVBQUVBLEdBQUdBLGVBQWVBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBO1FBQ25DQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1FBQ2pDQSxJQUFJQSxJQUFJQSxHQUFHQSxFQUFFQSxDQUFDQSxZQUFZQSxDQUFDQSxHQUFHQSxDQUFDQSxtQkFBbUJBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO1FBRS9EQSxJQUFJQSxTQUFTQSxHQUFHQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUNoRUEsSUFBSUEsV0FBV0EsR0FBR0EsSUFBSUEsWUFBWUEsaUJBQWlCQSxJQUFJQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQTtZQUM5REEsSUFBSUEsQ0FBQ0EsYUFBYUE7WUFDbEJBLEVBQUVBLENBQUNBO1FBQ3pCQSxNQUFNQSxDQUFDQSxJQUFJQSxpQkFBaUJBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEVBQUVBLEVBQUVBLENBQUNBLE9BQU9BLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLEVBQUVBLFNBQVNBLEVBQUVBLFdBQVdBLENBQUNBLENBQUNBO0lBQ3ZGQSxDQUFDQTtJQUVETCxPQUFPQSxjQUFjQSxDQUFDQSxJQUFVQSxFQUFFQSxVQUE2QkE7UUFDN0RNLElBQUlBLFFBQVFBLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLElBQUlBLEVBQUVBLEVBQUNBLFFBQVFBLEVBQUVBLElBQUlBLEVBQUNBLENBQUNBLENBQUNBO1FBQ3BEQSxNQUFNQSxDQUFDQSxpQkFBaUJBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsUUFBUUEsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0E7SUFDcEVBLENBQUNBO0FBQ0hOLENBQUNBO0FBRUQsMkVBQTJFO0FBQzNFO0lBRUVPLFlBQW1CQSxXQUFxQ0EsRUFBU0EsSUFBYUEsRUFDM0RBLFVBQXNCQSxFQUFTQSxXQUF3QkE7UUFEdkRDLGdCQUFXQSxHQUFYQSxXQUFXQSxDQUEwQkE7UUFBU0EsU0FBSUEsR0FBSkEsSUFBSUEsQ0FBU0E7UUFDM0RBLGVBQVVBLEdBQVZBLFVBQVVBLENBQVlBO1FBQVNBLGdCQUFXQSxHQUFYQSxXQUFXQSxDQUFhQTtRQUYxRUEsZUFBVUEsR0FBWUEsSUFBSUEsQ0FBQ0E7SUFFa0RBLENBQUNBO0FBQ2hGRCxDQUFDQTtBQUVEO0lBQ0VFLFlBQW1CQSxNQUFnQkEsRUFBU0EsUUFBdUJBO1FBQWhEQyxXQUFNQSxHQUFOQSxNQUFNQSxDQUFVQTtRQUFTQSxhQUFRQSxHQUFSQSxRQUFRQSxDQUFlQTtJQUFHQSxDQUFDQTtBQUN6RUQsQ0FBQ0E7QUFFRDtJQUNFRSxZQUFtQkEsU0FBaUJBLEVBQVNBLE1BQWdCQTtRQUExQ0MsY0FBU0EsR0FBVEEsU0FBU0EsQ0FBUUE7UUFBU0EsV0FBTUEsR0FBTkEsTUFBTUEsQ0FBVUE7SUFBR0EsQ0FBQ0E7SUFFakVELFNBQVNBLENBQUNBLElBQWFBLEVBQUVBLGlCQUF5QkEsRUFBRUEsU0FBaUJBO1FBQ25FRSxJQUFJQSxZQUFZQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUMxQ0EsTUFBTUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxTQUFTQSxDQUM5QkEsWUFBWUEsRUFDWkEsUUFBUUEsSUFBSUEsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxFQUFFQSxRQUFRQSxFQUFFQSxpQkFBaUJBLENBQUNBLENBQUNBLENBQUNBO0lBQzFGQSxDQUFDQTtBQUNIRixDQUFDQTtBQUVELHNDQUFzQyxHQUEyQjtJQUMvREcsSUFBSUEsUUFBUUEsR0FBR0EsR0FBR0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7SUFDNUJBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLFlBQVlBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7SUFDeERBLElBQUlBLEVBQUVBLEdBQXNCQSxRQUFRQSxDQUFDQTtJQUNyQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsV0FBV0E7UUFDckNBLElBQUlBLFdBQVdBLEdBQUdBLFdBQVdBLENBQUNBLEtBQUtBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQ2pEQSxNQUFNQSxDQUFDQSxJQUFJQSxvQkFBb0JBLENBQUNBLFdBQVdBLENBQUNBLFNBQVNBLEVBQUVBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO0lBQ2xHQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUNMQSxDQUFDQTtBQUVELCtCQUErQixTQUFtQztJQUNoRUMsSUFBSUEsR0FBR0EsR0FBR0EsRUFBRUEsQ0FBQ0E7SUFDYkEsV0FBV0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQTtRQUMzQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsWUFBWUEsaUJBQWlCQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1Q0EsSUFBSUEsaUJBQWlCQSxHQUFzQkEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDdERBLGdCQUFnQkE7WUFDaEJBLElBQUlBLE9BQU9BLEdBQThCQSxpQkFBaUJBLENBQUNBLE9BQU9BLENBQUNBO1lBQ25FQSxPQUFPQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxhQUFhQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUUzRUEsdUNBQXVDQTtZQUN2Q0Esc0VBQXNFQTtZQUN0RUEsSUFBSUEsSUFBSUEsR0FDbUJBLGlCQUFpQkEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsWUFBWUEsQ0FBQ0E7WUFDMUVBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO2dCQUNaQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQTtvQkFBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsYUFBYUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLENBQUNBO1FBQ0xBLENBQUNBO0lBQ0hBLENBQUNBLENBQUNBLENBQUNBO0lBQ0hBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBO0FBQ2JBLENBQUNBO0FBRUQ7SUErREVDLFlBQW1CQSxNQUE0QkEsRUFBU0EsS0FBYUEsRUFDekRBLEdBQTZCQSxFQUFTQSxnQkFBd0JBLEVBQzlEQSx5QkFBa0NBLEVBQzNCQSx5QkFBOENBO1FBSDlDQyxXQUFNQSxHQUFOQSxNQUFNQSxDQUFzQkE7UUFBU0EsVUFBS0EsR0FBTEEsS0FBS0EsQ0FBUUE7UUFDbkJBLHFCQUFnQkEsR0FBaEJBLGdCQUFnQkEsQ0FBUUE7UUFFdkRBLDhCQUF5QkEsR0FBekJBLHlCQUF5QkEsQ0FBcUJBO1FBQy9EQSxJQUFJQSxDQUFDQSx5QkFBeUJBLEdBQUdBLHlCQUF5QkEsQ0FBQ0E7UUFDM0RBLElBQUlBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBO1FBQ3hCQSxJQUFJQSxDQUFDQSxhQUFhQSxHQUFHQSxJQUFJQSxhQUFhQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUM1Q0EsSUFBSUEsQ0FBQ0EscUJBQXFCQSxHQUFHQSxXQUFXQSxDQUFDQSxlQUFlQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUNqRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsTUFBTUEsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDaENBLElBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsNEJBQTRCQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN2RUEsQ0FBQ0E7UUFDREEsSUFBSUEsQ0FBQ0EsY0FBY0EsR0FBR0EscUJBQXFCQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUNuREEsQ0FBQ0E7SUFwRURELE9BQU9BLE1BQU1BLENBQUNBLE1BQTRCQSxFQUFFQSxLQUFhQSxFQUFFQSxTQUE4QkEsRUFDM0VBLHdCQUFpQ0EsRUFBRUEsZ0JBQXdCQSxFQUMzREEseUJBQThDQTtRQUMxREUsSUFBSUEsRUFBRUEsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFFWkEsb0JBQW9CQSxDQUFDQSxzQ0FBc0NBLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLEVBQ2JBLHdCQUF3QkEsQ0FBQ0EsQ0FBQ0E7UUFDdEZBLEVBQUVBLENBQUNBLENBQUNBLHdCQUF3QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDN0JBLG9CQUFvQkEsQ0FBQ0Esa0NBQWtDQSxDQUFDQSxTQUFTQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUN6RUEsQ0FBQ0E7UUFFREEsb0JBQW9CQSxDQUFDQSw4QkFBOEJBLENBQUNBLFNBQVNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO1FBQ25FQSxNQUFNQSxDQUFDQSxJQUFJQSxvQkFBb0JBLENBQUNBLE1BQU1BLEVBQUVBLEtBQUtBLEVBQUVBLEVBQUVBLEVBQUVBLGdCQUFnQkEsRUFBRUEsd0JBQXdCQSxFQUM3REEseUJBQXlCQSxDQUFDQSxDQUFDQTtJQUM3REEsQ0FBQ0E7SUFFREYsT0FBZUEsc0NBQXNDQSxDQUFDQSxZQUFpQ0EsRUFDakNBLEVBQTRCQSxFQUM1QkEsd0JBQWlDQTtRQUNyRkcsWUFBWUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsV0FBV0E7WUFDOUJBLEVBQUVBLENBQUNBLElBQUlBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsNkJBQTZCQSxDQUN0REEsd0JBQXdCQSxFQUFFQSxXQUFXQSxFQUFFQSxZQUFZQSxFQUFFQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN6RUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDTEEsQ0FBQ0E7SUFFREgsT0FBZUEsOEJBQThCQSxDQUFDQSxZQUFpQ0EsRUFDakNBLEVBQTRCQTtRQUN4RUksSUFBSUEsMEJBQTBCQSxHQUFHQSxFQUFFQSxDQUFDQTtRQUNwQ0EsWUFBWUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsV0FBV0E7WUFDOUJBLDBCQUEwQkE7Z0JBQ3RCQSxXQUFXQSxDQUFDQSxNQUFNQSxDQUFDQSwwQkFBMEJBLEVBQUVBLFdBQVdBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBQzVFQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUVIQSxJQUFJQSxRQUFRQSxHQUFHQSxRQUFRQSxDQUFDQSxPQUFPQSxDQUFDQSwwQkFBMEJBLENBQUNBLENBQUNBO1FBQzVEQSxRQUFRQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxzQkFBc0JBLENBQUNBLENBQUNBLEVBQUVBLFVBQVVBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBQ25GQSxDQUFDQTtJQUVESixPQUFlQSw2QkFBNkJBLENBQUNBLHdCQUFpQ0EsRUFDakNBLFdBQThCQSxFQUM5QkEsWUFBaUNBLEVBQ2pDQSxRQUEwQkE7UUFDckVLLElBQUlBLFdBQVdBLEdBQUdBLHdCQUF3QkEsSUFBSUEsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsV0FBV0EsQ0FBQ0E7UUFDOUVBLE1BQU1BLENBQUNBLElBQUlBLHNCQUFzQkEsQ0FDN0JBLFFBQVFBLEVBQUVBLFdBQVdBLEdBQUdBLFVBQVVBLENBQUNBLGdCQUFnQkEsR0FBR0EsVUFBVUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDL0VBLENBQUNBO0lBRURMLE9BQWVBLGtDQUFrQ0EsQ0FBQ0EsWUFBaUNBLEVBQ2pDQSxFQUE0QkE7UUFDNUVNLElBQUlBLHFCQUFxQkEsR0FBR0EsUUFBUUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7UUFDNUVBLHFCQUFxQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsc0JBQXNCQSxDQUFDQSxDQUFDQSxFQUFFQSxVQUFVQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNqR0EsQ0FBQ0E7SUFvQkROLFdBQVdBLENBQUNBLE1BQXVCQTtRQUNqQ08sTUFBTUEsQ0FBQ0EsSUFBSUEsZUFBZUEsQ0FBQ0EsSUFBSUEsRUFBRUEsTUFBTUEsQ0FBQ0EsQ0FBQ0E7SUFDM0NBLENBQUNBO0lBRURQLFlBQVlBLEtBQTJCUSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLEdBQUdBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBRS9GUixJQUFJQSxXQUFXQSxLQUFjUyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxxQkFBcUJBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRTVFVCxrQkFBa0JBLENBQUNBLEtBQWFBLElBQVNVLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDakdWLENBQUNBO0FBRUQ7SUFDRVcsWUFBbUJBLE9BQVlBLEVBQVNBLGdCQUFxQkEsRUFBU0EsUUFBYUE7UUFBaEVDLFlBQU9BLEdBQVBBLE9BQU9BLENBQUtBO1FBQVNBLHFCQUFnQkEsR0FBaEJBLGdCQUFnQkEsQ0FBS0E7UUFBU0EsYUFBUUEsR0FBUkEsUUFBUUEsQ0FBS0E7SUFBR0EsQ0FBQ0E7QUFDekZELENBQUNBO0FBRUQscUNBQXFDLFFBQVE7SUFhM0NFLFlBQVlBLE1BQTRCQSxFQUFFQSxNQUF1QkE7UUFDL0RDLE1BQU1BLE1BQU1BLENBQUNBLENBQUNBO1FBWFJBLHFCQUFnQkEsR0FBb0JBLElBQUlBLENBQUNBO1FBWS9DQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQTtRQUNyQkEsSUFBSUEsQ0FBQ0EsU0FBU0E7WUFDVkEsSUFBSUEsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsYUFBYUEsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsRUFBRUEsTUFBTUEsSUFBSUEsQ0FBQ0EsYUFBYUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFFcEZBLDBFQUEwRUE7UUFDMUVBLElBQUlBLGdCQUFnQkEsR0FBUUEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsZ0JBQWdCQSxDQUFDQTtRQUM1REEsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsZ0JBQWdCQSxZQUFZQSxzQkFBc0JBO1lBQzlDQSxJQUFJQSw2QkFBNkJBLENBQUNBLGdCQUFnQkEsRUFBRUEsSUFBSUEsQ0FBQ0E7WUFDekRBLElBQUlBLDhCQUE4QkEsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUVoRkEsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFFdEJBLElBQUlBLENBQUNBLGNBQWNBLEdBQUdBLElBQUlBLENBQUNBLG1CQUFtQkEsRUFBRUEsQ0FBQ0E7SUFDbkRBLENBQUNBO0lBRURELFNBQVNBO1FBQ1BFLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLEtBQUtBLENBQUNBO1FBQ3RCQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNsQkEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUM3QkEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsYUFBYUEsRUFBRUEsQ0FBQ0E7UUFDL0JBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBO1FBQzNCQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQTtJQUNsQ0EsQ0FBQ0E7SUFFREYsT0FBT0EsQ0FBQ0EsMkJBQXFDQSxFQUFFQSxJQUFxQkEsRUFDNURBLGVBQWdDQTtRQUN0Q0csSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDbEJBLElBQUlBLENBQUNBLGdCQUFnQkEsR0FBR0EsZUFBZUEsQ0FBQ0E7UUFFeENBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsMkJBQTJCQSxDQUFDQSxDQUFDQTtRQUNyREEsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7UUFDOUJBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO1FBRXpCQSxJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUN2QkEsQ0FBQ0E7SUFFT0gsYUFBYUE7UUFDbkJJLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0E7UUFDOUJBLElBQUlBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLFVBQVVBLENBQUNBLGlCQUFpQkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0E7UUFDbEVBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDaEVBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLENBQUNBLGdCQUFnQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDdkZBLENBQUNBO0lBRU9KLGtCQUFrQkEsQ0FBQ0EsMkJBQXFDQTtRQUM5REssNEVBQTRFQTtRQUM1RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNUJBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLDJCQUEyQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzNDQSxrRUFBa0VBO2dCQUNsRUEsZ0VBQWdFQTtnQkFDaEVBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBRUEsMkJBQTJCQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDM0VBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsMkJBQTJCQSxFQUFFQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxTQUFTQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUNyRkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ05BLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBRUEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsU0FBU0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDeEVBLENBQUNBO1FBR0hBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pDQSxrRUFBa0VBO1lBQ2xFQSxxRUFBcUVBO1lBQ3JFQSxpREFBaURBO1lBQ2pEQSx1RUFBdUVBO1lBQ3ZFQSxpREFBaURBO1lBQ2pEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSwyQkFBMkJBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUMzQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxFQUFFQSwyQkFBMkJBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO2dCQUMzRUEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSwyQkFBMkJBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLFNBQVNBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1lBQ2xGQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtnQkFDTkEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxTQUFTQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNyRUEsQ0FBQ0E7UUFHSEEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsMkJBQTJCQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDM0NBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBRUEsMkJBQTJCQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUM1RUEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFT0wsaUJBQWlCQSxDQUFDQSxRQUFrQkEsRUFBRUEsY0FBd0JBLEVBQUVBLFVBQW1CQTtRQUN6Rk0sUUFBUUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxNQUFNQSxDQUFDQSxjQUFjQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQTtJQUMvREEsQ0FBQ0E7SUFFRE4sa0JBQWtCQSxDQUFDQSxJQUFZQTtRQUM3Qk8sSUFBSUEsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EseUJBQXlCQSxDQUFDQTtRQUMvQ0EsTUFBTUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDdkNBLENBQUNBO0lBRURQLGtCQUFrQkEsQ0FBQ0EsSUFBWUE7UUFDN0JRLElBQUlBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLHlCQUF5QkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDNURBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLG1CQUFtQkEsQ0FBU0EsS0FBS0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsYUFBYUEsRUFBRUEsQ0FBQ0E7SUFDM0ZBLENBQUNBO0lBRURSLEdBQUdBLENBQUNBLEtBQVVBLElBQVNTLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRTFEVCxZQUFZQSxDQUFDQSxJQUFVQSxJQUFhVSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUV6RlYsd0JBQXdCQSxLQUErQlcsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EscUJBQXFCQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVsR1gsNEJBQTRCQTtRQUMxQlksTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EseUJBQXlCQSxDQUFDQTtJQUMvQ0EsQ0FBQ0E7SUFFRFosWUFBWUEsS0FBVWEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsWUFBWUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFN0RiLFdBQVdBLEtBQWVjLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBO0lBRWxEZCxhQUFhQSxLQUFpQmUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUV4RWYsbUJBQW1CQTtRQUNqQmdCLE1BQU1BLENBQUNBLElBQUlBLGlCQUFpQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxXQUFXQSxFQUFFQSxJQUFJQSxDQUFDQSxhQUFhQSxFQUFFQSxDQUFDQSxDQUFDQTtJQUN4RkEsQ0FBQ0E7SUFFRGhCLGFBQWFBLEtBQWNpQixNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBO0lBRXJFakIsT0FBT0EsS0FBY2tCLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFekRsQixZQUFZQSxLQUFzQm1CLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLGdCQUFnQkEsR0FBR0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFakduQixjQUFjQSxDQUFDQSxHQUFRQSxJQUFhb0IsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFaEZwQixhQUFhQSxDQUFDQSxRQUFrQkEsRUFBRUEsUUFBMEJBLEVBQUVBLEdBQWVBO1FBQzNFcUIsSUFBSUEsR0FBR0EsR0FBUUEsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0E7UUFFdkJBLEVBQUVBLENBQUNBLENBQUNBLFFBQVFBLFlBQVlBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDMUNBLElBQUlBLE1BQU1BLEdBQXdCQSxHQUFHQSxDQUFDQTtZQUN0Q0EsSUFBSUEsV0FBV0EsR0FBR0EsUUFBUUEsQ0FBQ0E7WUFDM0JBLElBQUlBLFVBQVVBLEdBQUdBLFVBQVVBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1lBR3ZDQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxLQUFLQSxVQUFVQSxDQUFDQSxhQUFhQSxDQUFDQTtnQkFBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxXQUFXQSxDQUFDQTtZQUVsRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7Z0JBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1lBRXpFQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQTtnQkFDbkNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBO1lBRW5FQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxLQUFLQSxVQUFVQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBO2dCQUNoRUEsb0VBQW9FQTtnQkFDcEVBLDZEQUE2REE7Z0JBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxRQUFRQSxZQUFZQSxpQkFBaUJBLENBQUNBLENBQUNBLENBQUNBO29CQUN0REEsSUFBSUEsYUFBYUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUN4REEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxVQUFVQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBO29CQUN4REEsTUFBTUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0E7Z0JBQzFDQSxDQUFDQTtnQkFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBQ05BLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0E7Z0JBQ3ZEQSxDQUFDQTtZQUNIQSxDQUFDQTtZQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxLQUFLQSxVQUFVQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDekRBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLEVBQUVBLENBQUNBO1lBQzlCQSxDQUFDQTtZQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxLQUFLQSxVQUFVQSxDQUFDQSxRQUFRQSxFQUFFQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDNURBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLG1CQUFtQkEsRUFBRUEsQ0FBQ0E7WUFDcENBLENBQUNBO1lBRURBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLEtBQUtBLFVBQVVBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO2dCQUMxREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDL0NBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO3dCQUNwQkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7b0JBQ2RBLENBQUNBO29CQUVEQSxNQUFNQSxJQUFJQSxlQUFlQSxDQUFDQSxJQUFJQSxFQUFFQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtnQkFDOUNBLENBQUNBO2dCQUNEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFdBQVdBLENBQUNBO1lBQzNDQSxDQUFDQTtRQUVIQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxRQUFRQSxZQUFZQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsS0FBS0EsVUFBVUEsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDN0RBLElBQUlBLGFBQWFBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FDeERBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQTtnQkFDeERBLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBLGNBQWNBLENBQUNBLEdBQUdBLENBQUNBO1lBQzFDQSxDQUFDQTtRQUNIQSxDQUFDQTtRQUVEQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQTtJQUNuQkEsQ0FBQ0E7SUFFT3JCLGVBQWVBLENBQUNBLEdBQXdCQTtRQUM5Q3NCLElBQUlBLFVBQVVBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBO1FBQ3hDQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxVQUFVQSxDQUFDQSxHQUFHQSxDQUFDQSxHQUFHQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMvREEsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7UUFDM0NBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQ05BLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO0lBQ0hBLENBQUNBO0lBRUR0QiwwQkFBMEJBLENBQUNBLEtBQW9CQSxFQUFFQSxJQUFXQTtRQUMxRHVCLElBQUlBLFdBQVdBLEdBQUdBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsR0FBR0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxXQUFXQSxDQUFDQTtRQUM1RkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsS0FBS0EsV0FBV0EsSUFBSUEsU0FBU0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDN0RBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQ3pCQSxDQUFDQTtRQUNEQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSwwQkFBMEJBLENBQUNBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO0lBQ3pEQSxDQUFDQTtJQUVPdkIsbUJBQW1CQTtRQUN6QndCLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLGNBQWNBLENBQUNBLE1BQU1BLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzVDQSxNQUFNQSxDQUFDQSxtQkFBbUJBLENBQUNBO1FBQzdCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQSxNQUFNQTtZQUNqQ0EsbUJBQW1CQSxDQUFDQSwyQkFBMkJBLENBQUNBLENBQUNBLENBQUNBO1lBQzNEQSxNQUFNQSxDQUFDQSxJQUFJQSxtQkFBbUJBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3ZDQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxNQUFNQSxDQUFDQSxJQUFJQSxvQkFBb0JBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3hDQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVEeEIsSUFBSUEsQ0FBQ0EsTUFBdUJBLElBQVV5QixNQUFNQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUU5RHpCLE1BQU1BLEtBQVcwQixJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVqQzFCLG1CQUFtQkEsQ0FBQ0EsS0FBYUEsSUFBUzJCLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRS9FM0IsWUFBWUEsS0FBYzRCLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLElBQUlBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO0lBRTVFNUIsT0FBT0EsS0FBc0I2QixNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUVqRDdCLG9CQUFvQkEsS0FBYThCLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO0lBRTVEOUIsb0JBQW9CQTtRQUNsQitCLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLEVBQUVBLENBQUNBO1FBQzlCQSxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBO1FBQ3RDQSxJQUFJQSxVQUFVQSxHQUFHQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxHQUFHQSxJQUFJQSxDQUFDQSxvQkFBb0JBLEVBQUVBLENBQUNBLENBQUNBO1FBQ3RGQSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxVQUFVQSxDQUFDQSxHQUFHQSxVQUFVQSxDQUFDQSxvQkFBb0JBLEdBQUdBLEVBQUVBLENBQUNBO0lBQ3RFQSxDQUFDQTtJQUVEL0Isa0JBQWtCQSxLQUFXZ0MsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsaUJBQWlCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUV2RWhDLHFCQUFxQkEsS0FBV2lDLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLG9CQUFvQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFN0VqQyw0QkFBNEJBO1FBQzFCa0MsSUFBSUEsR0FBR0EsR0FBb0JBLElBQUlBLENBQUNBO1FBQ2hDQSxPQUFPQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQTtZQUN0QkEsR0FBR0EsQ0FBQ0Esa0JBQWtCQSxFQUFFQSxDQUFDQTtZQUN6QkEsR0FBR0EsR0FBR0EsR0FBR0EsQ0FBQ0EsTUFBTUEsQ0FBQ0E7UUFDbkJBLENBQUNBO0lBQ0hBLENBQUNBO0lBRU9sQyxrQkFBa0JBO1FBQ3hCbUMsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0Esd0JBQXdCQSxFQUFFQSxDQUFDQTtRQUMvQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EscUJBQXFCQSxFQUFFQSxDQUFDQTtJQUMvRUEsQ0FBQ0E7QUFDSG5DLENBQUNBO0FBWUQ7SUFDRW9DLHdCQUF3QkEsS0FBVUMsQ0FBQ0E7SUFDbkNELHFCQUFxQkEsS0FBVUUsQ0FBQ0E7SUFDaENGLE9BQU9BLEtBQVVHLENBQUNBO0lBQ2xCSCxTQUFTQSxLQUFVSSxDQUFDQTtJQUNwQkosb0JBQW9CQSxLQUFVSyxDQUFDQTtJQUMvQkwsaUJBQWlCQSxLQUFVTSxDQUFDQTtJQUM1Qk4sU0FBU0EsQ0FBQ0EsS0FBb0JBO1FBQzVCTyxNQUFNQSxJQUFJQSxhQUFhQSxDQUFDQSxtQ0FBbUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBO0lBQ3ZFQSxDQUFDQTtBQUNIUCxDQUFDQTtBQUVELElBQUksbUJBQW1CLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO0FBRXBEO0lBT0VRLFlBQVlBLEVBQW1CQTtRQUM3QkMsSUFBSUEsU0FBU0EsR0FBR0EsRUFBRUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsY0FBY0EsQ0FBQ0E7UUFDekNBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLElBQUlBLFFBQVFBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO1FBQ3ZFQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxJQUFJQSxRQUFRQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsUUFBUUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7SUFDekVBLENBQUNBO0lBRURELHdCQUF3QkE7UUFDdEJFLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2pGQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNqRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDbkZBLENBQUNBO0lBRURGLHFCQUFxQkE7UUFDbkJHLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2hGQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNoRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDbEZBLENBQUNBO0lBRURILE9BQU9BO1FBQ0xJLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO1FBQ2xEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUNsREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7SUFDcERBLENBQUNBO0lBRURKLFNBQVNBO1FBQ1BLLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBO1FBQ3BEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQTtRQUNwREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0E7SUFDdERBLENBQUNBO0lBRURMLG9CQUFvQkE7UUFDbEJNLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZEQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkRBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2REEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO0lBQ0hBLENBQUNBO0lBRUROLGlCQUFpQkE7UUFDZk8sRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdERBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0REEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3REQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFRFAs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LGlCQUFpQkEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7SUFDL0RBLENBQUNBO0lBRURGLFNBQVNBO1FBQ1BHLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0E7UUFFOUJBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLFNBQVNBLENBQUNBO1FBQ25CQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxTQUFTQSxDQUFDQTtRQUNuQkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsU0FBU0EsQ0FBQ0E7UUFDbkJBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLFNBQVNBLENBQUNBO1FBQ25CQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxTQUFTQSxDQUFDQTtRQUNuQkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsU0FBU0EsQ0FBQ0E7UUFDbkJBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLFNBQVNBLENBQUNBO1FBQ25CQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxTQUFTQSxDQUFDQTtRQUNuQkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsU0FBU0EsQ0FBQ0E7UUFDbkJBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLFNBQVNBLENBQUNBO0lBQ3JCQSxDQUFDQTtJQUVESCxhQUFhQTtRQUNYSSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBO1FBQzlCQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxhQUFhQSxDQUFDQTtRQUV4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQTtZQUNwQkEsQ0FBQ0EsQ0FBQ0EsU0FBVUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBO1lBQ3BCQSxDQUFDQSxDQUFDQSxTQUFVQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkE7WUFDcEJBLENBQUNBLENBQUNBLFNBQVVBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQTtZQUNwQkEsQ0FBQ0EsQ0FBQ0EsU0FBVUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBO1lBQ3BCQSxDQUFDQSxDQUFDQSxTQUFVQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkE7WUFDcEJBLENBQUNBLENBQUNBLFNBQVVBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQTtZQUNwQkEsQ0FBQ0EsQ0FBQ0EsU0FBVUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBO1lBQ3BCQSxDQUFDQSxDQUFDQSxTQUFVQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkE7WUFDcEJBLENBQUNBLENBQUNBLFNBQVVBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQTtZQUNwQkEsQ0FBQ0EsQ0FBQ0EsU0FBVUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVESixZQUFZQSxLQUFVSyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBRTFETCxjQUFjQSxDQUFDQSxHQUFRQTtRQUNyQk0sTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EseUJBQXlCQSxJQUFJQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQTtZQUMzREEsR0FBR0EsQ0FBQ0EsRUFBRUEsS0FBS0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxhQUFhQSxDQUFDQSxNQUFNQSxDQUFDQTtJQUMvREEsQ0FBQ0E7SUFFRE4sMEJBQTBCQSxDQUFDQSxLQUFvQkEsRUFBRUEsSUFBV0E7UUFDMURPLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0E7UUFDOUJBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLGFBQWFBLENBQUNBO1FBRXhCQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFB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SUFBSUEsQ0FBQ0E7SUFDcEJBLENBQUNBO0FBQ0haLENBQUNBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIFR5cGUsXG4gIHN0cmluZ2lmeSxcbiAgQ09OU1RfRVhQUixcbiAgU3RyaW5nV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1xuICBJbmplY3RvcixcbiAgS2V5LFxuICBEZXBlbmRlbmN5LFxuICBwcm92aWRlLFxuICBQcm92aWRlcixcbiAgUmVzb2x2ZWRQcm92aWRlcixcbiAgTm9Qcm92aWRlckVycm9yLFxuICBBYnN0cmFjdFByb3ZpZGVyRXJyb3IsXG4gIEN5Y2xpY0RlcGVuZGVuY3lFcnJvcixcbiAgcmVzb2x2ZUZvcndhcmRSZWZcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtcbiAgVU5ERUZJTkVELFxuICBQcm90b0luamVjdG9yLFxuICBWaXNpYmlsaXR5LFxuICBJbmplY3RvcklubGluZVN0cmF0ZWd5LFxuICBJbmplY3RvckR5bmFtaWNTdHJhdGVneSxcbiAgUHJvdmlkZXJXaXRoVmlzaWJpbGl0eSxcbiAgRGVwZW5kZW5jeVByb3ZpZGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpL2luamVjdG9yJztcbmltcG9ydCB7cmVzb2x2ZVByb3ZpZGVyLCBSZXNvbHZlZEZhY3RvcnksIFJlc29sdmVkUHJvdmlkZXJffSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9wcm92aWRlcic7XG5cbmltcG9ydCB7QXR0cmlidXRlTWV0YWRhdGEsIFF1ZXJ5TWV0YWRhdGF9IGZyb20gJy4uL21ldGFkYXRhL2RpJztcblxuaW1wb3J0IHtBcHBWaWV3Q29udGFpbmVyLCBBcHBWaWV3fSBmcm9tICcuL3ZpZXcnO1xuLyogY2lyY3VsYXIgKi8gaW1wb3J0ICogYXMgYXZtTW9kdWxlIGZyb20gJy4vdmlld19tYW5hZ2VyJztcbmltcG9ydCB7Vmlld0NvbnRhaW5lclJlZn0gZnJvbSAnLi92aWV3X2NvbnRhaW5lcl9yZWYnO1xuaW1wb3J0IHtFbGVtZW50UmVmfSBmcm9tICcuL2VsZW1lbnRfcmVmJztcbmltcG9ydCB7VGVtcGxhdGVSZWZ9IGZyb20gJy4vdGVtcGxhdGVfcmVmJztcbmltcG9ydCB7RGlyZWN0aXZlTWV0YWRhdGEsIENvbXBvbmVudE1ldGFkYXRhfSBmcm9tICcuLi9tZXRhZGF0YS9kaXJlY3RpdmVzJztcbmltcG9ydCB7aGFzTGlmZWN5Y2xlSG9va30gZnJvbSAnLi9kaXJlY3RpdmVfbGlmZWN5Y2xlX3JlZmxlY3Rvcic7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3RvcixcbiAgQ2hhbmdlRGV0ZWN0b3JSZWZcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7UXVlcnlMaXN0fSBmcm9tICcuL3F1ZXJ5X2xpc3QnO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge1NldHRlckZufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3R5cGVzJztcbmltcG9ydCB7RXZlbnRDb25maWd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9ldmVudF9jb25maWcnO1xuaW1wb3J0IHtBZnRlclZpZXdDaGVja2VkfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQge1BpcGVQcm92aWRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcGlwZXMvcGlwZV9wcm92aWRlcic7XG5cbmltcG9ydCB7TGlmZWN5Y2xlSG9va3N9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQge1ZpZXdDb250YWluZXJSZWZffSBmcm9tIFwiLi92aWV3X2NvbnRhaW5lcl9yZWZcIjtcblxudmFyIF9zdGF0aWNLZXlzO1xuXG5leHBvcnQgY2xhc3MgU3RhdGljS2V5cyB7XG4gIHZpZXdNYW5hZ2VySWQ6IG51bWJlcjtcbiAgdGVtcGxhdGVSZWZJZDogbnVtYmVyO1xuICB2aWV3Q29udGFpbmVySWQ6IG51bWJlcjtcbiAgY2hhbmdlRGV0ZWN0b3JSZWZJZDogbnVtYmVyO1xuICBlbGVtZW50UmVmSWQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnZpZXdNYW5hZ2VySWQgPSBLZXkuZ2V0KGF2bU1vZHVsZS5BcHBWaWV3TWFuYWdlcikuaWQ7XG4gICAgdGhpcy50ZW1wbGF0ZVJlZklkID0gS2V5LmdldChUZW1wbGF0ZVJlZikuaWQ7XG4gICAgdGhpcy52aWV3Q29udGFpbmVySWQgPSBLZXkuZ2V0KFZpZXdDb250YWluZXJSZWYpLmlkO1xuICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3JSZWZJZCA9IEtleS5nZXQoQ2hhbmdlRGV0ZWN0b3JSZWYpLmlkO1xuICAgIHRoaXMuZWxlbWVudFJlZklkID0gS2V5LmdldChFbGVtZW50UmVmKS5pZDtcbiAgfVxuXG4gIHN0YXRpYyBpbnN0YW5jZSgpOiBTdGF0aWNLZXlzIHtcbiAgICBpZiAoaXNCbGFuayhfc3RhdGljS2V5cykpIF9zdGF0aWNLZXlzID0gbmV3IFN0YXRpY0tleXMoKTtcbiAgICByZXR1cm4gX3N0YXRpY0tleXM7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRyZWVOb2RlPFQgZXh0ZW5kcyBUcmVlTm9kZTxhbnk+PiB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcmVudDogVDtcbiAgY29uc3RydWN0b3IocGFyZW50OiBUKSB7XG4gICAgaWYgKGlzUHJlc2VudChwYXJlbnQpKSB7XG4gICAgICBwYXJlbnQuYWRkQ2hpbGQodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3BhcmVudCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgYWRkQ2hpbGQoY2hpbGQ6IFQpOiB2b2lkIHsgY2hpbGQuX3BhcmVudCA9IHRoaXM7IH1cblxuICByZW1vdmUoKTogdm9pZCB7IHRoaXMuX3BhcmVudCA9IG51bGw7IH1cblxuICBnZXQgcGFyZW50KCkgeyByZXR1cm4gdGhpcy5fcGFyZW50OyB9XG59XG5cbmV4cG9ydCBjbGFzcyBEaXJlY3RpdmVEZXBlbmRlbmN5IGV4dGVuZHMgRGVwZW5kZW5jeSB7XG4gIGNvbnN0cnVjdG9yKGtleTogS2V5LCBvcHRpb25hbDogYm9vbGVhbiwgbG93ZXJCb3VuZFZpc2liaWxpdHk6IE9iamVjdCxcbiAgICAgICAgICAgICAgdXBwZXJCb3VuZFZpc2liaWxpdHk6IE9iamVjdCwgcHJvcGVydGllczogYW55W10sIHB1YmxpYyBhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHB1YmxpYyBxdWVyeURlY29yYXRvcjogUXVlcnlNZXRhZGF0YSkge1xuICAgIHN1cGVyKGtleSwgb3B0aW9uYWwsIGxvd2VyQm91bmRWaXNpYmlsaXR5LCB1cHBlckJvdW5kVmlzaWJpbGl0eSwgcHJvcGVydGllcyk7XG4gICAgdGhpcy5fdmVyaWZ5KCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF92ZXJpZnkoKTogdm9pZCB7XG4gICAgdmFyIGNvdW50ID0gMDtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnlEZWNvcmF0b3IpKSBjb3VudCsrO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5hdHRyaWJ1dGVOYW1lKSkgY291bnQrKztcbiAgICBpZiAoY291bnQgPiAxKVxuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgJ0EgZGlyZWN0aXZlIGluamVjdGFibGUgY2FuIGNvbnRhaW4gb25seSBvbmUgb2YgdGhlIGZvbGxvd2luZyBAQXR0cmlidXRlIG9yIEBRdWVyeS4nKTtcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGVGcm9tKGQ6IERlcGVuZGVuY3kpOiBEZXBlbmRlbmN5IHtcbiAgICByZXR1cm4gbmV3IERpcmVjdGl2ZURlcGVuZGVuY3koXG4gICAgICAgIGQua2V5LCBkLm9wdGlvbmFsLCBkLmxvd2VyQm91bmRWaXNpYmlsaXR5LCBkLnVwcGVyQm91bmRWaXNpYmlsaXR5LCBkLnByb3BlcnRpZXMsXG4gICAgICAgIERpcmVjdGl2ZURlcGVuZGVuY3kuX2F0dHJpYnV0ZU5hbWUoZC5wcm9wZXJ0aWVzKSwgRGlyZWN0aXZlRGVwZW5kZW5jeS5fcXVlcnkoZC5wcm9wZXJ0aWVzKSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHN0YXRpYyBfYXR0cmlidXRlTmFtZShwcm9wZXJ0aWVzOiBhbnlbXSk6IHN0cmluZyB7XG4gICAgdmFyIHAgPSA8QXR0cmlidXRlTWV0YWRhdGE+cHJvcGVydGllcy5maW5kKHAgPT4gcCBpbnN0YW5jZW9mIEF0dHJpYnV0ZU1ldGFkYXRhKTtcbiAgICByZXR1cm4gaXNQcmVzZW50KHApID8gcC5hdHRyaWJ1dGVOYW1lIDogbnVsbDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgc3RhdGljIF9xdWVyeShwcm9wZXJ0aWVzOiBhbnlbXSk6IFF1ZXJ5TWV0YWRhdGEge1xuICAgIHJldHVybiA8UXVlcnlNZXRhZGF0YT5wcm9wZXJ0aWVzLmZpbmQocCA9PiBwIGluc3RhbmNlb2YgUXVlcnlNZXRhZGF0YSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERpcmVjdGl2ZVByb3ZpZGVyIGV4dGVuZHMgUmVzb2x2ZWRQcm92aWRlcl8ge1xuICBwdWJsaWMgY2FsbE9uRGVzdHJveTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihrZXk6IEtleSwgZmFjdG9yeTogRnVuY3Rpb24sIGRlcHM6IERlcGVuZGVuY3lbXSwgcHVibGljIG1ldGFkYXRhOiBEaXJlY3RpdmVNZXRhZGF0YSxcbiAgICAgICAgICAgICAgcHVibGljIHByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+LFxuICAgICAgICAgICAgICBwdWJsaWMgdmlld1Byb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KSB7XG4gICAgc3VwZXIoa2V5LCBbbmV3IFJlc29sdmVkRmFjdG9yeShmYWN0b3J5LCBkZXBzKV0sIGZhbHNlKTtcbiAgICB0aGlzLmNhbGxPbkRlc3Ryb3kgPSBoYXNMaWZlY3ljbGVIb29rKExpZmVjeWNsZUhvb2tzLk9uRGVzdHJveSwga2V5LnRva2VuKTtcbiAgfVxuXG4gIGdldCBkaXNwbGF5TmFtZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5rZXkuZGlzcGxheU5hbWU7IH1cblxuICBnZXQgcXVlcmllcygpOiBRdWVyeU1ldGFkYXRhV2l0aFNldHRlcltdIHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLm1ldGFkYXRhLnF1ZXJpZXMpKSByZXR1cm4gW107XG5cbiAgICB2YXIgcmVzID0gW107XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHRoaXMubWV0YWRhdGEucXVlcmllcywgKG1ldGEsIGZpZWxkTmFtZSkgPT4ge1xuICAgICAgdmFyIHNldHRlciA9IHJlZmxlY3Rvci5zZXR0ZXIoZmllbGROYW1lKTtcbiAgICAgIHJlcy5wdXNoKG5ldyBRdWVyeU1ldGFkYXRhV2l0aFNldHRlcihzZXR0ZXIsIG1ldGEpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgZ2V0IGV2ZW50RW1pdHRlcnMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5tZXRhZGF0YSkgJiYgaXNQcmVzZW50KHRoaXMubWV0YWRhdGEub3V0cHV0cykgPyB0aGlzLm1ldGFkYXRhLm91dHB1dHMgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXTtcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGVGcm9tUHJvdmlkZXIocHJvdmlkZXI6IFByb3ZpZGVyLCBtZXRhOiBEaXJlY3RpdmVNZXRhZGF0YSk6IERpcmVjdGl2ZVByb3ZpZGVyIHtcbiAgICBpZiAoaXNCbGFuayhtZXRhKSkge1xuICAgICAgbWV0YSA9IG5ldyBEaXJlY3RpdmVNZXRhZGF0YSgpO1xuICAgIH1cblxuICAgIHZhciByYiA9IHJlc29sdmVQcm92aWRlcihwcm92aWRlcik7XG4gICAgdmFyIHJmID0gcmIucmVzb2x2ZWRGYWN0b3JpZXNbMF07XG4gICAgdmFyIGRlcHMgPSByZi5kZXBlbmRlbmNpZXMubWFwKERpcmVjdGl2ZURlcGVuZGVuY3kuY3JlYXRlRnJvbSk7XG5cbiAgICB2YXIgcHJvdmlkZXJzID0gaXNQcmVzZW50KG1ldGEucHJvdmlkZXJzKSA/IG1ldGEucHJvdmlkZXJzIDogW107XG4gICAgdmFyIHZpZXdCaW5kaWdzID0gbWV0YSBpbnN0YW5jZW9mIENvbXBvbmVudE1ldGFkYXRhICYmIGlzUHJlc2VudChtZXRhLnZpZXdQcm92aWRlcnMpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YS52aWV3UHJvdmlkZXJzIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgW107XG4gICAgcmV0dXJuIG5ldyBEaXJlY3RpdmVQcm92aWRlcihyYi5rZXksIHJmLmZhY3RvcnksIGRlcHMsIG1ldGEsIHByb3ZpZGVycywgdmlld0JpbmRpZ3MpO1xuICB9XG5cbiAgc3RhdGljIGNyZWF0ZUZyb21UeXBlKHR5cGU6IFR5cGUsIGFubm90YXRpb246IERpcmVjdGl2ZU1ldGFkYXRhKTogRGlyZWN0aXZlUHJvdmlkZXIge1xuICAgIHZhciBwcm92aWRlciA9IG5ldyBQcm92aWRlcih0eXBlLCB7dXNlQ2xhc3M6IHR5cGV9KTtcbiAgICByZXR1cm4gRGlyZWN0aXZlUHJvdmlkZXIuY3JlYXRlRnJvbVByb3ZpZGVyKHByb3ZpZGVyLCBhbm5vdGF0aW9uKTtcbiAgfVxufVxuXG4vLyBUT0RPKHJhZG8pOiBiZW5jaG1hcmsgYW5kIGNvbnNpZGVyIHJvbGxpbmcgaW4gYXMgRWxlbWVudEluamVjdG9yIGZpZWxkcy5cbmV4cG9ydCBjbGFzcyBQcmVCdWlsdE9iamVjdHMge1xuICBuZXN0ZWRWaWV3OiBBcHBWaWV3ID0gbnVsbDtcbiAgY29uc3RydWN0b3IocHVibGljIHZpZXdNYW5hZ2VyOiBhdm1Nb2R1bGUuQXBwVmlld01hbmFnZXIsIHB1YmxpYyB2aWV3OiBBcHBWaWV3LFxuICAgICAgICAgICAgICBwdWJsaWMgZWxlbWVudFJlZjogRWxlbWVudFJlZiwgcHVibGljIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZikge31cbn1cblxuZXhwb3J0IGNsYXNzIFF1ZXJ5TWV0YWRhdGFXaXRoU2V0dGVyIHtcbiAgY29uc3RydWN0b3IocHVibGljIHNldHRlcjogU2V0dGVyRm4sIHB1YmxpYyBtZXRhZGF0YTogUXVlcnlNZXRhZGF0YSkge31cbn1cblxuZXhwb3J0IGNsYXNzIEV2ZW50RW1pdHRlckFjY2Vzc29yIHtcbiAgY29uc3RydWN0b3IocHVibGljIGV2ZW50TmFtZTogc3RyaW5nLCBwdWJsaWMgZ2V0dGVyOiBGdW5jdGlvbikge31cblxuICBzdWJzY3JpYmUodmlldzogQXBwVmlldywgYm91bmRFbGVtZW50SW5kZXg6IG51bWJlciwgZGlyZWN0aXZlOiBPYmplY3QpOiBPYmplY3Qge1xuICAgIHZhciBldmVudEVtaXR0ZXIgPSB0aGlzLmdldHRlcihkaXJlY3RpdmUpO1xuICAgIHJldHVybiBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmU8RXZlbnQ+KFxuICAgICAgICBldmVudEVtaXR0ZXIsXG4gICAgICAgIGV2ZW50T2JqID0+IHZpZXcudHJpZ2dlckV2ZW50SGFuZGxlcnModGhpcy5ldmVudE5hbWUsIGV2ZW50T2JqLCBib3VuZEVsZW1lbnRJbmRleCkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVFdmVudEVtaXR0ZXJBY2Nlc3NvcnMoYnd2OiBQcm92aWRlcldpdGhWaXNpYmlsaXR5KTogRXZlbnRFbWl0dGVyQWNjZXNzb3JbXSB7XG4gIHZhciBwcm92aWRlciA9IGJ3di5wcm92aWRlcjtcbiAgaWYgKCEocHJvdmlkZXIgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlcikpIHJldHVybiBbXTtcbiAgdmFyIGRiID0gPERpcmVjdGl2ZVByb3ZpZGVyPnByb3ZpZGVyO1xuICByZXR1cm4gZGIuZXZlbnRFbWl0dGVycy5tYXAoZXZlbnRDb25maWcgPT4ge1xuICAgIHZhciBwYXJzZWRFdmVudCA9IEV2ZW50Q29uZmlnLnBhcnNlKGV2ZW50Q29uZmlnKTtcbiAgICByZXR1cm4gbmV3IEV2ZW50RW1pdHRlckFjY2Vzc29yKHBhcnNlZEV2ZW50LmV2ZW50TmFtZSwgcmVmbGVjdG9yLmdldHRlcihwYXJzZWRFdmVudC5maWVsZE5hbWUpKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVQcm90b1F1ZXJ5UmVmcyhwcm92aWRlcnM6IFByb3ZpZGVyV2l0aFZpc2liaWxpdHlbXSk6IFByb3RvUXVlcnlSZWZbXSB7XG4gIHZhciByZXMgPSBbXTtcbiAgTGlzdFdyYXBwZXIuZm9yRWFjaFdpdGhJbmRleChwcm92aWRlcnMsIChiLCBpKSA9PiB7XG4gICAgaWYgKGIucHJvdmlkZXIgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlcikge1xuICAgICAgdmFyIGRpcmVjdGl2ZVByb3ZpZGVyID0gPERpcmVjdGl2ZVByb3ZpZGVyPmIucHJvdmlkZXI7XG4gICAgICAvLyBmaWVsZCBxdWVyaWVzXG4gICAgICB2YXIgcXVlcmllczogUXVlcnlNZXRhZGF0YVdpdGhTZXR0ZXJbXSA9IGRpcmVjdGl2ZVByb3ZpZGVyLnF1ZXJpZXM7XG4gICAgICBxdWVyaWVzLmZvckVhY2gocSA9PiByZXMucHVzaChuZXcgUHJvdG9RdWVyeVJlZihpLCBxLnNldHRlciwgcS5tZXRhZGF0YSkpKTtcblxuICAgICAgLy8gcXVlcmllcyBwYXNzZWQgaW50byB0aGUgY29uc3RydWN0b3IuXG4gICAgICAvLyBUT0RPOiByZW1vdmUgdGhpcyBhZnRlciBjb25zdHJ1Y3RvciBxdWVyaWVzIGFyZSBubyBsb25nZXIgc3VwcG9ydGVkXG4gICAgICB2YXIgZGVwczogRGlyZWN0aXZlRGVwZW5kZW5jeVtdID1cbiAgICAgICAgICA8RGlyZWN0aXZlRGVwZW5kZW5jeVtdPmRpcmVjdGl2ZVByb3ZpZGVyLnJlc29sdmVkRmFjdG9yeS5kZXBlbmRlbmNpZXM7XG4gICAgICBkZXBzLmZvckVhY2goZCA9PiB7XG4gICAgICAgIGlmIChpc1ByZXNlbnQoZC5xdWVyeURlY29yYXRvcikpIHJlcy5wdXNoKG5ldyBQcm90b1F1ZXJ5UmVmKGksIG51bGwsIGQucXVlcnlEZWNvcmF0b3IpKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiByZXM7XG59XG5cbmV4cG9ydCBjbGFzcyBQcm90b0VsZW1lbnRJbmplY3RvciB7XG4gIHZpZXc6IEFwcFZpZXc7XG4gIGF0dHJpYnV0ZXM6IE1hcDxzdHJpbmcsIHN0cmluZz47XG4gIGV2ZW50RW1pdHRlckFjY2Vzc29yczogRXZlbnRFbWl0dGVyQWNjZXNzb3JbXVtdO1xuICBwcm90b1F1ZXJ5UmVmczogUHJvdG9RdWVyeVJlZltdO1xuICBwcm90b0luamVjdG9yOiBQcm90b0luamVjdG9yO1xuXG4gIHN0YXRpYyBjcmVhdGUocGFyZW50OiBQcm90b0VsZW1lbnRJbmplY3RvciwgaW5kZXg6IG51bWJlciwgcHJvdmlkZXJzOiBEaXJlY3RpdmVQcm92aWRlcltdLFxuICAgICAgICAgICAgICAgIGZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudDogYm9vbGVhbiwgZGlzdGFuY2VUb1BhcmVudDogbnVtYmVyLFxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZVZhcmlhYmxlQmluZGluZ3M6IE1hcDxzdHJpbmcsIG51bWJlcj4pOiBQcm90b0VsZW1lbnRJbmplY3RvciB7XG4gICAgdmFyIGJkID0gW107XG5cbiAgICBQcm90b0VsZW1lbnRJbmplY3Rvci5fY3JlYXRlRGlyZWN0aXZlUHJvdmlkZXJXaXRoVmlzaWJpbGl0eShwcm92aWRlcnMsIGJkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudCk7XG4gICAgaWYgKGZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudCkge1xuICAgICAgUHJvdG9FbGVtZW50SW5qZWN0b3IuX2NyZWF0ZVZpZXdQcm92aWRlcnNXaXRoVmlzaWJpbGl0eShwcm92aWRlcnMsIGJkKTtcbiAgICB9XG5cbiAgICBQcm90b0VsZW1lbnRJbmplY3Rvci5fY3JlYXRlUHJvdmlkZXJzV2l0aFZpc2liaWxpdHkocHJvdmlkZXJzLCBiZCk7XG4gICAgcmV0dXJuIG5ldyBQcm90b0VsZW1lbnRJbmplY3RvcihwYXJlbnQsIGluZGV4LCBiZCwgZGlzdGFuY2VUb1BhcmVudCwgZmlyc3RQcm92aWRlcklzQ29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlVmFyaWFibGVCaW5kaW5ncyk7XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyBfY3JlYXRlRGlyZWN0aXZlUHJvdmlkZXJXaXRoVmlzaWJpbGl0eShkaXJQcm92aWRlcnM6IERpcmVjdGl2ZVByb3ZpZGVyW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJkOiBQcm92aWRlcldpdGhWaXNpYmlsaXR5W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudDogYm9vbGVhbikge1xuICAgIGRpclByb3ZpZGVycy5mb3JFYWNoKGRpclByb3ZpZGVyID0+IHtcbiAgICAgIGJkLnB1c2goUHJvdG9FbGVtZW50SW5qZWN0b3IuX2NyZWF0ZVByb3ZpZGVyV2l0aFZpc2liaWxpdHkoXG4gICAgICAgICAgZmlyc3RQcm92aWRlcklzQ29tcG9uZW50LCBkaXJQcm92aWRlciwgZGlyUHJvdmlkZXJzLCBkaXJQcm92aWRlcikpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgX2NyZWF0ZVByb3ZpZGVyc1dpdGhWaXNpYmlsaXR5KGRpclByb3ZpZGVyczogRGlyZWN0aXZlUHJvdmlkZXJbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJkOiBQcm92aWRlcldpdGhWaXNpYmlsaXR5W10pIHtcbiAgICB2YXIgcHJvdmlkZXJzRnJvbUFsbERpcmVjdGl2ZXMgPSBbXTtcbiAgICBkaXJQcm92aWRlcnMuZm9yRWFjaChkaXJQcm92aWRlciA9PiB7XG4gICAgICBwcm92aWRlcnNGcm9tQWxsRGlyZWN0aXZlcyA9XG4gICAgICAgICAgTGlzdFdyYXBwZXIuY29uY2F0KHByb3ZpZGVyc0Zyb21BbGxEaXJlY3RpdmVzLCBkaXJQcm92aWRlci5wcm92aWRlcnMpO1xuICAgIH0pO1xuXG4gICAgdmFyIHJlc29sdmVkID0gSW5qZWN0b3IucmVzb2x2ZShwcm92aWRlcnNGcm9tQWxsRGlyZWN0aXZlcyk7XG4gICAgcmVzb2x2ZWQuZm9yRWFjaChiID0+IGJkLnB1c2gobmV3IFByb3ZpZGVyV2l0aFZpc2liaWxpdHkoYiwgVmlzaWJpbGl0eS5QdWJsaWMpKSk7XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyBfY3JlYXRlUHJvdmlkZXJXaXRoVmlzaWJpbGl0eShmaXJzdFByb3ZpZGVySXNDb21wb25lbnQ6IGJvb2xlYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpclByb3ZpZGVyOiBEaXJlY3RpdmVQcm92aWRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyUHJvdmlkZXJzOiBEaXJlY3RpdmVQcm92aWRlcltdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcjogUmVzb2x2ZWRQcm92aWRlcikge1xuICAgIHZhciBpc0NvbXBvbmVudCA9IGZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudCAmJiBkaXJQcm92aWRlcnNbMF0gPT09IGRpclByb3ZpZGVyO1xuICAgIHJldHVybiBuZXcgUHJvdmlkZXJXaXRoVmlzaWJpbGl0eShcbiAgICAgICAgcHJvdmlkZXIsIGlzQ29tcG9uZW50ID8gVmlzaWJpbGl0eS5QdWJsaWNBbmRQcml2YXRlIDogVmlzaWJpbGl0eS5QdWJsaWMpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgX2NyZWF0ZVZpZXdQcm92aWRlcnNXaXRoVmlzaWJpbGl0eShkaXJQcm92aWRlcnM6IERpcmVjdGl2ZVByb3ZpZGVyW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmQ6IFByb3ZpZGVyV2l0aFZpc2liaWxpdHlbXSkge1xuICAgIHZhciByZXNvbHZlZFZpZXdQcm92aWRlcnMgPSBJbmplY3Rvci5yZXNvbHZlKGRpclByb3ZpZGVyc1swXS52aWV3UHJvdmlkZXJzKTtcbiAgICByZXNvbHZlZFZpZXdQcm92aWRlcnMuZm9yRWFjaChiID0+IGJkLnB1c2gobmV3IFByb3ZpZGVyV2l0aFZpc2liaWxpdHkoYiwgVmlzaWJpbGl0eS5Qcml2YXRlKSkpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwdWJsaWMgX2ZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudDogYm9vbGVhbjtcblxuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwYXJlbnQ6IFByb3RvRWxlbWVudEluamVjdG9yLCBwdWJsaWMgaW5kZXg6IG51bWJlcixcbiAgICAgICAgICAgICAgYnd2OiBQcm92aWRlcldpdGhWaXNpYmlsaXR5W10sIHB1YmxpYyBkaXN0YW5jZVRvUGFyZW50OiBudW1iZXIsXG4gICAgICAgICAgICAgIF9maXJzdFByb3ZpZGVySXNDb21wb25lbnQ6IGJvb2xlYW4sXG4gICAgICAgICAgICAgIHB1YmxpYyBkaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzOiBNYXA8c3RyaW5nLCBudW1iZXI+KSB7XG4gICAgdGhpcy5fZmlyc3RQcm92aWRlcklzQ29tcG9uZW50ID0gX2ZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudDtcbiAgICB2YXIgbGVuZ3RoID0gYnd2Lmxlbmd0aDtcbiAgICB0aGlzLnByb3RvSW5qZWN0b3IgPSBuZXcgUHJvdG9JbmplY3Rvcihid3YpO1xuICAgIHRoaXMuZXZlbnRFbWl0dGVyQWNjZXNzb3JzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgICAgdGhpcy5ldmVudEVtaXR0ZXJBY2Nlc3NvcnNbaV0gPSBfY3JlYXRlRXZlbnRFbWl0dGVyQWNjZXNzb3JzKGJ3dltpXSk7XG4gICAgfVxuICAgIHRoaXMucHJvdG9RdWVyeVJlZnMgPSBfY3JlYXRlUHJvdG9RdWVyeVJlZnMoYnd2KTtcbiAgfVxuXG4gIGluc3RhbnRpYXRlKHBhcmVudDogRWxlbWVudEluamVjdG9yKTogRWxlbWVudEluamVjdG9yIHtcbiAgICByZXR1cm4gbmV3IEVsZW1lbnRJbmplY3Rvcih0aGlzLCBwYXJlbnQpO1xuICB9XG5cbiAgZGlyZWN0UGFyZW50KCk6IFByb3RvRWxlbWVudEluamVjdG9yIHsgcmV0dXJuIHRoaXMuZGlzdGFuY2VUb1BhcmVudCA8IDIgPyB0aGlzLnBhcmVudCA6IG51bGw7IH1cblxuICBnZXQgaGFzQmluZGluZ3MoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmV2ZW50RW1pdHRlckFjY2Vzc29ycy5sZW5ndGggPiAwOyB9XG5cbiAgZ2V0UHJvdmlkZXJBdEluZGV4KGluZGV4OiBudW1iZXIpOiBhbnkgeyByZXR1cm4gdGhpcy5wcm90b0luamVjdG9yLmdldFByb3ZpZGVyQXRJbmRleChpbmRleCk7IH1cbn1cblxuY2xhc3MgX0NvbnRleHQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZWxlbWVudDogYW55LCBwdWJsaWMgY29tcG9uZW50RWxlbWVudDogYW55LCBwdWJsaWMgaW5qZWN0b3I6IGFueSkge31cbn1cblxuZXhwb3J0IGNsYXNzIEVsZW1lbnRJbmplY3RvciBleHRlbmRzIFRyZWVOb2RlPEVsZW1lbnRJbmplY3Rvcj4gaW1wbGVtZW50cyBEZXBlbmRlbmN5UHJvdmlkZXIsXG4gICAgQWZ0ZXJWaWV3Q2hlY2tlZCB7XG4gIHByaXZhdGUgX2hvc3Q6IEVsZW1lbnRJbmplY3RvcjtcbiAgcHJpdmF0ZSBfcHJlQnVpbHRPYmplY3RzOiBQcmVCdWlsdE9iamVjdHMgPSBudWxsO1xuICBwcml2YXRlIF9xdWVyeVN0cmF0ZWd5OiBfUXVlcnlTdHJhdGVneTtcblxuICBoeWRyYXRlZDogYm9vbGVhbjtcblxuICBwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3I7XG4gIHByaXZhdGUgX3N0cmF0ZWd5OiBfRWxlbWVudEluamVjdG9yU3RyYXRlZ3k7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIF9wcm90bzogUHJvdG9FbGVtZW50SW5qZWN0b3I7XG5cbiAgY29uc3RydWN0b3IoX3Byb3RvOiBQcm90b0VsZW1lbnRJbmplY3RvciwgcGFyZW50OiBFbGVtZW50SW5qZWN0b3IpIHtcbiAgICBzdXBlcihwYXJlbnQpO1xuICAgIHRoaXMuX3Byb3RvID0gX3Byb3RvO1xuICAgIHRoaXMuX2luamVjdG9yID1cbiAgICAgICAgbmV3IEluamVjdG9yKHRoaXMuX3Byb3RvLnByb3RvSW5qZWN0b3IsIG51bGwsIHRoaXMsICgpID0+IHRoaXMuX2RlYnVnQ29udGV4dCgpKTtcblxuICAgIC8vIHdlIGNvdXBsZSBvdXJzZWx2ZXMgdG8gdGhlIGluamVjdG9yIHN0cmF0ZWd5IHRvIGF2b2lkIHBvbHltb3ByaGljIGNhbGxzXG4gICAgdmFyIGluamVjdG9yU3RyYXRlZ3kgPSA8YW55PnRoaXMuX2luamVjdG9yLmludGVybmFsU3RyYXRlZ3k7XG4gICAgdGhpcy5fc3RyYXRlZ3kgPSBpbmplY3RvclN0cmF0ZWd5IGluc3RhbmNlb2YgSW5qZWN0b3JJbmxpbmVTdHJhdGVneSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5KGluamVjdG9yU3RyYXRlZ3ksIHRoaXMpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRWxlbWVudEluamVjdG9yRHluYW1pY1N0cmF0ZWd5KGluamVjdG9yU3RyYXRlZ3ksIHRoaXMpO1xuXG4gICAgdGhpcy5oeWRyYXRlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5fcXVlcnlTdHJhdGVneSA9IHRoaXMuX2J1aWxkUXVlcnlTdHJhdGVneSgpO1xuICB9XG5cbiAgZGVoeWRyYXRlKCk6IHZvaWQge1xuICAgIHRoaXMuaHlkcmF0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9ob3N0ID0gbnVsbDtcbiAgICB0aGlzLl9wcmVCdWlsdE9iamVjdHMgPSBudWxsO1xuICAgIHRoaXMuX3N0cmF0ZWd5LmNhbGxPbkRlc3Ryb3koKTtcbiAgICB0aGlzLl9zdHJhdGVneS5kZWh5ZHJhdGUoKTtcbiAgICB0aGlzLl9xdWVyeVN0cmF0ZWd5LmRlaHlkcmF0ZSgpO1xuICB9XG5cbiAgaHlkcmF0ZShpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3I6IEluamVjdG9yLCBob3N0OiBFbGVtZW50SW5qZWN0b3IsXG4gICAgICAgICAgcHJlQnVpbHRPYmplY3RzOiBQcmVCdWlsdE9iamVjdHMpOiB2b2lkIHtcbiAgICB0aGlzLl9ob3N0ID0gaG9zdDtcbiAgICB0aGlzLl9wcmVCdWlsdE9iamVjdHMgPSBwcmVCdWlsdE9iamVjdHM7XG5cbiAgICB0aGlzLl9yZWF0dGFjaEluamVjdG9ycyhpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IpO1xuICAgIHRoaXMuX3F1ZXJ5U3RyYXRlZ3kuaHlkcmF0ZSgpO1xuICAgIHRoaXMuX3N0cmF0ZWd5Lmh5ZHJhdGUoKTtcblxuICAgIHRoaXMuaHlkcmF0ZWQgPSB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfZGVidWdDb250ZXh0KCk6IGFueSB7XG4gICAgdmFyIHAgPSB0aGlzLl9wcmVCdWlsdE9iamVjdHM7XG4gICAgdmFyIGluZGV4ID0gcC5lbGVtZW50UmVmLmJvdW5kRWxlbWVudEluZGV4IC0gcC52aWV3LmVsZW1lbnRPZmZzZXQ7XG4gICAgdmFyIGMgPSB0aGlzLl9wcmVCdWlsdE9iamVjdHMudmlldy5nZXREZWJ1Z0NvbnRleHQoaW5kZXgsIG51bGwpO1xuICAgIHJldHVybiBpc1ByZXNlbnQoYykgPyBuZXcgX0NvbnRleHQoYy5lbGVtZW50LCBjLmNvbXBvbmVudEVsZW1lbnQsIGMuaW5qZWN0b3IpIDogbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX3JlYXR0YWNoSW5qZWN0b3JzKGltcGVyYXRpdmVseUNyZWF0ZWRJbmplY3RvcjogSW5qZWN0b3IpOiB2b2lkIHtcbiAgICAvLyBEeW5hbWljYWxseS1sb2FkZWQgY29tcG9uZW50IGluIHRoZSB0ZW1wbGF0ZS4gTm90IGEgcm9vdCBFbGVtZW50SW5qZWN0b3IuXG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9wYXJlbnQpKSB7XG4gICAgICBpZiAoaXNQcmVzZW50KGltcGVyYXRpdmVseUNyZWF0ZWRJbmplY3RvcikpIHtcbiAgICAgICAgLy8gVGhlIGltcGVyYXRpdmUgaW5qZWN0b3IgaXMgc2ltaWxhciB0byBoYXZpbmcgYW4gZWxlbWVudCBiZXR3ZWVuXG4gICAgICAgIC8vIHRoZSBkeW5hbWljLWxvYWRlZCBjb21wb25lbnQgYW5kIGl0cyBwYXJlbnQgPT4gbm8gYm91bmRhcmllcy5cbiAgICAgICAgdGhpcy5fcmVhdHRhY2hJbmplY3Rvcih0aGlzLl9pbmplY3RvciwgaW1wZXJhdGl2ZWx5Q3JlYXRlZEluamVjdG9yLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuX3JlYXR0YWNoSW5qZWN0b3IoaW1wZXJhdGl2ZWx5Q3JlYXRlZEluamVjdG9yLCB0aGlzLl9wYXJlbnQuX2luamVjdG9yLCBmYWxzZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9yZWF0dGFjaEluamVjdG9yKHRoaXMuX2luamVjdG9yLCB0aGlzLl9wYXJlbnQuX2luamVjdG9yLCBmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIER5bmFtaWNhbGx5LWxvYWRlZCBjb21wb25lbnQgaW4gdGhlIHRlbXBsYXRlLiBBIHJvb3QgRWxlbWVudEluamVjdG9yLlxuICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHRoaXMuX2hvc3QpKSB7XG4gICAgICAvLyBUaGUgaW1wZXJhdGl2ZSBpbmplY3RvciBpcyBzaW1pbGFyIHRvIGhhdmluZyBhbiBlbGVtZW50IGJldHdlZW5cbiAgICAgIC8vIHRoZSBkeW5hbWljLWxvYWRlZCBjb21wb25lbnQgYW5kIGl0cyBwYXJlbnQgPT4gbm8gYm91bmRhcnkgYmV0d2VlblxuICAgICAgLy8gdGhlIGNvbXBvbmVudCBhbmQgaW1wZXJhdGl2ZWx5Q3JlYXRlZEluamVjdG9yLlxuICAgICAgLy8gQnV0IHNpbmNlIGl0IGlzIGEgcm9vdCBFbGVtZW50SW5qZWN0b3IsIHdlIG5lZWQgdG8gY3JlYXRlIGEgYm91bmRhcnlcbiAgICAgIC8vIGJldHdlZW4gaW1wZXJhdGl2ZWx5Q3JlYXRlZEluamVjdG9yIGFuZCBfaG9zdC5cbiAgICAgIGlmIChpc1ByZXNlbnQoaW1wZXJhdGl2ZWx5Q3JlYXRlZEluamVjdG9yKSkge1xuICAgICAgICB0aGlzLl9yZWF0dGFjaEluamVjdG9yKHRoaXMuX2luamVjdG9yLCBpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5fcmVhdHRhY2hJbmplY3RvcihpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IsIHRoaXMuX2hvc3QuX2luamVjdG9yLCB0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3JlYXR0YWNoSW5qZWN0b3IodGhpcy5faW5qZWN0b3IsIHRoaXMuX2hvc3QuX2luamVjdG9yLCB0cnVlKTtcbiAgICAgIH1cblxuICAgICAgLy8gQm9vdHN0cmFwXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpc1ByZXNlbnQoaW1wZXJhdGl2ZWx5Q3JlYXRlZEluamVjdG9yKSkge1xuICAgICAgICB0aGlzLl9yZWF0dGFjaEluamVjdG9yKHRoaXMuX2luamVjdG9yLCBpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IsIHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3JlYXR0YWNoSW5qZWN0b3IoaW5qZWN0b3I6IEluamVjdG9yLCBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IsIGlzQm91bmRhcnk6IGJvb2xlYW4pIHtcbiAgICBpbmplY3Rvci5pbnRlcm5hbFN0cmF0ZWd5LmF0dGFjaChwYXJlbnRJbmplY3RvciwgaXNCb3VuZGFyeSk7XG4gIH1cblxuICBoYXNWYXJpYWJsZUJpbmRpbmcobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdmFyIHZiID0gdGhpcy5fcHJvdG8uZGlyZWN0aXZlVmFyaWFibGVCaW5kaW5ncztcbiAgICByZXR1cm4gaXNQcmVzZW50KHZiKSAmJiB2Yi5oYXMobmFtZSk7XG4gIH1cblxuICBnZXRWYXJpYWJsZUJpbmRpbmcobmFtZTogc3RyaW5nKTogYW55IHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9wcm90by5kaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzLmdldChuYW1lKTtcbiAgICByZXR1cm4gaXNQcmVzZW50KGluZGV4KSA/IHRoaXMuZ2V0RGlyZWN0aXZlQXRJbmRleCg8bnVtYmVyPmluZGV4KSA6IHRoaXMuZ2V0RWxlbWVudFJlZigpO1xuICB9XG5cbiAgZ2V0KHRva2VuOiBhbnkpOiBhbnkgeyByZXR1cm4gdGhpcy5faW5qZWN0b3IuZ2V0KHRva2VuKTsgfVxuXG4gIGhhc0RpcmVjdGl2ZSh0eXBlOiBUeXBlKTogYm9vbGVhbiB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5faW5qZWN0b3IuZ2V0T3B0aW9uYWwodHlwZSkpOyB9XG5cbiAgZ2V0RXZlbnRFbWl0dGVyQWNjZXNzb3JzKCk6IEV2ZW50RW1pdHRlckFjY2Vzc29yW11bXSB7IHJldHVybiB0aGlzLl9wcm90by5ldmVudEVtaXR0ZXJBY2Nlc3NvcnM7IH1cblxuICBnZXREaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzKCk6IE1hcDxzdHJpbmcsIG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLl9wcm90by5kaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzO1xuICB9XG5cbiAgZ2V0Q29tcG9uZW50KCk6IGFueSB7IHJldHVybiB0aGlzLl9zdHJhdGVneS5nZXRDb21wb25lbnQoKTsgfVxuXG4gIGdldEluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIHRoaXMuX2luamVjdG9yOyB9XG5cbiAgZ2V0RWxlbWVudFJlZigpOiBFbGVtZW50UmVmIHsgcmV0dXJuIHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy5lbGVtZW50UmVmOyB9XG5cbiAgZ2V0Vmlld0NvbnRhaW5lclJlZigpOiBWaWV3Q29udGFpbmVyUmVmIHtcbiAgICByZXR1cm4gbmV3IFZpZXdDb250YWluZXJSZWZfKHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy52aWV3TWFuYWdlciwgdGhpcy5nZXRFbGVtZW50UmVmKCkpO1xuICB9XG5cbiAgZ2V0TmVzdGVkVmlldygpOiBBcHBWaWV3IHsgcmV0dXJuIHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy5uZXN0ZWRWaWV3OyB9XG5cbiAgZ2V0VmlldygpOiBBcHBWaWV3IHsgcmV0dXJuIHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy52aWV3OyB9XG5cbiAgZGlyZWN0UGFyZW50KCk6IEVsZW1lbnRJbmplY3RvciB7IHJldHVybiB0aGlzLl9wcm90by5kaXN0YW5jZVRvUGFyZW50IDwgMiA/IHRoaXMucGFyZW50IDogbnVsbDsgfVxuXG4gIGlzQ29tcG9uZW50S2V5KGtleTogS2V5KTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9zdHJhdGVneS5pc0NvbXBvbmVudEtleShrZXkpOyB9XG5cbiAgZ2V0RGVwZW5kZW5jeShpbmplY3RvcjogSW5qZWN0b3IsIHByb3ZpZGVyOiBSZXNvbHZlZFByb3ZpZGVyLCBkZXA6IERlcGVuZGVuY3kpOiBhbnkge1xuICAgIHZhciBrZXk6IEtleSA9IGRlcC5rZXk7XG5cbiAgICBpZiAocHJvdmlkZXIgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlcikge1xuICAgICAgdmFyIGRpckRlcCA9IDxEaXJlY3RpdmVEZXBlbmRlbmN5PmRlcDtcbiAgICAgIHZhciBkaXJQcm92aWRlciA9IHByb3ZpZGVyO1xuICAgICAgdmFyIHN0YXRpY0tleXMgPSBTdGF0aWNLZXlzLmluc3RhbmNlKCk7XG5cblxuICAgICAgaWYgKGtleS5pZCA9PT0gc3RhdGljS2V5cy52aWV3TWFuYWdlcklkKSByZXR1cm4gdGhpcy5fcHJlQnVpbHRPYmplY3RzLnZpZXdNYW5hZ2VyO1xuXG4gICAgICBpZiAoaXNQcmVzZW50KGRpckRlcC5hdHRyaWJ1dGVOYW1lKSkgcmV0dXJuIHRoaXMuX2J1aWxkQXR0cmlidXRlKGRpckRlcCk7XG5cbiAgICAgIGlmIChpc1ByZXNlbnQoZGlyRGVwLnF1ZXJ5RGVjb3JhdG9yKSlcbiAgICAgICAgcmV0dXJuIHRoaXMuX3F1ZXJ5U3RyYXRlZ3kuZmluZFF1ZXJ5KGRpckRlcC5xdWVyeURlY29yYXRvcikubGlzdDtcblxuICAgICAgaWYgKGRpckRlcC5rZXkuaWQgPT09IFN0YXRpY0tleXMuaW5zdGFuY2UoKS5jaGFuZ2VEZXRlY3RvclJlZklkKSB7XG4gICAgICAgIC8vIFdlIHByb3ZpZGUgdGhlIGNvbXBvbmVudCdzIHZpZXcgY2hhbmdlIGRldGVjdG9yIHRvIGNvbXBvbmVudHMgYW5kXG4gICAgICAgIC8vIHRoZSBzdXJyb3VuZGluZyBjb21wb25lbnQncyBjaGFuZ2UgZGV0ZWN0b3IgdG8gZGlyZWN0aXZlcy5cbiAgICAgICAgaWYgKGRpclByb3ZpZGVyLm1ldGFkYXRhIGluc3RhbmNlb2YgQ29tcG9uZW50TWV0YWRhdGEpIHtcbiAgICAgICAgICB2YXIgY29tcG9uZW50VmlldyA9IHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy52aWV3LmdldE5lc3RlZFZpZXcoXG4gICAgICAgICAgICAgIHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy5lbGVtZW50UmVmLmJvdW5kRWxlbWVudEluZGV4KTtcbiAgICAgICAgICByZXR1cm4gY29tcG9uZW50Vmlldy5jaGFuZ2VEZXRlY3Rvci5yZWY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy52aWV3LmNoYW5nZURldGVjdG9yLnJlZjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZGlyRGVwLmtleS5pZCA9PT0gU3RhdGljS2V5cy5pbnN0YW5jZSgpLmVsZW1lbnRSZWZJZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRFbGVtZW50UmVmKCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChkaXJEZXAua2V5LmlkID09PSBTdGF0aWNLZXlzLmluc3RhbmNlKCkudmlld0NvbnRhaW5lcklkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFZpZXdDb250YWluZXJSZWYoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRpckRlcC5rZXkuaWQgPT09IFN0YXRpY0tleXMuaW5zdGFuY2UoKS50ZW1wbGF0ZVJlZklkKSB7XG4gICAgICAgIGlmIChpc0JsYW5rKHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy50ZW1wbGF0ZVJlZikpIHtcbiAgICAgICAgICBpZiAoZGlyRGVwLm9wdGlvbmFsKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aHJvdyBuZXcgTm9Qcm92aWRlckVycm9yKG51bGwsIGRpckRlcC5rZXkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9wcmVCdWlsdE9iamVjdHMudGVtcGxhdGVSZWY7XG4gICAgICB9XG5cbiAgICB9IGVsc2UgaWYgKHByb3ZpZGVyIGluc3RhbmNlb2YgUGlwZVByb3ZpZGVyKSB7XG4gICAgICBpZiAoZGVwLmtleS5pZCA9PT0gU3RhdGljS2V5cy5pbnN0YW5jZSgpLmNoYW5nZURldGVjdG9yUmVmSWQpIHtcbiAgICAgICAgdmFyIGNvbXBvbmVudFZpZXcgPSB0aGlzLl9wcmVCdWlsdE9iamVjdHMudmlldy5nZXROZXN0ZWRWaWV3KFxuICAgICAgICAgICAgdGhpcy5fcHJlQnVpbHRPYmplY3RzLmVsZW1lbnRSZWYuYm91bmRFbGVtZW50SW5kZXgpO1xuICAgICAgICByZXR1cm4gY29tcG9uZW50Vmlldy5jaGFuZ2VEZXRlY3Rvci5yZWY7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFVOREVGSU5FRDtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkQXR0cmlidXRlKGRlcDogRGlyZWN0aXZlRGVwZW5kZW5jeSk6IHN0cmluZyB7XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSB0aGlzLl9wcm90by5hdHRyaWJ1dGVzO1xuICAgIGlmIChpc1ByZXNlbnQoYXR0cmlidXRlcykgJiYgYXR0cmlidXRlcy5oYXMoZGVwLmF0dHJpYnV0ZU5hbWUpKSB7XG4gICAgICByZXR1cm4gYXR0cmlidXRlcy5nZXQoZGVwLmF0dHJpYnV0ZU5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBhZGREaXJlY3RpdmVzTWF0Y2hpbmdRdWVyeShxdWVyeTogUXVlcnlNZXRhZGF0YSwgbGlzdDogYW55W10pOiB2b2lkIHtcbiAgICB2YXIgdGVtcGxhdGVSZWYgPSBpc0JsYW5rKHRoaXMuX3ByZUJ1aWx0T2JqZWN0cykgPyBudWxsIDogdGhpcy5fcHJlQnVpbHRPYmplY3RzLnRlbXBsYXRlUmVmO1xuICAgIGlmIChxdWVyeS5zZWxlY3RvciA9PT0gVGVtcGxhdGVSZWYgJiYgaXNQcmVzZW50KHRlbXBsYXRlUmVmKSkge1xuICAgICAgbGlzdC5wdXNoKHRlbXBsYXRlUmVmKTtcbiAgICB9XG4gICAgdGhpcy5fc3RyYXRlZ3kuYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkocXVlcnksIGxpc3QpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRRdWVyeVN0cmF0ZWd5KCk6IF9RdWVyeVN0cmF0ZWd5IHtcbiAgICBpZiAodGhpcy5fcHJvdG8ucHJvdG9RdWVyeVJlZnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gX2VtcHR5UXVlcnlTdHJhdGVneTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3Byb3RvLnByb3RvUXVlcnlSZWZzLmxlbmd0aCA8PVxuICAgICAgICAgICAgICAgSW5saW5lUXVlcnlTdHJhdGVneS5OVU1CRVJfT0ZfU1VQUE9SVEVEX1FVRVJJRVMpIHtcbiAgICAgIHJldHVybiBuZXcgSW5saW5lUXVlcnlTdHJhdGVneSh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBEeW5hbWljUXVlcnlTdHJhdGVneSh0aGlzKTtcbiAgICB9XG4gIH1cblxuICBsaW5rKHBhcmVudDogRWxlbWVudEluamVjdG9yKTogdm9pZCB7IHBhcmVudC5hZGRDaGlsZCh0aGlzKTsgfVxuXG4gIHVubGluaygpOiB2b2lkIHsgdGhpcy5yZW1vdmUoKTsgfVxuXG4gIGdldERpcmVjdGl2ZUF0SW5kZXgoaW5kZXg6IG51bWJlcik6IGFueSB7IHJldHVybiB0aGlzLl9pbmplY3Rvci5nZXRBdChpbmRleCk7IH1cblxuICBoYXNJbnN0YW5jZXMoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9wcm90by5oYXNCaW5kaW5ncyAmJiB0aGlzLmh5ZHJhdGVkOyB9XG5cbiAgZ2V0SG9zdCgpOiBFbGVtZW50SW5qZWN0b3IgeyByZXR1cm4gdGhpcy5faG9zdDsgfVxuXG4gIGdldEJvdW5kRWxlbWVudEluZGV4KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9wcm90by5pbmRleDsgfVxuXG4gIGdldFJvb3RWaWV3SW5qZWN0b3JzKCk6IEVsZW1lbnRJbmplY3RvcltdIHtcbiAgICBpZiAoIXRoaXMuaHlkcmF0ZWQpIHJldHVybiBbXTtcbiAgICB2YXIgdmlldyA9IHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy52aWV3O1xuICAgIHZhciBuZXN0ZWRWaWV3ID0gdmlldy5nZXROZXN0ZWRWaWV3KHZpZXcuZWxlbWVudE9mZnNldCArIHRoaXMuZ2V0Qm91bmRFbGVtZW50SW5kZXgoKSk7XG4gICAgcmV0dXJuIGlzUHJlc2VudChuZXN0ZWRWaWV3KSA/IG5lc3RlZFZpZXcucm9vdEVsZW1lbnRJbmplY3RvcnMgOiBbXTtcbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3Q2hlY2tlZCgpOiB2b2lkIHsgdGhpcy5fcXVlcnlTdHJhdGVneS51cGRhdGVWaWV3UXVlcmllcygpOyB9XG5cbiAgbmdBZnRlckNvbnRlbnRDaGVja2VkKCk6IHZvaWQgeyB0aGlzLl9xdWVyeVN0cmF0ZWd5LnVwZGF0ZUNvbnRlbnRRdWVyaWVzKCk7IH1cblxuICB0cmF2ZXJzZUFuZFNldFF1ZXJpZXNBc0RpcnR5KCk6IHZvaWQge1xuICAgIHZhciBpbmo6IEVsZW1lbnRJbmplY3RvciA9IHRoaXM7XG4gICAgd2hpbGUgKGlzUHJlc2VudChpbmopKSB7XG4gICAgICBpbmouX3NldFF1ZXJpZXNBc0RpcnR5KCk7XG4gICAgICBpbmogPSBpbmoucGFyZW50O1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3NldFF1ZXJpZXNBc0RpcnR5KCk6IHZvaWQge1xuICAgIHRoaXMuX3F1ZXJ5U3RyYXRlZ3kuc2V0Q29udGVudFF1ZXJpZXNBc0RpcnR5KCk7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9ob3N0KSkgdGhpcy5faG9zdC5fcXVlcnlTdHJhdGVneS5zZXRWaWV3UXVlcmllc0FzRGlydHkoKTtcbiAgfVxufVxuXG5pbnRlcmZhY2UgX1F1ZXJ5U3RyYXRlZ3kge1xuICBzZXRDb250ZW50UXVlcmllc0FzRGlydHkoKTogdm9pZDtcbiAgc2V0Vmlld1F1ZXJpZXNBc0RpcnR5KCk6IHZvaWQ7XG4gIGh5ZHJhdGUoKTogdm9pZDtcbiAgZGVoeWRyYXRlKCk6IHZvaWQ7XG4gIHVwZGF0ZUNvbnRlbnRRdWVyaWVzKCk6IHZvaWQ7XG4gIHVwZGF0ZVZpZXdRdWVyaWVzKCk6IHZvaWQ7XG4gIGZpbmRRdWVyeShxdWVyeTogUXVlcnlNZXRhZGF0YSk6IFF1ZXJ5UmVmO1xufVxuXG5jbGFzcyBfRW1wdHlRdWVyeVN0cmF0ZWd5IGltcGxlbWVudHMgX1F1ZXJ5U3RyYXRlZ3kge1xuICBzZXRDb250ZW50UXVlcmllc0FzRGlydHkoKTogdm9pZCB7fVxuICBzZXRWaWV3UXVlcmllc0FzRGlydHkoKTogdm9pZCB7fVxuICBoeWRyYXRlKCk6IHZvaWQge31cbiAgZGVoeWRyYXRlKCk6IHZvaWQge31cbiAgdXBkYXRlQ29udGVudFF1ZXJpZXMoKTogdm9pZCB7fVxuICB1cGRhdGVWaWV3UXVlcmllcygpOiB2b2lkIHt9XG4gIGZpbmRRdWVyeShxdWVyeTogUXVlcnlNZXRhZGF0YSk6IFF1ZXJ5UmVmIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgQ2Fubm90IGZpbmQgcXVlcnkgZm9yIGRpcmVjdGl2ZSAke3F1ZXJ5fS5gKTtcbiAgfVxufVxuXG52YXIgX2VtcHR5UXVlcnlTdHJhdGVneSA9IG5ldyBfRW1wdHlRdWVyeVN0cmF0ZWd5KCk7XG5cbmNsYXNzIElubGluZVF1ZXJ5U3RyYXRlZ3kgaW1wbGVtZW50cyBfUXVlcnlTdHJhdGVneSB7XG4gIHN0YXRpYyBOVU1CRVJfT0ZfU1VQUE9SVEVEX1FVRVJJRVMgPSAzO1xuXG4gIHF1ZXJ5MDogUXVlcnlSZWY7XG4gIHF1ZXJ5MTogUXVlcnlSZWY7XG4gIHF1ZXJ5MjogUXVlcnlSZWY7XG5cbiAgY29uc3RydWN0b3IoZWk6IEVsZW1lbnRJbmplY3Rvcikge1xuICAgIHZhciBwcm90b1JlZnMgPSBlaS5fcHJvdG8ucHJvdG9RdWVyeVJlZnM7XG4gICAgaWYgKHByb3RvUmVmcy5sZW5ndGggPiAwKSB0aGlzLnF1ZXJ5MCA9IG5ldyBRdWVyeVJlZihwcm90b1JlZnNbMF0sIGVpKTtcbiAgICBpZiAocHJvdG9SZWZzLmxlbmd0aCA+IDEpIHRoaXMucXVlcnkxID0gbmV3IFF1ZXJ5UmVmKHByb3RvUmVmc1sxXSwgZWkpO1xuICAgIGlmIChwcm90b1JlZnMubGVuZ3RoID4gMikgdGhpcy5xdWVyeTIgPSBuZXcgUXVlcnlSZWYocHJvdG9SZWZzWzJdLCBlaSk7XG4gIH1cblxuICBzZXRDb250ZW50UXVlcmllc0FzRGlydHkoKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MCkgJiYgIXRoaXMucXVlcnkwLmlzVmlld1F1ZXJ5KSB0aGlzLnF1ZXJ5MC5kaXJ0eSA9IHRydWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MSkgJiYgIXRoaXMucXVlcnkxLmlzVmlld1F1ZXJ5KSB0aGlzLnF1ZXJ5MS5kaXJ0eSA9IHRydWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MikgJiYgIXRoaXMucXVlcnkyLmlzVmlld1F1ZXJ5KSB0aGlzLnF1ZXJ5Mi5kaXJ0eSA9IHRydWU7XG4gIH1cblxuICBzZXRWaWV3UXVlcmllc0FzRGlydHkoKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MCkgJiYgdGhpcy5xdWVyeTAuaXNWaWV3UXVlcnkpIHRoaXMucXVlcnkwLmRpcnR5ID0gdHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkxKSAmJiB0aGlzLnF1ZXJ5MS5pc1ZpZXdRdWVyeSkgdGhpcy5xdWVyeTEuZGlydHkgPSB0cnVlO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTIpICYmIHRoaXMucXVlcnkyLmlzVmlld1F1ZXJ5KSB0aGlzLnF1ZXJ5Mi5kaXJ0eSA9IHRydWU7XG4gIH1cblxuICBoeWRyYXRlKCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTApKSB0aGlzLnF1ZXJ5MC5oeWRyYXRlKCk7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MSkpIHRoaXMucXVlcnkxLmh5ZHJhdGUoKTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkyKSkgdGhpcy5xdWVyeTIuaHlkcmF0ZSgpO1xuICB9XG5cbiAgZGVoeWRyYXRlKCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTApKSB0aGlzLnF1ZXJ5MC5kZWh5ZHJhdGUoKTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkxKSkgdGhpcy5xdWVyeTEuZGVoeWRyYXRlKCk7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MikpIHRoaXMucXVlcnkyLmRlaHlkcmF0ZSgpO1xuICB9XG5cbiAgdXBkYXRlQ29udGVudFF1ZXJpZXMoKSB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MCkgJiYgIXRoaXMucXVlcnkwLmlzVmlld1F1ZXJ5KSB7XG4gICAgICB0aGlzLnF1ZXJ5MC51cGRhdGUoKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MSkgJiYgIXRoaXMucXVlcnkxLmlzVmlld1F1ZXJ5KSB7XG4gICAgICB0aGlzLnF1ZXJ5MS51cGRhdGUoKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MikgJiYgIXRoaXMucXVlcnkyLmlzVmlld1F1ZXJ5KSB7XG4gICAgICB0aGlzLnF1ZXJ5Mi51cGRhdGUoKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVWaWV3UXVlcmllcygpIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkwKSAmJiB0aGlzLnF1ZXJ5MC5pc1ZpZXdRdWVyeSkge1xuICAgICAgdGhpcy5xdWVyeTAudXBkYXRlKCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTEpICYmIHRoaXMucXVlcnkxLmlzVmlld1F1ZXJ5KSB7XG4gICAgICB0aGlzLnF1ZXJ5MS51cGRhdGUoKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MikgJiYgdGhpcy5xdWVyeTIuaXNWaWV3UXVlcnkpIHtcbiAgICAgIHRoaXMucXVlcnkyLnVwZGF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIGZpbmRRdWVyeShxdWVyeTogUXVlcnlNZXRhZGF0YSk6IFF1ZXJ5UmVmIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkwKSAmJiB0aGlzLnF1ZXJ5MC5wcm90b1F1ZXJ5UmVmLnF1ZXJ5ID09PSBxdWVyeSkge1xuICAgICAgcmV0dXJuIHRoaXMucXVlcnkwO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkxKSAmJiB0aGlzLnF1ZXJ5MS5wcm90b1F1ZXJ5UmVmLnF1ZXJ5ID09PSBxdWVyeSkge1xuICAgICAgcmV0dXJuIHRoaXMucXVlcnkxO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkyKSAmJiB0aGlzLnF1ZXJ5Mi5wcm90b1F1ZXJ5UmVmLnF1ZXJ5ID09PSBxdWVyeSkge1xuICAgICAgcmV0dXJuIHRoaXMucXVlcnkyO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgQ2Fubm90IGZpbmQgcXVlcnkgZm9yIGRpcmVjdGl2ZSAke3F1ZXJ5fS5gKTtcbiAgfVxufVxuXG5jbGFzcyBEeW5hbWljUXVlcnlTdHJhdGVneSBpbXBsZW1lbnRzIF9RdWVyeVN0cmF0ZWd5IHtcbiAgcXVlcmllczogUXVlcnlSZWZbXTtcblxuICBjb25zdHJ1Y3RvcihlaTogRWxlbWVudEluamVjdG9yKSB7XG4gICAgdGhpcy5xdWVyaWVzID0gZWkuX3Byb3RvLnByb3RvUXVlcnlSZWZzLm1hcChwID0+IG5ldyBRdWVyeVJlZihwLCBlaSkpO1xuICB9XG5cbiAgc2V0Q29udGVudFF1ZXJpZXNBc0RpcnR5KCk6IHZvaWQge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5xdWVyaWVzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgcSA9IHRoaXMucXVlcmllc1tpXTtcbiAgICAgIGlmICghcS5pc1ZpZXdRdWVyeSkgcS5kaXJ0eSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgc2V0Vmlld1F1ZXJpZXNBc0RpcnR5KCk6IHZvaWQge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5xdWVyaWVzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgcSA9IHRoaXMucXVlcmllc1tpXTtcbiAgICAgIGlmIChxLmlzVmlld1F1ZXJ5KSBxLmRpcnR5ID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBoeWRyYXRlKCk6IHZvaWQge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5xdWVyaWVzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgcSA9IHRoaXMucXVlcmllc1tpXTtcbiAgICAgIHEuaHlkcmF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIGRlaHlkcmF0ZSgpOiB2b2lkIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVlcmllcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHEgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICBxLmRlaHlkcmF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZUNvbnRlbnRRdWVyaWVzKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5xdWVyaWVzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgcSA9IHRoaXMucXVlcmllc1tpXTtcbiAgICAgIGlmICghcS5pc1ZpZXdRdWVyeSkge1xuICAgICAgICBxLnVwZGF0ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVZpZXdRdWVyaWVzKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5xdWVyaWVzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgcSA9IHRoaXMucXVlcmllc1tpXTtcbiAgICAgIGlmIChxLmlzVmlld1F1ZXJ5KSB7XG4gICAgICAgIHEudXBkYXRlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZmluZFF1ZXJ5KHF1ZXJ5OiBRdWVyeU1ldGFkYXRhKTogUXVlcnlSZWYge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5xdWVyaWVzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgcSA9IHRoaXMucXVlcmllc1tpXTtcbiAgICAgIGlmIChxLnByb3RvUXVlcnlSZWYucXVlcnkgPT09IHF1ZXJ5KSB7XG4gICAgICAgIHJldHVybiBxO1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgQ2Fubm90IGZpbmQgcXVlcnkgZm9yIGRpcmVjdGl2ZSAke3F1ZXJ5fS5gKTtcbiAgfVxufVxuXG5pbnRlcmZhY2UgX0VsZW1lbnRJbmplY3RvclN0cmF0ZWd5IHtcbiAgY2FsbE9uRGVzdHJveSgpOiB2b2lkO1xuICBnZXRDb21wb25lbnQoKTogYW55O1xuICBpc0NvbXBvbmVudEtleShrZXk6IEtleSk6IGJvb2xlYW47XG4gIGFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5KHE6IFF1ZXJ5TWV0YWRhdGEsIHJlczogYW55W10pOiB2b2lkO1xuICBoeWRyYXRlKCk6IHZvaWQ7XG4gIGRlaHlkcmF0ZSgpOiB2b2lkO1xufVxuXG4vKipcbiAqIFN0cmF0ZWd5IHVzZWQgYnkgdGhlIGBFbGVtZW50SW5qZWN0b3JgIHdoZW4gdGhlIG51bWJlciBvZiBwcm92aWRlcnMgaXMgMTAgb3IgbGVzcy5cbiAqIEluIHN1Y2ggYSBjYXNlLCBpbmxpbmluZyBmaWVsZHMgaXMgYmVuZWZpY2lhbCBmb3IgcGVyZm9ybWFuY2VzLlxuICovXG5jbGFzcyBFbGVtZW50SW5qZWN0b3JJbmxpbmVTdHJhdGVneSBpbXBsZW1lbnRzIF9FbGVtZW50SW5qZWN0b3JTdHJhdGVneSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbmplY3RvclN0cmF0ZWd5OiBJbmplY3RvcklubGluZVN0cmF0ZWd5LCBwdWJsaWMgX2VpOiBFbGVtZW50SW5qZWN0b3IpIHt9XG5cbiAgaHlkcmF0ZSgpOiB2b2lkIHtcbiAgICB2YXIgaSA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneTtcbiAgICB2YXIgcCA9IGkucHJvdG9TdHJhdGVneTtcbiAgICBpLnJlc2V0Q29uc3RydWN0aW9uQ291bnRlcigpO1xuXG4gICAgaWYgKHAucHJvdmlkZXIwIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWQwKSAmJiBpLm9iajAgPT09IFVOREVGSU5FRClcbiAgICAgIGkub2JqMCA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyMCwgcC52aXNpYmlsaXR5MCk7XG4gICAgaWYgKHAucHJvdmlkZXIxIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWQxKSAmJiBpLm9iajEgPT09IFVOREVGSU5FRClcbiAgICAgIGkub2JqMSA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyMSwgcC52aXNpYmlsaXR5MSk7XG4gICAgaWYgKHAucHJvdmlkZXIyIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWQyKSAmJiBpLm9iajIgPT09IFVOREVGSU5FRClcbiAgICAgIGkub2JqMiA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyMiwgcC52aXNpYmlsaXR5Mik7XG4gICAgaWYgKHAucHJvdmlkZXIzIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWQzKSAmJiBpLm9iajMgPT09IFVOREVGSU5FRClcbiAgICAgIGkub2JqMyA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyMywgcC52aXNpYmlsaXR5Myk7XG4gICAgaWYgKHAucHJvdmlkZXI0IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWQ0KSAmJiBpLm9iajQgPT09IFVOREVGSU5FRClcbiAgICAgIGkub2JqNCA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyNCwgcC52aXNpYmlsaXR5NCk7XG4gICAgaWYgKHAucHJvdmlkZXI1IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWQ1KSAmJiBpLm9iajUgPT09IFVOREVGSU5FRClcbiAgICAgIGkub2JqNSA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyNSwgcC52aXNpYmlsaXR5NSk7XG4gICAgaWYgKHAucHJvdmlkZXI2IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWQ2KSAmJiBpLm9iajYgPT09IFVOREVGSU5FRClcbiAgICAgIGkub2JqNiA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyNiwgcC52aXNpYmlsaXR5Nik7XG4gICAgaWYgKHAucHJvdmlkZXI3IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWQ3KSAmJiBpLm9iajcgPT09IFVOREVGSU5FRClcbiAgICAgIGkub2JqNyA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyNywgcC52aXNpYmlsaXR5Nyk7XG4gICAgaWYgKHAucHJvdmlkZXI4IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWQ4KSAmJiBpLm9iajggPT09IFVOREVGSU5FRClcbiAgICAgIGkub2JqOCA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyOCwgcC52aXNpYmlsaXR5OCk7XG4gICAgaWYgKHAucHJvdmlkZXI5IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWQ5KSAmJiBpLm9iajkgPT09IFVOREVGSU5FRClcbiAgICAgIGkub2JqOSA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyOSwgcC52aXNpYmlsaXR5OSk7XG4gIH1cblxuICBkZWh5ZHJhdGUoKSB7XG4gICAgdmFyIGkgPSB0aGlzLmluamVjdG9yU3RyYXRlZ3k7XG5cbiAgICBpLm9iajAgPSBVTkRFRklORUQ7XG4gICAgaS5vYmoxID0gVU5ERUZJTkVEO1xuICAgIGkub2JqMiA9IFVOREVGSU5FRDtcbiAgICBpLm9iajMgPSBVTkRFRklORUQ7XG4gICAgaS5vYmo0ID0gVU5ERUZJTkVEO1xuICAgIGkub2JqNSA9IFVOREVGSU5FRDtcbiAgICBpLm9iajYgPSBVTkRFRklORUQ7XG4gICAgaS5vYmo3ID0gVU5ERUZJTkVEO1xuICAgIGkub2JqOCA9IFVOREVGSU5FRDtcbiAgICBpLm9iajkgPSBVTkRFRklORUQ7XG4gIH1cblxuICBjYWxsT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHZhciBpID0gdGhpcy5pbmplY3RvclN0cmF0ZWd5O1xuICAgIHZhciBwID0gaS5wcm90b1N0cmF0ZWd5O1xuXG4gICAgaWYgKHAucHJvdmlkZXIwIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiZcbiAgICAgICAgKDxEaXJlY3RpdmVQcm92aWRlcj5wLnByb3ZpZGVyMCkuY2FsbE9uRGVzdHJveSkge1xuICAgICAgaS5vYmowLm5nT25EZXN0cm95KCk7XG4gICAgfVxuICAgIGlmIChwLnByb3ZpZGVyMSBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmXG4gICAgICAgICg8RGlyZWN0aXZlUHJvdmlkZXI+cC5wcm92aWRlcjEpLmNhbGxPbkRlc3Ryb3kpIHtcbiAgICAgIGkub2JqMS5uZ09uRGVzdHJveSgpO1xuICAgIH1cbiAgICBpZiAocC5wcm92aWRlcjIgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJlxuICAgICAgICAoPERpcmVjdGl2ZVByb3ZpZGVyPnAucHJvdmlkZXIyKS5jYWxsT25EZXN0cm95KSB7XG4gICAgICBpLm9iajIubmdPbkRlc3Ryb3koKTtcbiAgICB9XG4gICAgaWYgKHAucHJvdmlkZXIzIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiZcbiAgICAgICAgKDxEaXJlY3RpdmVQcm92aWRlcj5wLnByb3ZpZGVyMykuY2FsbE9uRGVzdHJveSkge1xuICAgICAgaS5vYmozLm5nT25EZXN0cm95KCk7XG4gICAgfVxuICAgIGlmIChwLnByb3ZpZGVyNCBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmXG4gICAgICAgICg8RGlyZWN0aXZlUHJvdmlkZXI+cC5wcm92aWRlcjQpLmNhbGxPbkRlc3Ryb3kpIHtcbiAgICAgIGkub2JqNC5uZ09uRGVzdHJveSgpO1xuICAgIH1cbiAgICBpZiAocC5wcm92aWRlcjUgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJlxuICAgICAgICAoPERpcmVjdGl2ZVByb3ZpZGVyPnAucHJvdmlkZXI1KS5jYWxsT25EZXN0cm95KSB7XG4gICAgICBpLm9iajUubmdPbkRlc3Ryb3koKTtcbiAgICB9XG4gICAgaWYgKHAucHJvdmlkZXI2IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiZcbiAgICAgICAgKDxEaXJlY3RpdmVQcm92aWRlcj5wLnByb3ZpZGVyNikuY2FsbE9uRGVzdHJveSkge1xuICAgICAgaS5vYmo2Lm5nT25EZXN0cm95KCk7XG4gICAgfVxuICAgIGlmIChwLnByb3ZpZGVyNyBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmXG4gICAgICAgICg8RGlyZWN0aXZlUHJvdmlkZXI+cC5wcm92aWRlcjcpLmNhbGxPbkRlc3Ryb3kpIHtcbiAgICAgIGkub2JqNy5uZ09uRGVzdHJveSgpO1xuICAgIH1cbiAgICBpZiAocC5wcm92aWRlcjggaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJlxuICAgICAgICAoPERpcmVjdGl2ZVByb3ZpZGVyPnAucHJvdmlkZXI4KS5jYWxsT25EZXN0cm95KSB7XG4gICAgICBpLm9iajgubmdPbkRlc3Ryb3koKTtcbiAgICB9XG4gICAgaWYgKHAucHJvdmlkZXI5IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiZcbiAgICAgICAgKDxEaXJlY3RpdmVQcm92aWRlcj5wLnByb3ZpZGVyOSkuY2FsbE9uRGVzdHJveSkge1xuICAgICAgaS5vYmo5Lm5nT25EZXN0cm95KCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0Q29tcG9uZW50KCk6IGFueSB7IHJldHVybiB0aGlzLmluamVjdG9yU3RyYXRlZ3kub2JqMDsgfVxuXG4gIGlzQ29tcG9uZW50S2V5KGtleTogS2V5KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2VpLl9wcm90by5fZmlyc3RQcm92aWRlcklzQ29tcG9uZW50ICYmIGlzUHJlc2VudChrZXkpICYmXG4gICAgICAgICAgIGtleS5pZCA9PT0gdGhpcy5pbmplY3RvclN0cmF0ZWd5LnByb3RvU3RyYXRlZ3kua2V5SWQwO1xuICB9XG5cbiAgYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkocXVlcnk6IFF1ZXJ5TWV0YWRhdGEsIGxpc3Q6IGFueVtdKTogdm9pZCB7XG4gICAgdmFyIGkgPSB0aGlzLmluamVjdG9yU3RyYXRlZ3k7XG4gICAgdmFyIHAgPSBpLnByb3RvU3RyYXRlZ3k7XG5cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXIwKSAmJiBwLnByb3ZpZGVyMC5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmowID09PSBVTkRFRklORUQpIGkub2JqMCA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyMCwgcC52aXNpYmlsaXR5MCk7XG4gICAgICBsaXN0LnB1c2goaS5vYmowKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyMSkgJiYgcC5wcm92aWRlcjEua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqMSA9PT0gVU5ERUZJTkVEKSBpLm9iajEgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjEsIHAudmlzaWJpbGl0eTEpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqMSk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjIpICYmIHAucHJvdmlkZXIyLmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajIgPT09IFVOREVGSU5FRCkgaS5vYmoyID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIyLCBwLnZpc2liaWxpdHkyKTtcbiAgICAgIGxpc3QucHVzaChpLm9iajIpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXIzKSAmJiBwLnByb3ZpZGVyMy5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmozID09PSBVTkRFRklORUQpIGkub2JqMyA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyMywgcC52aXNpYmlsaXR5Myk7XG4gICAgICBsaXN0LnB1c2goaS5vYmozKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyNCkgJiYgcC5wcm92aWRlcjQua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqNCA9PT0gVU5ERUZJTkVEKSBpLm9iajQgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjQsIHAudmlzaWJpbGl0eTQpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqNCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjUpICYmIHAucHJvdmlkZXI1LmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajUgPT09IFVOREVGSU5FRCkgaS5vYmo1ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI1LCBwLnZpc2liaWxpdHk1KTtcbiAgICAgIGxpc3QucHVzaChpLm9iajUpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXI2KSAmJiBwLnByb3ZpZGVyNi5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmo2ID09PSBVTkRFRklORUQpIGkub2JqNiA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyNiwgcC52aXNpYmlsaXR5Nik7XG4gICAgICBsaXN0LnB1c2goaS5vYmo2KTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyNykgJiYgcC5wcm92aWRlcjcua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqNyA9PT0gVU5ERUZJTkVEKSBpLm9iajcgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjcsIHAudmlzaWJpbGl0eTcpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqNyk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjgpICYmIHAucHJvdmlkZXI4LmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajggPT09IFVOREVGSU5FRCkgaS5vYmo4ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI4LCBwLnZpc2liaWxpdHk4KTtcbiAgICAgIGxpc3QucHVzaChpLm9iajgpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXI5KSAmJiBwLnByb3ZpZGVyOS5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmo5ID09PSBVTkRFRklORUQpIGkub2JqOSA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyOSwgcC52aXNpYmlsaXR5OSk7XG4gICAgICBsaXN0LnB1c2goaS5vYmo5KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBTdHJhdGVneSB1c2VkIGJ5IHRoZSBgRWxlbWVudEluamVjdG9yYCB3aGVuIHRoZSBudW1iZXIgb2YgYmluZGluZ3MgaXMgMTEgb3IgbW9yZS5cbiAqIEluIHN1Y2ggYSBjYXNlLCB0aGVyZSBhcmUgdG9vIG1hbnkgZmllbGRzIHRvIGlubGluZSAoc2VlIEVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5KS5cbiAqL1xuY2xhc3MgRWxlbWVudEluamVjdG9yRHluYW1pY1N0cmF0ZWd5IGltcGxlbWVudHMgX0VsZW1lbnRJbmplY3RvclN0cmF0ZWd5IHtcbiAgY29uc3RydWN0b3IocHVibGljIGluamVjdG9yU3RyYXRlZ3k6IEluamVjdG9yRHluYW1pY1N0cmF0ZWd5LCBwdWJsaWMgX2VpOiBFbGVtZW50SW5qZWN0b3IpIHt9XG5cbiAgaHlkcmF0ZSgpOiB2b2lkIHtcbiAgICB2YXIgaW5qID0gdGhpcy5pbmplY3RvclN0cmF0ZWd5O1xuICAgIHZhciBwID0gaW5qLnByb3RvU3RyYXRlZ3k7XG4gICAgaW5qLnJlc2V0Q29uc3RydWN0aW9uQ291bnRlcigpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwLmtleUlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHAucHJvdmlkZXJzW2ldIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWRzW2ldKSAmJlxuICAgICAgICAgIGluai5vYmpzW2ldID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgaW5qLm9ianNbaV0gPSBpbmouaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyc1tpXSwgcC52aXNpYmlsaXRpZXNbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGRlaHlkcmF0ZSgpOiB2b2lkIHtcbiAgICB2YXIgaW5qID0gdGhpcy5pbmplY3RvclN0cmF0ZWd5O1xuICAgIExpc3RXcmFwcGVyLmZpbGwoaW5qLm9ianMsIFVOREVGSU5FRCk7XG4gIH1cblxuICBjYWxsT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHZhciBpc3QgPSB0aGlzLmluamVjdG9yU3RyYXRlZ3k7XG4gICAgdmFyIHAgPSBpc3QucHJvdG9TdHJhdGVneTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcC5wcm92aWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChwLnByb3ZpZGVyc1tpXSBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmXG4gICAgICAgICAgKDxEaXJlY3RpdmVQcm92aWRlcj5wLnByb3ZpZGVyc1tpXSkuY2FsbE9uRGVzdHJveSkge1xuICAgICAgICBpc3Qub2Jqc1tpXS5uZ09uRGVzdHJveSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldENvbXBvbmVudCgpOiBhbnkgeyByZXR1cm4gdGhpcy5pbmplY3RvclN0cmF0ZWd5Lm9ianNbMF07IH1cblxuICBpc0NvbXBvbmVudEtleShrZXk6IEtleSk6IGJvb2xlYW4ge1xuICAgIHZhciBwID0gdGhpcy5pbmplY3RvclN0cmF0ZWd5LnByb3RvU3RyYXRlZ3k7XG4gICAgcmV0dXJuIHRoaXMuX2VpLl9wcm90by5fZmlyc3RQcm92aWRlcklzQ29tcG9uZW50ICYmIGlzUHJlc2VudChrZXkpICYmIGtleS5pZCA9PT0gcC5rZXlJZHNbMF07XG4gIH1cblxuICBhZGREaXJlY3RpdmVzTWF0Y2hpbmdRdWVyeShxdWVyeTogUXVlcnlNZXRhZGF0YSwgbGlzdDogYW55W10pOiB2b2lkIHtcbiAgICB2YXIgaXN0ID0gdGhpcy5pbmplY3RvclN0cmF0ZWd5O1xuICAgIHZhciBwID0gaXN0LnByb3RvU3RyYXRlZ3k7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHAucHJvdmlkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocC5wcm92aWRlcnNbaV0ua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgICBpZiAoaXN0Lm9ianNbaV0gPT09IFVOREVGSU5FRCkge1xuICAgICAgICAgIGlzdC5vYmpzW2ldID0gaXN0Lmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcnNbaV0sIHAudmlzaWJpbGl0aWVzW2ldKTtcbiAgICAgICAgfVxuICAgICAgICBsaXN0LnB1c2goaXN0Lm9ianNbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgUHJvdG9RdWVyeVJlZiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBkaXJJbmRleDogbnVtYmVyLCBwdWJsaWMgc2V0dGVyOiBTZXR0ZXJGbiwgcHVibGljIHF1ZXJ5OiBRdWVyeU1ldGFkYXRhKSB7fVxuXG4gIGdldCB1c2VzUHJvcGVydHlTeW50YXgoKTogYm9vbGVhbiB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5zZXR0ZXIpOyB9XG59XG5cbmV4cG9ydCBjbGFzcyBRdWVyeVJlZiB7XG4gIHB1YmxpYyBsaXN0OiBRdWVyeUxpc3Q8YW55PjtcbiAgcHVibGljIGRpcnR5OiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwcm90b1F1ZXJ5UmVmOiBQcm90b1F1ZXJ5UmVmLCBwcml2YXRlIG9yaWdpbmF0b3I6IEVsZW1lbnRJbmplY3Rvcikge31cblxuICBnZXQgaXNWaWV3UXVlcnkoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLnByb3RvUXVlcnlSZWYucXVlcnkuaXNWaWV3UXVlcnk7IH1cblxuICB1cGRhdGUoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmRpcnR5KSByZXR1cm47XG4gICAgdGhpcy5fdXBkYXRlKCk7XG4gICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xuXG4gICAgLy8gVE9ETyBkZWxldGUgdGhlIGNoZWNrIG9uY2Ugb25seSBmaWVsZCBxdWVyaWVzIGFyZSBzdXBwb3J0ZWRcbiAgICBpZiAodGhpcy5wcm90b1F1ZXJ5UmVmLnVzZXNQcm9wZXJ0eVN5bnRheCkge1xuICAgICAgdmFyIGRpciA9IHRoaXMub3JpZ2luYXRvci5nZXREaXJlY3RpdmVBdEluZGV4KHRoaXMucHJvdG9RdWVyeVJlZi5kaXJJbmRleCk7XG4gICAgICBpZiAodGhpcy5wcm90b1F1ZXJ5UmVmLnF1ZXJ5LmZpcnN0KSB7XG4gICAgICAgIHRoaXMucHJvdG9RdWVyeVJlZi5zZXR0ZXIoZGlyLCB0aGlzLmxpc3QubGVuZ3RoID4gMCA/IHRoaXMubGlzdC5maXJzdCA6IG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wcm90b1F1ZXJ5UmVmLnNldHRlcihkaXIsIHRoaXMubGlzdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5saXN0Lm5vdGlmeU9uQ2hhbmdlcygpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlKCk6IHZvaWQge1xuICAgIHZhciBhZ2dyZWdhdG9yID0gW107XG4gICAgaWYgKHRoaXMucHJvdG9RdWVyeVJlZi5xdWVyeS5pc1ZpZXdRdWVyeSkge1xuICAgICAgdmFyIHZpZXcgPSB0aGlzLm9yaWdpbmF0b3IuZ2V0VmlldygpO1xuICAgICAgLy8gaW50ZW50aW9uYWxseSBza2lwcGluZyBvcmlnaW5hdG9yIGZvciB2aWV3IHF1ZXJpZXMuXG4gICAgICB2YXIgbmVzdGVkVmlldyA9XG4gICAgICAgICAgdmlldy5nZXROZXN0ZWRWaWV3KHZpZXcuZWxlbWVudE9mZnNldCArIHRoaXMub3JpZ2luYXRvci5nZXRCb3VuZEVsZW1lbnRJbmRleCgpKTtcbiAgICAgIGlmIChpc1ByZXNlbnQobmVzdGVkVmlldykpIHRoaXMuX3Zpc2l0VmlldyhuZXN0ZWRWaWV3LCBhZ2dyZWdhdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdmlzaXQodGhpcy5vcmlnaW5hdG9yLCBhZ2dyZWdhdG9yKTtcbiAgICB9XG4gICAgdGhpcy5saXN0LnJlc2V0KGFnZ3JlZ2F0b3IpO1xuICB9O1xuXG4gIHByaXZhdGUgX3Zpc2l0KGluajogRWxlbWVudEluamVjdG9yLCBhZ2dyZWdhdG9yOiBhbnlbXSk6IHZvaWQge1xuICAgIHZhciB2aWV3ID0gaW5qLmdldFZpZXcoKTtcbiAgICB2YXIgc3RhcnRJZHggPSB2aWV3LmVsZW1lbnRPZmZzZXQgKyBpbmouX3Byb3RvLmluZGV4O1xuICAgIGZvciAodmFyIGkgPSBzdGFydElkeDsgaSA8IHZpZXcuZWxlbWVudE9mZnNldCArIHZpZXcub3duQmluZGVyc0NvdW50OyBpKyspIHtcbiAgICAgIHZhciBjdXJJbmogPSB2aWV3LmVsZW1lbnRJbmplY3RvcnNbaV07XG4gICAgICBpZiAoaXNCbGFuayhjdXJJbmopKSBjb250aW51ZTtcbiAgICAgIC8vIFRoZSBmaXJzdCBpbmplY3RvciBhZnRlciBpbmosIHRoYXQgaXMgb3V0c2lkZSB0aGUgc3VidHJlZSByb290ZWQgYXRcbiAgICAgIC8vIGluaiBoYXMgdG8gaGF2ZSBhIG51bGwgcGFyZW50IG9yIGEgcGFyZW50IHRoYXQgaXMgYW4gYW5jZXN0b3Igb2YgaW5qLlxuICAgICAgaWYgKGkgPiBzdGFydElkeCAmJiAoaXNCbGFuayhjdXJJbmopIHx8IGlzQmxhbmsoY3VySW5qLnBhcmVudCkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpZXcuZWxlbWVudE9mZnNldCArIGN1ckluai5wYXJlbnQuX3Byb3RvLmluZGV4IDwgc3RhcnRJZHgpKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMucHJvdG9RdWVyeVJlZi5xdWVyeS5kZXNjZW5kYW50cyAmJlxuICAgICAgICAgICEoY3VySW5qLnBhcmVudCA9PSB0aGlzLm9yaWdpbmF0b3IgfHwgY3VySW5qID09IHRoaXMub3JpZ2luYXRvcikpXG4gICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAvLyBXZSB2aXNpdCB0aGUgdmlldyBjb250YWluZXIoVkMpIHZpZXdzIHJpZ2h0IGFmdGVyIHRoZSBpbmplY3RvciB0aGF0IGNvbnRhaW5zXG4gICAgICAvLyB0aGUgVkMuIFRoZW9yZXRpY2FsbHksIHRoYXQgbWlnaHQgbm90IGJlIHRoZSByaWdodCBvcmRlciBpZiB0aGVyZSBhcmVcbiAgICAgIC8vIGNoaWxkIGluamVjdG9ycyBvZiBzYWlkIGluamVjdG9yLiBOb3QgY2xlYXIgd2hldGhlciBpZiBzdWNoIGNhc2UgY2FuXG4gICAgICAvLyBldmVuIGJlIGNvbnN0cnVjdGVkIHdpdGggdGhlIGN1cnJlbnQgYXBpcy5cbiAgICAgIHRoaXMuX3Zpc2l0SW5qZWN0b3IoY3VySW5qLCBhZ2dyZWdhdG9yKTtcbiAgICAgIHZhciB2YyA9IHZpZXcudmlld0NvbnRhaW5lcnNbaV07XG4gICAgICBpZiAoaXNQcmVzZW50KHZjKSkgdGhpcy5fdmlzaXRWaWV3Q29udGFpbmVyKHZjLCBhZ2dyZWdhdG9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF92aXNpdEluamVjdG9yKGluajogRWxlbWVudEluamVjdG9yLCBhZ2dyZWdhdG9yOiBhbnlbXSkge1xuICAgIGlmICh0aGlzLnByb3RvUXVlcnlSZWYucXVlcnkuaXNWYXJCaW5kaW5nUXVlcnkpIHtcbiAgICAgIHRoaXMuX2FnZ3JlZ2F0ZVZhcmlhYmxlQmluZGluZyhpbmosIGFnZ3JlZ2F0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9hZ2dyZWdhdGVEaXJlY3RpdmUoaW5qLCBhZ2dyZWdhdG9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFZpZXdDb250YWluZXIodmM6IEFwcFZpZXdDb250YWluZXIsIGFnZ3JlZ2F0b3I6IGFueVtdKSB7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCB2Yy52aWV3cy5sZW5ndGg7IGorKykge1xuICAgICAgdGhpcy5fdmlzaXRWaWV3KHZjLnZpZXdzW2pdLCBhZ2dyZWdhdG9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF92aXNpdFZpZXcodmlldzogQXBwVmlldywgYWdncmVnYXRvcjogYW55W10pIHtcbiAgICBmb3IgKHZhciBpID0gdmlldy5lbGVtZW50T2Zmc2V0OyBpIDwgdmlldy5lbGVtZW50T2Zmc2V0ICsgdmlldy5vd25CaW5kZXJzQ291bnQ7IGkrKykge1xuICAgICAgdmFyIGluaiA9IHZpZXcuZWxlbWVudEluamVjdG9yc1tpXTtcbiAgICAgIGlmIChpc0JsYW5rKGluaikpIGNvbnRpbnVlO1xuXG4gICAgICB0aGlzLl92aXNpdEluamVjdG9yKGluaiwgYWdncmVnYXRvcik7XG5cbiAgICAgIHZhciB2YyA9IHZpZXcudmlld0NvbnRhaW5lcnNbaV07XG4gICAgICBpZiAoaXNQcmVzZW50KHZjKSkgdGhpcy5fdmlzaXRWaWV3Q29udGFpbmVyKHZjLCBhZ2dyZWdhdG9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hZ2dyZWdhdGVWYXJpYWJsZUJpbmRpbmcoaW5qOiBFbGVtZW50SW5qZWN0b3IsIGFnZ3JlZ2F0b3I6IGFueVtdKTogdm9pZCB7XG4gICAgdmFyIHZiID0gdGhpcy5wcm90b1F1ZXJ5UmVmLnF1ZXJ5LnZhckJpbmRpbmdzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmIubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmIChpbmouaGFzVmFyaWFibGVCaW5kaW5nKHZiW2ldKSkge1xuICAgICAgICBhZ2dyZWdhdG9yLnB1c2goaW5qLmdldFZhcmlhYmxlQmluZGluZyh2YltpXSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FnZ3JlZ2F0ZURpcmVjdGl2ZShpbmo6IEVsZW1lbnRJbmplY3RvciwgYWdncmVnYXRvcjogYW55W10pOiB2b2lkIHtcbiAgICBpbmouYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkodGhpcy5wcm90b1F1ZXJ5UmVmLnF1ZXJ5LCBhZ2dyZWdhdG9yKTtcbiAgfVxuXG4gIGRlaHlkcmF0ZSgpOiB2b2lkIHsgdGhpcy5saXN0ID0gbnVsbDsgfVxuXG4gIGh5ZHJhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5saXN0ID0gbmV3IFF1ZXJ5TGlzdDxhbnk+KCk7XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG4gIH1cbn1cbiJdfQ==