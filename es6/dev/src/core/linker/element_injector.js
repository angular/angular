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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudF9pbmplY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9lbGVtZW50X2luamVjdG9yLnRzIl0sIm5hbWVzIjpbIlN0YXRpY0tleXMiLCJTdGF0aWNLZXlzLmNvbnN0cnVjdG9yIiwiU3RhdGljS2V5cy5pbnN0YW5jZSIsIlRyZWVOb2RlIiwiVHJlZU5vZGUuY29uc3RydWN0b3IiLCJUcmVlTm9kZS5hZGRDaGlsZCIsIlRyZWVOb2RlLnJlbW92ZSIsIlRyZWVOb2RlLnBhcmVudCIsIkRpcmVjdGl2ZURlcGVuZGVuY3kiLCJEaXJlY3RpdmVEZXBlbmRlbmN5LmNvbnN0cnVjdG9yIiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5fdmVyaWZ5IiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5jcmVhdGVGcm9tIiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5fYXR0cmlidXRlTmFtZSIsIkRpcmVjdGl2ZURlcGVuZGVuY3kuX3F1ZXJ5IiwiRGlyZWN0aXZlUHJvdmlkZXIiLCJEaXJlY3RpdmVQcm92aWRlci5jb25zdHJ1Y3RvciIsIkRpcmVjdGl2ZVByb3ZpZGVyLmRpc3BsYXlOYW1lIiwiRGlyZWN0aXZlUHJvdmlkZXIucXVlcmllcyIsIkRpcmVjdGl2ZVByb3ZpZGVyLmV2ZW50RW1pdHRlcnMiLCJEaXJlY3RpdmVQcm92aWRlci5jcmVhdGVGcm9tUHJvdmlkZXIiLCJEaXJlY3RpdmVQcm92aWRlci5jcmVhdGVGcm9tVHlwZSIsIlByZUJ1aWx0T2JqZWN0cyIsIlByZUJ1aWx0T2JqZWN0cy5jb25zdHJ1Y3RvciIsIlF1ZXJ5TWV0YWRhdGFXaXRoU2V0dGVyIiwiUXVlcnlNZXRhZGF0YVdpdGhTZXR0ZXIuY29uc3RydWN0b3IiLCJFdmVudEVtaXR0ZXJBY2Nlc3NvciIsIkV2ZW50RW1pdHRlckFjY2Vzc29yLmNvbnN0cnVjdG9yIiwiRXZlbnRFbWl0dGVyQWNjZXNzb3Iuc3Vic2NyaWJlIiwiX2NyZWF0ZUV2ZW50RW1pdHRlckFjY2Vzc29ycyIsIl9jcmVhdGVQcm90b1F1ZXJ5UmVmcyIsIlByb3RvRWxlbWVudEluamVjdG9yIiwiUHJvdG9FbGVtZW50SW5qZWN0b3IuY29uc3RydWN0b3IiLCJQcm90b0VsZW1lbnRJbmplY3Rvci5jcmVhdGUiLCJQcm90b0VsZW1lbnRJbmplY3Rvci5fY3JlYXRlRGlyZWN0aXZlUHJvdmlkZXJXaXRoVmlzaWJpbGl0eSIsIlByb3RvRWxlbWVudEluamVjdG9yLl9jcmVhdGVQcm92aWRlcnNXaXRoVmlzaWJpbGl0eSIsIlByb3RvRWxlbWVudEluamVjdG9yLl9jcmVhdGVQcm92aWRlcldpdGhWaXNpYmlsaXR5IiwiUHJvdG9FbGVtZW50SW5qZWN0b3IuX2NyZWF0ZVZpZXdQcm92aWRlcnNXaXRoVmlzaWJpbGl0eSIsIlByb3RvRWxlbWVudEluamVjdG9yLmluc3RhbnRpYXRlIiwiUHJvdG9FbGVtZW50SW5qZWN0b3IuZGlyZWN0UGFyZW50IiwiUHJvdG9FbGVtZW50SW5qZWN0b3IuaGFzQmluZGluZ3MiLCJQcm90b0VsZW1lbnRJbmplY3Rvci5nZXRQcm92aWRlckF0SW5kZXgiLCJfQ29udGV4dCIsIl9Db250ZXh0LmNvbnN0cnVjdG9yIiwiRWxlbWVudEluamVjdG9yIiwiRWxlbWVudEluamVjdG9yLmNvbnN0cnVjdG9yIiwiRWxlbWVudEluamVjdG9yLmRlaHlkcmF0ZSIsIkVsZW1lbnRJbmplY3Rvci5oeWRyYXRlIiwiRWxlbWVudEluamVjdG9yLl9kZWJ1Z0NvbnRleHQiLCJFbGVtZW50SW5qZWN0b3IuX3JlYXR0YWNoSW5qZWN0b3JzIiwiRWxlbWVudEluamVjdG9yLl9yZWF0dGFjaEluamVjdG9yIiwiRWxlbWVudEluamVjdG9yLmhhc1ZhcmlhYmxlQmluZGluZyIsIkVsZW1lbnRJbmplY3Rvci5nZXRWYXJpYWJsZUJpbmRpbmciLCJFbGVtZW50SW5qZWN0b3IuZ2V0IiwiRWxlbWVudEluamVjdG9yLmhhc0RpcmVjdGl2ZSIsIkVsZW1lbnRJbmplY3Rvci5nZXRFdmVudEVtaXR0ZXJBY2Nlc3NvcnMiLCJFbGVtZW50SW5qZWN0b3IuZ2V0RGlyZWN0aXZlVmFyaWFibGVCaW5kaW5ncyIsIkVsZW1lbnRJbmplY3Rvci5nZXRDb21wb25lbnQiLCJFbGVtZW50SW5qZWN0b3IuZ2V0SW5qZWN0b3IiLCJFbGVtZW50SW5qZWN0b3IuZ2V0RWxlbWVudFJlZiIsIkVsZW1lbnRJbmplY3Rvci5nZXRWaWV3Q29udGFpbmVyUmVmIiwiRWxlbWVudEluamVjdG9yLmdldE5lc3RlZFZpZXciLCJFbGVtZW50SW5qZWN0b3IuZ2V0VmlldyIsIkVsZW1lbnRJbmplY3Rvci5kaXJlY3RQYXJlbnQiLCJFbGVtZW50SW5qZWN0b3IuaXNDb21wb25lbnRLZXkiLCJFbGVtZW50SW5qZWN0b3IuZ2V0RGVwZW5kZW5jeSIsIkVsZW1lbnRJbmplY3Rvci5fYnVpbGRBdHRyaWJ1dGUiLCJFbGVtZW50SW5qZWN0b3IuYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkiLCJFbGVtZW50SW5qZWN0b3IuX2J1aWxkUXVlcnlTdHJhdGVneSIsIkVsZW1lbnRJbmplY3Rvci5saW5rIiwiRWxlbWVudEluamVjdG9yLnVubGluayIsIkVsZW1lbnRJbmplY3Rvci5nZXREaXJlY3RpdmVBdEluZGV4IiwiRWxlbWVudEluamVjdG9yLmhhc0luc3RhbmNlcyIsIkVsZW1lbnRJbmplY3Rvci5nZXRIb3N0IiwiRWxlbWVudEluamVjdG9yLmdldEJvdW5kRWxlbWVudEluZGV4IiwiRWxlbWVudEluamVjdG9yLmdldFJvb3RWaWV3SW5qZWN0b3JzIiwiRWxlbWVudEluamVjdG9yLm5nQWZ0ZXJWaWV3Q2hlY2tlZCIsIkVsZW1lbnRJbmplY3Rvci5uZ0FmdGVyQ29udGVudENoZWNrZWQiLCJFbGVtZW50SW5qZWN0b3IudHJhdmVyc2VBbmRTZXRRdWVyaWVzQXNEaXJ0eSIsIkVsZW1lbnRJbmplY3Rvci5fc2V0UXVlcmllc0FzRGlydHkiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5IiwiX0VtcHR5UXVlcnlTdHJhdGVneS5zZXRDb250ZW50UXVlcmllc0FzRGlydHkiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5LnNldFZpZXdRdWVyaWVzQXNEaXJ0eSIsIl9FbXB0eVF1ZXJ5U3RyYXRlZ3kuaHlkcmF0ZSIsIl9FbXB0eVF1ZXJ5U3RyYXRlZ3kuZGVoeWRyYXRlIiwiX0VtcHR5UXVlcnlTdHJhdGVneS51cGRhdGVDb250ZW50UXVlcmllcyIsIl9FbXB0eVF1ZXJ5U3RyYXRlZ3kudXBkYXRlVmlld1F1ZXJpZXMiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5LmZpbmRRdWVyeSIsIklubGluZVF1ZXJ5U3RyYXRlZ3kiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiSW5saW5lUXVlcnlTdHJhdGVneS5zZXRDb250ZW50UXVlcmllc0FzRGlydHkiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5LnNldFZpZXdRdWVyaWVzQXNEaXJ0eSIsIklubGluZVF1ZXJ5U3RyYXRlZ3kuaHlkcmF0ZSIsIklubGluZVF1ZXJ5U3RyYXRlZ3kuZGVoeWRyYXRlIiwiSW5saW5lUXVlcnlTdHJhdGVneS51cGRhdGVDb250ZW50UXVlcmllcyIsIklubGluZVF1ZXJ5U3RyYXRlZ3kudXBkYXRlVmlld1F1ZXJpZXMiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5LmZpbmRRdWVyeSIsIkR5bmFtaWNRdWVyeVN0cmF0ZWd5IiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kuY29uc3RydWN0b3IiLCJEeW5hbWljUXVlcnlTdHJhdGVneS5zZXRDb250ZW50UXVlcmllc0FzRGlydHkiLCJEeW5hbWljUXVlcnlTdHJhdGVneS5zZXRWaWV3UXVlcmllc0FzRGlydHkiLCJEeW5hbWljUXVlcnlTdHJhdGVneS5oeWRyYXRlIiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kuZGVoeWRyYXRlIiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kudXBkYXRlQ29udGVudFF1ZXJpZXMiLCJEeW5hbWljUXVlcnlTdHJhdGVneS51cGRhdGVWaWV3UXVlcmllcyIsIkR5bmFtaWNRdWVyeVN0cmF0ZWd5LmZpbmRRdWVyeSIsIkVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5IiwiRWxlbWVudEluamVjdG9ySW5saW5lU3RyYXRlZ3kuY29uc3RydWN0b3IiLCJFbGVtZW50SW5qZWN0b3JJbmxpbmVTdHJhdGVneS5oeWRyYXRlIiwiRWxlbWVudEluamVjdG9ySW5saW5lU3RyYXRlZ3kuZGVoeWRyYXRlIiwiRWxlbWVudEluamVjdG9ySW5saW5lU3RyYXRlZ3kuY2FsbE9uRGVzdHJveSIsIkVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5LmdldENvbXBvbmVudCIsIkVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5LmlzQ29tcG9uZW50S2V5IiwiRWxlbWVudEluamVjdG9ySW5saW5lU3RyYXRlZ3kuYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkiLCJFbGVtZW50SW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kiLCJFbGVtZW50SW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuY29uc3RydWN0b3IiLCJFbGVtZW50SW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuaHlkcmF0ZSIsIkVsZW1lbnRJbmplY3RvckR5bmFtaWNTdHJhdGVneS5kZWh5ZHJhdGUiLCJFbGVtZW50SW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuY2FsbE9uRGVzdHJveSIsIkVsZW1lbnRJbmplY3RvckR5bmFtaWNTdHJhdGVneS5nZXRDb21wb25lbnQiLCJFbGVtZW50SW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuaXNDb21wb25lbnRLZXkiLCJFbGVtZW50SW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkiLCJQcm90b1F1ZXJ5UmVmIiwiUHJvdG9RdWVyeVJlZi5jb25zdHJ1Y3RvciIsIlByb3RvUXVlcnlSZWYudXNlc1Byb3BlcnR5U3ludGF4IiwiUXVlcnlSZWYiLCJRdWVyeVJlZi5jb25zdHJ1Y3RvciIsIlF1ZXJ5UmVmLmlzVmlld1F1ZXJ5IiwiUXVlcnlSZWYudXBkYXRlIiwiUXVlcnlSZWYuX3VwZGF0ZSIsIlF1ZXJ5UmVmLl92aXNpdCIsIlF1ZXJ5UmVmLl92aXNpdEluamVjdG9yIiwiUXVlcnlSZWYuX3Zpc2l0Vmlld0NvbnRhaW5lciIsIlF1ZXJ5UmVmLl92aXNpdFZpZXciLCJRdWVyeVJlZi5fYWdncmVnYXRlVmFyaWFibGVCaW5kaW5nIiwiUXVlcnlSZWYuX2FnZ3JlZ2F0ZURpcmVjdGl2ZSIsIlF1ZXJ5UmVmLmRlaHlkcmF0ZSIsIlF1ZXJ5UmVmLmh5ZHJhdGUiXSwibWFwcGluZ3MiOiJPQUFPLEVBQ0wsU0FBUyxFQUNULE9BQU8sRUFLUixNQUFNLDBCQUEwQjtPQUMxQixFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztPQUNyRCxFQUFlLGlCQUFpQixFQUFDLE1BQU0sMkJBQTJCO09BQ2xFLEVBQUMsV0FBVyxFQUFjLGdCQUFnQixFQUFDLE1BQU0sZ0NBQWdDO09BQ2pGLEVBQ0wsUUFBUSxFQUNSLEdBQUcsRUFDSCxVQUFVLEVBRVYsUUFBUSxFQUVSLGVBQWUsRUFJaEIsTUFBTSxzQkFBc0I7T0FDdEIsRUFDTCxTQUFTLEVBQ1QsYUFBYSxFQUNiLFVBQVUsRUFDVixzQkFBc0IsRUFFdEIsc0JBQXNCLEVBRXZCLE1BQU0sK0JBQStCO09BQy9CLEVBQUMsZUFBZSxFQUFFLGVBQWUsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLCtCQUErQjtPQUUxRixFQUFDLGlCQUFpQixFQUFFLGFBQWEsRUFBQyxNQUFNLGdCQUFnQjtPQUd6QyxLQUFLLFNBQVMsTUFBTSxnQkFBZ0I7T0FDbkQsRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHNCQUFzQjtPQUM5QyxFQUFDLFVBQVUsRUFBQyxNQUFNLGVBQWU7T0FDakMsRUFBQyxXQUFXLEVBQUMsTUFBTSxnQkFBZ0I7T0FDbkMsRUFBQyxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLHdCQUF3QjtPQUNwRSxFQUFDLGdCQUFnQixFQUFDLE1BQU0saUNBQWlDO09BQ3pELEVBRUwsaUJBQWlCLEVBQ2xCLE1BQU0scURBQXFEO09BQ3JELEVBQUMsU0FBUyxFQUFDLE1BQU0sY0FBYztPQUMvQixFQUFDLFNBQVMs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RUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDakZBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO0lBQ25GQSxDQUFDQTtJQUVERixxQkFBcUJBO1FBQ25CRyxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNoRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDaEZBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO0lBQ2xGQSxDQUFDQTtJQUVESCxPQUFPQTtRQUNMSSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUNsREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7UUFDbERBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO0lBQ3BEQSxDQUFDQTtJQUVESixTQUFTQTtRQUNQSyxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQTtRQUNwREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0E7UUFDcERBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBO0lBQ3REQSxDQUFDQTtJQUVETCxvQkFBb0JBO1FBQ2xCTSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2REEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZEQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkRBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVETixpQkFBaUJBO1FBQ2ZPLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3REQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdERBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0REEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURQLFNB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T0EsRUFBRUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREosU0FBU0E7UUFDUEssR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDN0NBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hCQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQTtRQUNoQkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREwsb0JBQW9CQTtRQUNsQk0sR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDN0NBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbkJBLENBQUNBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1lBQ2JBLENBQUNBO1FBQ0hBLENBQUNBO0lBQ0hBLENBQUNBO0lBRUROLGlCQUFpQkE7UUFDZk8sR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDN0NBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbEJBLENBQUNBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1lBQ2JBLENBQUNBO1FBQ0hBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURQLFNBQVNBLENBQUNBLEtBQW9CQTtRQUM1QlEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDN0NBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxhQUFhQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDcENBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1lBQ1hBLENBQUNBO1FBQ0hBLENBQUNBO1FBQ0RBLE1BQU1BLElBQUlBLGFBQWFBLENBQUNBLG1DQUFtQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7SUFDdkVBLENBQUNBO0FBQ0hSLENBQUNBO0FBV0Q7OztHQUdHO0FBQ0g7SUFDRVMsWUFBbUJBLGdCQUF3Q0EsRUFBU0EsR0FBb0JBO1FBQXJFQyxxQkFBZ0JBLEdBQWhCQSxnQkFBZ0JBLENBQXdCQTtRQUFTQSxRQUFHQSxHQUFIQSxHQUFHQSxDQUFpQkE7SUFBR0EsQ0FBQ0E7SUFFNUZELE9BQU9BO1FBQ0xFLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0E7UUFDOUJBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLGFBQWFBLENBQUNBO1FBQ3hCQSxDQUFDQSxDQUFDQSx3QkFBd0JBLEVBQUVBLENBQUNBO1FBRTdCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO0lBQy9EQSxDQUFDQTtJQUVERixTQUFTQTtRQUNQRyxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBO1FBRTlCQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxTQUFTQSxDQUFDQTtRQUNuQkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsU0FBU0EsQ0FBQ0E7UUFDbkJBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLFNBQVNBLENBQUNBO1FBQ25CQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxTQUFTQSxDQUFDQTtRQUNuQkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsU0FBU0EsQ0FBQ0E7UUFDbkJBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLFNBQVNBLENBQUNBO1FBQ25CQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxTQUFTQSxDQUFDQTtRQUNuQkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsU0FBU0EsQ0FBQ0E7UUFDbkJBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLFNBQVNBLENBQUNBO1FBQ25CQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxTQUFTQSxDQUFDQTtJQUNyQkEsQ0FBQ0E7SUFFREgsYUFBYUE7UUFDWEksSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQTtRQUM5QkEsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsYUFBYUEsQ0FBQ0E7UUFFeEJBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkE7WUFDcEJBLENBQUNBLENBQUNBLFNBQVVBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQTtZQUNwQkEsQ0FBQ0EsQ0FBQ0EsU0FBVUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBO1lBQ3BCQSxDQUFDQSxDQUFDQSxTQUFVQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkE7WUFDcEJBLENBQUNBLENBQUNBLFNBQVVBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQTtZQUNwQkEsQ0FBQ0EsQ0FBQ0EsU0FBVUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBO1lBQ3BCQSxDQUFDQSxDQUFDQSxTQUFVQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkE7WUFDcEJBLENBQUNBLENBQUNBLFNBQVVBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQTtZQUNwQkEsQ0FBQ0EsQ0FBQ0EsU0FBVUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBO1lBQ3BCQSxDQUFDQSxDQUFDQSxTQUFVQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkE7WUFDcEJBLENBQUNBLENBQUNBLFNBQVVBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREosWUFBWUEsS0FBVUssTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUUxREwsY0FBY0EsQ0FBQ0EsR0FBUUE7UUFDckJNLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBLHlCQUF5QkEsSUFBSUEsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0E7WUFDM0RBLEdBQUdBLENBQUNBLEVBQUVBLEtBQUtBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7SUFDL0RBLENBQUNBO0lBRUROLDBCQUEwQkEsQ0FBQ0EsS0FBb0JBLEVBQUVBLElBQVdBO1FBQzFETyxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBO1FBQzlCQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxhQUFhQSxDQUFDQTtRQUV4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO2dCQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO2dCQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO2dCQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO2dCQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO2dCQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO2dCQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO2dCQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO2dCQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLFNBQVNBLENBQUNBO2dCQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLEVBQUVB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QUlBLENBQUNBO0lBQ3BCQSxDQUFDQTtBQUNIWixDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgaXNQcmVzZW50LFxuICBpc0JsYW5rLFxuICBUeXBlLFxuICBzdHJpbmdpZnksXG4gIENPTlNUX0VYUFIsXG4gIFN0cmluZ1dyYXBwZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyLCBPYnNlcnZhYmxlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBNYXBXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtcbiAgSW5qZWN0b3IsXG4gIEtleSxcbiAgRGVwZW5kZW5jeSxcbiAgcHJvdmlkZSxcbiAgUHJvdmlkZXIsXG4gIFJlc29sdmVkUHJvdmlkZXIsXG4gIE5vUHJvdmlkZXJFcnJvcixcbiAgQWJzdHJhY3RQcm92aWRlckVycm9yLFxuICBDeWNsaWNEZXBlbmRlbmN5RXJyb3IsXG4gIHJlc29sdmVGb3J3YXJkUmVmXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7XG4gIFVOREVGSU5FRCxcbiAgUHJvdG9JbmplY3RvcixcbiAgVmlzaWJpbGl0eSxcbiAgSW5qZWN0b3JJbmxpbmVTdHJhdGVneSxcbiAgSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3ksXG4gIFByb3ZpZGVyV2l0aFZpc2liaWxpdHksXG4gIERlcGVuZGVuY3lQcm92aWRlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9pbmplY3Rvcic7XG5pbXBvcnQge3Jlc29sdmVQcm92aWRlciwgUmVzb2x2ZWRGYWN0b3J5LCBSZXNvbHZlZFByb3ZpZGVyX30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvcHJvdmlkZXInO1xuXG5pbXBvcnQge0F0dHJpYnV0ZU1ldGFkYXRhLCBRdWVyeU1ldGFkYXRhfSBmcm9tICcuLi9tZXRhZGF0YS9kaSc7XG5cbmltcG9ydCB7QXBwVmlld0NvbnRhaW5lciwgQXBwVmlld30gZnJvbSAnLi92aWV3Jztcbi8qIGNpcmN1bGFyICovIGltcG9ydCAqIGFzIGF2bU1vZHVsZSBmcm9tICcuL3ZpZXdfbWFuYWdlcic7XG5pbXBvcnQge1ZpZXdDb250YWluZXJSZWZ9IGZyb20gJy4vdmlld19jb250YWluZXJfcmVmJztcbmltcG9ydCB7RWxlbWVudFJlZn0gZnJvbSAnLi9lbGVtZW50X3JlZic7XG5pbXBvcnQge1RlbXBsYXRlUmVmfSBmcm9tICcuL3RlbXBsYXRlX3JlZic7XG5pbXBvcnQge0RpcmVjdGl2ZU1ldGFkYXRhLCBDb21wb25lbnRNZXRhZGF0YX0gZnJvbSAnLi4vbWV0YWRhdGEvZGlyZWN0aXZlcyc7XG5pbXBvcnQge2hhc0xpZmVjeWNsZUhvb2t9IGZyb20gJy4vZGlyZWN0aXZlX2xpZmVjeWNsZV9yZWZsZWN0b3InO1xuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0b3IsXG4gIENoYW5nZURldGVjdG9yUmVmXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24vY2hhbmdlX2RldGVjdGlvbic7XG5pbXBvcnQge1F1ZXJ5TGlzdH0gZnJvbSAnLi9xdWVyeV9saXN0JztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtTZXR0ZXJGbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi90eXBlcyc7XG5pbXBvcnQge0V2ZW50Q29uZmlnfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvZXZlbnRfY29uZmlnJztcbmltcG9ydCB7QWZ0ZXJWaWV3Q2hlY2tlZH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtQaXBlUHJvdmlkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3BpcGVzL3BpcGVfcHJvdmlkZXInO1xuXG5pbXBvcnQge0xpZmVjeWNsZUhvb2tzfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtWaWV3Q29udGFpbmVyUmVmX30gZnJvbSBcIi4vdmlld19jb250YWluZXJfcmVmXCI7XG5cbnZhciBfc3RhdGljS2V5cztcblxuZXhwb3J0IGNsYXNzIFN0YXRpY0tleXMge1xuICB2aWV3TWFuYWdlcklkOiBudW1iZXI7XG4gIHRlbXBsYXRlUmVmSWQ6IG51bWJlcjtcbiAgdmlld0NvbnRhaW5lcklkOiBudW1iZXI7XG4gIGNoYW5nZURldGVjdG9yUmVmSWQ6IG51bWJlcjtcbiAgZWxlbWVudFJlZklkOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy52aWV3TWFuYWdlcklkID0gS2V5LmdldChhdm1Nb2R1bGUuQXBwVmlld01hbmFnZXIpLmlkO1xuICAgIHRoaXMudGVtcGxhdGVSZWZJZCA9IEtleS5nZXQoVGVtcGxhdGVSZWYpLmlkO1xuICAgIHRoaXMudmlld0NvbnRhaW5lcklkID0gS2V5LmdldChWaWV3Q29udGFpbmVyUmVmKS5pZDtcbiAgICB0aGlzLmNoYW5nZURldGVjdG9yUmVmSWQgPSBLZXkuZ2V0KENoYW5nZURldGVjdG9yUmVmKS5pZDtcbiAgICB0aGlzLmVsZW1lbnRSZWZJZCA9IEtleS5nZXQoRWxlbWVudFJlZikuaWQ7XG4gIH1cblxuICBzdGF0aWMgaW5zdGFuY2UoKTogU3RhdGljS2V5cyB7XG4gICAgaWYgKGlzQmxhbmsoX3N0YXRpY0tleXMpKSBfc3RhdGljS2V5cyA9IG5ldyBTdGF0aWNLZXlzKCk7XG4gICAgcmV0dXJuIF9zdGF0aWNLZXlzO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUcmVlTm9kZTxUIGV4dGVuZHMgVHJlZU5vZGU8YW55Pj4ge1xuICAvKiogQGludGVybmFsICovXG4gIF9wYXJlbnQ6IFQ7XG4gIGNvbnN0cnVjdG9yKHBhcmVudDogVCkge1xuICAgIGlmIChpc1ByZXNlbnQocGFyZW50KSkge1xuICAgICAgcGFyZW50LmFkZENoaWxkKHRoaXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9wYXJlbnQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGFkZENoaWxkKGNoaWxkOiBUKTogdm9pZCB7IGNoaWxkLl9wYXJlbnQgPSB0aGlzOyB9XG5cbiAgcmVtb3ZlKCk6IHZvaWQgeyB0aGlzLl9wYXJlbnQgPSBudWxsOyB9XG5cbiAgZ2V0IHBhcmVudCgpIHsgcmV0dXJuIHRoaXMuX3BhcmVudDsgfVxufVxuXG5leHBvcnQgY2xhc3MgRGlyZWN0aXZlRGVwZW5kZW5jeSBleHRlbmRzIERlcGVuZGVuY3kge1xuICBjb25zdHJ1Y3RvcihrZXk6IEtleSwgb3B0aW9uYWw6IGJvb2xlYW4sIGxvd2VyQm91bmRWaXNpYmlsaXR5OiBPYmplY3QsXG4gICAgICAgICAgICAgIHVwcGVyQm91bmRWaXNpYmlsaXR5OiBPYmplY3QsIHByb3BlcnRpZXM6IGFueVtdLCBwdWJsaWMgYXR0cmlidXRlTmFtZTogc3RyaW5nLFxuICAgICAgICAgICAgICBwdWJsaWMgcXVlcnlEZWNvcmF0b3I6IFF1ZXJ5TWV0YWRhdGEpIHtcbiAgICBzdXBlcihrZXksIG9wdGlvbmFsLCBsb3dlckJvdW5kVmlzaWJpbGl0eSwgdXBwZXJCb3VuZFZpc2liaWxpdHksIHByb3BlcnRpZXMpO1xuICAgIHRoaXMuX3ZlcmlmeSgpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdmVyaWZ5KCk6IHZvaWQge1xuICAgIHZhciBjb3VudCA9IDA7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5RGVjb3JhdG9yKSkgY291bnQrKztcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuYXR0cmlidXRlTmFtZSkpIGNvdW50Kys7XG4gICAgaWYgKGNvdW50ID4gMSlcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICdBIGRpcmVjdGl2ZSBpbmplY3RhYmxlIGNhbiBjb250YWluIG9ubHkgb25lIG9mIHRoZSBmb2xsb3dpbmcgQEF0dHJpYnV0ZSBvciBAUXVlcnkuJyk7XG4gIH1cblxuICBzdGF0aWMgY3JlYXRlRnJvbShkOiBEZXBlbmRlbmN5KTogRGVwZW5kZW5jeSB7XG4gICAgcmV0dXJuIG5ldyBEaXJlY3RpdmVEZXBlbmRlbmN5KFxuICAgICAgICBkLmtleSwgZC5vcHRpb25hbCwgZC5sb3dlckJvdW5kVmlzaWJpbGl0eSwgZC51cHBlckJvdW5kVmlzaWJpbGl0eSwgZC5wcm9wZXJ0aWVzLFxuICAgICAgICBEaXJlY3RpdmVEZXBlbmRlbmN5Ll9hdHRyaWJ1dGVOYW1lKGQucHJvcGVydGllcyksIERpcmVjdGl2ZURlcGVuZGVuY3kuX3F1ZXJ5KGQucHJvcGVydGllcykpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBzdGF0aWMgX2F0dHJpYnV0ZU5hbWUocHJvcGVydGllczogYW55W10pOiBzdHJpbmcge1xuICAgIHZhciBwID0gPEF0dHJpYnV0ZU1ldGFkYXRhPnByb3BlcnRpZXMuZmluZChwID0+IHAgaW5zdGFuY2VvZiBBdHRyaWJ1dGVNZXRhZGF0YSk7XG4gICAgcmV0dXJuIGlzUHJlc2VudChwKSA/IHAuYXR0cmlidXRlTmFtZSA6IG51bGw7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHN0YXRpYyBfcXVlcnkocHJvcGVydGllczogYW55W10pOiBRdWVyeU1ldGFkYXRhIHtcbiAgICByZXR1cm4gPFF1ZXJ5TWV0YWRhdGE+cHJvcGVydGllcy5maW5kKHAgPT4gcCBpbnN0YW5jZW9mIFF1ZXJ5TWV0YWRhdGEpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEaXJlY3RpdmVQcm92aWRlciBleHRlbmRzIFJlc29sdmVkUHJvdmlkZXJfIHtcbiAgcHVibGljIGNhbGxPbkRlc3Ryb3k6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3Ioa2V5OiBLZXksIGZhY3Rvcnk6IEZ1bmN0aW9uLCBkZXBzOiBEZXBlbmRlbmN5W10sIHB1YmxpYyBtZXRhZGF0YTogRGlyZWN0aXZlTWV0YWRhdGEsXG4gICAgICAgICAgICAgIHB1YmxpYyBwcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPixcbiAgICAgICAgICAgICAgcHVibGljIHZpZXdQcm92aWRlcnM6IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPikge1xuICAgIHN1cGVyKGtleSwgW25ldyBSZXNvbHZlZEZhY3RvcnkoZmFjdG9yeSwgZGVwcyldLCBmYWxzZSk7XG4gICAgdGhpcy5jYWxsT25EZXN0cm95ID0gaGFzTGlmZWN5Y2xlSG9vayhMaWZlY3ljbGVIb29rcy5PbkRlc3Ryb3ksIGtleS50b2tlbik7XG4gIH1cblxuICBnZXQgZGlzcGxheU5hbWUoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMua2V5LmRpc3BsYXlOYW1lOyB9XG5cbiAgZ2V0IHF1ZXJpZXMoKTogUXVlcnlNZXRhZGF0YVdpdGhTZXR0ZXJbXSB7XG4gICAgaWYgKGlzQmxhbmsodGhpcy5tZXRhZGF0YS5xdWVyaWVzKSkgcmV0dXJuIFtdO1xuXG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaCh0aGlzLm1ldGFkYXRhLnF1ZXJpZXMsIChtZXRhLCBmaWVsZE5hbWUpID0+IHtcbiAgICAgIHZhciBzZXR0ZXIgPSByZWZsZWN0b3Iuc2V0dGVyKGZpZWxkTmFtZSk7XG4gICAgICByZXMucHVzaChuZXcgUXVlcnlNZXRhZGF0YVdpdGhTZXR0ZXIoc2V0dGVyLCBtZXRhKSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuXG4gIGdldCBldmVudEVtaXR0ZXJzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMubWV0YWRhdGEpICYmIGlzUHJlc2VudCh0aGlzLm1ldGFkYXRhLm91dHB1dHMpID8gdGhpcy5tZXRhZGF0YS5vdXRwdXRzIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW107XG4gIH1cblxuICBzdGF0aWMgY3JlYXRlRnJvbVByb3ZpZGVyKHByb3ZpZGVyOiBQcm92aWRlciwgbWV0YTogRGlyZWN0aXZlTWV0YWRhdGEpOiBEaXJlY3RpdmVQcm92aWRlciB7XG4gICAgaWYgKGlzQmxhbmsobWV0YSkpIHtcbiAgICAgIG1ldGEgPSBuZXcgRGlyZWN0aXZlTWV0YWRhdGEoKTtcbiAgICB9XG5cbiAgICB2YXIgcmIgPSByZXNvbHZlUHJvdmlkZXIocHJvdmlkZXIpO1xuICAgIHZhciByZiA9IHJiLnJlc29sdmVkRmFjdG9yaWVzWzBdO1xuICAgIHZhciBkZXBzID0gcmYuZGVwZW5kZW5jaWVzLm1hcChEaXJlY3RpdmVEZXBlbmRlbmN5LmNyZWF0ZUZyb20pO1xuXG4gICAgdmFyIHByb3ZpZGVycyA9IGlzUHJlc2VudChtZXRhLnByb3ZpZGVycykgPyBtZXRhLnByb3ZpZGVycyA6IFtdO1xuICAgIHZhciB2aWV3QmluZGlncyA9IG1ldGEgaW5zdGFuY2VvZiBDb21wb25lbnRNZXRhZGF0YSAmJiBpc1ByZXNlbnQobWV0YS52aWV3UHJvdmlkZXJzKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG1ldGEudmlld1Byb3ZpZGVycyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFtdO1xuICAgIHJldHVybiBuZXcgRGlyZWN0aXZlUHJvdmlkZXIocmIua2V5LCByZi5mYWN0b3J5LCBkZXBzLCBtZXRhLCBwcm92aWRlcnMsIHZpZXdCaW5kaWdzKTtcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGVGcm9tVHlwZSh0eXBlOiBUeXBlLCBhbm5vdGF0aW9uOiBEaXJlY3RpdmVNZXRhZGF0YSk6IERpcmVjdGl2ZVByb3ZpZGVyIHtcbiAgICB2YXIgcHJvdmlkZXIgPSBuZXcgUHJvdmlkZXIodHlwZSwge3VzZUNsYXNzOiB0eXBlfSk7XG4gICAgcmV0dXJuIERpcmVjdGl2ZVByb3ZpZGVyLmNyZWF0ZUZyb21Qcm92aWRlcihwcm92aWRlciwgYW5ub3RhdGlvbik7XG4gIH1cbn1cblxuLy8gVE9ETyhyYWRvKTogYmVuY2htYXJrIGFuZCBjb25zaWRlciByb2xsaW5nIGluIGFzIEVsZW1lbnRJbmplY3RvciBmaWVsZHMuXG5leHBvcnQgY2xhc3MgUHJlQnVpbHRPYmplY3RzIHtcbiAgbmVzdGVkVmlldzogQXBwVmlldyA9IG51bGw7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2aWV3TWFuYWdlcjogYXZtTW9kdWxlLkFwcFZpZXdNYW5hZ2VyLCBwdWJsaWMgdmlldzogQXBwVmlldyxcbiAgICAgICAgICAgICAgcHVibGljIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsIHB1YmxpYyB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWYpIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBRdWVyeU1ldGFkYXRhV2l0aFNldHRlciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzZXR0ZXI6IFNldHRlckZuLCBwdWJsaWMgbWV0YWRhdGE6IFF1ZXJ5TWV0YWRhdGEpIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBFdmVudEVtaXR0ZXJBY2Nlc3NvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBldmVudE5hbWU6IHN0cmluZywgcHVibGljIGdldHRlcjogRnVuY3Rpb24pIHt9XG5cbiAgc3Vic2NyaWJlKHZpZXc6IEFwcFZpZXcsIGJvdW5kRWxlbWVudEluZGV4OiBudW1iZXIsIGRpcmVjdGl2ZTogT2JqZWN0KTogT2JqZWN0IHtcbiAgICB2YXIgZXZlbnRFbWl0dGVyID0gdGhpcy5nZXR0ZXIoZGlyZWN0aXZlKTtcbiAgICByZXR1cm4gT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlPEV2ZW50PihcbiAgICAgICAgZXZlbnRFbWl0dGVyLFxuICAgICAgICBldmVudE9iaiA9PiB2aWV3LnRyaWdnZXJFdmVudEhhbmRsZXJzKHRoaXMuZXZlbnROYW1lLCBldmVudE9iaiwgYm91bmRFbGVtZW50SW5kZXgpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBfY3JlYXRlRXZlbnRFbWl0dGVyQWNjZXNzb3JzKGJ3djogUHJvdmlkZXJXaXRoVmlzaWJpbGl0eSk6IEV2ZW50RW1pdHRlckFjY2Vzc29yW10ge1xuICB2YXIgcHJvdmlkZXIgPSBid3YucHJvdmlkZXI7XG4gIGlmICghKHByb3ZpZGVyIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIpKSByZXR1cm4gW107XG4gIHZhciBkYiA9IDxEaXJlY3RpdmVQcm92aWRlcj5wcm92aWRlcjtcbiAgcmV0dXJuIGRiLmV2ZW50RW1pdHRlcnMubWFwKGV2ZW50Q29uZmlnID0+IHtcbiAgICB2YXIgcGFyc2VkRXZlbnQgPSBFdmVudENvbmZpZy5wYXJzZShldmVudENvbmZpZyk7XG4gICAgcmV0dXJuIG5ldyBFdmVudEVtaXR0ZXJBY2Nlc3NvcihwYXJzZWRFdmVudC5ldmVudE5hbWUsIHJlZmxlY3Rvci5nZXR0ZXIocGFyc2VkRXZlbnQuZmllbGROYW1lKSk7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBfY3JlYXRlUHJvdG9RdWVyeVJlZnMocHJvdmlkZXJzOiBQcm92aWRlcldpdGhWaXNpYmlsaXR5W10pOiBQcm90b1F1ZXJ5UmVmW10ge1xuICB2YXIgcmVzID0gW107XG4gIExpc3RXcmFwcGVyLmZvckVhY2hXaXRoSW5kZXgocHJvdmlkZXJzLCAoYiwgaSkgPT4ge1xuICAgIGlmIChiLnByb3ZpZGVyIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIpIHtcbiAgICAgIHZhciBkaXJlY3RpdmVQcm92aWRlciA9IDxEaXJlY3RpdmVQcm92aWRlcj5iLnByb3ZpZGVyO1xuICAgICAgLy8gZmllbGQgcXVlcmllc1xuICAgICAgdmFyIHF1ZXJpZXM6IFF1ZXJ5TWV0YWRhdGFXaXRoU2V0dGVyW10gPSBkaXJlY3RpdmVQcm92aWRlci5xdWVyaWVzO1xuICAgICAgcXVlcmllcy5mb3JFYWNoKHEgPT4gcmVzLnB1c2gobmV3IFByb3RvUXVlcnlSZWYoaSwgcS5zZXR0ZXIsIHEubWV0YWRhdGEpKSk7XG5cbiAgICAgIC8vIHF1ZXJpZXMgcGFzc2VkIGludG8gdGhlIGNvbnN0cnVjdG9yLlxuICAgICAgLy8gVE9ETzogcmVtb3ZlIHRoaXMgYWZ0ZXIgY29uc3RydWN0b3IgcXVlcmllcyBhcmUgbm8gbG9uZ2VyIHN1cHBvcnRlZFxuICAgICAgdmFyIGRlcHM6IERpcmVjdGl2ZURlcGVuZGVuY3lbXSA9XG4gICAgICAgICAgPERpcmVjdGl2ZURlcGVuZGVuY3lbXT5kaXJlY3RpdmVQcm92aWRlci5yZXNvbHZlZEZhY3RvcnkuZGVwZW5kZW5jaWVzO1xuICAgICAgZGVwcy5mb3JFYWNoKGQgPT4ge1xuICAgICAgICBpZiAoaXNQcmVzZW50KGQucXVlcnlEZWNvcmF0b3IpKSByZXMucHVzaChuZXcgUHJvdG9RdWVyeVJlZihpLCBudWxsLCBkLnF1ZXJ5RGVjb3JhdG9yKSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gcmVzO1xufVxuXG5leHBvcnQgY2xhc3MgUHJvdG9FbGVtZW50SW5qZWN0b3Ige1xuICB2aWV3OiBBcHBWaWV3O1xuICBhdHRyaWJ1dGVzOiBNYXA8c3RyaW5nLCBzdHJpbmc+O1xuICBldmVudEVtaXR0ZXJBY2Nlc3NvcnM6IEV2ZW50RW1pdHRlckFjY2Vzc29yW11bXTtcbiAgcHJvdG9RdWVyeVJlZnM6IFByb3RvUXVlcnlSZWZbXTtcbiAgcHJvdG9JbmplY3RvcjogUHJvdG9JbmplY3RvcjtcblxuICBzdGF0aWMgY3JlYXRlKHBhcmVudDogUHJvdG9FbGVtZW50SW5qZWN0b3IsIGluZGV4OiBudW1iZXIsIHByb3ZpZGVyczogRGlyZWN0aXZlUHJvdmlkZXJbXSxcbiAgICAgICAgICAgICAgICBmaXJzdFByb3ZpZGVySXNDb21wb25lbnQ6IGJvb2xlYW4sIGRpc3RhbmNlVG9QYXJlbnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgICBkaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzOiBNYXA8c3RyaW5nLCBudW1iZXI+KTogUHJvdG9FbGVtZW50SW5qZWN0b3Ige1xuICAgIHZhciBiZCA9IFtdO1xuXG4gICAgUHJvdG9FbGVtZW50SW5qZWN0b3IuX2NyZWF0ZURpcmVjdGl2ZVByb3ZpZGVyV2l0aFZpc2liaWxpdHkocHJvdmlkZXJzLCBiZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFByb3ZpZGVySXNDb21wb25lbnQpO1xuICAgIGlmIChmaXJzdFByb3ZpZGVySXNDb21wb25lbnQpIHtcbiAgICAgIFByb3RvRWxlbWVudEluamVjdG9yLl9jcmVhdGVWaWV3UHJvdmlkZXJzV2l0aFZpc2liaWxpdHkocHJvdmlkZXJzLCBiZCk7XG4gICAgfVxuXG4gICAgUHJvdG9FbGVtZW50SW5qZWN0b3IuX2NyZWF0ZVByb3ZpZGVyc1dpdGhWaXNpYmlsaXR5KHByb3ZpZGVycywgYmQpO1xuICAgIHJldHVybiBuZXcgUHJvdG9FbGVtZW50SW5qZWN0b3IocGFyZW50LCBpbmRleCwgYmQsIGRpc3RhbmNlVG9QYXJlbnQsIGZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGl2ZVZhcmlhYmxlQmluZGluZ3MpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgX2NyZWF0ZURpcmVjdGl2ZVByb3ZpZGVyV2l0aFZpc2liaWxpdHkoZGlyUHJvdmlkZXJzOiBEaXJlY3RpdmVQcm92aWRlcltdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZDogUHJvdmlkZXJXaXRoVmlzaWJpbGl0eVtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaXJzdFByb3ZpZGVySXNDb21wb25lbnQ6IGJvb2xlYW4pIHtcbiAgICBkaXJQcm92aWRlcnMuZm9yRWFjaChkaXJQcm92aWRlciA9PiB7XG4gICAgICBiZC5wdXNoKFByb3RvRWxlbWVudEluamVjdG9yLl9jcmVhdGVQcm92aWRlcldpdGhWaXNpYmlsaXR5KFxuICAgICAgICAgIGZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudCwgZGlyUHJvdmlkZXIsIGRpclByb3ZpZGVycywgZGlyUHJvdmlkZXIpKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIF9jcmVhdGVQcm92aWRlcnNXaXRoVmlzaWJpbGl0eShkaXJQcm92aWRlcnM6IERpcmVjdGl2ZVByb3ZpZGVyW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZDogUHJvdmlkZXJXaXRoVmlzaWJpbGl0eVtdKSB7XG4gICAgdmFyIHByb3ZpZGVyc0Zyb21BbGxEaXJlY3RpdmVzID0gW107XG4gICAgZGlyUHJvdmlkZXJzLmZvckVhY2goZGlyUHJvdmlkZXIgPT4ge1xuICAgICAgcHJvdmlkZXJzRnJvbUFsbERpcmVjdGl2ZXMgPVxuICAgICAgICAgIExpc3RXcmFwcGVyLmNvbmNhdChwcm92aWRlcnNGcm9tQWxsRGlyZWN0aXZlcywgZGlyUHJvdmlkZXIucHJvdmlkZXJzKTtcbiAgICB9KTtcblxuICAgIHZhciByZXNvbHZlZCA9IEluamVjdG9yLnJlc29sdmUocHJvdmlkZXJzRnJvbUFsbERpcmVjdGl2ZXMpO1xuICAgIHJlc29sdmVkLmZvckVhY2goYiA9PiBiZC5wdXNoKG5ldyBQcm92aWRlcldpdGhWaXNpYmlsaXR5KGIsIFZpc2liaWxpdHkuUHVibGljKSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgX2NyZWF0ZVByb3ZpZGVyV2l0aFZpc2liaWxpdHkoZmlyc3RQcm92aWRlcklzQ29tcG9uZW50OiBib29sZWFuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJQcm92aWRlcjogRGlyZWN0aXZlUHJvdmlkZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpclByb3ZpZGVyczogRGlyZWN0aXZlUHJvdmlkZXJbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXI6IFJlc29sdmVkUHJvdmlkZXIpIHtcbiAgICB2YXIgaXNDb21wb25lbnQgPSBmaXJzdFByb3ZpZGVySXNDb21wb25lbnQgJiYgZGlyUHJvdmlkZXJzWzBdID09PSBkaXJQcm92aWRlcjtcbiAgICByZXR1cm4gbmV3IFByb3ZpZGVyV2l0aFZpc2liaWxpdHkoXG4gICAgICAgIHByb3ZpZGVyLCBpc0NvbXBvbmVudCA/IFZpc2liaWxpdHkuUHVibGljQW5kUHJpdmF0ZSA6IFZpc2liaWxpdHkuUHVibGljKTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIF9jcmVhdGVWaWV3UHJvdmlkZXJzV2l0aFZpc2liaWxpdHkoZGlyUHJvdmlkZXJzOiBEaXJlY3RpdmVQcm92aWRlcltdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJkOiBQcm92aWRlcldpdGhWaXNpYmlsaXR5W10pIHtcbiAgICB2YXIgcmVzb2x2ZWRWaWV3UHJvdmlkZXJzID0gSW5qZWN0b3IucmVzb2x2ZShkaXJQcm92aWRlcnNbMF0udmlld1Byb3ZpZGVycyk7XG4gICAgcmVzb2x2ZWRWaWV3UHJvdmlkZXJzLmZvckVhY2goYiA9PiBiZC5wdXNoKG5ldyBQcm92aWRlcldpdGhWaXNpYmlsaXR5KGIsIFZpc2liaWxpdHkuUHJpdmF0ZSkpKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIF9maXJzdFByb3ZpZGVySXNDb21wb25lbnQ6IGJvb2xlYW47XG5cblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGFyZW50OiBQcm90b0VsZW1lbnRJbmplY3RvciwgcHVibGljIGluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgIGJ3djogUHJvdmlkZXJXaXRoVmlzaWJpbGl0eVtdLCBwdWJsaWMgZGlzdGFuY2VUb1BhcmVudDogbnVtYmVyLFxuICAgICAgICAgICAgICBfZmlyc3RQcm92aWRlcklzQ29tcG9uZW50OiBib29sZWFuLFxuICAgICAgICAgICAgICBwdWJsaWMgZGlyZWN0aXZlVmFyaWFibGVCaW5kaW5nczogTWFwPHN0cmluZywgbnVtYmVyPikge1xuICAgIHRoaXMuX2ZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudCA9IF9maXJzdFByb3ZpZGVySXNDb21wb25lbnQ7XG4gICAgdmFyIGxlbmd0aCA9IGJ3di5sZW5ndGg7XG4gICAgdGhpcy5wcm90b0luamVjdG9yID0gbmV3IFByb3RvSW5qZWN0b3IoYnd2KTtcbiAgICB0aGlzLmV2ZW50RW1pdHRlckFjY2Vzc29ycyA9IExpc3RXcmFwcGVyLmNyZWF0ZUZpeGVkU2l6ZShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICAgIHRoaXMuZXZlbnRFbWl0dGVyQWNjZXNzb3JzW2ldID0gX2NyZWF0ZUV2ZW50RW1pdHRlckFjY2Vzc29ycyhid3ZbaV0pO1xuICAgIH1cbiAgICB0aGlzLnByb3RvUXVlcnlSZWZzID0gX2NyZWF0ZVByb3RvUXVlcnlSZWZzKGJ3dik7XG4gIH1cblxuICBpbnN0YW50aWF0ZShwYXJlbnQ6IEVsZW1lbnRJbmplY3Rvcik6IEVsZW1lbnRJbmplY3RvciB7XG4gICAgcmV0dXJuIG5ldyBFbGVtZW50SW5qZWN0b3IodGhpcywgcGFyZW50KTtcbiAgfVxuXG4gIGRpcmVjdFBhcmVudCgpOiBQcm90b0VsZW1lbnRJbmplY3RvciB7IHJldHVybiB0aGlzLmRpc3RhbmNlVG9QYXJlbnQgPCAyID8gdGhpcy5wYXJlbnQgOiBudWxsOyB9XG5cbiAgZ2V0IGhhc0JpbmRpbmdzKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5ldmVudEVtaXR0ZXJBY2Nlc3NvcnMubGVuZ3RoID4gMDsgfVxuXG4gIGdldFByb3ZpZGVyQXRJbmRleChpbmRleDogbnVtYmVyKTogYW55IHsgcmV0dXJuIHRoaXMucHJvdG9JbmplY3Rvci5nZXRQcm92aWRlckF0SW5kZXgoaW5kZXgpOyB9XG59XG5cbmNsYXNzIF9Db250ZXh0IHtcbiAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnQ6IGFueSwgcHVibGljIGNvbXBvbmVudEVsZW1lbnQ6IGFueSwgcHVibGljIGluamVjdG9yOiBhbnkpIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBFbGVtZW50SW5qZWN0b3IgZXh0ZW5kcyBUcmVlTm9kZTxFbGVtZW50SW5qZWN0b3I+IGltcGxlbWVudHMgRGVwZW5kZW5jeVByb3ZpZGVyLFxuICAgIEFmdGVyVmlld0NoZWNrZWQge1xuICBwcml2YXRlIF9ob3N0OiBFbGVtZW50SW5qZWN0b3I7XG4gIHByaXZhdGUgX3ByZUJ1aWx0T2JqZWN0czogUHJlQnVpbHRPYmplY3RzID0gbnVsbDtcbiAgcHJpdmF0ZSBfcXVlcnlTdHJhdGVneTogX1F1ZXJ5U3RyYXRlZ3k7XG5cbiAgaHlkcmF0ZWQ6IGJvb2xlYW47XG5cbiAgcHJpdmF0ZSBfaW5qZWN0b3I6IEluamVjdG9yO1xuICBwcml2YXRlIF9zdHJhdGVneTogX0VsZW1lbnRJbmplY3RvclN0cmF0ZWd5O1xuICAvKiogQGludGVybmFsICovXG4gIHB1YmxpYyBfcHJvdG86IFByb3RvRWxlbWVudEluamVjdG9yO1xuXG4gIGNvbnN0cnVjdG9yKF9wcm90bzogUHJvdG9FbGVtZW50SW5qZWN0b3IsIHBhcmVudDogRWxlbWVudEluamVjdG9yKSB7XG4gICAgc3VwZXIocGFyZW50KTtcbiAgICB0aGlzLl9wcm90byA9IF9wcm90bztcbiAgICB0aGlzLl9pbmplY3RvciA9XG4gICAgICAgIG5ldyBJbmplY3Rvcih0aGlzLl9wcm90by5wcm90b0luamVjdG9yLCBudWxsLCB0aGlzLCAoKSA9PiB0aGlzLl9kZWJ1Z0NvbnRleHQoKSk7XG5cbiAgICAvLyB3ZSBjb3VwbGUgb3Vyc2VsdmVzIHRvIHRoZSBpbmplY3RvciBzdHJhdGVneSB0byBhdm9pZCBwb2x5bW9wcmhpYyBjYWxsc1xuICAgIHZhciBpbmplY3RvclN0cmF0ZWd5ID0gPGFueT50aGlzLl9pbmplY3Rvci5pbnRlcm5hbFN0cmF0ZWd5O1xuICAgIHRoaXMuX3N0cmF0ZWd5ID0gaW5qZWN0b3JTdHJhdGVneSBpbnN0YW5jZW9mIEluamVjdG9ySW5saW5lU3RyYXRlZ3kgP1xuICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBFbGVtZW50SW5qZWN0b3JJbmxpbmVTdHJhdGVneShpbmplY3RvclN0cmF0ZWd5LCB0aGlzKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEVsZW1lbnRJbmplY3RvckR5bmFtaWNTdHJhdGVneShpbmplY3RvclN0cmF0ZWd5LCB0aGlzKTtcblxuICAgIHRoaXMuaHlkcmF0ZWQgPSBmYWxzZTtcblxuICAgIHRoaXMuX3F1ZXJ5U3RyYXRlZ3kgPSB0aGlzLl9idWlsZFF1ZXJ5U3RyYXRlZ3koKTtcbiAgfVxuXG4gIGRlaHlkcmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLmh5ZHJhdGVkID0gZmFsc2U7XG4gICAgdGhpcy5faG9zdCA9IG51bGw7XG4gICAgdGhpcy5fcHJlQnVpbHRPYmplY3RzID0gbnVsbDtcbiAgICB0aGlzLl9zdHJhdGVneS5jYWxsT25EZXN0cm95KCk7XG4gICAgdGhpcy5fc3RyYXRlZ3kuZGVoeWRyYXRlKCk7XG4gICAgdGhpcy5fcXVlcnlTdHJhdGVneS5kZWh5ZHJhdGUoKTtcbiAgfVxuXG4gIGh5ZHJhdGUoaW1wZXJhdGl2ZWx5Q3JlYXRlZEluamVjdG9yOiBJbmplY3RvciwgaG9zdDogRWxlbWVudEluamVjdG9yLFxuICAgICAgICAgIHByZUJ1aWx0T2JqZWN0czogUHJlQnVpbHRPYmplY3RzKTogdm9pZCB7XG4gICAgdGhpcy5faG9zdCA9IGhvc3Q7XG4gICAgdGhpcy5fcHJlQnVpbHRPYmplY3RzID0gcHJlQnVpbHRPYmplY3RzO1xuXG4gICAgdGhpcy5fcmVhdHRhY2hJbmplY3RvcnMoaW1wZXJhdGl2ZWx5Q3JlYXRlZEluamVjdG9yKTtcbiAgICB0aGlzLl9xdWVyeVN0cmF0ZWd5Lmh5ZHJhdGUoKTtcbiAgICB0aGlzLl9zdHJhdGVneS5oeWRyYXRlKCk7XG5cbiAgICB0aGlzLmh5ZHJhdGVkID0gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX2RlYnVnQ29udGV4dCgpOiBhbnkge1xuICAgIHZhciBwID0gdGhpcy5fcHJlQnVpbHRPYmplY3RzO1xuICAgIHZhciBpbmRleCA9IHAuZWxlbWVudFJlZi5ib3VuZEVsZW1lbnRJbmRleCAtIHAudmlldy5lbGVtZW50T2Zmc2V0O1xuICAgIHZhciBjID0gdGhpcy5fcHJlQnVpbHRPYmplY3RzLnZpZXcuZ2V0RGVidWdDb250ZXh0KGluZGV4LCBudWxsKTtcbiAgICByZXR1cm4gaXNQcmVzZW50KGMpID8gbmV3IF9Db250ZXh0KGMuZWxlbWVudCwgYy5jb21wb25lbnRFbGVtZW50LCBjLmluamVjdG9yKSA6IG51bGw7XG4gIH1cblxuICBwcml2YXRlIF9yZWF0dGFjaEluamVjdG9ycyhpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3I6IEluamVjdG9yKTogdm9pZCB7XG4gICAgLy8gRHluYW1pY2FsbHktbG9hZGVkIGNvbXBvbmVudCBpbiB0aGUgdGVtcGxhdGUuIE5vdCBhIHJvb3QgRWxlbWVudEluamVjdG9yLlxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fcGFyZW50KSkge1xuICAgICAgaWYgKGlzUHJlc2VudChpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IpKSB7XG4gICAgICAgIC8vIFRoZSBpbXBlcmF0aXZlIGluamVjdG9yIGlzIHNpbWlsYXIgdG8gaGF2aW5nIGFuIGVsZW1lbnQgYmV0d2VlblxuICAgICAgICAvLyB0aGUgZHluYW1pYy1sb2FkZWQgY29tcG9uZW50IGFuZCBpdHMgcGFyZW50ID0+IG5vIGJvdW5kYXJpZXMuXG4gICAgICAgIHRoaXMuX3JlYXR0YWNoSW5qZWN0b3IodGhpcy5faW5qZWN0b3IsIGltcGVyYXRpdmVseUNyZWF0ZWRJbmplY3RvciwgZmFsc2UpO1xuICAgICAgICB0aGlzLl9yZWF0dGFjaEluamVjdG9yKGltcGVyYXRpdmVseUNyZWF0ZWRJbmplY3RvciwgdGhpcy5fcGFyZW50Ll9pbmplY3RvciwgZmFsc2UpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcmVhdHRhY2hJbmplY3Rvcih0aGlzLl9pbmplY3RvciwgdGhpcy5fcGFyZW50Ll9pbmplY3RvciwgZmFsc2UpO1xuICAgICAgfVxuXG4gICAgICAvLyBEeW5hbWljYWxseS1sb2FkZWQgY29tcG9uZW50IGluIHRoZSB0ZW1wbGF0ZS4gQSByb290IEVsZW1lbnRJbmplY3Rvci5cbiAgICB9IGVsc2UgaWYgKGlzUHJlc2VudCh0aGlzLl9ob3N0KSkge1xuICAgICAgLy8gVGhlIGltcGVyYXRpdmUgaW5qZWN0b3IgaXMgc2ltaWxhciB0byBoYXZpbmcgYW4gZWxlbWVudCBiZXR3ZWVuXG4gICAgICAvLyB0aGUgZHluYW1pYy1sb2FkZWQgY29tcG9uZW50IGFuZCBpdHMgcGFyZW50ID0+IG5vIGJvdW5kYXJ5IGJldHdlZW5cbiAgICAgIC8vIHRoZSBjb21wb25lbnQgYW5kIGltcGVyYXRpdmVseUNyZWF0ZWRJbmplY3Rvci5cbiAgICAgIC8vIEJ1dCBzaW5jZSBpdCBpcyBhIHJvb3QgRWxlbWVudEluamVjdG9yLCB3ZSBuZWVkIHRvIGNyZWF0ZSBhIGJvdW5kYXJ5XG4gICAgICAvLyBiZXR3ZWVuIGltcGVyYXRpdmVseUNyZWF0ZWRJbmplY3RvciBhbmQgX2hvc3QuXG4gICAgICBpZiAoaXNQcmVzZW50KGltcGVyYXRpdmVseUNyZWF0ZWRJbmplY3RvcikpIHtcbiAgICAgICAgdGhpcy5fcmVhdHRhY2hJbmplY3Rvcih0aGlzLl9pbmplY3RvciwgaW1wZXJhdGl2ZWx5Q3JlYXRlZEluamVjdG9yLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuX3JlYXR0YWNoSW5qZWN0b3IoaW1wZXJhdGl2ZWx5Q3JlYXRlZEluamVjdG9yLCB0aGlzLl9ob3N0Ll9pbmplY3RvciwgdHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9yZWF0dGFjaEluamVjdG9yKHRoaXMuX2luamVjdG9yLCB0aGlzLl9ob3N0Ll9pbmplY3RvciwgdHJ1ZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEJvb3RzdHJhcFxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoaXNQcmVzZW50KGltcGVyYXRpdmVseUNyZWF0ZWRJbmplY3RvcikpIHtcbiAgICAgICAgdGhpcy5fcmVhdHRhY2hJbmplY3Rvcih0aGlzLl9pbmplY3RvciwgaW1wZXJhdGl2ZWx5Q3JlYXRlZEluamVjdG9yLCB0cnVlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9yZWF0dGFjaEluamVjdG9yKGluamVjdG9yOiBJbmplY3RvciwgcGFyZW50SW5qZWN0b3I6IEluamVjdG9yLCBpc0JvdW5kYXJ5OiBib29sZWFuKSB7XG4gICAgaW5qZWN0b3IuaW50ZXJuYWxTdHJhdGVneS5hdHRhY2gocGFyZW50SW5qZWN0b3IsIGlzQm91bmRhcnkpO1xuICB9XG5cbiAgaGFzVmFyaWFibGVCaW5kaW5nKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHZhciB2YiA9IHRoaXMuX3Byb3RvLmRpcmVjdGl2ZVZhcmlhYmxlQmluZGluZ3M7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh2YikgJiYgdmIuaGFzKG5hbWUpO1xuICB9XG5cbiAgZ2V0VmFyaWFibGVCaW5kaW5nKG5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fcHJvdG8uZGlyZWN0aXZlVmFyaWFibGVCaW5kaW5ncy5nZXQobmFtZSk7XG4gICAgcmV0dXJuIGlzUHJlc2VudChpbmRleCkgPyB0aGlzLmdldERpcmVjdGl2ZUF0SW5kZXgoPG51bWJlcj5pbmRleCkgOiB0aGlzLmdldEVsZW1lbnRSZWYoKTtcbiAgfVxuXG4gIGdldCh0b2tlbjogYW55KTogYW55IHsgcmV0dXJuIHRoaXMuX2luamVjdG9yLmdldCh0b2tlbik7IH1cblxuICBoYXNEaXJlY3RpdmUodHlwZTogVHlwZSk6IGJvb2xlYW4geyByZXR1cm4gaXNQcmVzZW50KHRoaXMuX2luamVjdG9yLmdldE9wdGlvbmFsKHR5cGUpKTsgfVxuXG4gIGdldEV2ZW50RW1pdHRlckFjY2Vzc29ycygpOiBFdmVudEVtaXR0ZXJBY2Nlc3NvcltdW10geyByZXR1cm4gdGhpcy5fcHJvdG8uZXZlbnRFbWl0dGVyQWNjZXNzb3JzOyB9XG5cbiAgZ2V0RGlyZWN0aXZlVmFyaWFibGVCaW5kaW5ncygpOiBNYXA8c3RyaW5nLCBudW1iZXI+IHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdG8uZGlyZWN0aXZlVmFyaWFibGVCaW5kaW5ncztcbiAgfVxuXG4gIGdldENvbXBvbmVudCgpOiBhbnkgeyByZXR1cm4gdGhpcy5fc3RyYXRlZ3kuZ2V0Q29tcG9uZW50KCk7IH1cblxuICBnZXRJbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLl9pbmplY3RvcjsgfVxuXG4gIGdldEVsZW1lbnRSZWYoKTogRWxlbWVudFJlZiB7IHJldHVybiB0aGlzLl9wcmVCdWlsdE9iamVjdHMuZWxlbWVudFJlZjsgfVxuXG4gIGdldFZpZXdDb250YWluZXJSZWYoKTogVmlld0NvbnRhaW5lclJlZiB7XG4gICAgcmV0dXJuIG5ldyBWaWV3Q29udGFpbmVyUmVmXyh0aGlzLl9wcmVCdWlsdE9iamVjdHMudmlld01hbmFnZXIsIHRoaXMuZ2V0RWxlbWVudFJlZigpKTtcbiAgfVxuXG4gIGdldE5lc3RlZFZpZXcoKTogQXBwVmlldyB7IHJldHVybiB0aGlzLl9wcmVCdWlsdE9iamVjdHMubmVzdGVkVmlldzsgfVxuXG4gIGdldFZpZXcoKTogQXBwVmlldyB7IHJldHVybiB0aGlzLl9wcmVCdWlsdE9iamVjdHMudmlldzsgfVxuXG4gIGRpcmVjdFBhcmVudCgpOiBFbGVtZW50SW5qZWN0b3IgeyByZXR1cm4gdGhpcy5fcHJvdG8uZGlzdGFuY2VUb1BhcmVudCA8IDIgPyB0aGlzLnBhcmVudCA6IG51bGw7IH1cblxuICBpc0NvbXBvbmVudEtleShrZXk6IEtleSk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fc3RyYXRlZ3kuaXNDb21wb25lbnRLZXkoa2V5KTsgfVxuXG4gIGdldERlcGVuZGVuY3koaW5qZWN0b3I6IEluamVjdG9yLCBwcm92aWRlcjogUmVzb2x2ZWRQcm92aWRlciwgZGVwOiBEZXBlbmRlbmN5KTogYW55IHtcbiAgICB2YXIga2V5OiBLZXkgPSBkZXAua2V5O1xuXG4gICAgaWYgKHByb3ZpZGVyIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIpIHtcbiAgICAgIHZhciBkaXJEZXAgPSA8RGlyZWN0aXZlRGVwZW5kZW5jeT5kZXA7XG4gICAgICB2YXIgZGlyUHJvdmlkZXIgPSBwcm92aWRlcjtcbiAgICAgIHZhciBzdGF0aWNLZXlzID0gU3RhdGljS2V5cy5pbnN0YW5jZSgpO1xuXG5cbiAgICAgIGlmIChrZXkuaWQgPT09IHN0YXRpY0tleXMudmlld01hbmFnZXJJZCkgcmV0dXJuIHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy52aWV3TWFuYWdlcjtcblxuICAgICAgaWYgKGlzUHJlc2VudChkaXJEZXAuYXR0cmlidXRlTmFtZSkpIHJldHVybiB0aGlzLl9idWlsZEF0dHJpYnV0ZShkaXJEZXApO1xuXG4gICAgICBpZiAoaXNQcmVzZW50KGRpckRlcC5xdWVyeURlY29yYXRvcikpXG4gICAgICAgIHJldHVybiB0aGlzLl9xdWVyeVN0cmF0ZWd5LmZpbmRRdWVyeShkaXJEZXAucXVlcnlEZWNvcmF0b3IpLmxpc3Q7XG5cbiAgICAgIGlmIChkaXJEZXAua2V5LmlkID09PSBTdGF0aWNLZXlzLmluc3RhbmNlKCkuY2hhbmdlRGV0ZWN0b3JSZWZJZCkge1xuICAgICAgICAvLyBXZSBwcm92aWRlIHRoZSBjb21wb25lbnQncyB2aWV3IGNoYW5nZSBkZXRlY3RvciB0byBjb21wb25lbnRzIGFuZFxuICAgICAgICAvLyB0aGUgc3Vycm91bmRpbmcgY29tcG9uZW50J3MgY2hhbmdlIGRldGVjdG9yIHRvIGRpcmVjdGl2ZXMuXG4gICAgICAgIGlmIChkaXJQcm92aWRlci5tZXRhZGF0YSBpbnN0YW5jZW9mIENvbXBvbmVudE1ldGFkYXRhKSB7XG4gICAgICAgICAgdmFyIGNvbXBvbmVudFZpZXcgPSB0aGlzLl9wcmVCdWlsdE9iamVjdHMudmlldy5nZXROZXN0ZWRWaWV3KFxuICAgICAgICAgICAgICB0aGlzLl9wcmVCdWlsdE9iamVjdHMuZWxlbWVudFJlZi5ib3VuZEVsZW1lbnRJbmRleCk7XG4gICAgICAgICAgcmV0dXJuIGNvbXBvbmVudFZpZXcuY2hhbmdlRGV0ZWN0b3IucmVmO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLl9wcmVCdWlsdE9iamVjdHMudmlldy5jaGFuZ2VEZXRlY3Rvci5yZWY7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGRpckRlcC5rZXkuaWQgPT09IFN0YXRpY0tleXMuaW5zdGFuY2UoKS5lbGVtZW50UmVmSWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0RWxlbWVudFJlZigpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGlyRGVwLmtleS5pZCA9PT0gU3RhdGljS2V5cy5pbnN0YW5jZSgpLnZpZXdDb250YWluZXJJZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRWaWV3Q29udGFpbmVyUmVmKCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChkaXJEZXAua2V5LmlkID09PSBTdGF0aWNLZXlzLmluc3RhbmNlKCkudGVtcGxhdGVSZWZJZCkge1xuICAgICAgICBpZiAoaXNCbGFuayh0aGlzLl9wcmVCdWlsdE9iamVjdHMudGVtcGxhdGVSZWYpKSB7XG4gICAgICAgICAgaWYgKGRpckRlcC5vcHRpb25hbCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhyb3cgbmV3IE5vUHJvdmlkZXJFcnJvcihudWxsLCBkaXJEZXAua2V5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fcHJlQnVpbHRPYmplY3RzLnRlbXBsYXRlUmVmO1xuICAgICAgfVxuXG4gICAgfSBlbHNlIGlmIChwcm92aWRlciBpbnN0YW5jZW9mIFBpcGVQcm92aWRlcikge1xuICAgICAgaWYgKGRlcC5rZXkuaWQgPT09IFN0YXRpY0tleXMuaW5zdGFuY2UoKS5jaGFuZ2VEZXRlY3RvclJlZklkKSB7XG4gICAgICAgIHZhciBjb21wb25lbnRWaWV3ID0gdGhpcy5fcHJlQnVpbHRPYmplY3RzLnZpZXcuZ2V0TmVzdGVkVmlldyhcbiAgICAgICAgICAgIHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy5lbGVtZW50UmVmLmJvdW5kRWxlbWVudEluZGV4KTtcbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudFZpZXcuY2hhbmdlRGV0ZWN0b3IucmVmO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBVTkRFRklORUQ7XG4gIH1cblxuICBwcml2YXRlIF9idWlsZEF0dHJpYnV0ZShkZXA6IERpcmVjdGl2ZURlcGVuZGVuY3kpOiBzdHJpbmcge1xuICAgIHZhciBhdHRyaWJ1dGVzID0gdGhpcy5fcHJvdG8uYXR0cmlidXRlcztcbiAgICBpZiAoaXNQcmVzZW50KGF0dHJpYnV0ZXMpICYmIGF0dHJpYnV0ZXMuaGFzKGRlcC5hdHRyaWJ1dGVOYW1lKSkge1xuICAgICAgcmV0dXJuIGF0dHJpYnV0ZXMuZ2V0KGRlcC5hdHRyaWJ1dGVOYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkocXVlcnk6IFF1ZXJ5TWV0YWRhdGEsIGxpc3Q6IGFueVtdKTogdm9pZCB7XG4gICAgdmFyIHRlbXBsYXRlUmVmID0gaXNCbGFuayh0aGlzLl9wcmVCdWlsdE9iamVjdHMpID8gbnVsbCA6IHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy50ZW1wbGF0ZVJlZjtcbiAgICBpZiAocXVlcnkuc2VsZWN0b3IgPT09IFRlbXBsYXRlUmVmICYmIGlzUHJlc2VudCh0ZW1wbGF0ZVJlZikpIHtcbiAgICAgIGxpc3QucHVzaCh0ZW1wbGF0ZVJlZik7XG4gICAgfVxuICAgIHRoaXMuX3N0cmF0ZWd5LmFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5KHF1ZXJ5LCBsaXN0KTtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkUXVlcnlTdHJhdGVneSgpOiBfUXVlcnlTdHJhdGVneSB7XG4gICAgaWYgKHRoaXMuX3Byb3RvLnByb3RvUXVlcnlSZWZzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIF9lbXB0eVF1ZXJ5U3RyYXRlZ3k7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9wcm90by5wcm90b1F1ZXJ5UmVmcy5sZW5ndGggPD1cbiAgICAgICAgICAgICAgIElubGluZVF1ZXJ5U3RyYXRlZ3kuTlVNQkVSX09GX1NVUFBPUlRFRF9RVUVSSUVTKSB7XG4gICAgICByZXR1cm4gbmV3IElubGluZVF1ZXJ5U3RyYXRlZ3kodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgRHluYW1pY1F1ZXJ5U3RyYXRlZ3kodGhpcyk7XG4gICAgfVxuICB9XG5cbiAgbGluayhwYXJlbnQ6IEVsZW1lbnRJbmplY3Rvcik6IHZvaWQgeyBwYXJlbnQuYWRkQ2hpbGQodGhpcyk7IH1cblxuICB1bmxpbmsoKTogdm9pZCB7IHRoaXMucmVtb3ZlKCk7IH1cblxuICBnZXREaXJlY3RpdmVBdEluZGV4KGluZGV4OiBudW1iZXIpOiBhbnkgeyByZXR1cm4gdGhpcy5faW5qZWN0b3IuZ2V0QXQoaW5kZXgpOyB9XG5cbiAgaGFzSW5zdGFuY2VzKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fcHJvdG8uaGFzQmluZGluZ3MgJiYgdGhpcy5oeWRyYXRlZDsgfVxuXG4gIGdldEhvc3QoKTogRWxlbWVudEluamVjdG9yIHsgcmV0dXJuIHRoaXMuX2hvc3Q7IH1cblxuICBnZXRCb3VuZEVsZW1lbnRJbmRleCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fcHJvdG8uaW5kZXg7IH1cblxuICBnZXRSb290Vmlld0luamVjdG9ycygpOiBFbGVtZW50SW5qZWN0b3JbXSB7XG4gICAgaWYgKCF0aGlzLmh5ZHJhdGVkKSByZXR1cm4gW107XG4gICAgdmFyIHZpZXcgPSB0aGlzLl9wcmVCdWlsdE9iamVjdHMudmlldztcbiAgICB2YXIgbmVzdGVkVmlldyA9IHZpZXcuZ2V0TmVzdGVkVmlldyh2aWV3LmVsZW1lbnRPZmZzZXQgKyB0aGlzLmdldEJvdW5kRWxlbWVudEluZGV4KCkpO1xuICAgIHJldHVybiBpc1ByZXNlbnQobmVzdGVkVmlldykgPyBuZXN0ZWRWaWV3LnJvb3RFbGVtZW50SW5qZWN0b3JzIDogW107XG4gIH1cblxuICBuZ0FmdGVyVmlld0NoZWNrZWQoKTogdm9pZCB7IHRoaXMuX3F1ZXJ5U3RyYXRlZ3kudXBkYXRlVmlld1F1ZXJpZXMoKTsgfVxuXG4gIG5nQWZ0ZXJDb250ZW50Q2hlY2tlZCgpOiB2b2lkIHsgdGhpcy5fcXVlcnlTdHJhdGVneS51cGRhdGVDb250ZW50UXVlcmllcygpOyB9XG5cbiAgdHJhdmVyc2VBbmRTZXRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHtcbiAgICB2YXIgaW5qID0gdGhpcztcbiAgICB3aGlsZSAoaXNQcmVzZW50KGluaikpIHtcbiAgICAgIGluai5fc2V0UXVlcmllc0FzRGlydHkoKTtcbiAgICAgIGluaiA9IGluai5wYXJlbnQ7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfc2V0UXVlcmllc0FzRGlydHkoKTogdm9pZCB7XG4gICAgdGhpcy5fcXVlcnlTdHJhdGVneS5zZXRDb250ZW50UXVlcmllc0FzRGlydHkoKTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2hvc3QpKSB0aGlzLl9ob3N0Ll9xdWVyeVN0cmF0ZWd5LnNldFZpZXdRdWVyaWVzQXNEaXJ0eSgpO1xuICB9XG59XG5cbmludGVyZmFjZSBfUXVlcnlTdHJhdGVneSB7XG4gIHNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkO1xuICBzZXRWaWV3UXVlcmllc0FzRGlydHkoKTogdm9pZDtcbiAgaHlkcmF0ZSgpOiB2b2lkO1xuICBkZWh5ZHJhdGUoKTogdm9pZDtcbiAgdXBkYXRlQ29udGVudFF1ZXJpZXMoKTogdm9pZDtcbiAgdXBkYXRlVmlld1F1ZXJpZXMoKTogdm9pZDtcbiAgZmluZFF1ZXJ5KHF1ZXJ5OiBRdWVyeU1ldGFkYXRhKTogUXVlcnlSZWY7XG59XG5cbmNsYXNzIF9FbXB0eVF1ZXJ5U3RyYXRlZ3kgaW1wbGVtZW50cyBfUXVlcnlTdHJhdGVneSB7XG4gIHNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHt9XG4gIHNldFZpZXdRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHt9XG4gIGh5ZHJhdGUoKTogdm9pZCB7fVxuICBkZWh5ZHJhdGUoKTogdm9pZCB7fVxuICB1cGRhdGVDb250ZW50UXVlcmllcygpOiB2b2lkIHt9XG4gIHVwZGF0ZVZpZXdRdWVyaWVzKCk6IHZvaWQge31cbiAgZmluZFF1ZXJ5KHF1ZXJ5OiBRdWVyeU1ldGFkYXRhKTogUXVlcnlSZWYge1xuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW5ub3QgZmluZCBxdWVyeSBmb3IgZGlyZWN0aXZlICR7cXVlcnl9LmApO1xuICB9XG59XG5cbnZhciBfZW1wdHlRdWVyeVN0cmF0ZWd5ID0gbmV3IF9FbXB0eVF1ZXJ5U3RyYXRlZ3koKTtcblxuY2xhc3MgSW5saW5lUXVlcnlTdHJhdGVneSBpbXBsZW1lbnRzIF9RdWVyeVN0cmF0ZWd5IHtcbiAgc3RhdGljIE5VTUJFUl9PRl9TVVBQT1JURURfUVVFUklFUyA9IDM7XG5cbiAgcXVlcnkwOiBRdWVyeVJlZjtcbiAgcXVlcnkxOiBRdWVyeVJlZjtcbiAgcXVlcnkyOiBRdWVyeVJlZjtcblxuICBjb25zdHJ1Y3RvcihlaTogRWxlbWVudEluamVjdG9yKSB7XG4gICAgdmFyIHByb3RvUmVmcyA9IGVpLl9wcm90by5wcm90b1F1ZXJ5UmVmcztcbiAgICBpZiAocHJvdG9SZWZzLmxlbmd0aCA+IDApIHRoaXMucXVlcnkwID0gbmV3IFF1ZXJ5UmVmKHByb3RvUmVmc1swXSwgZWkpO1xuICAgIGlmIChwcm90b1JlZnMubGVuZ3RoID4gMSkgdGhpcy5xdWVyeTEgPSBuZXcgUXVlcnlSZWYocHJvdG9SZWZzWzFdLCBlaSk7XG4gICAgaWYgKHByb3RvUmVmcy5sZW5ndGggPiAyKSB0aGlzLnF1ZXJ5MiA9IG5ldyBRdWVyeVJlZihwcm90b1JlZnNbMl0sIGVpKTtcbiAgfVxuXG4gIHNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkwKSAmJiAhdGhpcy5xdWVyeTAuaXNWaWV3UXVlcnkpIHRoaXMucXVlcnkwLmRpcnR5ID0gdHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkxKSAmJiAhdGhpcy5xdWVyeTEuaXNWaWV3UXVlcnkpIHRoaXMucXVlcnkxLmRpcnR5ID0gdHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkyKSAmJiAhdGhpcy5xdWVyeTIuaXNWaWV3UXVlcnkpIHRoaXMucXVlcnkyLmRpcnR5ID0gdHJ1ZTtcbiAgfVxuXG4gIHNldFZpZXdRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkwKSAmJiB0aGlzLnF1ZXJ5MC5pc1ZpZXdRdWVyeSkgdGhpcy5xdWVyeTAuZGlydHkgPSB0cnVlO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTEpICYmIHRoaXMucXVlcnkxLmlzVmlld1F1ZXJ5KSB0aGlzLnF1ZXJ5MS5kaXJ0eSA9IHRydWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MikgJiYgdGhpcy5xdWVyeTIuaXNWaWV3UXVlcnkpIHRoaXMucXVlcnkyLmRpcnR5ID0gdHJ1ZTtcbiAgfVxuXG4gIGh5ZHJhdGUoKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MCkpIHRoaXMucXVlcnkwLmh5ZHJhdGUoKTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkxKSkgdGhpcy5xdWVyeTEuaHlkcmF0ZSgpO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTIpKSB0aGlzLnF1ZXJ5Mi5oeWRyYXRlKCk7XG4gIH1cblxuICBkZWh5ZHJhdGUoKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MCkpIHRoaXMucXVlcnkwLmRlaHlkcmF0ZSgpO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTEpKSB0aGlzLnF1ZXJ5MS5kZWh5ZHJhdGUoKTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkyKSkgdGhpcy5xdWVyeTIuZGVoeWRyYXRlKCk7XG4gIH1cblxuICB1cGRhdGVDb250ZW50UXVlcmllcygpIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkwKSAmJiAhdGhpcy5xdWVyeTAuaXNWaWV3UXVlcnkpIHtcbiAgICAgIHRoaXMucXVlcnkwLnVwZGF0ZSgpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkxKSAmJiAhdGhpcy5xdWVyeTEuaXNWaWV3UXVlcnkpIHtcbiAgICAgIHRoaXMucXVlcnkxLnVwZGF0ZSgpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkyKSAmJiAhdGhpcy5xdWVyeTIuaXNWaWV3UXVlcnkpIHtcbiAgICAgIHRoaXMucXVlcnkyLnVwZGF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVZpZXdRdWVyaWVzKCkge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTApICYmIHRoaXMucXVlcnkwLmlzVmlld1F1ZXJ5KSB7XG4gICAgICB0aGlzLnF1ZXJ5MC51cGRhdGUoKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MSkgJiYgdGhpcy5xdWVyeTEuaXNWaWV3UXVlcnkpIHtcbiAgICAgIHRoaXMucXVlcnkxLnVwZGF0ZSgpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkyKSAmJiB0aGlzLnF1ZXJ5Mi5pc1ZpZXdRdWVyeSkge1xuICAgICAgdGhpcy5xdWVyeTIudXBkYXRlKCk7XG4gICAgfVxuICB9XG5cbiAgZmluZFF1ZXJ5KHF1ZXJ5OiBRdWVyeU1ldGFkYXRhKTogUXVlcnlSZWYge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTApICYmIHRoaXMucXVlcnkwLnByb3RvUXVlcnlSZWYucXVlcnkgPT09IHF1ZXJ5KSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWVyeTA7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTEpICYmIHRoaXMucXVlcnkxLnByb3RvUXVlcnlSZWYucXVlcnkgPT09IHF1ZXJ5KSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWVyeTE7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTIpICYmIHRoaXMucXVlcnkyLnByb3RvUXVlcnlSZWYucXVlcnkgPT09IHF1ZXJ5KSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWVyeTI7XG4gICAgfVxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW5ub3QgZmluZCBxdWVyeSBmb3IgZGlyZWN0aXZlICR7cXVlcnl9LmApO1xuICB9XG59XG5cbmNsYXNzIER5bmFtaWNRdWVyeVN0cmF0ZWd5IGltcGxlbWVudHMgX1F1ZXJ5U3RyYXRlZ3kge1xuICBxdWVyaWVzOiBRdWVyeVJlZltdO1xuXG4gIGNvbnN0cnVjdG9yKGVpOiBFbGVtZW50SW5qZWN0b3IpIHtcbiAgICB0aGlzLnF1ZXJpZXMgPSBlaS5fcHJvdG8ucHJvdG9RdWVyeVJlZnMubWFwKHAgPT4gbmV3IFF1ZXJ5UmVmKHAsIGVpKSk7XG4gIH1cblxuICBzZXRDb250ZW50UXVlcmllc0FzRGlydHkoKTogdm9pZCB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKCFxLmlzVmlld1F1ZXJ5KSBxLmRpcnR5ID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBzZXRWaWV3UXVlcmllc0FzRGlydHkoKTogdm9pZCB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKHEuaXNWaWV3UXVlcnkpIHEuZGlydHkgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGh5ZHJhdGUoKTogdm9pZCB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgcS5oeWRyYXRlKCk7XG4gICAgfVxuICB9XG5cbiAgZGVoeWRyYXRlKCk6IHZvaWQge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5xdWVyaWVzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgcSA9IHRoaXMucXVlcmllc1tpXTtcbiAgICAgIHEuZGVoeWRyYXRlKCk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlQ29udGVudFF1ZXJpZXMoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKCFxLmlzVmlld1F1ZXJ5KSB7XG4gICAgICAgIHEudXBkYXRlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlVmlld1F1ZXJpZXMoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKHEuaXNWaWV3UXVlcnkpIHtcbiAgICAgICAgcS51cGRhdGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmaW5kUXVlcnkocXVlcnk6IFF1ZXJ5TWV0YWRhdGEpOiBRdWVyeVJlZiB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKHEucHJvdG9RdWVyeVJlZi5xdWVyeSA9PT0gcXVlcnkpIHtcbiAgICAgICAgcmV0dXJuIHE7XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW5ub3QgZmluZCBxdWVyeSBmb3IgZGlyZWN0aXZlICR7cXVlcnl9LmApO1xuICB9XG59XG5cbmludGVyZmFjZSBfRWxlbWVudEluamVjdG9yU3RyYXRlZ3kge1xuICBjYWxsT25EZXN0cm95KCk6IHZvaWQ7XG4gIGdldENvbXBvbmVudCgpOiBhbnk7XG4gIGlzQ29tcG9uZW50S2V5KGtleTogS2V5KTogYm9vbGVhbjtcbiAgYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkocTogUXVlcnlNZXRhZGF0YSwgcmVzOiBhbnlbXSk6IHZvaWQ7XG4gIGh5ZHJhdGUoKTogdm9pZDtcbiAgZGVoeWRyYXRlKCk6IHZvaWQ7XG59XG5cbi8qKlxuICogU3RyYXRlZ3kgdXNlZCBieSB0aGUgYEVsZW1lbnRJbmplY3RvcmAgd2hlbiB0aGUgbnVtYmVyIG9mIHByb3ZpZGVycyBpcyAxMCBvciBsZXNzLlxuICogSW4gc3VjaCBhIGNhc2UsIGlubGluaW5nIGZpZWxkcyBpcyBiZW5lZmljaWFsIGZvciBwZXJmb3JtYW5jZXMuXG4gKi9cbmNsYXNzIEVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5IGltcGxlbWVudHMgX0VsZW1lbnRJbmplY3RvclN0cmF0ZWd5IHtcbiAgY29uc3RydWN0b3IocHVibGljIGluamVjdG9yU3RyYXRlZ3k6IEluamVjdG9ySW5saW5lU3RyYXRlZ3ksIHB1YmxpYyBfZWk6IEVsZW1lbnRJbmplY3Rvcikge31cblxuICBoeWRyYXRlKCk6IHZvaWQge1xuICAgIHZhciBpID0gdGhpcy5pbmplY3RvclN0cmF0ZWd5O1xuICAgIHZhciBwID0gaS5wcm90b1N0cmF0ZWd5O1xuICAgIGkucmVzZXRDb25zdHJ1Y3Rpb25Db3VudGVyKCk7XG5cbiAgICBpZiAocC5wcm92aWRlcjAgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDApICYmIGkub2JqMCA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmowID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIwLCBwLnZpc2liaWxpdHkwKTtcbiAgICBpZiAocC5wcm92aWRlcjEgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDEpICYmIGkub2JqMSA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmoxID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIxLCBwLnZpc2liaWxpdHkxKTtcbiAgICBpZiAocC5wcm92aWRlcjIgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDIpICYmIGkub2JqMiA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmoyID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIyLCBwLnZpc2liaWxpdHkyKTtcbiAgICBpZiAocC5wcm92aWRlcjMgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDMpICYmIGkub2JqMyA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmozID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIzLCBwLnZpc2liaWxpdHkzKTtcbiAgICBpZiAocC5wcm92aWRlcjQgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDQpICYmIGkub2JqNCA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo0ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI0LCBwLnZpc2liaWxpdHk0KTtcbiAgICBpZiAocC5wcm92aWRlcjUgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDUpICYmIGkub2JqNSA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo1ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI1LCBwLnZpc2liaWxpdHk1KTtcbiAgICBpZiAocC5wcm92aWRlcjYgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDYpICYmIGkub2JqNiA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo2ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI2LCBwLnZpc2liaWxpdHk2KTtcbiAgICBpZiAocC5wcm92aWRlcjcgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDcpICYmIGkub2JqNyA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo3ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI3LCBwLnZpc2liaWxpdHk3KTtcbiAgICBpZiAocC5wcm92aWRlcjggaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDgpICYmIGkub2JqOCA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo4ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI4LCBwLnZpc2liaWxpdHk4KTtcbiAgICBpZiAocC5wcm92aWRlcjkgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDkpICYmIGkub2JqOSA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo5ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI5LCBwLnZpc2liaWxpdHk5KTtcbiAgfVxuXG4gIGRlaHlkcmF0ZSgpIHtcbiAgICB2YXIgaSA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneTtcblxuICAgIGkub2JqMCA9IFVOREVGSU5FRDtcbiAgICBpLm9iajEgPSBVTkRFRklORUQ7XG4gICAgaS5vYmoyID0gVU5ERUZJTkVEO1xuICAgIGkub2JqMyA9IFVOREVGSU5FRDtcbiAgICBpLm9iajQgPSBVTkRFRklORUQ7XG4gICAgaS5vYmo1ID0gVU5ERUZJTkVEO1xuICAgIGkub2JqNiA9IFVOREVGSU5FRDtcbiAgICBpLm9iajcgPSBVTkRFRklORUQ7XG4gICAgaS5vYmo4ID0gVU5ERUZJTkVEO1xuICAgIGkub2JqOSA9IFVOREVGSU5FRDtcbiAgfVxuXG4gIGNhbGxPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdmFyIGkgPSB0aGlzLmluamVjdG9yU3RyYXRlZ3k7XG4gICAgdmFyIHAgPSBpLnByb3RvU3RyYXRlZ3k7XG5cbiAgICBpZiAocC5wcm92aWRlcjAgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJlxuICAgICAgICAoPERpcmVjdGl2ZVByb3ZpZGVyPnAucHJvdmlkZXIwKS5jYWxsT25EZXN0cm95KSB7XG4gICAgICBpLm9iajAubmdPbkRlc3Ryb3koKTtcbiAgICB9XG4gICAgaWYgKHAucHJvdmlkZXIxIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiZcbiAgICAgICAgKDxEaXJlY3RpdmVQcm92aWRlcj5wLnByb3ZpZGVyMSkuY2FsbE9uRGVzdHJveSkge1xuICAgICAgaS5vYmoxLm5nT25EZXN0cm95KCk7XG4gICAgfVxuICAgIGlmIChwLnByb3ZpZGVyMiBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmXG4gICAgICAgICg8RGlyZWN0aXZlUHJvdmlkZXI+cC5wcm92aWRlcjIpLmNhbGxPbkRlc3Ryb3kpIHtcbiAgICAgIGkub2JqMi5uZ09uRGVzdHJveSgpO1xuICAgIH1cbiAgICBpZiAocC5wcm92aWRlcjMgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJlxuICAgICAgICAoPERpcmVjdGl2ZVByb3ZpZGVyPnAucHJvdmlkZXIzKS5jYWxsT25EZXN0cm95KSB7XG4gICAgICBpLm9iajMubmdPbkRlc3Ryb3koKTtcbiAgICB9XG4gICAgaWYgKHAucHJvdmlkZXI0IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiZcbiAgICAgICAgKDxEaXJlY3RpdmVQcm92aWRlcj5wLnByb3ZpZGVyNCkuY2FsbE9uRGVzdHJveSkge1xuICAgICAgaS5vYmo0Lm5nT25EZXN0cm95KCk7XG4gICAgfVxuICAgIGlmIChwLnByb3ZpZGVyNSBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmXG4gICAgICAgICg8RGlyZWN0aXZlUHJvdmlkZXI+cC5wcm92aWRlcjUpLmNhbGxPbkRlc3Ryb3kpIHtcbiAgICAgIGkub2JqNS5uZ09uRGVzdHJveSgpO1xuICAgIH1cbiAgICBpZiAocC5wcm92aWRlcjYgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJlxuICAgICAgICAoPERpcmVjdGl2ZVByb3ZpZGVyPnAucHJvdmlkZXI2KS5jYWxsT25EZXN0cm95KSB7XG4gICAgICBpLm9iajYubmdPbkRlc3Ryb3koKTtcbiAgICB9XG4gICAgaWYgKHAucHJvdmlkZXI3IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiZcbiAgICAgICAgKDxEaXJlY3RpdmVQcm92aWRlcj5wLnByb3ZpZGVyNykuY2FsbE9uRGVzdHJveSkge1xuICAgICAgaS5vYmo3Lm5nT25EZXN0cm95KCk7XG4gICAgfVxuICAgIGlmIChwLnByb3ZpZGVyOCBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmXG4gICAgICAgICg8RGlyZWN0aXZlUHJvdmlkZXI+cC5wcm92aWRlcjgpLmNhbGxPbkRlc3Ryb3kpIHtcbiAgICAgIGkub2JqOC5uZ09uRGVzdHJveSgpO1xuICAgIH1cbiAgICBpZiAocC5wcm92aWRlcjkgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJlxuICAgICAgICAoPERpcmVjdGl2ZVByb3ZpZGVyPnAucHJvdmlkZXI5KS5jYWxsT25EZXN0cm95KSB7XG4gICAgICBpLm9iajkubmdPbkRlc3Ryb3koKTtcbiAgICB9XG4gIH1cblxuICBnZXRDb21wb25lbnQoKTogYW55IHsgcmV0dXJuIHRoaXMuaW5qZWN0b3JTdHJhdGVneS5vYmowOyB9XG5cbiAgaXNDb21wb25lbnRLZXkoa2V5OiBLZXkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZWkuX3Byb3RvLl9maXJzdFByb3ZpZGVySXNDb21wb25lbnQgJiYgaXNQcmVzZW50KGtleSkgJiZcbiAgICAgICAgICAga2V5LmlkID09PSB0aGlzLmluamVjdG9yU3RyYXRlZ3kucHJvdG9TdHJhdGVneS5rZXlJZDA7XG4gIH1cblxuICBhZGREaXJlY3RpdmVzTWF0Y2hpbmdRdWVyeShxdWVyeTogUXVlcnlNZXRhZGF0YSwgbGlzdDogYW55W10pOiB2b2lkIHtcbiAgICB2YXIgaSA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneTtcbiAgICB2YXIgcCA9IGkucHJvdG9TdHJhdGVneTtcblxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjApICYmIHAucHJvdmlkZXIwLmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajAgPT09IFVOREVGSU5FRCkgaS5vYmowID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIwLCBwLnZpc2liaWxpdHkwKTtcbiAgICAgIGxpc3QucHVzaChpLm9iajApO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXIxKSAmJiBwLnByb3ZpZGVyMS5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmoxID09PSBVTkRFRklORUQpIGkub2JqMSA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyMSwgcC52aXNpYmlsaXR5MSk7XG4gICAgICBsaXN0LnB1c2goaS5vYmoxKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyMikgJiYgcC5wcm92aWRlcjIua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqMiA9PT0gVU5ERUZJTkVEKSBpLm9iajIgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjIsIHAudmlzaWJpbGl0eTIpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqMik7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjMpICYmIHAucHJvdmlkZXIzLmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajMgPT09IFVOREVGSU5FRCkgaS5vYmozID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIzLCBwLnZpc2liaWxpdHkzKTtcbiAgICAgIGxpc3QucHVzaChpLm9iajMpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXI0KSAmJiBwLnByb3ZpZGVyNC5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmo0ID09PSBVTkRFRklORUQpIGkub2JqNCA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyNCwgcC52aXNpYmlsaXR5NCk7XG4gICAgICBsaXN0LnB1c2goaS5vYmo0KTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyNSkgJiYgcC5wcm92aWRlcjUua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqNSA9PT0gVU5ERUZJTkVEKSBpLm9iajUgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjUsIHAudmlzaWJpbGl0eTUpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqNSk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjYpICYmIHAucHJvdmlkZXI2LmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajYgPT09IFVOREVGSU5FRCkgaS5vYmo2ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI2LCBwLnZpc2liaWxpdHk2KTtcbiAgICAgIGxpc3QucHVzaChpLm9iajYpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXI3KSAmJiBwLnByb3ZpZGVyNy5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmo3ID09PSBVTkRFRklORUQpIGkub2JqNyA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyNywgcC52aXNpYmlsaXR5Nyk7XG4gICAgICBsaXN0LnB1c2goaS5vYmo3KTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyOCkgJiYgcC5wcm92aWRlcjgua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqOCA9PT0gVU5ERUZJTkVEKSBpLm9iajggPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjgsIHAudmlzaWJpbGl0eTgpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqOCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjkpICYmIHAucHJvdmlkZXI5LmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajkgPT09IFVOREVGSU5FRCkgaS5vYmo5ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI5LCBwLnZpc2liaWxpdHk5KTtcbiAgICAgIGxpc3QucHVzaChpLm9iajkpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFN0cmF0ZWd5IHVzZWQgYnkgdGhlIGBFbGVtZW50SW5qZWN0b3JgIHdoZW4gdGhlIG51bWJlciBvZiBiaW5kaW5ncyBpcyAxMSBvciBtb3JlLlxuICogSW4gc3VjaCBhIGNhc2UsIHRoZXJlIGFyZSB0b28gbWFueSBmaWVsZHMgdG8gaW5saW5lIChzZWUgRWxlbWVudEluamVjdG9ySW5saW5lU3RyYXRlZ3kpLlxuICovXG5jbGFzcyBFbGVtZW50SW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kgaW1wbGVtZW50cyBfRWxlbWVudEluamVjdG9yU3RyYXRlZ3kge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW5qZWN0b3JTdHJhdGVneTogSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3ksIHB1YmxpYyBfZWk6IEVsZW1lbnRJbmplY3Rvcikge31cblxuICBoeWRyYXRlKCk6IHZvaWQge1xuICAgIHZhciBpbmogPSB0aGlzLmluamVjdG9yU3RyYXRlZ3k7XG4gICAgdmFyIHAgPSBpbmoucHJvdG9TdHJhdGVneTtcbiAgICBpbmoucmVzZXRDb25zdHJ1Y3Rpb25Db3VudGVyKCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHAua2V5SWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocC5wcm92aWRlcnNbaV0gaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZHNbaV0pICYmXG4gICAgICAgICAgaW5qLm9ianNbaV0gPT09IFVOREVGSU5FRCkge1xuICAgICAgICBpbmoub2Jqc1tpXSA9IGluai5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXJzW2ldLCBwLnZpc2liaWxpdGllc1tpXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZGVoeWRyYXRlKCk6IHZvaWQge1xuICAgIHZhciBpbmogPSB0aGlzLmluamVjdG9yU3RyYXRlZ3k7XG4gICAgTGlzdFdyYXBwZXIuZmlsbChpbmoub2JqcywgVU5ERUZJTkVEKTtcbiAgfVxuXG4gIGNhbGxPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdmFyIGlzdCA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneTtcbiAgICB2YXIgcCA9IGlzdC5wcm90b1N0cmF0ZWd5O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwLnByb3ZpZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHAucHJvdmlkZXJzW2ldIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiZcbiAgICAgICAgICAoPERpcmVjdGl2ZVByb3ZpZGVyPnAucHJvdmlkZXJzW2ldKS5jYWxsT25EZXN0cm95KSB7XG4gICAgICAgIGlzdC5vYmpzW2ldLm5nT25EZXN0cm95KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0Q29tcG9uZW50KCk6IGFueSB7IHJldHVybiB0aGlzLmluamVjdG9yU3RyYXRlZ3kub2Jqc1swXTsgfVxuXG4gIGlzQ29tcG9uZW50S2V5KGtleTogS2V5KTogYm9vbGVhbiB7XG4gICAgdmFyIHAgPSB0aGlzLmluamVjdG9yU3RyYXRlZ3kucHJvdG9TdHJhdGVneTtcbiAgICByZXR1cm4gdGhpcy5fZWkuX3Byb3RvLl9maXJzdFByb3ZpZGVySXNDb21wb25lbnQgJiYgaXNQcmVzZW50KGtleSkgJiYga2V5LmlkID09PSBwLmtleUlkc1swXTtcbiAgfVxuXG4gIGFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5KHF1ZXJ5OiBRdWVyeU1ldGFkYXRhLCBsaXN0OiBhbnlbXSk6IHZvaWQge1xuICAgIHZhciBpc3QgPSB0aGlzLmluamVjdG9yU3RyYXRlZ3k7XG4gICAgdmFyIHAgPSBpc3QucHJvdG9TdHJhdGVneTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcC5wcm92aWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChwLnByb3ZpZGVyc1tpXS5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICAgIGlmIChpc3Qub2Jqc1tpXSA9PT0gVU5ERUZJTkVEKSB7XG4gICAgICAgICAgaXN0Lm9ianNbaV0gPSBpc3QuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyc1tpXSwgcC52aXNpYmlsaXRpZXNbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGxpc3QucHVzaChpc3Qub2Jqc1tpXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQcm90b1F1ZXJ5UmVmIHtcbiAgY29uc3RydWN0b3IocHVibGljIGRpckluZGV4OiBudW1iZXIsIHB1YmxpYyBzZXR0ZXI6IFNldHRlckZuLCBwdWJsaWMgcXVlcnk6IFF1ZXJ5TWV0YWRhdGEpIHt9XG5cbiAgZ2V0IHVzZXNQcm9wZXJ0eVN5bnRheCgpOiBib29sZWFuIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLnNldHRlcik7IH1cbn1cblxuZXhwb3J0IGNsYXNzIFF1ZXJ5UmVmIHtcbiAgcHVibGljIGxpc3Q6IFF1ZXJ5TGlzdDxhbnk+O1xuICBwdWJsaWMgZGlydHk6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHVibGljIHByb3RvUXVlcnlSZWY6IFByb3RvUXVlcnlSZWYsIHByaXZhdGUgb3JpZ2luYXRvcjogRWxlbWVudEluamVjdG9yKSB7fVxuXG4gIGdldCBpc1ZpZXdRdWVyeSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMucHJvdG9RdWVyeVJlZi5xdWVyeS5pc1ZpZXdRdWVyeTsgfVxuXG4gIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuZGlydHkpIHJldHVybjtcbiAgICB0aGlzLl91cGRhdGUoKTtcbiAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG5cbiAgICAvLyBUT0RPIGRlbGV0ZSB0aGUgY2hlY2sgb25jZSBvbmx5IGZpZWxkIHF1ZXJpZXMgYXJlIHN1cHBvcnRlZFxuICAgIGlmICh0aGlzLnByb3RvUXVlcnlSZWYudXNlc1Byb3BlcnR5U3ludGF4KSB7XG4gICAgICB2YXIgZGlyID0gdGhpcy5vcmlnaW5hdG9yLmdldERpcmVjdGl2ZUF0SW5kZXgodGhpcy5wcm90b1F1ZXJ5UmVmLmRpckluZGV4KTtcbiAgICAgIGlmICh0aGlzLnByb3RvUXVlcnlSZWYucXVlcnkuZmlyc3QpIHtcbiAgICAgICAgdGhpcy5wcm90b1F1ZXJ5UmVmLnNldHRlcihkaXIsIHRoaXMubGlzdC5sZW5ndGggPiAwID8gdGhpcy5saXN0LmZpcnN0IDogbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnByb3RvUXVlcnlSZWYuc2V0dGVyKGRpciwgdGhpcy5saXN0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmxpc3Qubm90aWZ5T25DaGFuZ2VzKCk7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGUoKTogdm9pZCB7XG4gICAgdmFyIGFnZ3JlZ2F0b3IgPSBbXTtcbiAgICBpZiAodGhpcy5wcm90b1F1ZXJ5UmVmLnF1ZXJ5LmlzVmlld1F1ZXJ5KSB7XG4gICAgICB2YXIgdmlldyA9IHRoaXMub3JpZ2luYXRvci5nZXRWaWV3KCk7XG4gICAgICAvLyBpbnRlbnRpb25hbGx5IHNraXBwaW5nIG9yaWdpbmF0b3IgZm9yIHZpZXcgcXVlcmllcy5cbiAgICAgIHZhciBuZXN0ZWRWaWV3ID1cbiAgICAgICAgICB2aWV3LmdldE5lc3RlZFZpZXcodmlldy5lbGVtZW50T2Zmc2V0ICsgdGhpcy5vcmlnaW5hdG9yLmdldEJvdW5kRWxlbWVudEluZGV4KCkpO1xuICAgICAgaWYgKGlzUHJlc2VudChuZXN0ZWRWaWV3KSkgdGhpcy5fdmlzaXRWaWV3KG5lc3RlZFZpZXcsIGFnZ3JlZ2F0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl92aXNpdCh0aGlzLm9yaWdpbmF0b3IsIGFnZ3JlZ2F0b3IpO1xuICAgIH1cbiAgICB0aGlzLmxpc3QucmVzZXQoYWdncmVnYXRvcik7XG4gIH07XG5cbiAgcHJpdmF0ZSBfdmlzaXQoaW5qOiBFbGVtZW50SW5qZWN0b3IsIGFnZ3JlZ2F0b3I6IGFueVtdKTogdm9pZCB7XG4gICAgdmFyIHZpZXcgPSBpbmouZ2V0VmlldygpO1xuICAgIHZhciBzdGFydElkeCA9IHZpZXcuZWxlbWVudE9mZnNldCArIGluai5fcHJvdG8uaW5kZXg7XG4gICAgZm9yICh2YXIgaSA9IHN0YXJ0SWR4OyBpIDwgdmlldy5lbGVtZW50T2Zmc2V0ICsgdmlldy5vd25CaW5kZXJzQ291bnQ7IGkrKykge1xuICAgICAgdmFyIGN1ckluaiA9IHZpZXcuZWxlbWVudEluamVjdG9yc1tpXTtcbiAgICAgIGlmIChpc0JsYW5rKGN1ckluaikpIGNvbnRpbnVlO1xuICAgICAgLy8gVGhlIGZpcnN0IGluamVjdG9yIGFmdGVyIGluaiwgdGhhdCBpcyBvdXRzaWRlIHRoZSBzdWJ0cmVlIHJvb3RlZCBhdFxuICAgICAgLy8gaW5qIGhhcyB0byBoYXZlIGEgbnVsbCBwYXJlbnQgb3IgYSBwYXJlbnQgdGhhdCBpcyBhbiBhbmNlc3RvciBvZiBpbmouXG4gICAgICBpZiAoaSA+IHN0YXJ0SWR4ICYmIChpc0JsYW5rKGN1ckluaikgfHwgaXNCbGFuayhjdXJJbmoucGFyZW50KSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5lbGVtZW50T2Zmc2V0ICsgY3VySW5qLnBhcmVudC5fcHJvdG8uaW5kZXggPCBzdGFydElkeCkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5wcm90b1F1ZXJ5UmVmLnF1ZXJ5LmRlc2NlbmRhbnRzICYmXG4gICAgICAgICAgIShjdXJJbmoucGFyZW50ID09IHRoaXMub3JpZ2luYXRvciB8fCBjdXJJbmogPT0gdGhpcy5vcmlnaW5hdG9yKSlcbiAgICAgICAgY29udGludWU7XG5cbiAgICAgIC8vIFdlIHZpc2l0IHRoZSB2aWV3IGNvbnRhaW5lcihWQykgdmlld3MgcmlnaHQgYWZ0ZXIgdGhlIGluamVjdG9yIHRoYXQgY29udGFpbnNcbiAgICAgIC8vIHRoZSBWQy4gVGhlb3JldGljYWxseSwgdGhhdCBtaWdodCBub3QgYmUgdGhlIHJpZ2h0IG9yZGVyIGlmIHRoZXJlIGFyZVxuICAgICAgLy8gY2hpbGQgaW5qZWN0b3JzIG9mIHNhaWQgaW5qZWN0b3IuIE5vdCBjbGVhciB3aGV0aGVyIGlmIHN1Y2ggY2FzZSBjYW5cbiAgICAgIC8vIGV2ZW4gYmUgY29uc3RydWN0ZWQgd2l0aCB0aGUgY3VycmVudCBhcGlzLlxuICAgICAgdGhpcy5fdmlzaXRJbmplY3RvcihjdXJJbmosIGFnZ3JlZ2F0b3IpO1xuICAgICAgdmFyIHZjID0gdmlldy52aWV3Q29udGFpbmVyc1tpXTtcbiAgICAgIGlmIChpc1ByZXNlbnQodmMpKSB0aGlzLl92aXNpdFZpZXdDb250YWluZXIodmMsIGFnZ3JlZ2F0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0SW5qZWN0b3IoaW5qOiBFbGVtZW50SW5qZWN0b3IsIGFnZ3JlZ2F0b3I6IGFueVtdKSB7XG4gICAgaWYgKHRoaXMucHJvdG9RdWVyeVJlZi5xdWVyeS5pc1ZhckJpbmRpbmdRdWVyeSkge1xuICAgICAgdGhpcy5fYWdncmVnYXRlVmFyaWFibGVCaW5kaW5nKGluaiwgYWdncmVnYXRvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2FnZ3JlZ2F0ZURpcmVjdGl2ZShpbmosIGFnZ3JlZ2F0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0Vmlld0NvbnRhaW5lcih2YzogQXBwVmlld0NvbnRhaW5lciwgYWdncmVnYXRvcjogYW55W10pIHtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHZjLnZpZXdzLmxlbmd0aDsgaisrKSB7XG4gICAgICB0aGlzLl92aXNpdFZpZXcodmMudmlld3Nbal0sIGFnZ3JlZ2F0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0Vmlldyh2aWV3OiBBcHBWaWV3LCBhZ2dyZWdhdG9yOiBhbnlbXSkge1xuICAgIGZvciAodmFyIGkgPSB2aWV3LmVsZW1lbnRPZmZzZXQ7IGkgPCB2aWV3LmVsZW1lbnRPZmZzZXQgKyB2aWV3Lm93bkJpbmRlcnNDb3VudDsgaSsrKSB7XG4gICAgICB2YXIgaW5qID0gdmlldy5lbGVtZW50SW5qZWN0b3JzW2ldO1xuICAgICAgaWYgKGlzQmxhbmsoaW5qKSkgY29udGludWU7XG5cbiAgICAgIHRoaXMuX3Zpc2l0SW5qZWN0b3IoaW5qLCBhZ2dyZWdhdG9yKTtcblxuICAgICAgdmFyIHZjID0gdmlldy52aWV3Q29udGFpbmVyc1tpXTtcbiAgICAgIGlmIChpc1ByZXNlbnQodmMpKSB0aGlzLl92aXNpdFZpZXdDb250YWluZXIodmMsIGFnZ3JlZ2F0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FnZ3JlZ2F0ZVZhcmlhYmxlQmluZGluZyhpbmo6IEVsZW1lbnRJbmplY3RvciwgYWdncmVnYXRvcjogYW55W10pOiB2b2lkIHtcbiAgICB2YXIgdmIgPSB0aGlzLnByb3RvUXVlcnlSZWYucXVlcnkudmFyQmluZGluZ3M7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2Yi5sZW5ndGg7ICsraSkge1xuICAgICAgaWYgKGluai5oYXNWYXJpYWJsZUJpbmRpbmcodmJbaV0pKSB7XG4gICAgICAgIGFnZ3JlZ2F0b3IucHVzaChpbmouZ2V0VmFyaWFibGVCaW5kaW5nKHZiW2ldKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYWdncmVnYXRlRGlyZWN0aXZlKGluajogRWxlbWVudEluamVjdG9yLCBhZ2dyZWdhdG9yOiBhbnlbXSk6IHZvaWQge1xuICAgIGluai5hZGREaXJlY3RpdmVzTWF0Y2hpbmdRdWVyeSh0aGlzLnByb3RvUXVlcnlSZWYucXVlcnksIGFnZ3JlZ2F0b3IpO1xuICB9XG5cbiAgZGVoeWRyYXRlKCk6IHZvaWQgeyB0aGlzLmxpc3QgPSBudWxsOyB9XG5cbiAgaHlkcmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLmxpc3QgPSBuZXcgUXVlcnlMaXN0PGFueT4oKTtcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgfVxufVxuIl19