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
    afterViewChecked() { this._queryStrategy.updateViewQueries(); }
    afterContentChecked() { this._queryStrategy.updateContentQueries(); }
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
            i.obj0.onDestroy();
        }
        if (p.provider1 instanceof DirectiveProvider &&
            p.provider1.callOnDestroy) {
            i.obj1.onDestroy();
        }
        if (p.provider2 instanceof DirectiveProvider &&
            p.provider2.callOnDestroy) {
            i.obj2.onDestroy();
        }
        if (p.provider3 instanceof DirectiveProvider &&
            p.provider3.callOnDestroy) {
            i.obj3.onDestroy();
        }
        if (p.provider4 instanceof DirectiveProvider &&
            p.provider4.callOnDestroy) {
            i.obj4.onDestroy();
        }
        if (p.provider5 instanceof DirectiveProvider &&
            p.provider5.callOnDestroy) {
            i.obj5.onDestroy();
        }
        if (p.provider6 instanceof DirectiveProvider &&
            p.provider6.callOnDestroy) {
            i.obj6.onDestroy();
        }
        if (p.provider7 instanceof DirectiveProvider &&
            p.provider7.callOnDestroy) {
            i.obj7.onDestroy();
        }
        if (p.provider8 instanceof DirectiveProvider &&
            p.provider8.callOnDestroy) {
            i.obj8.onDestroy();
        }
        if (p.provider9 instanceof DirectiveProvider &&
            p.provider9.callOnDestroy) {
            i.obj9.onDestroy();
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
                ist.objs[i].onDestroy();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudF9pbmplY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9lbGVtZW50X2luamVjdG9yLnRzIl0sIm5hbWVzIjpbIlN0YXRpY0tleXMiLCJTdGF0aWNLZXlzLmNvbnN0cnVjdG9yIiwiU3RhdGljS2V5cy5pbnN0YW5jZSIsIlRyZWVOb2RlIiwiVHJlZU5vZGUuY29uc3RydWN0b3IiLCJUcmVlTm9kZS5hZGRDaGlsZCIsIlRyZWVOb2RlLnJlbW92ZSIsIlRyZWVOb2RlLnBhcmVudCIsIkRpcmVjdGl2ZURlcGVuZGVuY3kiLCJEaXJlY3RpdmVEZXBlbmRlbmN5LmNvbnN0cnVjdG9yIiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5fdmVyaWZ5IiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5jcmVhdGVGcm9tIiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5fYXR0cmlidXRlTmFtZSIsIkRpcmVjdGl2ZURlcGVuZGVuY3kuX3F1ZXJ5IiwiRGlyZWN0aXZlUHJvdmlkZXIiLCJEaXJlY3RpdmVQcm92aWRlci5jb25zdHJ1Y3RvciIsIkRpcmVjdGl2ZVByb3ZpZGVyLmRpc3BsYXlOYW1lIiwiRGlyZWN0aXZlUHJvdmlkZXIucXVlcmllcyIsIkRpcmVjdGl2ZVByb3ZpZGVyLmV2ZW50RW1pdHRlcnMiLCJEaXJlY3RpdmVQcm92aWRlci5jcmVhdGVGcm9tUHJvdmlkZXIiLCJEaXJlY3RpdmVQcm92aWRlci5jcmVhdGVGcm9tVHlwZSIsIlByZUJ1aWx0T2JqZWN0cyIsIlByZUJ1aWx0T2JqZWN0cy5jb25zdHJ1Y3RvciIsIlF1ZXJ5TWV0YWRhdGFXaXRoU2V0dGVyIiwiUXVlcnlNZXRhZGF0YVdpdGhTZXR0ZXIuY29uc3RydWN0b3IiLCJFdmVudEVtaXR0ZXJBY2Nlc3NvciIsIkV2ZW50RW1pdHRlckFjY2Vzc29yLmNvbnN0cnVjdG9yIiwiRXZlbnRFbWl0dGVyQWNjZXNzb3Iuc3Vic2NyaWJlIiwiX2NyZWF0ZUV2ZW50RW1pdHRlckFjY2Vzc29ycyIsIl9jcmVhdGVQcm90b1F1ZXJ5UmVmcyIsIlByb3RvRWxlbWVudEluamVjdG9yIiwiUHJvdG9FbGVtZW50SW5qZWN0b3IuY29uc3RydWN0b3IiLCJQcm90b0VsZW1lbnRJbmplY3Rvci5jcmVhdGUiLCJQcm90b0VsZW1lbnRJbmplY3Rvci5fY3JlYXRlRGlyZWN0aXZlUHJvdmlkZXJXaXRoVmlzaWJpbGl0eSIsIlByb3RvRWxlbWVudEluamVjdG9yLl9jcmVhdGVQcm92aWRlcnNXaXRoVmlzaWJpbGl0eSIsIlByb3RvRWxlbWVudEluamVjdG9yLl9jcmVhdGVQcm92aWRlcldpdGhWaXNpYmlsaXR5IiwiUHJvdG9FbGVtZW50SW5qZWN0b3IuX2NyZWF0ZVZpZXdQcm92aWRlcnNXaXRoVmlzaWJpbGl0eSIsIlByb3RvRWxlbWVudEluamVjdG9yLmluc3RhbnRpYXRlIiwiUHJvdG9FbGVtZW50SW5qZWN0b3IuZGlyZWN0UGFyZW50IiwiUHJvdG9FbGVtZW50SW5qZWN0b3IuaGFzQmluZGluZ3MiLCJQcm90b0VsZW1lbnRJbmplY3Rvci5nZXRQcm92aWRlckF0SW5kZXgiLCJfQ29udGV4dCIsIl9Db250ZXh0LmNvbnN0cnVjdG9yIiwiRWxlbWVudEluamVjdG9yIiwiRWxlbWVudEluamVjdG9yLmNvbnN0cnVjdG9yIiwiRWxlbWVudEluamVjdG9yLmRlaHlkcmF0ZSIsIkVsZW1lbnRJbmplY3Rvci5oeWRyYXRlIiwiRWxlbWVudEluamVjdG9yLl9kZWJ1Z0NvbnRleHQiLCJFbGVtZW50SW5qZWN0b3IuX3JlYXR0YWNoSW5qZWN0b3JzIiwiRWxlbWVudEluamVjdG9yLl9yZWF0dGFjaEluamVjdG9yIiwiRWxlbWVudEluamVjdG9yLmhhc1ZhcmlhYmxlQmluZGluZyIsIkVsZW1lbnRJbmplY3Rvci5nZXRWYXJpYWJsZUJpbmRpbmciLCJFbGVtZW50SW5qZWN0b3IuZ2V0IiwiRWxlbWVudEluamVjdG9yLmhhc0RpcmVjdGl2ZSIsIkVsZW1lbnRJbmplY3Rvci5nZXRFdmVudEVtaXR0ZXJBY2Nlc3NvcnMiLCJFbGVtZW50SW5qZWN0b3IuZ2V0RGlyZWN0aXZlVmFyaWFibGVCaW5kaW5ncyIsIkVsZW1lbnRJbmplY3Rvci5nZXRDb21wb25lbnQiLCJFbGVtZW50SW5qZWN0b3IuZ2V0SW5qZWN0b3IiLCJFbGVtZW50SW5qZWN0b3IuZ2V0RWxlbWVudFJlZiIsIkVsZW1lbnRJbmplY3Rvci5nZXRWaWV3Q29udGFpbmVyUmVmIiwiRWxlbWVudEluamVjdG9yLmdldE5lc3RlZFZpZXciLCJFbGVtZW50SW5qZWN0b3IuZ2V0VmlldyIsIkVsZW1lbnRJbmplY3Rvci5kaXJlY3RQYXJlbnQiLCJFbGVtZW50SW5qZWN0b3IuaXNDb21wb25lbnRLZXkiLCJFbGVtZW50SW5qZWN0b3IuZ2V0RGVwZW5kZW5jeSIsIkVsZW1lbnRJbmplY3Rvci5fYnVpbGRBdHRyaWJ1dGUiLCJFbGVtZW50SW5qZWN0b3IuYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkiLCJFbGVtZW50SW5qZWN0b3IuX2J1aWxkUXVlcnlTdHJhdGVneSIsIkVsZW1lbnRJbmplY3Rvci5saW5rIiwiRWxlbWVudEluamVjdG9yLnVubGluayIsIkVsZW1lbnRJbmplY3Rvci5nZXREaXJlY3RpdmVBdEluZGV4IiwiRWxlbWVudEluamVjdG9yLmhhc0luc3RhbmNlcyIsIkVsZW1lbnRJbmplY3Rvci5nZXRIb3N0IiwiRWxlbWVudEluamVjdG9yLmdldEJvdW5kRWxlbWVudEluZGV4IiwiRWxlbWVudEluamVjdG9yLmdldFJvb3RWaWV3SW5qZWN0b3JzIiwiRWxlbWVudEluamVjdG9yLmFmdGVyVmlld0NoZWNrZWQiLCJFbGVtZW50SW5qZWN0b3IuYWZ0ZXJDb250ZW50Q2hlY2tlZCIsIkVsZW1lbnRJbmplY3Rvci50cmF2ZXJzZUFuZFNldFF1ZXJpZXNBc0RpcnR5IiwiRWxlbWVudEluamVjdG9yLl9zZXRRdWVyaWVzQXNEaXJ0eSIsIl9FbXB0eVF1ZXJ5U3RyYXRlZ3kiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5LnNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSIsIl9FbXB0eVF1ZXJ5U3RyYXRlZ3kuc2V0Vmlld1F1ZXJpZXNBc0RpcnR5IiwiX0VtcHR5UXVlcnlTdHJhdGVneS5oeWRyYXRlIiwiX0VtcHR5UXVlcnlTdHJhdGVneS5kZWh5ZHJhdGUiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5LnVwZGF0ZUNvbnRlbnRRdWVyaWVzIiwiX0VtcHR5UXVlcnlTdHJhdGVneS51cGRhdGVWaWV3UXVlcmllcyIsIl9FbXB0eVF1ZXJ5U3RyYXRlZ3kuZmluZFF1ZXJ5IiwiSW5saW5lUXVlcnlTdHJhdGVneSIsIklubGluZVF1ZXJ5U3RyYXRlZ3kuY29uc3RydWN0b3IiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5LnNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSIsIklubGluZVF1ZXJ5U3RyYXRlZ3kuc2V0Vmlld1F1ZXJpZXNBc0RpcnR5IiwiSW5saW5lUXVlcnlTdHJhdGVneS5oeWRyYXRlIiwiSW5saW5lUXVlcnlTdHJhdGVneS5kZWh5ZHJhdGUiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5LnVwZGF0ZUNvbnRlbnRRdWVyaWVzIiwiSW5saW5lUXVlcnlTdHJhdGVneS51cGRhdGVWaWV3UXVlcmllcyIsIklubGluZVF1ZXJ5U3RyYXRlZ3kuZmluZFF1ZXJ5IiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kiLCJEeW5hbWljUXVlcnlTdHJhdGVneS5jb25zdHJ1Y3RvciIsIkR5bmFtaWNRdWVyeVN0cmF0ZWd5LnNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSIsIkR5bmFtaWNRdWVyeVN0cmF0ZWd5LnNldFZpZXdRdWVyaWVzQXNEaXJ0eSIsIkR5bmFtaWNRdWVyeVN0cmF0ZWd5Lmh5ZHJhdGUiLCJEeW5hbWljUXVlcnlTdHJhdGVneS5kZWh5ZHJhdGUiLCJEeW5hbWljUXVlcnlTdHJhdGVneS51cGRhdGVDb250ZW50UXVlcmllcyIsIkR5bmFtaWNRdWVyeVN0cmF0ZWd5LnVwZGF0ZVZpZXdRdWVyaWVzIiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kuZmluZFF1ZXJ5IiwiRWxlbWVudEluamVjdG9ySW5saW5lU3RyYXRlZ3kiLCJFbGVtZW50SW5qZWN0b3JJbmxpbmVTdHJhdGVneS5jb25zdHJ1Y3RvciIsIkVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5Lmh5ZHJhdGUiLCJFbGVtZW50SW5qZWN0b3JJbmxpbmVTdHJhdGVneS5kZWh5ZHJhdGUiLCJFbGVtZW50SW5qZWN0b3JJbmxpbmVTdHJhdGVneS5jYWxsT25EZXN0cm95IiwiRWxlbWVudEluamVjdG9ySW5saW5lU3RyYXRlZ3kuZ2V0Q29tcG9uZW50IiwiRWxlbWVudEluamVjdG9ySW5saW5lU3RyYXRlZ3kuaXNDb21wb25lbnRLZXkiLCJFbGVtZW50SW5qZWN0b3JJbmxpbmVTdHJhdGVneS5hZGREaXJlY3RpdmVzTWF0Y2hpbmdRdWVyeSIsIkVsZW1lbnRJbmplY3RvckR5bmFtaWNTdHJhdGVneSIsIkVsZW1lbnRJbmplY3RvckR5bmFtaWNTdHJhdGVneS5jb25zdHJ1Y3RvciIsIkVsZW1lbnRJbmplY3RvckR5bmFtaWNTdHJhdGVneS5oeWRyYXRlIiwiRWxlbWVudEluamVjdG9yRHluYW1pY1N0cmF0ZWd5LmRlaHlkcmF0ZSIsIkVsZW1lbnRJbmplY3RvckR5bmFtaWNTdHJhdGVneS5jYWxsT25EZXN0cm95IiwiRWxlbWVudEluamVjdG9yRHluYW1pY1N0cmF0ZWd5LmdldENvbXBvbmVudCIsIkVsZW1lbnRJbmplY3RvckR5bmFtaWNTdHJhdGVneS5pc0NvbXBvbmVudEtleSIsIkVsZW1lbnRJbmplY3RvckR5bmFtaWNTdHJhdGVneS5hZGREaXJlY3RpdmVzTWF0Y2hpbmdRdWVyeSIsIlByb3RvUXVlcnlSZWYiLCJQcm90b1F1ZXJ5UmVmLmNvbnN0cnVjdG9yIiwiUHJvdG9RdWVyeVJlZi51c2VzUHJvcGVydHlTeW50YXgiLCJRdWVyeVJlZiIsIlF1ZXJ5UmVmLmNvbnN0cnVjdG9yIiwiUXVlcnlSZWYuaXNWaWV3UXVlcnkiLCJRdWVyeVJlZi51cGRhdGUiLCJRdWVyeVJlZi5fdXBkYXRlIiwiUXVlcnlSZWYuX3Zpc2l0IiwiUXVlcnlSZWYuX3Zpc2l0SW5qZWN0b3IiLCJRdWVyeVJlZi5fdmlzaXRWaWV3Q29udGFpbmVyIiwiUXVlcnlSZWYuX3Zpc2l0VmlldyIsIlF1ZXJ5UmVmLl9hZ2dyZWdhdGVWYXJpYWJsZUJpbmRpbmciLCJRdWVyeVJlZi5fYWdncmVnYXRlRGlyZWN0aXZlIiwiUXVlcnlSZWYuZGVoeWRyYXRlIiwiUXVlcnlSZWYuaHlkcmF0ZSJdLCJtYXBwaW5ncyI6Ik9BQU8sRUFDTCxTQUFTLEVBQ1QsT0FBTyxFQUtSLE1BQU0sMEJBQTBCO09BQzFCLEVBQUMsYUFBYSxFQUFDLE1BQU0sZ0NBQWdDO09BQ3JELEVBQWUsaUJBQWlCLEVBQUMsTUFBTSwyQkFBMkI7T0FDbEUsRUFBQyxXQUFXLEVBQWMsZ0JBQWdCLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDakYsRUFDTCxRQUFRLEVBQ1IsR0FBRyxFQUNILFVBQVUsRUFFVixRQUFRLEVBRVIsZUFBZSxFQUloQixNQUFNLHNCQUFzQjtPQUN0QixFQUNMLFNBQVMsRUFDVCxhQUFhLEVBQ2IsVUFBVSxFQUNWLHNCQUFzQixFQUV0QixzQkFBc0IsRUFFdkIsTUFBTSwrQkFBK0I7T0FDL0IsRUFBQyxlQUFlLEVBQUUsZUFBZSxFQUFFLGlCQUFpQixFQUFDLE1BQU0sK0JBQStCO09BRTFGLEVBQUMsaUJBQWlCLEVBQUUsYUFBYSxFQUFDLE1BQU0sZ0JBQWdCO09BR3pDLEtBQUssU0FBUyxNQUFNLGdCQUFnQjtPQUNuRCxFQUFDLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCO09BQzlDLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZTtPQUNqQyxFQUFDLFdBQVcsRUFBQyxNQUFNLGdCQUFnQjtPQUNuQyxFQUFDLGlCQUFpQixFQUFFLGlCQUFpQixFQUFDLE1BQU0sd0JBQXdCO09BQ3BFLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxpQ0FBaUM7T0FDekQsRUFFTCxpQkFBaUIsRUFDbEIsTUFBTSxxREFBcUQ7T0FDckQsRUFBQyxTQUFTLEVBQUMsTUFBTSxjQUFjO09BQy9CLEVBQUMsU0FBUyxFQUFD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QUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNqRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDbkZBLENBQUNBO0lBRURGLHFCQUFxQkE7UUFDbkJHLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2hGQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNoRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDbEZBLENBQUNBO0lBRURILE9BQU9BO1FBQ0xJLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO1FBQ2xEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUNsREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7SUFDcERBLENBQUNBO0lBRURKLFNBQVNBO1FBQ1BLLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBO1FBQ3BEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQTtRQUNwREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0E7SUFDdERBLENBQUNBO0lBRURMLG9CQUFvQkE7UUFDbEJNLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZEQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkRBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2REEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO0lBQ0hBLENBQUNBO0lBRUROLGlCQUFpQkE7UUFDZk8sRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdERBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0REEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3REQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFRFAsU0FBU0Es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QkEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7SUFDL0RBLENBQUNBO0lBRURGLFNBQVNBO1FBQ1BHLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0E7UUFFOUJBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLFNBQVNBLENBQUNBO1FBQ25CQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxTQUFTQSxDQUFDQTtRQUNuQkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsU0FBU0EsQ0FBQ0E7UUFDbkJBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLFNBQVNBLENBQUNBO1FBQ25CQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxTQUFTQSxDQUFDQTtRQUNuQkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsU0FBU0EsQ0FBQ0E7UUFDbkJBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLFNBQVNBLENBQUNBO1FBQ25CQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxTQUFTQSxDQUFDQTtRQUNuQkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsU0FBU0EsQ0FBQ0E7UUFDbkJBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLFNBQVNBLENBQUNBO0lBQ3JCQSxDQUFDQTtJQUVESCxhQUFhQTtRQUNYSSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBO1FBQzlCQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxhQUFhQSxDQUFDQTtRQUV4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQTtZQUNwQkEsQ0FBQ0EsQ0FBQ0EsU0FBVUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBO1FBQ3JCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBO1lBQ3BCQSxDQUFDQSxDQUFDQSxTQUFVQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0E7UUFDckJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkE7WUFDcEJBLENBQUNBLENBQUNBLFNBQVVBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQTtRQUNyQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQTtZQUNwQkEsQ0FBQ0EsQ0FBQ0EsU0FBVUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBO1FBQ3JCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBO1lBQ3BCQSxDQUFDQSxDQUFDQSxTQUFVQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0E7UUFDckJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkE7WUFDcEJBLENBQUNBLENBQUNBLFNBQVVBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQTtRQUNyQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQTtZQUNwQkEsQ0FBQ0EsQ0FBQ0EsU0FBVUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBO1FBQ3JCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBO1lBQ3BCQSxDQUFDQSxDQUFDQSxTQUFVQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0E7UUFDckJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkE7WUFDcEJBLENBQUNBLENBQUNBLFNBQVVBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQTtRQUNyQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQTtZQUNwQkEsQ0FBQ0EsQ0FBQ0EsU0FBVUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBO1FBQ3JCQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVESixZQUFZQSxLQUFVSyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBRTFETCxjQUFjQSxDQUFDQSxHQUFRQTtRQUNyQk0sTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EseUJBQXlCQSxJQUFJQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQTtZQUMzREEsR0FBR0EsQ0FBQ0EsRUFBRUEsS0FBS0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxhQUFhQSxDQUFDQSxNQUFNQSxDQUFDQTtJQUMvREEsQ0FBQ0E7SUFFRE4sMEJBQTBCQSxDQUFDQSxLQUFvQkEsRUFBRUEsSUFBV0E7UUFDMURPLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0E7UUFDOUJBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLGFBQWFBLENBQUNBO1FBRXhCQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0EsU0FBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtJQUNIQSxDQUFDQTtBQUNIUCxDQUFDQTtBQUVEOzs7R0FHRztBQUNIO0lBQ0VRLFlBQW1CQSxnQkFBeUNBLEVBQVNBLEdBQW9CQTtRQUF0RUMscUJBQWdCQSxHQUFoQkEsZ0JBQWdCQSxDQUF5QkE7UUFBU0EsUUFBR0EsR0FBSEEsR0FBR0EsQ0FBaUJBO0lBQUdBLENBQUNBO0lBRTdGRCxPQUFPQTtRQUNMRSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBO1FBQ2hDQSxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQSxhQUFhQSxDQUFDQTtRQUMxQkEsR0FBR0EsQ0FBQ0Esd0JBQXdCQSxFQUFFQSxDQUFDQTtRQUUvQkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7WUFDekNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3JFQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDOUJBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0VBLENBQUNBO1FBQ0hBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURGLFNBQVNBO1FBQ1BHLElBQUlBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0E7UUFDaENBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLEVBQUVBLFNBQVNBLENBQUNBLENBQUNBO0lBQ3hDQSxDQUFDQTtJQUVESCxhQUFhQTtRQUNYSSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBO1FBQ2hDQSxJQUFJQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQSxhQUFhQSxDQUFDQTtRQUUxQkEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7WUFDNUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLFlBQVlBLGlCQUFpQkE7Z0JBQ3ZCQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFFQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdERBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBO1lBQzFCQSxDQUFDQTtRQUNIQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVESixZQUFZQSxLQUFVSyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0lBRTdETCxjQUFjQSxDQUFDQSxHQUFRQTtRQUNyQk0sSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxhQUFhQSxDQUFDQTtRQUM1Q0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EseUJBQXlCQSxJQUFJQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUMvRkEsQ0FBQ0E7SUFFRE4sMEJBQTBCQSxDQUFDQSxLQUFvQkEsRUFBRUEsSUFBV0E7UUFDMURPLElBQUlBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0E7UUFDaENBLElBQUlBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBLGFBQWFBLENBQUNBO1FBRTFCQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtZQUM1Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2hEQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxLQUFLQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDOUJBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLEdBQUdBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzNFQSxDQUFDQTtnQkFDREEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDekJBLENBQUNBO1FBQ0hBLENBQUNBO0lBQ0hBLENBQUNBO0FBQ0hQLENBQUNBO0FBRUQ7SUFDRVEsWUFBbUJBLFFBQWdCQSxFQUFTQSxNQUFnQkEsRUFBU0EsS0FBb0JBO1FBQXRFQyxhQUFRQSxHQUFSQSxRQUFRQSxDQUFRQTtRQUFTQSxXQUFNQSxHQUFOQSxNQUFNQSxDQUFVQTtRQUFTQSxVQUFLQSxHQUFMQSxLQUFLQSxDQUFlQTtJQUFHQSxDQUFDQTtJQUU3RkQsSUFBSUEsa0JBQWtCQSxLQUFjRSxNQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUN0RUYsQ0FBQ0E7QUFFRDtJQUlFRyxZQUFtQkEsYUFBNEJBLEVBQVVBLFVBQTJCQTtRQUFqRUMsa0JBQWFBLEdBQWJBLGFBQWFBLENBQWVBO1FBQVVBLGVBQVVBLEdBQVZBLFVBQVVBLENBQWlCQTtJQUFHQSxDQUFDQTtJQUV4RkQsSUFBSUEsV0FBV0EsS0FBY0UsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFM0VGLE1BQU1BO1FBQ0pHLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBO1FBQ3hCQSxJQUFJQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUNmQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUVuQkEsOERBQThEQTtRQUM5REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMxQ0EsSUFBSUEsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtZQUMzRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25DQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxFQUFFQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNoRkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ05BLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLEVBQUVBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1lBQzVDQSxDQUFDQTtRQUNIQSxDQUFDQTtRQUVEQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFlQSxFQUFFQSxDQUFDQTtJQUM5QkEsQ0FBQ0E7SUFFT0gsT0FBT0E7UUFDYkksSUFBSUEsVUFBVUEsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDcEJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3pDQSxJQUFJQSxJQUFJQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtZQUNyQ0Esc0RBQXNEQTtZQUN0REEsSUFBSUEsVUFBVUEsR0FDVkEsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0Esb0JBQW9CQSxFQUFFQSxDQUFDQSxDQUFDQTtZQUNwRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7Z0JBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLFVBQVVBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBO1FBQ3JFQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQTtRQUMzQ0EsQ0FBQ0E7UUFDREEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7SUFDOUJBLENBQUNBOztJQUVPSixNQUFNQSxDQUFDQSxHQUFvQkEsRUFBRUEsVUFBaUJBO1FBQ3BESyxJQUFJQSxJQUFJQSxHQUFHQSxHQUFHQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUN6QkEsSUFBSUEsUUFBUUEsR0FBR0EsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsR0FBR0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7UUFDckRBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLFFBQVFBLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGFBQWFBLEdBQUdBLElBQUlBLENBQUNBLGVBQWVBLEVBQUVBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBO1lBQzFFQSxJQUFJQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RDQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtnQkFBQ0EsUUFBUUEsQ0FBQ0E7WUFDOUJBLHNFQUFzRUE7WUFDdEVBLHdFQUF3RUE7WUFDeEVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLFFBQVFBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLE9BQU9BLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLENBQUNBO2dCQUN6Q0EsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2pGQSxLQUFLQSxDQUFDQTtZQUNSQSxDQUFDQTtZQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxLQUFLQSxDQUFDQSxXQUFXQTtnQkFDckNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLElBQUlBLElBQUlBLENBQUNBLFVBQVVBLElBQUlBLE1BQU1BLElBQUlBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO2dCQUNuRUEsUUFBUUEsQ0FBQ0E7WUFFWEEsK0VBQStFQTtZQUMvRUEsd0VBQXdFQTtZQUN4RUEsdUVBQXVFQTtZQUN2RUEsNkNBQTZDQTtZQUM3Q0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsTUFBTUEsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0E7WUFDeENBLElBQUlBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2hDQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtnQkFBQ0EsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQTtRQUM5REEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFT0wsY0FBY0EsQ0FBQ0EsR0FBb0JBLEVBQUVBLFVBQWlCQTtRQUM1RE0sRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMvQ0EsSUFBSUEsQ0FBQ0EseUJBQXlCQSxDQUFDQSxHQUFHQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQTtRQUNsREEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDTkEsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxHQUFHQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQTtRQUM1Q0EsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFT04sbUJBQW1CQSxDQUFDQSxFQUFvQkEsRUFBRUEsVUFBaUJBO1FBQ2pFTyxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxFQUFFQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtZQUN6Q0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFDM0NBLENBQUNBO0lBQ0hBLENBQUNBO0lBRU9QLFVBQVVBLENBQUNBLElBQWFBLEVBQUVBLFVBQWlCQTtRQUNqRFEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsYUFBYUEsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsYUFBYUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZUFBZUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7WUFDcEZBLElBQUlBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkNBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLENBQUNBLEdBQUdBLENBQUNBLENBQUNBO2dCQUFDQSxRQUFRQSxDQUFDQTtZQUUzQkEsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0E7WUFFckNBLElBQUlBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2hDQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtnQkFBQ0EsSUFBSUEsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxFQUFFQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQTtRQUM5REEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFT1IseUJBQXlCQSxDQUFDQSxHQUFvQkEsRUFBRUEsVUFBaUJBO1FBQ3ZFUyxJQUFJQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxhQUFhQSxDQUFDQSxLQUFLQSxDQUFDQSxXQUFXQSxDQUFDQTtRQUM5Q0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDbkNBLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2xDQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxrQkFBa0JBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pEQSxDQUFDQTtRQUNIQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVPVCxtQkFBbUJBLENBQUNBLEdBQW9CQSxFQUFFQSxVQUFpQkE7UUFDakVVLEdBQUdBLENBQUNBLDBCQUEwQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsS0FBS0EsRUFBRUEsVUFBVUEsQ0FBQ0EsQ0FBQ0E7SUFDdkVBLENBQUNBO0lBRURWLFNBQVNBLEtBQVdXLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBRXZDWCxPQUFPQTtRQUNMWSxJQUFJQSxDQUFDQSxJQUFJQSxHQUFHQSxJQUFJQSxTQUFTQSxFQUFPQSxDQUFDQTtRQUNqQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDcEJBLENBQUNBO0FBQ0haLENBQUNBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBpc1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIFR5cGUsXG4gIHN0cmluZ2lmeSxcbiAgQ09OU1RfRVhQUixcbiAgU3RyaW5nV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1xuICBJbmplY3RvcixcbiAgS2V5LFxuICBEZXBlbmRlbmN5LFxuICBwcm92aWRlLFxuICBQcm92aWRlcixcbiAgUmVzb2x2ZWRQcm92aWRlcixcbiAgTm9Qcm92aWRlckVycm9yLFxuICBBYnN0cmFjdFByb3ZpZGVyRXJyb3IsXG4gIEN5Y2xpY0RlcGVuZGVuY3lFcnJvcixcbiAgcmVzb2x2ZUZvcndhcmRSZWZcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtcbiAgVU5ERUZJTkVELFxuICBQcm90b0luamVjdG9yLFxuICBWaXNpYmlsaXR5LFxuICBJbmplY3RvcklubGluZVN0cmF0ZWd5LFxuICBJbmplY3RvckR5bmFtaWNTdHJhdGVneSxcbiAgUHJvdmlkZXJXaXRoVmlzaWJpbGl0eSxcbiAgRGVwZW5kZW5jeVByb3ZpZGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpL2luamVjdG9yJztcbmltcG9ydCB7cmVzb2x2ZVByb3ZpZGVyLCBSZXNvbHZlZEZhY3RvcnksIFJlc29sdmVkUHJvdmlkZXJffSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9wcm92aWRlcic7XG5cbmltcG9ydCB7QXR0cmlidXRlTWV0YWRhdGEsIFF1ZXJ5TWV0YWRhdGF9IGZyb20gJy4uL21ldGFkYXRhL2RpJztcblxuaW1wb3J0IHtBcHBWaWV3Q29udGFpbmVyLCBBcHBWaWV3fSBmcm9tICcuL3ZpZXcnO1xuLyogY2lyY3VsYXIgKi8gaW1wb3J0ICogYXMgYXZtTW9kdWxlIGZyb20gJy4vdmlld19tYW5hZ2VyJztcbmltcG9ydCB7Vmlld0NvbnRhaW5lclJlZn0gZnJvbSAnLi92aWV3X2NvbnRhaW5lcl9yZWYnO1xuaW1wb3J0IHtFbGVtZW50UmVmfSBmcm9tICcuL2VsZW1lbnRfcmVmJztcbmltcG9ydCB7VGVtcGxhdGVSZWZ9IGZyb20gJy4vdGVtcGxhdGVfcmVmJztcbmltcG9ydCB7RGlyZWN0aXZlTWV0YWRhdGEsIENvbXBvbmVudE1ldGFkYXRhfSBmcm9tICcuLi9tZXRhZGF0YS9kaXJlY3RpdmVzJztcbmltcG9ydCB7aGFzTGlmZWN5Y2xlSG9va30gZnJvbSAnLi9kaXJlY3RpdmVfbGlmZWN5Y2xlX3JlZmxlY3Rvcic7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3RvcixcbiAgQ2hhbmdlRGV0ZWN0b3JSZWZcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7UXVlcnlMaXN0fSBmcm9tICcuL3F1ZXJ5X2xpc3QnO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge1NldHRlckZufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3R5cGVzJztcbmltcG9ydCB7RXZlbnRDb25maWd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9ldmVudF9jb25maWcnO1xuaW1wb3J0IHtQaXBlUHJvdmlkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3BpcGVzL3BpcGVfcHJvdmlkZXInO1xuXG5pbXBvcnQge0xpZmVjeWNsZUhvb2tzfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtWaWV3Q29udGFpbmVyUmVmX30gZnJvbSBcIi4vdmlld19jb250YWluZXJfcmVmXCI7XG5cbnZhciBfc3RhdGljS2V5cztcblxuZXhwb3J0IGNsYXNzIFN0YXRpY0tleXMge1xuICB2aWV3TWFuYWdlcklkOiBudW1iZXI7XG4gIHRlbXBsYXRlUmVmSWQ6IG51bWJlcjtcbiAgdmlld0NvbnRhaW5lcklkOiBudW1iZXI7XG4gIGNoYW5nZURldGVjdG9yUmVmSWQ6IG51bWJlcjtcbiAgZWxlbWVudFJlZklkOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy52aWV3TWFuYWdlcklkID0gS2V5LmdldChhdm1Nb2R1bGUuQXBwVmlld01hbmFnZXIpLmlkO1xuICAgIHRoaXMudGVtcGxhdGVSZWZJZCA9IEtleS5nZXQoVGVtcGxhdGVSZWYpLmlkO1xuICAgIHRoaXMudmlld0NvbnRhaW5lcklkID0gS2V5LmdldChWaWV3Q29udGFpbmVyUmVmKS5pZDtcbiAgICB0aGlzLmNoYW5nZURldGVjdG9yUmVmSWQgPSBLZXkuZ2V0KENoYW5nZURldGVjdG9yUmVmKS5pZDtcbiAgICB0aGlzLmVsZW1lbnRSZWZJZCA9IEtleS5nZXQoRWxlbWVudFJlZikuaWQ7XG4gIH1cblxuICBzdGF0aWMgaW5zdGFuY2UoKTogU3RhdGljS2V5cyB7XG4gICAgaWYgKGlzQmxhbmsoX3N0YXRpY0tleXMpKSBfc3RhdGljS2V5cyA9IG5ldyBTdGF0aWNLZXlzKCk7XG4gICAgcmV0dXJuIF9zdGF0aWNLZXlzO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUcmVlTm9kZTxUIGV4dGVuZHMgVHJlZU5vZGU8YW55Pj4ge1xuICAvKiogQGludGVybmFsICovXG4gIF9wYXJlbnQ6IFQ7XG4gIGNvbnN0cnVjdG9yKHBhcmVudDogVCkge1xuICAgIGlmIChpc1ByZXNlbnQocGFyZW50KSkge1xuICAgICAgcGFyZW50LmFkZENoaWxkKHRoaXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9wYXJlbnQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGFkZENoaWxkKGNoaWxkOiBUKTogdm9pZCB7IGNoaWxkLl9wYXJlbnQgPSB0aGlzOyB9XG5cbiAgcmVtb3ZlKCk6IHZvaWQgeyB0aGlzLl9wYXJlbnQgPSBudWxsOyB9XG5cbiAgZ2V0IHBhcmVudCgpIHsgcmV0dXJuIHRoaXMuX3BhcmVudDsgfVxufVxuXG5leHBvcnQgY2xhc3MgRGlyZWN0aXZlRGVwZW5kZW5jeSBleHRlbmRzIERlcGVuZGVuY3kge1xuICBjb25zdHJ1Y3RvcihrZXk6IEtleSwgb3B0aW9uYWw6IGJvb2xlYW4sIGxvd2VyQm91bmRWaXNpYmlsaXR5OiBPYmplY3QsXG4gICAgICAgICAgICAgIHVwcGVyQm91bmRWaXNpYmlsaXR5OiBPYmplY3QsIHByb3BlcnRpZXM6IGFueVtdLCBwdWJsaWMgYXR0cmlidXRlTmFtZTogc3RyaW5nLFxuICAgICAgICAgICAgICBwdWJsaWMgcXVlcnlEZWNvcmF0b3I6IFF1ZXJ5TWV0YWRhdGEpIHtcbiAgICBzdXBlcihrZXksIG9wdGlvbmFsLCBsb3dlckJvdW5kVmlzaWJpbGl0eSwgdXBwZXJCb3VuZFZpc2liaWxpdHksIHByb3BlcnRpZXMpO1xuICAgIHRoaXMuX3ZlcmlmeSgpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdmVyaWZ5KCk6IHZvaWQge1xuICAgIHZhciBjb3VudCA9IDA7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5RGVjb3JhdG9yKSkgY291bnQrKztcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuYXR0cmlidXRlTmFtZSkpIGNvdW50Kys7XG4gICAgaWYgKGNvdW50ID4gMSlcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICdBIGRpcmVjdGl2ZSBpbmplY3RhYmxlIGNhbiBjb250YWluIG9ubHkgb25lIG9mIHRoZSBmb2xsb3dpbmcgQEF0dHJpYnV0ZSBvciBAUXVlcnkuJyk7XG4gIH1cblxuICBzdGF0aWMgY3JlYXRlRnJvbShkOiBEZXBlbmRlbmN5KTogRGVwZW5kZW5jeSB7XG4gICAgcmV0dXJuIG5ldyBEaXJlY3RpdmVEZXBlbmRlbmN5KFxuICAgICAgICBkLmtleSwgZC5vcHRpb25hbCwgZC5sb3dlckJvdW5kVmlzaWJpbGl0eSwgZC51cHBlckJvdW5kVmlzaWJpbGl0eSwgZC5wcm9wZXJ0aWVzLFxuICAgICAgICBEaXJlY3RpdmVEZXBlbmRlbmN5Ll9hdHRyaWJ1dGVOYW1lKGQucHJvcGVydGllcyksIERpcmVjdGl2ZURlcGVuZGVuY3kuX3F1ZXJ5KGQucHJvcGVydGllcykpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBzdGF0aWMgX2F0dHJpYnV0ZU5hbWUocHJvcGVydGllczogYW55W10pOiBzdHJpbmcge1xuICAgIHZhciBwID0gPEF0dHJpYnV0ZU1ldGFkYXRhPnByb3BlcnRpZXMuZmluZChwID0+IHAgaW5zdGFuY2VvZiBBdHRyaWJ1dGVNZXRhZGF0YSk7XG4gICAgcmV0dXJuIGlzUHJlc2VudChwKSA/IHAuYXR0cmlidXRlTmFtZSA6IG51bGw7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHN0YXRpYyBfcXVlcnkocHJvcGVydGllczogYW55W10pOiBRdWVyeU1ldGFkYXRhIHtcbiAgICByZXR1cm4gPFF1ZXJ5TWV0YWRhdGE+cHJvcGVydGllcy5maW5kKHAgPT4gcCBpbnN0YW5jZW9mIFF1ZXJ5TWV0YWRhdGEpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEaXJlY3RpdmVQcm92aWRlciBleHRlbmRzIFJlc29sdmVkUHJvdmlkZXJfIHtcbiAgcHVibGljIGNhbGxPbkRlc3Ryb3k6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3Ioa2V5OiBLZXksIGZhY3Rvcnk6IEZ1bmN0aW9uLCBkZXBzOiBEZXBlbmRlbmN5W10sIHB1YmxpYyBtZXRhZGF0YTogRGlyZWN0aXZlTWV0YWRhdGEsXG4gICAgICAgICAgICAgIHB1YmxpYyBwcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPixcbiAgICAgICAgICAgICAgcHVibGljIHZpZXdQcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPikge1xuICAgIHN1cGVyKGtleSwgW25ldyBSZXNvbHZlZEZhY3RvcnkoZmFjdG9yeSwgZGVwcyldLCBmYWxzZSk7XG4gICAgdGhpcy5jYWxsT25EZXN0cm95ID0gaGFzTGlmZWN5Y2xlSG9vayhMaWZlY3ljbGVIb29rcy5PbkRlc3Ryb3ksIGtleS50b2tlbik7XG4gIH1cblxuICBnZXQgZGlzcGxheU5hbWUoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMua2V5LmRpc3BsYXlOYW1lOyB9XG5cbiAgZ2V0IHF1ZXJpZXMoKTogUXVlcnlNZXRhZGF0YVdpdGhTZXR0ZXJbXSB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5tZXRhZGF0YS5xdWVyaWVzKSkgcmV0dXJuIFtdO1xuXG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaCh0aGlzLm1ldGFkYXRhLnF1ZXJpZXMsIChtZXRhLCBmaWVsZE5hbWUpID0+IHtcbiAgICAgIHZhciBzZXR0ZXIgPSByZWZsZWN0b3Iuc2V0dGVyKGZpZWxkTmFtZSk7XG4gICAgICByZXMucHVzaChuZXcgUXVlcnlNZXRhZGF0YVdpdGhTZXR0ZXIoc2V0dGVyLCBtZXRhKSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIGdldCBldmVudEVtaXR0ZXJzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMubWV0YWRhdGEpICYmIGlzUHJlc2VudCh0aGlzLm1ldGFkYXRhLm91dHB1dHMpID8gdGhpcy5tZXRhZGF0YS5vdXRwdXRzIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW107XG4gIH1cblxuICBzdGF0aWMgY3JlYXRlRnJvbVByb3ZpZGVyKHByb3ZpZGVyOiBQcm92aWRlciwgbWV0YTogRGlyZWN0aXZlTWV0YWRhdGEpOiBEaXJlY3RpdmVQcm92aWRlciB7XG4gICAgaWYgKGlzQmxhbmsobWV0YSkpIHtcbiAgICAgIG1ldGEgPSBuZXcgRGlyZWN0aXZlTWV0YWRhdGEoKTtcbiAgICB9XG5cbiAgICB2YXIgcmIgPSByZXNvbHZlUHJvdmlkZXIocHJvdmlkZXIpO1xuICAgIHZhciByZiA9IHJiLnJlc29sdmVkRmFjdG9yaWVzWzBdO1xuICAgIHZhciBkZXBzID0gcmYuZGVwZW5kZW5jaWVzLm1hcChEaXJlY3RpdmVEZXBlbmRlbmN5LmNyZWF0ZUZyb20pO1xuXG4gICAgdmFyIHByb3ZpZGVycyA9IGlzUHJlc2VudChtZXRhLnByb3ZpZGVycykgPyBtZXRhLnByb3ZpZGVycyA6IFtdO1xuICAgIHZhciB2aWV3QmluZGlncyA9IG1ldGEgaW5zdGFuY2VvZiBDb21wb25lbnRNZXRhZGF0YSAmJiBpc1ByZXNlbnQobWV0YS52aWV3UHJvdmlkZXJzKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGEudmlld1Byb3ZpZGVycyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFtdO1xuICAgIHJldHVybiBuZXcgRGlyZWN0aXZlUHJvdmlkZXIocmIua2V5LCByZi5mYWN0b3J5LCBkZXBzLCBtZXRhLCBwcm92aWRlcnMsIHZpZXdCaW5kaWdzKTtcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGVGcm9tVHlwZSh0eXBlOiBUeXBlLCBhbm5vdGF0aW9uOiBEaXJlY3RpdmVNZXRhZGF0YSk6IERpcmVjdGl2ZVByb3ZpZGVyIHtcbiAgICB2YXIgcHJvdmlkZXIgPSBuZXcgUHJvdmlkZXIodHlwZSwge3VzZUNsYXNzOiB0eXBlfSk7XG4gICAgcmV0dXJuIERpcmVjdGl2ZVByb3ZpZGVyLmNyZWF0ZUZyb21Qcm92aWRlcihwcm92aWRlciwgYW5ub3RhdGlvbik7XG4gIH1cbn1cblxuLy8gVE9ETyhyYWRvKTogYmVuY2htYXJrIGFuZCBjb25zaWRlciByb2xsaW5nIGluIGFzIEVsZW1lbnRJbmplY3RvciBmaWVsZHMuXG5leHBvcnQgY2xhc3MgUHJlQnVpbHRPYmplY3RzIHtcbiAgbmVzdGVkVmlldzogQXBwVmlldyA9IG51bGw7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2aWV3TWFuYWdlcjogYXZtTW9kdWxlLkFwcFZpZXdNYW5hZ2VyLCBwdWJsaWMgdmlldzogQXBwVmlldyxcbiAgICAgICAgICAgICAgcHVibGljIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsIHB1YmxpYyB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWYpIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBRdWVyeU1ldGFkYXRhV2l0aFNldHRlciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzZXR0ZXI6IFNldHRlckZuLCBwdWJsaWMgbWV0YWRhdGE6IFF1ZXJ5TWV0YWRhdGEpIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBFdmVudEVtaXR0ZXJBY2Nlc3NvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBldmVudE5hbWU6IHN0cmluZywgcHVibGljIGdldHRlcjogRnVuY3Rpb24pIHt9XG5cbiAgc3Vic2NyaWJlKHZpZXc6IEFwcFZpZXcsIGJvdW5kRWxlbWVudEluZGV4OiBudW1iZXIsIGRpcmVjdGl2ZTogT2JqZWN0KTogT2JqZWN0IHtcbiAgICB2YXIgZXZlbnRFbWl0dGVyID0gdGhpcy5nZXR0ZXIoZGlyZWN0aXZlKTtcbiAgICByZXR1cm4gT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlPEV2ZW50PihcbiAgICAgICAgZXZlbnRFbWl0dGVyLFxuICAgICAgICBldmVudE9iaiA9PiB2aWV3LnRyaWdnZXJFdmVudEhhbmRsZXJzKHRoaXMuZXZlbnROYW1lLCBldmVudE9iaiwgYm91bmRFbGVtZW50SW5kZXgpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfY3JlYXRlRXZlbnRFbWl0dGVyQWNjZXNzb3JzKGJ3djogUHJvdmlkZXJXaXRoVmlzaWJpbGl0eSk6IEV2ZW50RW1pdHRlckFjY2Vzc29yW10ge1xuICB2YXIgcHJvdmlkZXIgPSBid3YucHJvdmlkZXI7XG4gIGlmICghKHByb3ZpZGVyIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIpKSByZXR1cm4gW107XG4gIHZhciBkYiA9IDxEaXJlY3RpdmVQcm92aWRlcj5wcm92aWRlcjtcbiAgcmV0dXJuIGRiLmV2ZW50RW1pdHRlcnMubWFwKGV2ZW50Q29uZmlnID0+IHtcbiAgICB2YXIgcGFyc2VkRXZlbnQgPSBFdmVudENvbmZpZy5wYXJzZShldmVudENvbmZpZyk7XG4gICAgcmV0dXJuIG5ldyBFdmVudEVtaXR0ZXJBY2Nlc3NvcihwYXJzZWRFdmVudC5ldmVudE5hbWUsIHJlZmxlY3Rvci5nZXR0ZXIocGFyc2VkRXZlbnQuZmllbGROYW1lKSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBfY3JlYXRlUHJvdG9RdWVyeVJlZnMocHJvdmlkZXJzOiBQcm92aWRlcldpdGhWaXNpYmlsaXR5W10pOiBQcm90b1F1ZXJ5UmVmW10ge1xuICB2YXIgcmVzID0gW107XG4gIExpc3RXcmFwcGVyLmZvckVhY2hXaXRoSW5kZXgocHJvdmlkZXJzLCAoYiwgaSkgPT4ge1xuICAgIGlmIChiLnByb3ZpZGVyIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIpIHtcbiAgICAgIHZhciBkaXJlY3RpdmVQcm92aWRlciA9IDxEaXJlY3RpdmVQcm92aWRlcj5iLnByb3ZpZGVyO1xuICAgICAgLy8gZmllbGQgcXVlcmllc1xuICAgICAgdmFyIHF1ZXJpZXM6IFF1ZXJ5TWV0YWRhdGFXaXRoU2V0dGVyW10gPSBkaXJlY3RpdmVQcm92aWRlci5xdWVyaWVzO1xuICAgICAgcXVlcmllcy5mb3JFYWNoKHEgPT4gcmVzLnB1c2gobmV3IFByb3RvUXVlcnlSZWYoaSwgcS5zZXR0ZXIsIHEubWV0YWRhdGEpKSk7XG5cbiAgICAgIC8vIHF1ZXJpZXMgcGFzc2VkIGludG8gdGhlIGNvbnN0cnVjdG9yLlxuICAgICAgLy8gVE9ETzogcmVtb3ZlIHRoaXMgYWZ0ZXIgY29uc3RydWN0b3IgcXVlcmllcyBhcmUgbm8gbG9uZ2VyIHN1cHBvcnRlZFxuICAgICAgdmFyIGRlcHM6IERpcmVjdGl2ZURlcGVuZGVuY3lbXSA9XG4gICAgICAgICAgPERpcmVjdGl2ZURlcGVuZGVuY3lbXT5kaXJlY3RpdmVQcm92aWRlci5yZXNvbHZlZEZhY3RvcnkuZGVwZW5kZW5jaWVzO1xuICAgICAgZGVwcy5mb3JFYWNoKGQgPT4ge1xuICAgICAgICBpZiAoaXNQcmVzZW50KGQucXVlcnlEZWNvcmF0b3IpKSByZXMucHVzaChuZXcgUHJvdG9RdWVyeVJlZihpLCBudWxsLCBkLnF1ZXJ5RGVjb3JhdG9yKSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmVzO1xufVxuXG5leHBvcnQgY2xhc3MgUHJvdG9FbGVtZW50SW5qZWN0b3Ige1xuICB2aWV3OiBBcHBWaWV3O1xuICBhdHRyaWJ1dGVzOiBNYXA8c3RyaW5nLCBzdHJpbmc+O1xuICBldmVudEVtaXR0ZXJBY2Nlc3NvcnM6IEV2ZW50RW1pdHRlckFjY2Vzc29yW11bXTtcbiAgcHJvdG9RdWVyeVJlZnM6IFByb3RvUXVlcnlSZWZbXTtcbiAgcHJvdG9JbmplY3RvcjogUHJvdG9JbmplY3RvcjtcblxuICBzdGF0aWMgY3JlYXRlKHBhcmVudDogUHJvdG9FbGVtZW50SW5qZWN0b3IsIGluZGV4OiBudW1iZXIsIHByb3ZpZGVyczogRGlyZWN0aXZlUHJvdmlkZXJbXSxcbiAgICAgICAgICAgICAgICBmaXJzdFByb3ZpZGVySXNDb21wb25lbnQ6IGJvb2xlYW4sIGRpc3RhbmNlVG9QYXJlbnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzOiBNYXA8c3RyaW5nLCBudW1iZXI+KTogUHJvdG9FbGVtZW50SW5qZWN0b3Ige1xuICAgIHZhciBiZCA9IFtdO1xuXG4gICAgUHJvdG9FbGVtZW50SW5qZWN0b3IuX2NyZWF0ZURpcmVjdGl2ZVByb3ZpZGVyV2l0aFZpc2liaWxpdHkocHJvdmlkZXJzLCBiZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFByb3ZpZGVySXNDb21wb25lbnQpO1xuICAgIGlmIChmaXJzdFByb3ZpZGVySXNDb21wb25lbnQpIHtcbiAgICAgIFByb3RvRWxlbWVudEluamVjdG9yLl9jcmVhdGVWaWV3UHJvdmlkZXJzV2l0aFZpc2liaWxpdHkocHJvdmlkZXJzLCBiZCk7XG4gICAgfVxuXG4gICAgUHJvdG9FbGVtZW50SW5qZWN0b3IuX2NyZWF0ZVByb3ZpZGVyc1dpdGhWaXNpYmlsaXR5KHByb3ZpZGVycywgYmQpO1xuICAgIHJldHVybiBuZXcgUHJvdG9FbGVtZW50SW5qZWN0b3IocGFyZW50LCBpbmRleCwgYmQsIGRpc3RhbmNlVG9QYXJlbnQsIGZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGl2ZVZhcmlhYmxlQmluZGluZ3MpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgX2NyZWF0ZURpcmVjdGl2ZVByb3ZpZGVyV2l0aFZpc2liaWxpdHkoZGlyUHJvdmlkZXJzOiBEaXJlY3RpdmVQcm92aWRlcltdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZDogUHJvdmlkZXJXaXRoVmlzaWJpbGl0eVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFByb3ZpZGVySXNDb21wb25lbnQ6IGJvb2xlYW4pIHtcbiAgICBkaXJQcm92aWRlcnMuZm9yRWFjaChkaXJQcm92aWRlciA9PiB7XG4gICAgICBiZC5wdXNoKFByb3RvRWxlbWVudEluamVjdG9yLl9jcmVhdGVQcm92aWRlcldpdGhWaXNpYmlsaXR5KFxuICAgICAgICAgIGZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudCwgZGlyUHJvdmlkZXIsIGRpclByb3ZpZGVycywgZGlyUHJvdmlkZXIpKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIF9jcmVhdGVQcm92aWRlcnNXaXRoVmlzaWJpbGl0eShkaXJQcm92aWRlcnM6IERpcmVjdGl2ZVByb3ZpZGVyW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZDogUHJvdmlkZXJXaXRoVmlzaWJpbGl0eVtdKSB7XG4gICAgdmFyIHByb3ZpZGVyc0Zyb21BbGxEaXJlY3RpdmVzID0gW107XG4gICAgZGlyUHJvdmlkZXJzLmZvckVhY2goZGlyUHJvdmlkZXIgPT4ge1xuICAgICAgcHJvdmlkZXJzRnJvbUFsbERpcmVjdGl2ZXMgPVxuICAgICAgICAgIExpc3RXcmFwcGVyLmNvbmNhdChwcm92aWRlcnNGcm9tQWxsRGlyZWN0aXZlcywgZGlyUHJvdmlkZXIucHJvdmlkZXJzKTtcbiAgICB9KTtcblxuICAgIHZhciByZXNvbHZlZCA9IEluamVjdG9yLnJlc29sdmUocHJvdmlkZXJzRnJvbUFsbERpcmVjdGl2ZXMpO1xuICAgIHJlc29sdmVkLmZvckVhY2goYiA9PiBiZC5wdXNoKG5ldyBQcm92aWRlcldpdGhWaXNpYmlsaXR5KGIsIFZpc2liaWxpdHkuUHVibGljKSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgX2NyZWF0ZVByb3ZpZGVyV2l0aFZpc2liaWxpdHkoZmlyc3RQcm92aWRlcklzQ29tcG9uZW50OiBib29sZWFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJQcm92aWRlcjogRGlyZWN0aXZlUHJvdmlkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpclByb3ZpZGVyczogRGlyZWN0aXZlUHJvdmlkZXJbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXI6IFJlc29sdmVkUHJvdmlkZXIpIHtcbiAgICB2YXIgaXNDb21wb25lbnQgPSBmaXJzdFByb3ZpZGVySXNDb21wb25lbnQgJiYgZGlyUHJvdmlkZXJzWzBdID09PSBkaXJQcm92aWRlcjtcbiAgICByZXR1cm4gbmV3IFByb3ZpZGVyV2l0aFZpc2liaWxpdHkoXG4gICAgICAgIHByb3ZpZGVyLCBpc0NvbXBvbmVudCA/IFZpc2liaWxpdHkuUHVibGljQW5kUHJpdmF0ZSA6IFZpc2liaWxpdHkuUHVibGljKTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIF9jcmVhdGVWaWV3UHJvdmlkZXJzV2l0aFZpc2liaWxpdHkoZGlyUHJvdmlkZXJzOiBEaXJlY3RpdmVQcm92aWRlcltdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJkOiBQcm92aWRlcldpdGhWaXNpYmlsaXR5W10pIHtcbiAgICB2YXIgcmVzb2x2ZWRWaWV3UHJvdmlkZXJzID0gSW5qZWN0b3IucmVzb2x2ZShkaXJQcm92aWRlcnNbMF0udmlld1Byb3ZpZGVycyk7XG4gICAgcmVzb2x2ZWRWaWV3UHJvdmlkZXJzLmZvckVhY2goYiA9PiBiZC5wdXNoKG5ldyBQcm92aWRlcldpdGhWaXNpYmlsaXR5KGIsIFZpc2liaWxpdHkuUHJpdmF0ZSkpKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIF9maXJzdFByb3ZpZGVySXNDb21wb25lbnQ6IGJvb2xlYW47XG5cblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGFyZW50OiBQcm90b0VsZW1lbnRJbmplY3RvciwgcHVibGljIGluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgIGJ3djogUHJvdmlkZXJXaXRoVmlzaWJpbGl0eVtdLCBwdWJsaWMgZGlzdGFuY2VUb1BhcmVudDogbnVtYmVyLFxuICAgICAgICAgICAgICBfZmlyc3RQcm92aWRlcklzQ29tcG9uZW50OiBib29sZWFuLFxuICAgICAgICAgICAgICBwdWJsaWMgZGlyZWN0aXZlVmFyaWFibGVCaW5kaW5nczogTWFwPHN0cmluZywgbnVtYmVyPikge1xuICAgIHRoaXMuX2ZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudCA9IF9maXJzdFByb3ZpZGVySXNDb21wb25lbnQ7XG4gICAgdmFyIGxlbmd0aCA9IGJ3di5sZW5ndGg7XG4gICAgdGhpcy5wcm90b0luamVjdG9yID0gbmV3IFByb3RvSW5qZWN0b3IoYnd2KTtcbiAgICB0aGlzLmV2ZW50RW1pdHRlckFjY2Vzc29ycyA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICAgIHRoaXMuZXZlbnRFbWl0dGVyQWNjZXNzb3JzW2ldID0gX2NyZWF0ZUV2ZW50RW1pdHRlckFjY2Vzc29ycyhid3ZbaV0pO1xuICAgIH1cbiAgICB0aGlzLnByb3RvUXVlcnlSZWZzID0gX2NyZWF0ZVByb3RvUXVlcnlSZWZzKGJ3dik7XG4gIH1cblxuICBpbnN0YW50aWF0ZShwYXJlbnQ6IEVsZW1lbnRJbmplY3Rvcik6IEVsZW1lbnRJbmplY3RvciB7XG4gICAgcmV0dXJuIG5ldyBFbGVtZW50SW5qZWN0b3IodGhpcywgcGFyZW50KTtcbiAgfVxuXG4gIGRpcmVjdFBhcmVudCgpOiBQcm90b0VsZW1lbnRJbmplY3RvciB7IHJldHVybiB0aGlzLmRpc3RhbmNlVG9QYXJlbnQgPCAyID8gdGhpcy5wYXJlbnQgOiBudWxsOyB9XG5cbiAgZ2V0IGhhc0JpbmRpbmdzKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5ldmVudEVtaXR0ZXJBY2Nlc3NvcnMubGVuZ3RoID4gMDsgfVxuXG4gIGdldFByb3ZpZGVyQXRJbmRleChpbmRleDogbnVtYmVyKTogYW55IHsgcmV0dXJuIHRoaXMucHJvdG9JbmplY3Rvci5nZXRQcm92aWRlckF0SW5kZXgoaW5kZXgpOyB9XG59XG5cbmNsYXNzIF9Db250ZXh0IHtcbiAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnQ6IGFueSwgcHVibGljIGNvbXBvbmVudEVsZW1lbnQ6IGFueSwgcHVibGljIGluamVjdG9yOiBhbnkpIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50SW5qZWN0b3IgZXh0ZW5kcyBUcmVlTm9kZTxFbGVtZW50SW5qZWN0b3I+IGltcGxlbWVudHMgRGVwZW5kZW5jeVByb3ZpZGVyIHtcbiAgcHJpdmF0ZSBfaG9zdDogRWxlbWVudEluamVjdG9yO1xuICBwcml2YXRlIF9wcmVCdWlsdE9iamVjdHM6IFByZUJ1aWx0T2JqZWN0cyA9IG51bGw7XG4gIHByaXZhdGUgX3F1ZXJ5U3RyYXRlZ3k6IF9RdWVyeVN0cmF0ZWd5O1xuXG4gIGh5ZHJhdGVkOiBib29sZWFuO1xuXG4gIHByaXZhdGUgX2luamVjdG9yOiBJbmplY3RvcjtcbiAgcHJpdmF0ZSBfc3RyYXRlZ3k6IF9FbGVtZW50SW5qZWN0b3JTdHJhdGVneTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwdWJsaWMgX3Byb3RvOiBQcm90b0VsZW1lbnRJbmplY3RvcjtcblxuICBjb25zdHJ1Y3RvcihfcHJvdG86IFByb3RvRWxlbWVudEluamVjdG9yLCBwYXJlbnQ6IEVsZW1lbnRJbmplY3Rvcikge1xuICAgIHN1cGVyKHBhcmVudCk7XG4gICAgdGhpcy5fcHJvdG8gPSBfcHJvdG87XG4gICAgdGhpcy5faW5qZWN0b3IgPVxuICAgICAgICBuZXcgSW5qZWN0b3IodGhpcy5fcHJvdG8ucHJvdG9JbmplY3RvciwgbnVsbCwgdGhpcywgKCkgPT4gdGhpcy5fZGVidWdDb250ZXh0KCkpO1xuXG4gICAgLy8gd2UgY291cGxlIG91cnNlbHZlcyB0byB0aGUgaW5qZWN0b3Igc3RyYXRlZ3kgdG8gYXZvaWQgcG9seW1vcHJoaWMgY2FsbHNcbiAgICB2YXIgaW5qZWN0b3JTdHJhdGVneSA9IDxhbnk+dGhpcy5faW5qZWN0b3IuaW50ZXJuYWxTdHJhdGVneTtcbiAgICB0aGlzLl9zdHJhdGVneSA9IGluamVjdG9yU3RyYXRlZ3kgaW5zdGFuY2VvZiBJbmplY3RvcklubGluZVN0cmF0ZWd5ID9cbiAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRWxlbWVudEluamVjdG9ySW5saW5lU3RyYXRlZ3koaW5qZWN0b3JTdHJhdGVneSwgdGhpcykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBFbGVtZW50SW5qZWN0b3JEeW5hbWljU3RyYXRlZ3koaW5qZWN0b3JTdHJhdGVneSwgdGhpcyk7XG5cbiAgICB0aGlzLmh5ZHJhdGVkID0gZmFsc2U7XG5cbiAgICB0aGlzLl9xdWVyeVN0cmF0ZWd5ID0gdGhpcy5fYnVpbGRRdWVyeVN0cmF0ZWd5KCk7XG4gIH1cblxuICBkZWh5ZHJhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5oeWRyYXRlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2hvc3QgPSBudWxsO1xuICAgIHRoaXMuX3ByZUJ1aWx0T2JqZWN0cyA9IG51bGw7XG4gICAgdGhpcy5fc3RyYXRlZ3kuY2FsbE9uRGVzdHJveSgpO1xuICAgIHRoaXMuX3N0cmF0ZWd5LmRlaHlkcmF0ZSgpO1xuICAgIHRoaXMuX3F1ZXJ5U3RyYXRlZ3kuZGVoeWRyYXRlKCk7XG4gIH1cblxuICBoeWRyYXRlKGltcGVyYXRpdmVseUNyZWF0ZWRJbmplY3RvcjogSW5qZWN0b3IsIGhvc3Q6IEVsZW1lbnRJbmplY3RvcixcbiAgICAgICAgICBwcmVCdWlsdE9iamVjdHM6IFByZUJ1aWx0T2JqZWN0cyk6IHZvaWQge1xuICAgIHRoaXMuX2hvc3QgPSBob3N0O1xuICAgIHRoaXMuX3ByZUJ1aWx0T2JqZWN0cyA9IHByZUJ1aWx0T2JqZWN0cztcblxuICAgIHRoaXMuX3JlYXR0YWNoSW5qZWN0b3JzKGltcGVyYXRpdmVseUNyZWF0ZWRJbmplY3Rvcik7XG4gICAgdGhpcy5fcXVlcnlTdHJhdGVneS5oeWRyYXRlKCk7XG4gICAgdGhpcy5fc3RyYXRlZ3kuaHlkcmF0ZSgpO1xuXG4gICAgdGhpcy5oeWRyYXRlZCA9IHRydWU7XG4gIH1cblxuICBwcml2YXRlIF9kZWJ1Z0NvbnRleHQoKTogYW55IHtcbiAgICB2YXIgcCA9IHRoaXMuX3ByZUJ1aWx0T2JqZWN0cztcbiAgICB2YXIgaW5kZXggPSBwLmVsZW1lbnRSZWYuYm91bmRFbGVtZW50SW5kZXggLSBwLnZpZXcuZWxlbWVudE9mZnNldDtcbiAgICB2YXIgYyA9IHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy52aWV3LmdldERlYnVnQ29udGV4dChpbmRleCwgbnVsbCk7XG4gICAgcmV0dXJuIGlzUHJlc2VudChjKSA/IG5ldyBfQ29udGV4dChjLmVsZW1lbnQsIGMuY29tcG9uZW50RWxlbWVudCwgYy5pbmplY3RvcikgOiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVhdHRhY2hJbmplY3RvcnMoaW1wZXJhdGl2ZWx5Q3JlYXRlZEluamVjdG9yOiBJbmplY3Rvcik6IHZvaWQge1xuICAgIC8vIER5bmFtaWNhbGx5LWxvYWRlZCBjb21wb25lbnQgaW4gdGhlIHRlbXBsYXRlLiBOb3QgYSByb290IEVsZW1lbnRJbmplY3Rvci5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3BhcmVudCkpIHtcbiAgICAgIGlmIChpc1ByZXNlbnQoaW1wZXJhdGl2ZWx5Q3JlYXRlZEluamVjdG9yKSkge1xuICAgICAgICAvLyBUaGUgaW1wZXJhdGl2ZSBpbmplY3RvciBpcyBzaW1pbGFyIHRvIGhhdmluZyBhbiBlbGVtZW50IGJldHdlZW5cbiAgICAgICAgLy8gdGhlIGR5bmFtaWMtbG9hZGVkIGNvbXBvbmVudCBhbmQgaXRzIHBhcmVudCA9PiBubyBib3VuZGFyaWVzLlxuICAgICAgICB0aGlzLl9yZWF0dGFjaEluamVjdG9yKHRoaXMuX2luamVjdG9yLCBpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5fcmVhdHRhY2hJbmplY3RvcihpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IsIHRoaXMuX3BhcmVudC5faW5qZWN0b3IsIGZhbHNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3JlYXR0YWNoSW5qZWN0b3IodGhpcy5faW5qZWN0b3IsIHRoaXMuX3BhcmVudC5faW5qZWN0b3IsIGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgLy8gRHluYW1pY2FsbHktbG9hZGVkIGNvbXBvbmVudCBpbiB0aGUgdGVtcGxhdGUuIEEgcm9vdCBFbGVtZW50SW5qZWN0b3IuXG4gICAgfSBlbHNlIGlmIChpc1ByZXNlbnQodGhpcy5faG9zdCkpIHtcbiAgICAgIC8vIFRoZSBpbXBlcmF0aXZlIGluamVjdG9yIGlzIHNpbWlsYXIgdG8gaGF2aW5nIGFuIGVsZW1lbnQgYmV0d2VlblxuICAgICAgLy8gdGhlIGR5bmFtaWMtbG9hZGVkIGNvbXBvbmVudCBhbmQgaXRzIHBhcmVudCA9PiBubyBib3VuZGFyeSBiZXR3ZWVuXG4gICAgICAvLyB0aGUgY29tcG9uZW50IGFuZCBpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IuXG4gICAgICAvLyBCdXQgc2luY2UgaXQgaXMgYSByb290IEVsZW1lbnRJbmplY3Rvciwgd2UgbmVlZCB0byBjcmVhdGUgYSBib3VuZGFyeVxuICAgICAgLy8gYmV0d2VlbiBpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IgYW5kIF9ob3N0LlxuICAgICAgaWYgKGlzUHJlc2VudChpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IpKSB7XG4gICAgICAgIHRoaXMuX3JlYXR0YWNoSW5qZWN0b3IodGhpcy5faW5qZWN0b3IsIGltcGVyYXRpdmVseUNyZWF0ZWRJbmplY3RvciwgZmFsc2UpO1xuICAgICAgICB0aGlzLl9yZWF0dGFjaEluamVjdG9yKGltcGVyYXRpdmVseUNyZWF0ZWRJbmplY3RvciwgdGhpcy5faG9zdC5faW5qZWN0b3IsIHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcmVhdHRhY2hJbmplY3Rvcih0aGlzLl9pbmplY3RvciwgdGhpcy5faG9zdC5faW5qZWN0b3IsIHRydWUpO1xuICAgICAgfVxuXG4gICAgICAvLyBCb290c3RyYXBcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGlzUHJlc2VudChpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IpKSB7XG4gICAgICAgIHRoaXMuX3JlYXR0YWNoSW5qZWN0b3IodGhpcy5faW5qZWN0b3IsIGltcGVyYXRpdmVseUNyZWF0ZWRJbmplY3RvciwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcmVhdHRhY2hJbmplY3RvcihpbmplY3RvcjogSW5qZWN0b3IsIHBhcmVudEluamVjdG9yOiBJbmplY3RvciwgaXNCb3VuZGFyeTogYm9vbGVhbikge1xuICAgIGluamVjdG9yLmludGVybmFsU3RyYXRlZ3kuYXR0YWNoKHBhcmVudEluamVjdG9yLCBpc0JvdW5kYXJ5KTtcbiAgfVxuXG4gIGhhc1ZhcmlhYmxlQmluZGluZyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB2YXIgdmIgPSB0aGlzLl9wcm90by5kaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzO1xuICAgIHJldHVybiBpc1ByZXNlbnQodmIpICYmIHZiLmhhcyhuYW1lKTtcbiAgfVxuXG4gIGdldFZhcmlhYmxlQmluZGluZyhuYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuX3Byb3RvLmRpcmVjdGl2ZVZhcmlhYmxlQmluZGluZ3MuZ2V0KG5hbWUpO1xuICAgIHJldHVybiBpc1ByZXNlbnQoaW5kZXgpID8gdGhpcy5nZXREaXJlY3RpdmVBdEluZGV4KDxudW1iZXI+aW5kZXgpIDogdGhpcy5nZXRFbGVtZW50UmVmKCk7XG4gIH1cblxuICBnZXQodG9rZW46IGFueSk6IGFueSB7IHJldHVybiB0aGlzLl9pbmplY3Rvci5nZXQodG9rZW4pOyB9XG5cbiAgaGFzRGlyZWN0aXZlKHR5cGU6IFR5cGUpOiBib29sZWFuIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9pbmplY3Rvci5nZXRPcHRpb25hbCh0eXBlKSk7IH1cblxuICBnZXRFdmVudEVtaXR0ZXJBY2Nlc3NvcnMoKTogRXZlbnRFbWl0dGVyQWNjZXNzb3JbXVtdIHsgcmV0dXJuIHRoaXMuX3Byb3RvLmV2ZW50RW1pdHRlckFjY2Vzc29yczsgfVxuXG4gIGdldERpcmVjdGl2ZVZhcmlhYmxlQmluZGluZ3MoKTogTWFwPHN0cmluZywgbnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3RvLmRpcmVjdGl2ZVZhcmlhYmxlQmluZGluZ3M7XG4gIH1cblxuICBnZXRDb21wb25lbnQoKTogYW55IHsgcmV0dXJuIHRoaXMuX3N0cmF0ZWd5LmdldENvbXBvbmVudCgpOyB9XG5cbiAgZ2V0SW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gdGhpcy5faW5qZWN0b3I7IH1cblxuICBnZXRFbGVtZW50UmVmKCk6IEVsZW1lbnRSZWYgeyByZXR1cm4gdGhpcy5fcHJlQnVpbHRPYmplY3RzLmVsZW1lbnRSZWY7IH1cblxuICBnZXRWaWV3Q29udGFpbmVyUmVmKCk6IFZpZXdDb250YWluZXJSZWYge1xuICAgIHJldHVybiBuZXcgVmlld0NvbnRhaW5lclJlZl8odGhpcy5fcHJlQnVpbHRPYmplY3RzLnZpZXdNYW5hZ2VyLCB0aGlzLmdldEVsZW1lbnRSZWYoKSk7XG4gIH1cblxuICBnZXROZXN0ZWRWaWV3KCk6IEFwcFZpZXcgeyByZXR1cm4gdGhpcy5fcHJlQnVpbHRPYmplY3RzLm5lc3RlZFZpZXc7IH1cblxuICBnZXRWaWV3KCk6IEFwcFZpZXcgeyByZXR1cm4gdGhpcy5fcHJlQnVpbHRPYmplY3RzLnZpZXc7IH1cblxuICBkaXJlY3RQYXJlbnQoKTogRWxlbWVudEluamVjdG9yIHsgcmV0dXJuIHRoaXMuX3Byb3RvLmRpc3RhbmNlVG9QYXJlbnQgPCAyID8gdGhpcy5wYXJlbnQgOiBudWxsOyB9XG5cbiAgaXNDb21wb25lbnRLZXkoa2V5OiBLZXkpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3N0cmF0ZWd5LmlzQ29tcG9uZW50S2V5KGtleSk7IH1cblxuICBnZXREZXBlbmRlbmN5KGluamVjdG9yOiBJbmplY3RvciwgcHJvdmlkZXI6IFJlc29sdmVkUHJvdmlkZXIsIGRlcDogRGVwZW5kZW5jeSk6IGFueSB7XG4gICAgdmFyIGtleTogS2V5ID0gZGVwLmtleTtcblxuICAgIGlmIChwcm92aWRlciBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyKSB7XG4gICAgICB2YXIgZGlyRGVwID0gPERpcmVjdGl2ZURlcGVuZGVuY3k+ZGVwO1xuICAgICAgdmFyIGRpclByb3ZpZGVyID0gcHJvdmlkZXI7XG4gICAgICB2YXIgc3RhdGljS2V5cyA9IFN0YXRpY0tleXMuaW5zdGFuY2UoKTtcblxuXG4gICAgICBpZiAoa2V5LmlkID09PSBzdGF0aWNLZXlzLnZpZXdNYW5hZ2VySWQpIHJldHVybiB0aGlzLl9wcmVCdWlsdE9iamVjdHMudmlld01hbmFnZXI7XG5cbiAgICAgIGlmIChpc1ByZXNlbnQoZGlyRGVwLmF0dHJpYnV0ZU5hbWUpKSByZXR1cm4gdGhpcy5fYnVpbGRBdHRyaWJ1dGUoZGlyRGVwKTtcblxuICAgICAgaWYgKGlzUHJlc2VudChkaXJEZXAucXVlcnlEZWNvcmF0b3IpKVxuICAgICAgICByZXR1cm4gdGhpcy5fcXVlcnlTdHJhdGVneS5maW5kUXVlcnkoZGlyRGVwLnF1ZXJ5RGVjb3JhdG9yKS5saXN0O1xuXG4gICAgICBpZiAoZGlyRGVwLmtleS5pZCA9PT0gU3RhdGljS2V5cy5pbnN0YW5jZSgpLmNoYW5nZURldGVjdG9yUmVmSWQpIHtcbiAgICAgICAgLy8gV2UgcHJvdmlkZSB0aGUgY29tcG9uZW50J3MgdmlldyBjaGFuZ2UgZGV0ZWN0b3IgdG8gY29tcG9uZW50cyBhbmRcbiAgICAgICAgLy8gdGhlIHN1cnJvdW5kaW5nIGNvbXBvbmVudCdzIGNoYW5nZSBkZXRlY3RvciB0byBkaXJlY3RpdmVzLlxuICAgICAgICBpZiAoZGlyUHJvdmlkZXIubWV0YWRhdGEgaW5zdGFuY2VvZiBDb21wb25lbnRNZXRhZGF0YSkge1xuICAgICAgICAgIHZhciBjb21wb25lbnRWaWV3ID0gdGhpcy5fcHJlQnVpbHRPYmplY3RzLnZpZXcuZ2V0TmVzdGVkVmlldyhcbiAgICAgICAgICAgICAgdGhpcy5fcHJlQnVpbHRPYmplY3RzLmVsZW1lbnRSZWYuYm91bmRFbGVtZW50SW5kZXgpO1xuICAgICAgICAgIHJldHVybiBjb21wb25lbnRWaWV3LmNoYW5nZURldGVjdG9yLnJlZjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fcHJlQnVpbHRPYmplY3RzLnZpZXcuY2hhbmdlRGV0ZWN0b3IucmVmO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChkaXJEZXAua2V5LmlkID09PSBTdGF0aWNLZXlzLmluc3RhbmNlKCkuZWxlbWVudFJlZklkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEVsZW1lbnRSZWYoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRpckRlcC5rZXkuaWQgPT09IFN0YXRpY0tleXMuaW5zdGFuY2UoKS52aWV3Q29udGFpbmVySWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Vmlld0NvbnRhaW5lclJlZigpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGlyRGVwLmtleS5pZCA9PT0gU3RhdGljS2V5cy5pbnN0YW5jZSgpLnRlbXBsYXRlUmVmSWQpIHtcbiAgICAgICAgaWYgKGlzQmxhbmsodGhpcy5fcHJlQnVpbHRPYmplY3RzLnRlbXBsYXRlUmVmKSkge1xuICAgICAgICAgIGlmIChkaXJEZXAub3B0aW9uYWwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRocm93IG5ldyBOb1Byb3ZpZGVyRXJyb3IobnVsbCwgZGlyRGVwLmtleSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy50ZW1wbGF0ZVJlZjtcbiAgICAgIH1cblxuICAgIH0gZWxzZSBpZiAocHJvdmlkZXIgaW5zdGFuY2VvZiBQaXBlUHJvdmlkZXIpIHtcbiAgICAgIGlmIChkZXAua2V5LmlkID09PSBTdGF0aWNLZXlzLmluc3RhbmNlKCkuY2hhbmdlRGV0ZWN0b3JSZWZJZCkge1xuICAgICAgICB2YXIgY29tcG9uZW50VmlldyA9IHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy52aWV3LmdldE5lc3RlZFZpZXcoXG4gICAgICAgICAgICB0aGlzLl9wcmVCdWlsdE9iamVjdHMuZWxlbWVudFJlZi5ib3VuZEVsZW1lbnRJbmRleCk7XG4gICAgICAgIHJldHVybiBjb21wb25lbnRWaWV3LmNoYW5nZURldGVjdG9yLnJlZjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gVU5ERUZJTkVEO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRBdHRyaWJ1dGUoZGVwOiBEaXJlY3RpdmVEZXBlbmRlbmN5KTogc3RyaW5nIHtcbiAgICB2YXIgYXR0cmlidXRlcyA9IHRoaXMuX3Byb3RvLmF0dHJpYnV0ZXM7XG4gICAgaWYgKGlzUHJlc2VudChhdHRyaWJ1dGVzKSAmJiBhdHRyaWJ1dGVzLmhhcyhkZXAuYXR0cmlidXRlTmFtZSkpIHtcbiAgICAgIHJldHVybiBhdHRyaWJ1dGVzLmdldChkZXAuYXR0cmlidXRlTmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5KHF1ZXJ5OiBRdWVyeU1ldGFkYXRhLCBsaXN0OiBhbnlbXSk6IHZvaWQge1xuICAgIHZhciB0ZW1wbGF0ZVJlZiA9IGlzQmxhbmsodGhpcy5fcHJlQnVpbHRPYmplY3RzKSA/IG51bGwgOiB0aGlzLl9wcmVCdWlsdE9iamVjdHMudGVtcGxhdGVSZWY7XG4gICAgaWYgKHF1ZXJ5LnNlbGVjdG9yID09PSBUZW1wbGF0ZVJlZiAmJiBpc1ByZXNlbnQodGVtcGxhdGVSZWYpKSB7XG4gICAgICBsaXN0LnB1c2godGVtcGxhdGVSZWYpO1xuICAgIH1cbiAgICB0aGlzLl9zdHJhdGVneS5hZGREaXJlY3RpdmVzTWF0Y2hpbmdRdWVyeShxdWVyeSwgbGlzdCk7XG4gIH1cblxuICBwcml2YXRlIF9idWlsZFF1ZXJ5U3RyYXRlZ3koKTogX1F1ZXJ5U3RyYXRlZ3kge1xuICAgIGlmICh0aGlzLl9wcm90by5wcm90b1F1ZXJ5UmVmcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBfZW1wdHlRdWVyeVN0cmF0ZWd5O1xuICAgIH0gZWxzZSBpZiAodGhpcy5fcHJvdG8ucHJvdG9RdWVyeVJlZnMubGVuZ3RoIDw9XG4gICAgICAgICAgICAgICBJbmxpbmVRdWVyeVN0cmF0ZWd5Lk5VTUJFUl9PRl9TVVBQT1JURURfUVVFUklFUykge1xuICAgICAgcmV0dXJuIG5ldyBJbmxpbmVRdWVyeVN0cmF0ZWd5KHRoaXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IER5bmFtaWNRdWVyeVN0cmF0ZWd5KHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIGxpbmsocGFyZW50OiBFbGVtZW50SW5qZWN0b3IpOiB2b2lkIHsgcGFyZW50LmFkZENoaWxkKHRoaXMpOyB9XG5cbiAgdW5saW5rKCk6IHZvaWQgeyB0aGlzLnJlbW92ZSgpOyB9XG5cbiAgZ2V0RGlyZWN0aXZlQXRJbmRleChpbmRleDogbnVtYmVyKTogYW55IHsgcmV0dXJuIHRoaXMuX2luamVjdG9yLmdldEF0KGluZGV4KTsgfVxuXG4gIGhhc0luc3RhbmNlcygpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3Byb3RvLmhhc0JpbmRpbmdzICYmIHRoaXMuaHlkcmF0ZWQ7IH1cblxuICBnZXRIb3N0KCk6IEVsZW1lbnRJbmplY3RvciB7IHJldHVybiB0aGlzLl9ob3N0OyB9XG5cbiAgZ2V0Qm91bmRFbGVtZW50SW5kZXgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3Byb3RvLmluZGV4OyB9XG5cbiAgZ2V0Um9vdFZpZXdJbmplY3RvcnMoKTogRWxlbWVudEluamVjdG9yW10ge1xuICAgIGlmICghdGhpcy5oeWRyYXRlZCkgcmV0dXJuIFtdO1xuICAgIHZhciB2aWV3ID0gdGhpcy5fcHJlQnVpbHRPYmplY3RzLnZpZXc7XG4gICAgdmFyIG5lc3RlZFZpZXcgPSB2aWV3LmdldE5lc3RlZFZpZXcodmlldy5lbGVtZW50T2Zmc2V0ICsgdGhpcy5nZXRCb3VuZEVsZW1lbnRJbmRleCgpKTtcbiAgICByZXR1cm4gaXNQcmVzZW50KG5lc3RlZFZpZXcpID8gbmVzdGVkVmlldy5yb290RWxlbWVudEluamVjdG9ycyA6IFtdO1xuICB9XG5cbiAgYWZ0ZXJWaWV3Q2hlY2tlZCgpOiB2b2lkIHsgdGhpcy5fcXVlcnlTdHJhdGVneS51cGRhdGVWaWV3UXVlcmllcygpOyB9XG5cbiAgYWZ0ZXJDb250ZW50Q2hlY2tlZCgpOiB2b2lkIHsgdGhpcy5fcXVlcnlTdHJhdGVneS51cGRhdGVDb250ZW50UXVlcmllcygpOyB9XG5cbiAgdHJhdmVyc2VBbmRTZXRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHtcbiAgICB2YXIgaW5qID0gdGhpcztcbiAgICB3aGlsZSAoaXNQcmVzZW50KGluaikpIHtcbiAgICAgIGluai5fc2V0UXVlcmllc0FzRGlydHkoKTtcbiAgICAgIGluaiA9IGluai5wYXJlbnQ7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfc2V0UXVlcmllc0FzRGlydHkoKTogdm9pZCB7XG4gICAgdGhpcy5fcXVlcnlTdHJhdGVneS5zZXRDb250ZW50UXVlcmllc0FzRGlydHkoKTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2hvc3QpKSB0aGlzLl9ob3N0Ll9xdWVyeVN0cmF0ZWd5LnNldFZpZXdRdWVyaWVzQXNEaXJ0eSgpO1xuICB9XG59XG5cbmludGVyZmFjZSBfUXVlcnlTdHJhdGVneSB7XG4gIHNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkO1xuICBzZXRWaWV3UXVlcmllc0FzRGlydHkoKTogdm9pZDtcbiAgaHlkcmF0ZSgpOiB2b2lkO1xuICBkZWh5ZHJhdGUoKTogdm9pZDtcbiAgdXBkYXRlQ29udGVudFF1ZXJpZXMoKTogdm9pZDtcbiAgdXBkYXRlVmlld1F1ZXJpZXMoKTogdm9pZDtcbiAgZmluZFF1ZXJ5KHF1ZXJ5OiBRdWVyeU1ldGFkYXRhKTogUXVlcnlSZWY7XG59XG5cbmNsYXNzIF9FbXB0eVF1ZXJ5U3RyYXRlZ3kgaW1wbGVtZW50cyBfUXVlcnlTdHJhdGVneSB7XG4gIHNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHt9XG4gIHNldFZpZXdRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHt9XG4gIGh5ZHJhdGUoKTogdm9pZCB7fVxuICBkZWh5ZHJhdGUoKTogdm9pZCB7fVxuICB1cGRhdGVDb250ZW50UXVlcmllcygpOiB2b2lkIHt9XG4gIHVwZGF0ZVZpZXdRdWVyaWVzKCk6IHZvaWQge31cbiAgZmluZFF1ZXJ5KHF1ZXJ5OiBRdWVyeU1ldGFkYXRhKTogUXVlcnlSZWYge1xuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW5ub3QgZmluZCBxdWVyeSBmb3IgZGlyZWN0aXZlICR7cXVlcnl9LmApO1xuICB9XG59XG5cbnZhciBfZW1wdHlRdWVyeVN0cmF0ZWd5ID0gbmV3IF9FbXB0eVF1ZXJ5U3RyYXRlZ3koKTtcblxuY2xhc3MgSW5saW5lUXVlcnlTdHJhdGVneSBpbXBsZW1lbnRzIF9RdWVyeVN0cmF0ZWd5IHtcbiAgc3RhdGljIE5VTUJFUl9PRl9TVVBQT1JURURfUVVFUklFUyA9IDM7XG5cbiAgcXVlcnkwOiBRdWVyeVJlZjtcbiAgcXVlcnkxOiBRdWVyeVJlZjtcbiAgcXVlcnkyOiBRdWVyeVJlZjtcblxuICBjb25zdHJ1Y3RvcihlaTogRWxlbWVudEluamVjdG9yKSB7XG4gICAgdmFyIHByb3RvUmVmcyA9IGVpLl9wcm90by5wcm90b1F1ZXJ5UmVmcztcbiAgICBpZiAocHJvdG9SZWZzLmxlbmd0aCA+IDApIHRoaXMucXVlcnkwID0gbmV3IFF1ZXJ5UmVmKHByb3RvUmVmc1swXSwgZWkpO1xuICAgIGlmIChwcm90b1JlZnMubGVuZ3RoID4gMSkgdGhpcy5xdWVyeTEgPSBuZXcgUXVlcnlSZWYocHJvdG9SZWZzWzFdLCBlaSk7XG4gICAgaWYgKHByb3RvUmVmcy5sZW5ndGggPiAyKSB0aGlzLnF1ZXJ5MiA9IG5ldyBRdWVyeVJlZihwcm90b1JlZnNbMl0sIGVpKTtcbiAgfVxuXG4gIHNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkwKSAmJiAhdGhpcy5xdWVyeTAuaXNWaWV3UXVlcnkpIHRoaXMucXVlcnkwLmRpcnR5ID0gdHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkxKSAmJiAhdGhpcy5xdWVyeTEuaXNWaWV3UXVlcnkpIHRoaXMucXVlcnkxLmRpcnR5ID0gdHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkyKSAmJiAhdGhpcy5xdWVyeTIuaXNWaWV3UXVlcnkpIHRoaXMucXVlcnkyLmRpcnR5ID0gdHJ1ZTtcbiAgfVxuXG4gIHNldFZpZXdRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkwKSAmJiB0aGlzLnF1ZXJ5MC5pc1ZpZXdRdWVyeSkgdGhpcy5xdWVyeTAuZGlydHkgPSB0cnVlO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTEpICYmIHRoaXMucXVlcnkxLmlzVmlld1F1ZXJ5KSB0aGlzLnF1ZXJ5MS5kaXJ0eSA9IHRydWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MikgJiYgdGhpcy5xdWVyeTIuaXNWaWV3UXVlcnkpIHRoaXMucXVlcnkyLmRpcnR5ID0gdHJ1ZTtcbiAgfVxuXG4gIGh5ZHJhdGUoKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MCkpIHRoaXMucXVlcnkwLmh5ZHJhdGUoKTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkxKSkgdGhpcy5xdWVyeTEuaHlkcmF0ZSgpO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTIpKSB0aGlzLnF1ZXJ5Mi5oeWRyYXRlKCk7XG4gIH1cblxuICBkZWh5ZHJhdGUoKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MCkpIHRoaXMucXVlcnkwLmRlaHlkcmF0ZSgpO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTEpKSB0aGlzLnF1ZXJ5MS5kZWh5ZHJhdGUoKTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkyKSkgdGhpcy5xdWVyeTIuZGVoeWRyYXRlKCk7XG4gIH1cblxuICB1cGRhdGVDb250ZW50UXVlcmllcygpIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkwKSAmJiAhdGhpcy5xdWVyeTAuaXNWaWV3UXVlcnkpIHtcbiAgICAgIHRoaXMucXVlcnkwLnVwZGF0ZSgpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkxKSAmJiAhdGhpcy5xdWVyeTEuaXNWaWV3UXVlcnkpIHtcbiAgICAgIHRoaXMucXVlcnkxLnVwZGF0ZSgpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkyKSAmJiAhdGhpcy5xdWVyeTIuaXNWaWV3UXVlcnkpIHtcbiAgICAgIHRoaXMucXVlcnkyLnVwZGF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVZpZXdRdWVyaWVzKCkge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTApICYmIHRoaXMucXVlcnkwLmlzVmlld1F1ZXJ5KSB7XG4gICAgICB0aGlzLnF1ZXJ5MC51cGRhdGUoKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MSkgJiYgdGhpcy5xdWVyeTEuaXNWaWV3UXVlcnkpIHtcbiAgICAgIHRoaXMucXVlcnkxLnVwZGF0ZSgpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkyKSAmJiB0aGlzLnF1ZXJ5Mi5pc1ZpZXdRdWVyeSkge1xuICAgICAgdGhpcy5xdWVyeTIudXBkYXRlKCk7XG4gICAgfVxuICB9XG5cbiAgZmluZFF1ZXJ5KHF1ZXJ5OiBRdWVyeU1ldGFkYXRhKTogUXVlcnlSZWYge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTApICYmIHRoaXMucXVlcnkwLnByb3RvUXVlcnlSZWYucXVlcnkgPT09IHF1ZXJ5KSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWVyeTA7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTEpICYmIHRoaXMucXVlcnkxLnByb3RvUXVlcnlSZWYucXVlcnkgPT09IHF1ZXJ5KSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWVyeTE7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTIpICYmIHRoaXMucXVlcnkyLnByb3RvUXVlcnlSZWYucXVlcnkgPT09IHF1ZXJ5KSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWVyeTI7XG4gICAgfVxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW5ub3QgZmluZCBxdWVyeSBmb3IgZGlyZWN0aXZlICR7cXVlcnl9LmApO1xuICB9XG59XG5cbmNsYXNzIER5bmFtaWNRdWVyeVN0cmF0ZWd5IGltcGxlbWVudHMgX1F1ZXJ5U3RyYXRlZ3kge1xuICBxdWVyaWVzOiBRdWVyeVJlZltdO1xuXG4gIGNvbnN0cnVjdG9yKGVpOiBFbGVtZW50SW5qZWN0b3IpIHtcbiAgICB0aGlzLnF1ZXJpZXMgPSBlaS5fcHJvdG8ucHJvdG9RdWVyeVJlZnMubWFwKHAgPT4gbmV3IFF1ZXJ5UmVmKHAsIGVpKSk7XG4gIH1cblxuICBzZXRDb250ZW50UXVlcmllc0FzRGlydHkoKTogdm9pZCB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKCFxLmlzVmlld1F1ZXJ5KSBxLmRpcnR5ID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBzZXRWaWV3UXVlcmllc0FzRGlydHkoKTogdm9pZCB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKHEuaXNWaWV3UXVlcnkpIHEuZGlydHkgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGh5ZHJhdGUoKTogdm9pZCB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgcS5oeWRyYXRlKCk7XG4gICAgfVxuICB9XG5cbiAgZGVoeWRyYXRlKCk6IHZvaWQge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5xdWVyaWVzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgcSA9IHRoaXMucXVlcmllc1tpXTtcbiAgICAgIHEuZGVoeWRyYXRlKCk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlQ29udGVudFF1ZXJpZXMoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKCFxLmlzVmlld1F1ZXJ5KSB7XG4gICAgICAgIHEudXBkYXRlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlVmlld1F1ZXJpZXMoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKHEuaXNWaWV3UXVlcnkpIHtcbiAgICAgICAgcS51cGRhdGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmaW5kUXVlcnkocXVlcnk6IFF1ZXJ5TWV0YWRhdGEpOiBRdWVyeVJlZiB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKHEucHJvdG9RdWVyeVJlZi5xdWVyeSA9PT0gcXVlcnkpIHtcbiAgICAgICAgcmV0dXJuIHE7XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW5ub3QgZmluZCBxdWVyeSBmb3IgZGlyZWN0aXZlICR7cXVlcnl9LmApO1xuICB9XG59XG5cbmludGVyZmFjZSBfRWxlbWVudEluamVjdG9yU3RyYXRlZ3kge1xuICBjYWxsT25EZXN0cm95KCk6IHZvaWQ7XG4gIGdldENvbXBvbmVudCgpOiBhbnk7XG4gIGlzQ29tcG9uZW50S2V5KGtleTogS2V5KTogYm9vbGVhbjtcbiAgYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkocTogUXVlcnlNZXRhZGF0YSwgcmVzOiBhbnlbXSk6IHZvaWQ7XG4gIGh5ZHJhdGUoKTogdm9pZDtcbiAgZGVoeWRyYXRlKCk6IHZvaWQ7XG59XG5cbi8qKlxuICogU3RyYXRlZ3kgdXNlZCBieSB0aGUgYEVsZW1lbnRJbmplY3RvcmAgd2hlbiB0aGUgbnVtYmVyIG9mIHByb3ZpZGVycyBpcyAxMCBvciBsZXNzLlxuICogSW4gc3VjaCBhIGNhc2UsIGlubGluaW5nIGZpZWxkcyBpcyBiZW5lZmljaWFsIGZvciBwZXJmb3JtYW5jZXMuXG4gKi9cbmNsYXNzIEVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5IGltcGxlbWVudHMgX0VsZW1lbnRJbmplY3RvclN0cmF0ZWd5IHtcbiAgY29uc3RydWN0b3IocHVibGljIGluamVjdG9yU3RyYXRlZ3k6IEluamVjdG9ySW5saW5lU3RyYXRlZ3ksIHB1YmxpYyBfZWk6IEVsZW1lbnRJbmplY3Rvcikge31cblxuICBoeWRyYXRlKCk6IHZvaWQge1xuICAgIHZhciBpID0gdGhpcy5pbmplY3RvclN0cmF0ZWd5O1xuICAgIHZhciBwID0gaS5wcm90b1N0cmF0ZWd5O1xuICAgIGkucmVzZXRDb25zdHJ1Y3Rpb25Db3VudGVyKCk7XG5cbiAgICBpZiAocC5wcm92aWRlcjAgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDApICYmIGkub2JqMCA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmowID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIwLCBwLnZpc2liaWxpdHkwKTtcbiAgICBpZiAocC5wcm92aWRlcjEgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDEpICYmIGkub2JqMSA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmoxID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIxLCBwLnZpc2liaWxpdHkxKTtcbiAgICBpZiAocC5wcm92aWRlcjIgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDIpICYmIGkub2JqMiA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmoyID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIyLCBwLnZpc2liaWxpdHkyKTtcbiAgICBpZiAocC5wcm92aWRlcjMgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDMpICYmIGkub2JqMyA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmozID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIzLCBwLnZpc2liaWxpdHkzKTtcbiAgICBpZiAocC5wcm92aWRlcjQgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDQpICYmIGkub2JqNCA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo0ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI0LCBwLnZpc2liaWxpdHk0KTtcbiAgICBpZiAocC5wcm92aWRlcjUgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDUpICYmIGkub2JqNSA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo1ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI1LCBwLnZpc2liaWxpdHk1KTtcbiAgICBpZiAocC5wcm92aWRlcjYgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDYpICYmIGkub2JqNiA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo2ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI2LCBwLnZpc2liaWxpdHk2KTtcbiAgICBpZiAocC5wcm92aWRlcjcgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDcpICYmIGkub2JqNyA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo3ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI3LCBwLnZpc2liaWxpdHk3KTtcbiAgICBpZiAocC5wcm92aWRlcjggaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDgpICYmIGkub2JqOCA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo4ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI4LCBwLnZpc2liaWxpdHk4KTtcbiAgICBpZiAocC5wcm92aWRlcjkgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDkpICYmIGkub2JqOSA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo5ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI5LCBwLnZpc2liaWxpdHk5KTtcbiAgfVxuXG4gIGRlaHlkcmF0ZSgpIHtcbiAgICB2YXIgaSA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneTtcblxuICAgIGkub2JqMCA9IFVOREVGSU5FRDtcbiAgICBpLm9iajEgPSBVTkRFRklORUQ7XG4gICAgaS5vYmoyID0gVU5ERUZJTkVEO1xuICAgIGkub2JqMyA9IFVOREVGSU5FRDtcbiAgICBpLm9iajQgPSBVTkRFRklORUQ7XG4gICAgaS5vYmo1ID0gVU5ERUZJTkVEO1xuICAgIGkub2JqNiA9IFVOREVGSU5FRDtcbiAgICBpLm9iajcgPSBVTkRFRklORUQ7XG4gICAgaS5vYmo4ID0gVU5ERUZJTkVEO1xuICAgIGkub2JqOSA9IFVOREVGSU5FRDtcbiAgfVxuXG4gIGNhbGxPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdmFyIGkgPSB0aGlzLmluamVjdG9yU3RyYXRlZ3k7XG4gICAgdmFyIHAgPSBpLnByb3RvU3RyYXRlZ3k7XG5cbiAgICBpZiAocC5wcm92aWRlcjAgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJlxuICAgICAgICAoPERpcmVjdGl2ZVByb3ZpZGVyPnAucHJvdmlkZXIwKS5jYWxsT25EZXN0cm95KSB7XG4gICAgICBpLm9iajAub25EZXN0cm95KCk7XG4gICAgfVxuICAgIGlmIChwLnByb3ZpZGVyMSBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmXG4gICAgICAgICg8RGlyZWN0aXZlUHJvdmlkZXI+cC5wcm92aWRlcjEpLmNhbGxPbkRlc3Ryb3kpIHtcbiAgICAgIGkub2JqMS5vbkRlc3Ryb3koKTtcbiAgICB9XG4gICAgaWYgKHAucHJvdmlkZXIyIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiZcbiAgICAgICAgKDxEaXJlY3RpdmVQcm92aWRlcj5wLnByb3ZpZGVyMikuY2FsbE9uRGVzdHJveSkge1xuICAgICAgaS5vYmoyLm9uRGVzdHJveSgpO1xuICAgIH1cbiAgICBpZiAocC5wcm92aWRlcjMgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJlxuICAgICAgICAoPERpcmVjdGl2ZVByb3ZpZGVyPnAucHJvdmlkZXIzKS5jYWxsT25EZXN0cm95KSB7XG4gICAgICBpLm9iajMub25EZXN0cm95KCk7XG4gICAgfVxuICAgIGlmIChwLnByb3ZpZGVyNCBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmXG4gICAgICAgICg8RGlyZWN0aXZlUHJvdmlkZXI+cC5wcm92aWRlcjQpLmNhbGxPbkRlc3Ryb3kpIHtcbiAgICAgIGkub2JqNC5vbkRlc3Ryb3koKTtcbiAgICB9XG4gICAgaWYgKHAucHJvdmlkZXI1IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiZcbiAgICAgICAgKDxEaXJlY3RpdmVQcm92aWRlcj5wLnByb3ZpZGVyNSkuY2FsbE9uRGVzdHJveSkge1xuICAgICAgaS5vYmo1Lm9uRGVzdHJveSgpO1xuICAgIH1cbiAgICBpZiAocC5wcm92aWRlcjYgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJlxuICAgICAgICAoPERpcmVjdGl2ZVByb3ZpZGVyPnAucHJvdmlkZXI2KS5jYWxsT25EZXN0cm95KSB7XG4gICAgICBpLm9iajYub25EZXN0cm95KCk7XG4gICAgfVxuICAgIGlmIChwLnByb3ZpZGVyNyBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmXG4gICAgICAgICg8RGlyZWN0aXZlUHJvdmlkZXI+cC5wcm92aWRlcjcpLmNhbGxPbkRlc3Ryb3kpIHtcbiAgICAgIGkub2JqNy5vbkRlc3Ryb3koKTtcbiAgICB9XG4gICAgaWYgKHAucHJvdmlkZXI4IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiZcbiAgICAgICAgKDxEaXJlY3RpdmVQcm92aWRlcj5wLnByb3ZpZGVyOCkuY2FsbE9uRGVzdHJveSkge1xuICAgICAgaS5vYmo4Lm9uRGVzdHJveSgpO1xuICAgIH1cbiAgICBpZiAocC5wcm92aWRlcjkgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJlxuICAgICAgICAoPERpcmVjdGl2ZVByb3ZpZGVyPnAucHJvdmlkZXI5KS5jYWxsT25EZXN0cm95KSB7XG4gICAgICBpLm9iajkub25EZXN0cm95KCk7XG4gICAgfVxuICB9XG5cbiAgZ2V0Q29tcG9uZW50KCk6IGFueSB7IHJldHVybiB0aGlzLmluamVjdG9yU3RyYXRlZ3kub2JqMDsgfVxuXG4gIGlzQ29tcG9uZW50S2V5KGtleTogS2V5KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2VpLl9wcm90by5fZmlyc3RQcm92aWRlcklzQ29tcG9uZW50ICYmIGlzUHJlc2VudChrZXkpICYmXG4gICAgICAgICAgIGtleS5pZCA9PT0gdGhpcy5pbmplY3RvclN0cmF0ZWd5LnByb3RvU3RyYXRlZ3kua2V5SWQwO1xuICB9XG5cbiAgYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkocXVlcnk6IFF1ZXJ5TWV0YWRhdGEsIGxpc3Q6IGFueVtdKTogdm9pZCB7XG4gICAgdmFyIGkgPSB0aGlzLmluamVjdG9yU3RyYXRlZ3k7XG4gICAgdmFyIHAgPSBpLnByb3RvU3RyYXRlZ3k7XG5cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXIwKSAmJiBwLnByb3ZpZGVyMC5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmowID09PSBVTkRFRklORUQpIGkub2JqMCA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyMCwgcC52aXNpYmlsaXR5MCk7XG4gICAgICBsaXN0LnB1c2goaS5vYmowKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyMSkgJiYgcC5wcm92aWRlcjEua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqMSA9PT0gVU5ERUZJTkVEKSBpLm9iajEgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjEsIHAudmlzaWJpbGl0eTEpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqMSk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjIpICYmIHAucHJvdmlkZXIyLmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajIgPT09IFVOREVGSU5FRCkgaS5vYmoyID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIyLCBwLnZpc2liaWxpdHkyKTtcbiAgICAgIGxpc3QucHVzaChpLm9iajIpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXIzKSAmJiBwLnByb3ZpZGVyMy5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmozID09PSBVTkRFRklORUQpIGkub2JqMyA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyMywgcC52aXNpYmlsaXR5Myk7XG4gICAgICBsaXN0LnB1c2goaS5vYmozKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyNCkgJiYgcC5wcm92aWRlcjQua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqNCA9PT0gVU5ERUZJTkVEKSBpLm9iajQgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjQsIHAudmlzaWJpbGl0eTQpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqNCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjUpICYmIHAucHJvdmlkZXI1LmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajUgPT09IFVOREVGSU5FRCkgaS5vYmo1ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI1LCBwLnZpc2liaWxpdHk1KTtcbiAgICAgIGxpc3QucHVzaChpLm9iajUpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXI2KSAmJiBwLnByb3ZpZGVyNi5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmo2ID09PSBVTkRFRklORUQpIGkub2JqNiA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyNiwgcC52aXNpYmlsaXR5Nik7XG4gICAgICBsaXN0LnB1c2goaS5vYmo2KTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyNykgJiYgcC5wcm92aWRlcjcua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqNyA9PT0gVU5ERUZJTkVEKSBpLm9iajcgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjcsIHAudmlzaWJpbGl0eTcpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqNyk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjgpICYmIHAucHJvdmlkZXI4LmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajggPT09IFVOREVGSU5FRCkgaS5vYmo4ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI4LCBwLnZpc2liaWxpdHk4KTtcbiAgICAgIGxpc3QucHVzaChpLm9iajgpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXI5KSAmJiBwLnByb3ZpZGVyOS5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmo5ID09PSBVTkRFRklORUQpIGkub2JqOSA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyOSwgcC52aXNpYmlsaXR5OSk7XG4gICAgICBsaXN0LnB1c2goaS5vYmo5KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBTdHJhdGVneSB1c2VkIGJ5IHRoZSBgRWxlbWVudEluamVjdG9yYCB3aGVuIHRoZSBudW1iZXIgb2YgYmluZGluZ3MgaXMgMTEgb3IgbW9yZS5cbiAqIEluIHN1Y2ggYSBjYXNlLCB0aGVyZSBhcmUgdG9vIG1hbnkgZmllbGRzIHRvIGlubGluZSAoc2VlIEVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5KS5cbiAqL1xuY2xhc3MgRWxlbWVudEluamVjdG9yRHluYW1pY1N0cmF0ZWd5IGltcGxlbWVudHMgX0VsZW1lbnRJbmplY3RvclN0cmF0ZWd5IHtcbiAgY29uc3RydWN0b3IocHVibGljIGluamVjdG9yU3RyYXRlZ3k6IEluamVjdG9yRHluYW1pY1N0cmF0ZWd5LCBwdWJsaWMgX2VpOiBFbGVtZW50SW5qZWN0b3IpIHt9XG5cbiAgaHlkcmF0ZSgpOiB2b2lkIHtcbiAgICB2YXIgaW5qID0gdGhpcy5pbmplY3RvclN0cmF0ZWd5O1xuICAgIHZhciBwID0gaW5qLnByb3RvU3RyYXRlZ3k7XG4gICAgaW5qLnJlc2V0Q29uc3RydWN0aW9uQ291bnRlcigpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwLmtleUlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHAucHJvdmlkZXJzW2ldIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWRzW2ldKSAmJlxuICAgICAgICAgIGluai5vYmpzW2ldID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgaW5qLm9ianNbaV0gPSBpbmouaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyc1tpXSwgcC52aXNpYmlsaXRpZXNbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGRlaHlkcmF0ZSgpOiB2b2lkIHtcbiAgICB2YXIgaW5qID0gdGhpcy5pbmplY3RvclN0cmF0ZWd5O1xuICAgIExpc3RXcmFwcGVyLmZpbGwoaW5qLm9ianMsIFVOREVGSU5FRCk7XG4gIH1cblxuICBjYWxsT25EZXN0cm95KCk6IHZvaWQge1xuICAgIHZhciBpc3QgPSB0aGlzLmluamVjdG9yU3RyYXRlZ3k7XG4gICAgdmFyIHAgPSBpc3QucHJvdG9TdHJhdGVneTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcC5wcm92aWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChwLnByb3ZpZGVyc1tpXSBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmXG4gICAgICAgICAgKDxEaXJlY3RpdmVQcm92aWRlcj5wLnByb3ZpZGVyc1tpXSkuY2FsbE9uRGVzdHJveSkge1xuICAgICAgICBpc3Qub2Jqc1tpXS5vbkRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRDb21wb25lbnQoKTogYW55IHsgcmV0dXJuIHRoaXMuaW5qZWN0b3JTdHJhdGVneS5vYmpzWzBdOyB9XG5cbiAgaXNDb21wb25lbnRLZXkoa2V5OiBLZXkpOiBib29sZWFuIHtcbiAgICB2YXIgcCA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneS5wcm90b1N0cmF0ZWd5O1xuICAgIHJldHVybiB0aGlzLl9laS5fcHJvdG8uX2ZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudCAmJiBpc1ByZXNlbnQoa2V5KSAmJiBrZXkuaWQgPT09IHAua2V5SWRzWzBdO1xuICB9XG5cbiAgYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkocXVlcnk6IFF1ZXJ5TWV0YWRhdGEsIGxpc3Q6IGFueVtdKTogdm9pZCB7XG4gICAgdmFyIGlzdCA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneTtcbiAgICB2YXIgcCA9IGlzdC5wcm90b1N0cmF0ZWd5O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwLnByb3ZpZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHAucHJvdmlkZXJzW2ldLmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKGlzdC5vYmpzW2ldID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgICBpc3Qub2Jqc1tpXSA9IGlzdC5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXJzW2ldLCBwLnZpc2liaWxpdGllc1tpXSk7XG4gICAgICAgIH1cbiAgICAgICAgbGlzdC5wdXNoKGlzdC5vYmpzW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFByb3RvUXVlcnlSZWYge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZGlySW5kZXg6IG51bWJlciwgcHVibGljIHNldHRlcjogU2V0dGVyRm4sIHB1YmxpYyBxdWVyeTogUXVlcnlNZXRhZGF0YSkge31cblxuICBnZXQgdXNlc1Byb3BlcnR5U3ludGF4KCk6IGJvb2xlYW4geyByZXR1cm4gaXNQcmVzZW50KHRoaXMuc2V0dGVyKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgUXVlcnlSZWYge1xuICBwdWJsaWMgbGlzdDogUXVlcnlMaXN0PGFueT47XG4gIHB1YmxpYyBkaXJ0eTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcHJvdG9RdWVyeVJlZjogUHJvdG9RdWVyeVJlZiwgcHJpdmF0ZSBvcmlnaW5hdG9yOiBFbGVtZW50SW5qZWN0b3IpIHt9XG5cbiAgZ2V0IGlzVmlld1F1ZXJ5KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5wcm90b1F1ZXJ5UmVmLnF1ZXJ5LmlzVmlld1F1ZXJ5OyB9XG5cbiAgdXBkYXRlKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5kaXJ0eSkgcmV0dXJuO1xuICAgIHRoaXMuX3VwZGF0ZSgpO1xuICAgIHRoaXMuZGlydHkgPSBmYWxzZTtcblxuICAgIC8vIFRPRE8gZGVsZXRlIHRoZSBjaGVjayBvbmNlIG9ubHkgZmllbGQgcXVlcmllcyBhcmUgc3VwcG9ydGVkXG4gICAgaWYgKHRoaXMucHJvdG9RdWVyeVJlZi51c2VzUHJvcGVydHlTeW50YXgpIHtcbiAgICAgIHZhciBkaXIgPSB0aGlzLm9yaWdpbmF0b3IuZ2V0RGlyZWN0aXZlQXRJbmRleCh0aGlzLnByb3RvUXVlcnlSZWYuZGlySW5kZXgpO1xuICAgICAgaWYgKHRoaXMucHJvdG9RdWVyeVJlZi5xdWVyeS5maXJzdCkge1xuICAgICAgICB0aGlzLnByb3RvUXVlcnlSZWYuc2V0dGVyKGRpciwgdGhpcy5saXN0Lmxlbmd0aCA+IDAgPyB0aGlzLmxpc3QuZmlyc3QgOiBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucHJvdG9RdWVyeVJlZi5zZXR0ZXIoZGlyLCB0aGlzLmxpc3QpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubGlzdC5ub3RpZnlPbkNoYW5nZXMoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZSgpOiB2b2lkIHtcbiAgICB2YXIgYWdncmVnYXRvciA9IFtdO1xuICAgIGlmICh0aGlzLnByb3RvUXVlcnlSZWYucXVlcnkuaXNWaWV3UXVlcnkpIHtcbiAgICAgIHZhciB2aWV3ID0gdGhpcy5vcmlnaW5hdG9yLmdldFZpZXcoKTtcbiAgICAgIC8vIGludGVudGlvbmFsbHkgc2tpcHBpbmcgb3JpZ2luYXRvciBmb3IgdmlldyBxdWVyaWVzLlxuICAgICAgdmFyIG5lc3RlZFZpZXcgPVxuICAgICAgICAgIHZpZXcuZ2V0TmVzdGVkVmlldyh2aWV3LmVsZW1lbnRPZmZzZXQgKyB0aGlzLm9yaWdpbmF0b3IuZ2V0Qm91bmRFbGVtZW50SW5kZXgoKSk7XG4gICAgICBpZiAoaXNQcmVzZW50KG5lc3RlZFZpZXcpKSB0aGlzLl92aXNpdFZpZXcobmVzdGVkVmlldywgYWdncmVnYXRvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3Zpc2l0KHRoaXMub3JpZ2luYXRvciwgYWdncmVnYXRvcik7XG4gICAgfVxuICAgIHRoaXMubGlzdC5yZXNldChhZ2dyZWdhdG9yKTtcbiAgfTtcblxuICBwcml2YXRlIF92aXNpdChpbmo6IEVsZW1lbnRJbmplY3RvciwgYWdncmVnYXRvcjogYW55W10pOiB2b2lkIHtcbiAgICB2YXIgdmlldyA9IGluai5nZXRWaWV3KCk7XG4gICAgdmFyIHN0YXJ0SWR4ID0gdmlldy5lbGVtZW50T2Zmc2V0ICsgaW5qLl9wcm90by5pbmRleDtcbiAgICBmb3IgKHZhciBpID0gc3RhcnRJZHg7IGkgPCB2aWV3LmVsZW1lbnRPZmZzZXQgKyB2aWV3Lm93bkJpbmRlcnNDb3VudDsgaSsrKSB7XG4gICAgICB2YXIgY3VySW5qID0gdmlldy5lbGVtZW50SW5qZWN0b3JzW2ldO1xuICAgICAgaWYgKGlzQmxhbmsoY3VySW5qKSkgY29udGludWU7XG4gICAgICAvLyBUaGUgZmlyc3QgaW5qZWN0b3IgYWZ0ZXIgaW5qLCB0aGF0IGlzIG91dHNpZGUgdGhlIHN1YnRyZWUgcm9vdGVkIGF0XG4gICAgICAvLyBpbmogaGFzIHRvIGhhdmUgYSBudWxsIHBhcmVudCBvciBhIHBhcmVudCB0aGF0IGlzIGFuIGFuY2VzdG9yIG9mIGluai5cbiAgICAgIGlmIChpID4gc3RhcnRJZHggJiYgKGlzQmxhbmsoY3VySW5qKSB8fCBpc0JsYW5rKGN1ckluai5wYXJlbnQpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3LmVsZW1lbnRPZmZzZXQgKyBjdXJJbmoucGFyZW50Ll9wcm90by5pbmRleCA8IHN0YXJ0SWR4KSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLnByb3RvUXVlcnlSZWYucXVlcnkuZGVzY2VuZGFudHMgJiZcbiAgICAgICAgICAhKGN1ckluai5wYXJlbnQgPT0gdGhpcy5vcmlnaW5hdG9yIHx8IGN1ckluaiA9PSB0aGlzLm9yaWdpbmF0b3IpKVxuICAgICAgICBjb250aW51ZTtcblxuICAgICAgLy8gV2UgdmlzaXQgdGhlIHZpZXcgY29udGFpbmVyKFZDKSB2aWV3cyByaWdodCBhZnRlciB0aGUgaW5qZWN0b3IgdGhhdCBjb250YWluc1xuICAgICAgLy8gdGhlIFZDLiBUaGVvcmV0aWNhbGx5LCB0aGF0IG1pZ2h0IG5vdCBiZSB0aGUgcmlnaHQgb3JkZXIgaWYgdGhlcmUgYXJlXG4gICAgICAvLyBjaGlsZCBpbmplY3RvcnMgb2Ygc2FpZCBpbmplY3Rvci4gTm90IGNsZWFyIHdoZXRoZXIgaWYgc3VjaCBjYXNlIGNhblxuICAgICAgLy8gZXZlbiBiZSBjb25zdHJ1Y3RlZCB3aXRoIHRoZSBjdXJyZW50IGFwaXMuXG4gICAgICB0aGlzLl92aXNpdEluamVjdG9yKGN1ckluaiwgYWdncmVnYXRvcik7XG4gICAgICB2YXIgdmMgPSB2aWV3LnZpZXdDb250YWluZXJzW2ldO1xuICAgICAgaWYgKGlzUHJlc2VudCh2YykpIHRoaXMuX3Zpc2l0Vmlld0NvbnRhaW5lcih2YywgYWdncmVnYXRvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRJbmplY3Rvcihpbmo6IEVsZW1lbnRJbmplY3RvciwgYWdncmVnYXRvcjogYW55W10pIHtcbiAgICBpZiAodGhpcy5wcm90b1F1ZXJ5UmVmLnF1ZXJ5LmlzVmFyQmluZGluZ1F1ZXJ5KSB7XG4gICAgICB0aGlzLl9hZ2dyZWdhdGVWYXJpYWJsZUJpbmRpbmcoaW5qLCBhZ2dyZWdhdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYWdncmVnYXRlRGlyZWN0aXZlKGluaiwgYWdncmVnYXRvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRWaWV3Q29udGFpbmVyKHZjOiBBcHBWaWV3Q29udGFpbmVyLCBhZ2dyZWdhdG9yOiBhbnlbXSkge1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgdmMudmlld3MubGVuZ3RoOyBqKyspIHtcbiAgICAgIHRoaXMuX3Zpc2l0Vmlldyh2Yy52aWV3c1tqXSwgYWdncmVnYXRvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRWaWV3KHZpZXc6IEFwcFZpZXcsIGFnZ3JlZ2F0b3I6IGFueVtdKSB7XG4gICAgZm9yICh2YXIgaSA9IHZpZXcuZWxlbWVudE9mZnNldDsgaSA8IHZpZXcuZWxlbWVudE9mZnNldCArIHZpZXcub3duQmluZGVyc0NvdW50OyBpKyspIHtcbiAgICAgIHZhciBpbmogPSB2aWV3LmVsZW1lbnRJbmplY3RvcnNbaV07XG4gICAgICBpZiAoaXNCbGFuayhpbmopKSBjb250aW51ZTtcblxuICAgICAgdGhpcy5fdmlzaXRJbmplY3RvcihpbmosIGFnZ3JlZ2F0b3IpO1xuXG4gICAgICB2YXIgdmMgPSB2aWV3LnZpZXdDb250YWluZXJzW2ldO1xuICAgICAgaWYgKGlzUHJlc2VudCh2YykpIHRoaXMuX3Zpc2l0Vmlld0NvbnRhaW5lcih2YywgYWdncmVnYXRvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYWdncmVnYXRlVmFyaWFibGVCaW5kaW5nKGluajogRWxlbWVudEluamVjdG9yLCBhZ2dyZWdhdG9yOiBhbnlbXSk6IHZvaWQge1xuICAgIHZhciB2YiA9IHRoaXMucHJvdG9RdWVyeVJlZi5xdWVyeS52YXJCaW5kaW5ncztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZiLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAoaW5qLmhhc1ZhcmlhYmxlQmluZGluZyh2YltpXSkpIHtcbiAgICAgICAgYWdncmVnYXRvci5wdXNoKGluai5nZXRWYXJpYWJsZUJpbmRpbmcodmJbaV0pKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hZ2dyZWdhdGVEaXJlY3RpdmUoaW5qOiBFbGVtZW50SW5qZWN0b3IsIGFnZ3JlZ2F0b3I6IGFueVtdKTogdm9pZCB7XG4gICAgaW5qLmFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5KHRoaXMucHJvdG9RdWVyeVJlZi5xdWVyeSwgYWdncmVnYXRvcik7XG4gIH1cblxuICBkZWh5ZHJhdGUoKTogdm9pZCB7IHRoaXMubGlzdCA9IG51bGw7IH1cblxuICBoeWRyYXRlKCk6IHZvaWQge1xuICAgIHRoaXMubGlzdCA9IG5ldyBRdWVyeUxpc3Q8YW55PigpO1xuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICB9XG59XG4iXX0=