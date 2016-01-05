'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var di_1 = require('angular2/src/core/di');
var injector_1 = require('angular2/src/core/di/injector');
var provider_1 = require('angular2/src/core/di/provider');
var di_2 = require('../metadata/di');
/* circular */ var avmModule = require('./view_manager');
var view_container_ref_1 = require('./view_container_ref');
var element_ref_1 = require('./element_ref');
var template_ref_1 = require('./template_ref');
var directives_1 = require('../metadata/directives');
var directive_lifecycle_reflector_1 = require('./directive_lifecycle_reflector');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var query_list_1 = require('./query_list');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var event_config_1 = require('angular2/src/core/linker/event_config');
var pipe_provider_1 = require('angular2/src/core/pipes/pipe_provider');
var interfaces_1 = require('./interfaces');
var view_container_ref_2 = require("./view_container_ref");
var _staticKeys;
var StaticKeys = (function () {
    function StaticKeys() {
        this.viewManagerId = di_1.Key.get(avmModule.AppViewManager).id;
        this.templateRefId = di_1.Key.get(template_ref_1.TemplateRef).id;
        this.viewContainerId = di_1.Key.get(view_container_ref_1.ViewContainerRef).id;
        this.changeDetectorRefId = di_1.Key.get(change_detection_1.ChangeDetectorRef).id;
        this.elementRefId = di_1.Key.get(element_ref_1.ElementRef).id;
    }
    StaticKeys.instance = function () {
        if (lang_1.isBlank(_staticKeys))
            _staticKeys = new StaticKeys();
        return _staticKeys;
    };
    return StaticKeys;
})();
exports.StaticKeys = StaticKeys;
var TreeNode = (function () {
    function TreeNode(parent) {
        if (lang_1.isPresent(parent)) {
            parent.addChild(this);
        }
        else {
            this._parent = null;
        }
    }
    TreeNode.prototype.addChild = function (child) { child._parent = this; };
    TreeNode.prototype.remove = function () { this._parent = null; };
    Object.defineProperty(TreeNode.prototype, "parent", {
        get: function () { return this._parent; },
        enumerable: true,
        configurable: true
    });
    return TreeNode;
})();
exports.TreeNode = TreeNode;
var DirectiveDependency = (function (_super) {
    __extends(DirectiveDependency, _super);
    function DirectiveDependency(key, optional, lowerBoundVisibility, upperBoundVisibility, properties, attributeName, queryDecorator) {
        _super.call(this, key, optional, lowerBoundVisibility, upperBoundVisibility, properties);
        this.attributeName = attributeName;
        this.queryDecorator = queryDecorator;
        this._verify();
    }
    /** @internal */
    DirectiveDependency.prototype._verify = function () {
        var count = 0;
        if (lang_1.isPresent(this.queryDecorator))
            count++;
        if (lang_1.isPresent(this.attributeName))
            count++;
        if (count > 1)
            throw new exceptions_1.BaseException('A directive injectable can contain only one of the following @Attribute or @Query.');
    };
    DirectiveDependency.createFrom = function (d) {
        return new DirectiveDependency(d.key, d.optional, d.lowerBoundVisibility, d.upperBoundVisibility, d.properties, DirectiveDependency._attributeName(d.properties), DirectiveDependency._query(d.properties));
    };
    /** @internal */
    DirectiveDependency._attributeName = function (properties) {
        var p = properties.find(function (p) { return p instanceof di_2.AttributeMetadata; });
        return lang_1.isPresent(p) ? p.attributeName : null;
    };
    /** @internal */
    DirectiveDependency._query = function (properties) {
        return properties.find(function (p) { return p instanceof di_2.QueryMetadata; });
    };
    return DirectiveDependency;
})(di_1.Dependency);
exports.DirectiveDependency = DirectiveDependency;
var DirectiveProvider = (function (_super) {
    __extends(DirectiveProvider, _super);
    function DirectiveProvider(key, factory, deps, metadata, providers, viewProviders) {
        _super.call(this, key, [new provider_1.ResolvedFactory(factory, deps)], false);
        this.metadata = metadata;
        this.providers = providers;
        this.viewProviders = viewProviders;
        this.callOnDestroy = directive_lifecycle_reflector_1.hasLifecycleHook(interfaces_1.LifecycleHooks.OnDestroy, key.token);
    }
    Object.defineProperty(DirectiveProvider.prototype, "displayName", {
        get: function () { return this.key.displayName; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DirectiveProvider.prototype, "queries", {
        get: function () {
            if (lang_1.isBlank(this.metadata.queries))
                return [];
            var res = [];
            collection_1.StringMapWrapper.forEach(this.metadata.queries, function (meta, fieldName) {
                var setter = reflection_1.reflector.setter(fieldName);
                res.push(new QueryMetadataWithSetter(setter, meta));
            });
            return res;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DirectiveProvider.prototype, "eventEmitters", {
        get: function () {
            return lang_1.isPresent(this.metadata) && lang_1.isPresent(this.metadata.outputs) ? this.metadata.outputs :
                [];
        },
        enumerable: true,
        configurable: true
    });
    DirectiveProvider.createFromProvider = function (provider, meta) {
        if (lang_1.isBlank(meta)) {
            meta = new directives_1.DirectiveMetadata();
        }
        var rb = provider_1.resolveProvider(provider);
        var rf = rb.resolvedFactories[0];
        var deps = rf.dependencies.map(DirectiveDependency.createFrom);
        var providers = lang_1.isPresent(meta.providers) ? meta.providers : [];
        var viewBindigs = meta instanceof directives_1.ComponentMetadata && lang_1.isPresent(meta.viewProviders) ?
            meta.viewProviders :
            [];
        return new DirectiveProvider(rb.key, rf.factory, deps, meta, providers, viewBindigs);
    };
    DirectiveProvider.createFromType = function (type, annotation) {
        var provider = new di_1.Provider(type, { useClass: type });
        return DirectiveProvider.createFromProvider(provider, annotation);
    };
    return DirectiveProvider;
})(provider_1.ResolvedProvider_);
exports.DirectiveProvider = DirectiveProvider;
// TODO(rado): benchmark and consider rolling in as ElementInjector fields.
var PreBuiltObjects = (function () {
    function PreBuiltObjects(viewManager, view, elementRef, templateRef) {
        this.viewManager = viewManager;
        this.view = view;
        this.elementRef = elementRef;
        this.templateRef = templateRef;
        this.nestedView = null;
    }
    return PreBuiltObjects;
})();
exports.PreBuiltObjects = PreBuiltObjects;
var QueryMetadataWithSetter = (function () {
    function QueryMetadataWithSetter(setter, metadata) {
        this.setter = setter;
        this.metadata = metadata;
    }
    return QueryMetadataWithSetter;
})();
exports.QueryMetadataWithSetter = QueryMetadataWithSetter;
var EventEmitterAccessor = (function () {
    function EventEmitterAccessor(eventName, getter) {
        this.eventName = eventName;
        this.getter = getter;
    }
    EventEmitterAccessor.prototype.subscribe = function (view, boundElementIndex, directive) {
        var _this = this;
        var eventEmitter = this.getter(directive);
        return async_1.ObservableWrapper.subscribe(eventEmitter, function (eventObj) { return view.triggerEventHandlers(_this.eventName, eventObj, boundElementIndex); });
    };
    return EventEmitterAccessor;
})();
exports.EventEmitterAccessor = EventEmitterAccessor;
function _createEventEmitterAccessors(bwv) {
    var provider = bwv.provider;
    if (!(provider instanceof DirectiveProvider))
        return [];
    var db = provider;
    return db.eventEmitters.map(function (eventConfig) {
        var parsedEvent = event_config_1.EventConfig.parse(eventConfig);
        return new EventEmitterAccessor(parsedEvent.eventName, reflection_1.reflector.getter(parsedEvent.fieldName));
    });
}
function _createProtoQueryRefs(providers) {
    var res = [];
    collection_1.ListWrapper.forEachWithIndex(providers, function (b, i) {
        if (b.provider instanceof DirectiveProvider) {
            var directiveProvider = b.provider;
            // field queries
            var queries = directiveProvider.queries;
            queries.forEach(function (q) { return res.push(new ProtoQueryRef(i, q.setter, q.metadata)); });
            // queries passed into the constructor.
            // TODO: remove this after constructor queries are no longer supported
            var deps = directiveProvider.resolvedFactory.dependencies;
            deps.forEach(function (d) {
                if (lang_1.isPresent(d.queryDecorator))
                    res.push(new ProtoQueryRef(i, null, d.queryDecorator));
            });
        }
    });
    return res;
}
var ProtoElementInjector = (function () {
    function ProtoElementInjector(parent, index, bwv, distanceToParent, _firstProviderIsComponent, directiveVariableBindings) {
        this.parent = parent;
        this.index = index;
        this.distanceToParent = distanceToParent;
        this.directiveVariableBindings = directiveVariableBindings;
        this._firstProviderIsComponent = _firstProviderIsComponent;
        var length = bwv.length;
        this.protoInjector = new injector_1.ProtoInjector(bwv);
        this.eventEmitterAccessors = collection_1.ListWrapper.createFixedSize(length);
        for (var i = 0; i < length; ++i) {
            this.eventEmitterAccessors[i] = _createEventEmitterAccessors(bwv[i]);
        }
        this.protoQueryRefs = _createProtoQueryRefs(bwv);
    }
    ProtoElementInjector.create = function (parent, index, providers, firstProviderIsComponent, distanceToParent, directiveVariableBindings) {
        var bd = [];
        ProtoElementInjector._createDirectiveProviderWithVisibility(providers, bd, firstProviderIsComponent);
        if (firstProviderIsComponent) {
            ProtoElementInjector._createViewProvidersWithVisibility(providers, bd);
        }
        ProtoElementInjector._createProvidersWithVisibility(providers, bd);
        return new ProtoElementInjector(parent, index, bd, distanceToParent, firstProviderIsComponent, directiveVariableBindings);
    };
    ProtoElementInjector._createDirectiveProviderWithVisibility = function (dirProviders, bd, firstProviderIsComponent) {
        dirProviders.forEach(function (dirProvider) {
            bd.push(ProtoElementInjector._createProviderWithVisibility(firstProviderIsComponent, dirProvider, dirProviders, dirProvider));
        });
    };
    ProtoElementInjector._createProvidersWithVisibility = function (dirProviders, bd) {
        var providersFromAllDirectives = [];
        dirProviders.forEach(function (dirProvider) {
            providersFromAllDirectives =
                collection_1.ListWrapper.concat(providersFromAllDirectives, dirProvider.providers);
        });
        var resolved = di_1.Injector.resolve(providersFromAllDirectives);
        resolved.forEach(function (b) { return bd.push(new injector_1.ProviderWithVisibility(b, injector_1.Visibility.Public)); });
    };
    ProtoElementInjector._createProviderWithVisibility = function (firstProviderIsComponent, dirProvider, dirProviders, provider) {
        var isComponent = firstProviderIsComponent && dirProviders[0] === dirProvider;
        return new injector_1.ProviderWithVisibility(provider, isComponent ? injector_1.Visibility.PublicAndPrivate : injector_1.Visibility.Public);
    };
    ProtoElementInjector._createViewProvidersWithVisibility = function (dirProviders, bd) {
        var resolvedViewProviders = di_1.Injector.resolve(dirProviders[0].viewProviders);
        resolvedViewProviders.forEach(function (b) { return bd.push(new injector_1.ProviderWithVisibility(b, injector_1.Visibility.Private)); });
    };
    ProtoElementInjector.prototype.instantiate = function (parent) {
        return new ElementInjector(this, parent);
    };
    ProtoElementInjector.prototype.directParent = function () { return this.distanceToParent < 2 ? this.parent : null; };
    Object.defineProperty(ProtoElementInjector.prototype, "hasBindings", {
        get: function () { return this.eventEmitterAccessors.length > 0; },
        enumerable: true,
        configurable: true
    });
    ProtoElementInjector.prototype.getProviderAtIndex = function (index) { return this.protoInjector.getProviderAtIndex(index); };
    return ProtoElementInjector;
})();
exports.ProtoElementInjector = ProtoElementInjector;
var _Context = (function () {
    function _Context(element, componentElement, injector) {
        this.element = element;
        this.componentElement = componentElement;
        this.injector = injector;
    }
    return _Context;
})();
var ElementInjector = (function (_super) {
    __extends(ElementInjector, _super);
    function ElementInjector(_proto, parent) {
        var _this = this;
        _super.call(this, parent);
        this._preBuiltObjects = null;
        this._proto = _proto;
        this._injector =
            new di_1.Injector(this._proto.protoInjector, null, this, function () { return _this._debugContext(); });
        // we couple ourselves to the injector strategy to avoid polymoprhic calls
        var injectorStrategy = this._injector.internalStrategy;
        this._strategy = injectorStrategy instanceof injector_1.InjectorInlineStrategy ?
            new ElementInjectorInlineStrategy(injectorStrategy, this) :
            new ElementInjectorDynamicStrategy(injectorStrategy, this);
        this.hydrated = false;
        this._queryStrategy = this._buildQueryStrategy();
    }
    ElementInjector.prototype.dehydrate = function () {
        this.hydrated = false;
        this._host = null;
        this._preBuiltObjects = null;
        this._strategy.callOnDestroy();
        this._strategy.dehydrate();
        this._queryStrategy.dehydrate();
    };
    ElementInjector.prototype.hydrate = function (imperativelyCreatedInjector, host, preBuiltObjects) {
        this._host = host;
        this._preBuiltObjects = preBuiltObjects;
        this._reattachInjectors(imperativelyCreatedInjector);
        this._queryStrategy.hydrate();
        this._strategy.hydrate();
        this.hydrated = true;
    };
    ElementInjector.prototype._debugContext = function () {
        var p = this._preBuiltObjects;
        var index = p.elementRef.boundElementIndex - p.view.elementOffset;
        var c = this._preBuiltObjects.view.getDebugContext(index, null);
        return lang_1.isPresent(c) ? new _Context(c.element, c.componentElement, c.injector) : null;
    };
    ElementInjector.prototype._reattachInjectors = function (imperativelyCreatedInjector) {
        // Dynamically-loaded component in the template. Not a root ElementInjector.
        if (lang_1.isPresent(this._parent)) {
            if (lang_1.isPresent(imperativelyCreatedInjector)) {
                // The imperative injector is similar to having an element between
                // the dynamic-loaded component and its parent => no boundaries.
                this._reattachInjector(this._injector, imperativelyCreatedInjector, false);
                this._reattachInjector(imperativelyCreatedInjector, this._parent._injector, false);
            }
            else {
                this._reattachInjector(this._injector, this._parent._injector, false);
            }
        }
        else if (lang_1.isPresent(this._host)) {
            // The imperative injector is similar to having an element between
            // the dynamic-loaded component and its parent => no boundary between
            // the component and imperativelyCreatedInjector.
            // But since it is a root ElementInjector, we need to create a boundary
            // between imperativelyCreatedInjector and _host.
            if (lang_1.isPresent(imperativelyCreatedInjector)) {
                this._reattachInjector(this._injector, imperativelyCreatedInjector, false);
                this._reattachInjector(imperativelyCreatedInjector, this._host._injector, true);
            }
            else {
                this._reattachInjector(this._injector, this._host._injector, true);
            }
        }
        else {
            if (lang_1.isPresent(imperativelyCreatedInjector)) {
                this._reattachInjector(this._injector, imperativelyCreatedInjector, true);
            }
        }
    };
    ElementInjector.prototype._reattachInjector = function (injector, parentInjector, isBoundary) {
        injector.internalStrategy.attach(parentInjector, isBoundary);
    };
    ElementInjector.prototype.hasVariableBinding = function (name) {
        var vb = this._proto.directiveVariableBindings;
        return lang_1.isPresent(vb) && vb.has(name);
    };
    ElementInjector.prototype.getVariableBinding = function (name) {
        var index = this._proto.directiveVariableBindings.get(name);
        return lang_1.isPresent(index) ? this.getDirectiveAtIndex(index) : this.getElementRef();
    };
    ElementInjector.prototype.get = function (token) { return this._injector.get(token); };
    ElementInjector.prototype.hasDirective = function (type) { return lang_1.isPresent(this._injector.getOptional(type)); };
    ElementInjector.prototype.getEventEmitterAccessors = function () { return this._proto.eventEmitterAccessors; };
    ElementInjector.prototype.getDirectiveVariableBindings = function () {
        return this._proto.directiveVariableBindings;
    };
    ElementInjector.prototype.getComponent = function () { return this._strategy.getComponent(); };
    ElementInjector.prototype.getInjector = function () { return this._injector; };
    ElementInjector.prototype.getElementRef = function () { return this._preBuiltObjects.elementRef; };
    ElementInjector.prototype.getViewContainerRef = function () {
        return new view_container_ref_2.ViewContainerRef_(this._preBuiltObjects.viewManager, this.getElementRef());
    };
    ElementInjector.prototype.getNestedView = function () { return this._preBuiltObjects.nestedView; };
    ElementInjector.prototype.getView = function () { return this._preBuiltObjects.view; };
    ElementInjector.prototype.directParent = function () { return this._proto.distanceToParent < 2 ? this.parent : null; };
    ElementInjector.prototype.isComponentKey = function (key) { return this._strategy.isComponentKey(key); };
    ElementInjector.prototype.getDependency = function (injector, provider, dep) {
        var key = dep.key;
        if (provider instanceof DirectiveProvider) {
            var dirDep = dep;
            var dirProvider = provider;
            var staticKeys = StaticKeys.instance();
            if (key.id === staticKeys.viewManagerId)
                return this._preBuiltObjects.viewManager;
            if (lang_1.isPresent(dirDep.attributeName))
                return this._buildAttribute(dirDep);
            if (lang_1.isPresent(dirDep.queryDecorator))
                return this._queryStrategy.findQuery(dirDep.queryDecorator).list;
            if (dirDep.key.id === StaticKeys.instance().changeDetectorRefId) {
                // We provide the component's view change detector to components and
                // the surrounding component's change detector to directives.
                if (dirProvider.metadata instanceof directives_1.ComponentMetadata) {
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
                if (lang_1.isBlank(this._preBuiltObjects.templateRef)) {
                    if (dirDep.optional) {
                        return null;
                    }
                    throw new di_1.NoProviderError(null, dirDep.key);
                }
                return this._preBuiltObjects.templateRef;
            }
        }
        else if (provider instanceof pipe_provider_1.PipeProvider) {
            if (dep.key.id === StaticKeys.instance().changeDetectorRefId) {
                var componentView = this._preBuiltObjects.view.getNestedView(this._preBuiltObjects.elementRef.boundElementIndex);
                return componentView.changeDetector.ref;
            }
        }
        return injector_1.UNDEFINED;
    };
    ElementInjector.prototype._buildAttribute = function (dep) {
        var attributes = this._proto.attributes;
        if (lang_1.isPresent(attributes) && attributes.has(dep.attributeName)) {
            return attributes.get(dep.attributeName);
        }
        else {
            return null;
        }
    };
    ElementInjector.prototype.addDirectivesMatchingQuery = function (query, list) {
        var templateRef = lang_1.isBlank(this._preBuiltObjects) ? null : this._preBuiltObjects.templateRef;
        if (query.selector === template_ref_1.TemplateRef && lang_1.isPresent(templateRef)) {
            list.push(templateRef);
        }
        this._strategy.addDirectivesMatchingQuery(query, list);
    };
    ElementInjector.prototype._buildQueryStrategy = function () {
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
    };
    ElementInjector.prototype.link = function (parent) { parent.addChild(this); };
    ElementInjector.prototype.unlink = function () { this.remove(); };
    ElementInjector.prototype.getDirectiveAtIndex = function (index) { return this._injector.getAt(index); };
    ElementInjector.prototype.hasInstances = function () { return this._proto.hasBindings && this.hydrated; };
    ElementInjector.prototype.getHost = function () { return this._host; };
    ElementInjector.prototype.getBoundElementIndex = function () { return this._proto.index; };
    ElementInjector.prototype.getRootViewInjectors = function () {
        if (!this.hydrated)
            return [];
        var view = this._preBuiltObjects.view;
        var nestedView = view.getNestedView(view.elementOffset + this.getBoundElementIndex());
        return lang_1.isPresent(nestedView) ? nestedView.rootElementInjectors : [];
    };
    ElementInjector.prototype.ngAfterViewChecked = function () { this._queryStrategy.updateViewQueries(); };
    ElementInjector.prototype.ngAfterContentChecked = function () { this._queryStrategy.updateContentQueries(); };
    ElementInjector.prototype.traverseAndSetQueriesAsDirty = function () {
        var inj = this;
        while (lang_1.isPresent(inj)) {
            inj._setQueriesAsDirty();
            inj = inj.parent;
        }
    };
    ElementInjector.prototype._setQueriesAsDirty = function () {
        this._queryStrategy.setContentQueriesAsDirty();
        if (lang_1.isPresent(this._host))
            this._host._queryStrategy.setViewQueriesAsDirty();
    };
    return ElementInjector;
})(TreeNode);
exports.ElementInjector = ElementInjector;
var _EmptyQueryStrategy = (function () {
    function _EmptyQueryStrategy() {
    }
    _EmptyQueryStrategy.prototype.setContentQueriesAsDirty = function () { };
    _EmptyQueryStrategy.prototype.setViewQueriesAsDirty = function () { };
    _EmptyQueryStrategy.prototype.hydrate = function () { };
    _EmptyQueryStrategy.prototype.dehydrate = function () { };
    _EmptyQueryStrategy.prototype.updateContentQueries = function () { };
    _EmptyQueryStrategy.prototype.updateViewQueries = function () { };
    _EmptyQueryStrategy.prototype.findQuery = function (query) {
        throw new exceptions_1.BaseException("Cannot find query for directive " + query + ".");
    };
    return _EmptyQueryStrategy;
})();
var _emptyQueryStrategy = new _EmptyQueryStrategy();
var InlineQueryStrategy = (function () {
    function InlineQueryStrategy(ei) {
        var protoRefs = ei._proto.protoQueryRefs;
        if (protoRefs.length > 0)
            this.query0 = new QueryRef(protoRefs[0], ei);
        if (protoRefs.length > 1)
            this.query1 = new QueryRef(protoRefs[1], ei);
        if (protoRefs.length > 2)
            this.query2 = new QueryRef(protoRefs[2], ei);
    }
    InlineQueryStrategy.prototype.setContentQueriesAsDirty = function () {
        if (lang_1.isPresent(this.query0) && !this.query0.isViewQuery)
            this.query0.dirty = true;
        if (lang_1.isPresent(this.query1) && !this.query1.isViewQuery)
            this.query1.dirty = true;
        if (lang_1.isPresent(this.query2) && !this.query2.isViewQuery)
            this.query2.dirty = true;
    };
    InlineQueryStrategy.prototype.setViewQueriesAsDirty = function () {
        if (lang_1.isPresent(this.query0) && this.query0.isViewQuery)
            this.query0.dirty = true;
        if (lang_1.isPresent(this.query1) && this.query1.isViewQuery)
            this.query1.dirty = true;
        if (lang_1.isPresent(this.query2) && this.query2.isViewQuery)
            this.query2.dirty = true;
    };
    InlineQueryStrategy.prototype.hydrate = function () {
        if (lang_1.isPresent(this.query0))
            this.query0.hydrate();
        if (lang_1.isPresent(this.query1))
            this.query1.hydrate();
        if (lang_1.isPresent(this.query2))
            this.query2.hydrate();
    };
    InlineQueryStrategy.prototype.dehydrate = function () {
        if (lang_1.isPresent(this.query0))
            this.query0.dehydrate();
        if (lang_1.isPresent(this.query1))
            this.query1.dehydrate();
        if (lang_1.isPresent(this.query2))
            this.query2.dehydrate();
    };
    InlineQueryStrategy.prototype.updateContentQueries = function () {
        if (lang_1.isPresent(this.query0) && !this.query0.isViewQuery) {
            this.query0.update();
        }
        if (lang_1.isPresent(this.query1) && !this.query1.isViewQuery) {
            this.query1.update();
        }
        if (lang_1.isPresent(this.query2) && !this.query2.isViewQuery) {
            this.query2.update();
        }
    };
    InlineQueryStrategy.prototype.updateViewQueries = function () {
        if (lang_1.isPresent(this.query0) && this.query0.isViewQuery) {
            this.query0.update();
        }
        if (lang_1.isPresent(this.query1) && this.query1.isViewQuery) {
            this.query1.update();
        }
        if (lang_1.isPresent(this.query2) && this.query2.isViewQuery) {
            this.query2.update();
        }
    };
    InlineQueryStrategy.prototype.findQuery = function (query) {
        if (lang_1.isPresent(this.query0) && this.query0.protoQueryRef.query === query) {
            return this.query0;
        }
        if (lang_1.isPresent(this.query1) && this.query1.protoQueryRef.query === query) {
            return this.query1;
        }
        if (lang_1.isPresent(this.query2) && this.query2.protoQueryRef.query === query) {
            return this.query2;
        }
        throw new exceptions_1.BaseException("Cannot find query for directive " + query + ".");
    };
    InlineQueryStrategy.NUMBER_OF_SUPPORTED_QUERIES = 3;
    return InlineQueryStrategy;
})();
var DynamicQueryStrategy = (function () {
    function DynamicQueryStrategy(ei) {
        this.queries = ei._proto.protoQueryRefs.map(function (p) { return new QueryRef(p, ei); });
    }
    DynamicQueryStrategy.prototype.setContentQueriesAsDirty = function () {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            if (!q.isViewQuery)
                q.dirty = true;
        }
    };
    DynamicQueryStrategy.prototype.setViewQueriesAsDirty = function () {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            if (q.isViewQuery)
                q.dirty = true;
        }
    };
    DynamicQueryStrategy.prototype.hydrate = function () {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            q.hydrate();
        }
    };
    DynamicQueryStrategy.prototype.dehydrate = function () {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            q.dehydrate();
        }
    };
    DynamicQueryStrategy.prototype.updateContentQueries = function () {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            if (!q.isViewQuery) {
                q.update();
            }
        }
    };
    DynamicQueryStrategy.prototype.updateViewQueries = function () {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            if (q.isViewQuery) {
                q.update();
            }
        }
    };
    DynamicQueryStrategy.prototype.findQuery = function (query) {
        for (var i = 0; i < this.queries.length; ++i) {
            var q = this.queries[i];
            if (q.protoQueryRef.query === query) {
                return q;
            }
        }
        throw new exceptions_1.BaseException("Cannot find query for directive " + query + ".");
    };
    return DynamicQueryStrategy;
})();
/**
 * Strategy used by the `ElementInjector` when the number of providers is 10 or less.
 * In such a case, inlining fields is beneficial for performances.
 */
var ElementInjectorInlineStrategy = (function () {
    function ElementInjectorInlineStrategy(injectorStrategy, _ei) {
        this.injectorStrategy = injectorStrategy;
        this._ei = _ei;
    }
    ElementInjectorInlineStrategy.prototype.hydrate = function () {
        var i = this.injectorStrategy;
        var p = i.protoStrategy;
        i.resetConstructionCounter();
        if (p.provider0 instanceof DirectiveProvider && lang_1.isPresent(p.keyId0) && i.obj0 === injector_1.UNDEFINED)
            i.obj0 = i.instantiateProvider(p.provider0, p.visibility0);
        if (p.provider1 instanceof DirectiveProvider && lang_1.isPresent(p.keyId1) && i.obj1 === injector_1.UNDEFINED)
            i.obj1 = i.instantiateProvider(p.provider1, p.visibility1);
        if (p.provider2 instanceof DirectiveProvider && lang_1.isPresent(p.keyId2) && i.obj2 === injector_1.UNDEFINED)
            i.obj2 = i.instantiateProvider(p.provider2, p.visibility2);
        if (p.provider3 instanceof DirectiveProvider && lang_1.isPresent(p.keyId3) && i.obj3 === injector_1.UNDEFINED)
            i.obj3 = i.instantiateProvider(p.provider3, p.visibility3);
        if (p.provider4 instanceof DirectiveProvider && lang_1.isPresent(p.keyId4) && i.obj4 === injector_1.UNDEFINED)
            i.obj4 = i.instantiateProvider(p.provider4, p.visibility4);
        if (p.provider5 instanceof DirectiveProvider && lang_1.isPresent(p.keyId5) && i.obj5 === injector_1.UNDEFINED)
            i.obj5 = i.instantiateProvider(p.provider5, p.visibility5);
        if (p.provider6 instanceof DirectiveProvider && lang_1.isPresent(p.keyId6) && i.obj6 === injector_1.UNDEFINED)
            i.obj6 = i.instantiateProvider(p.provider6, p.visibility6);
        if (p.provider7 instanceof DirectiveProvider && lang_1.isPresent(p.keyId7) && i.obj7 === injector_1.UNDEFINED)
            i.obj7 = i.instantiateProvider(p.provider7, p.visibility7);
        if (p.provider8 instanceof DirectiveProvider && lang_1.isPresent(p.keyId8) && i.obj8 === injector_1.UNDEFINED)
            i.obj8 = i.instantiateProvider(p.provider8, p.visibility8);
        if (p.provider9 instanceof DirectiveProvider && lang_1.isPresent(p.keyId9) && i.obj9 === injector_1.UNDEFINED)
            i.obj9 = i.instantiateProvider(p.provider9, p.visibility9);
    };
    ElementInjectorInlineStrategy.prototype.dehydrate = function () {
        var i = this.injectorStrategy;
        i.obj0 = injector_1.UNDEFINED;
        i.obj1 = injector_1.UNDEFINED;
        i.obj2 = injector_1.UNDEFINED;
        i.obj3 = injector_1.UNDEFINED;
        i.obj4 = injector_1.UNDEFINED;
        i.obj5 = injector_1.UNDEFINED;
        i.obj6 = injector_1.UNDEFINED;
        i.obj7 = injector_1.UNDEFINED;
        i.obj8 = injector_1.UNDEFINED;
        i.obj9 = injector_1.UNDEFINED;
    };
    ElementInjectorInlineStrategy.prototype.callOnDestroy = function () {
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
    };
    ElementInjectorInlineStrategy.prototype.getComponent = function () { return this.injectorStrategy.obj0; };
    ElementInjectorInlineStrategy.prototype.isComponentKey = function (key) {
        return this._ei._proto._firstProviderIsComponent && lang_1.isPresent(key) &&
            key.id === this.injectorStrategy.protoStrategy.keyId0;
    };
    ElementInjectorInlineStrategy.prototype.addDirectivesMatchingQuery = function (query, list) {
        var i = this.injectorStrategy;
        var p = i.protoStrategy;
        if (lang_1.isPresent(p.provider0) && p.provider0.key.token === query.selector) {
            if (i.obj0 === injector_1.UNDEFINED)
                i.obj0 = i.instantiateProvider(p.provider0, p.visibility0);
            list.push(i.obj0);
        }
        if (lang_1.isPresent(p.provider1) && p.provider1.key.token === query.selector) {
            if (i.obj1 === injector_1.UNDEFINED)
                i.obj1 = i.instantiateProvider(p.provider1, p.visibility1);
            list.push(i.obj1);
        }
        if (lang_1.isPresent(p.provider2) && p.provider2.key.token === query.selector) {
            if (i.obj2 === injector_1.UNDEFINED)
                i.obj2 = i.instantiateProvider(p.provider2, p.visibility2);
            list.push(i.obj2);
        }
        if (lang_1.isPresent(p.provider3) && p.provider3.key.token === query.selector) {
            if (i.obj3 === injector_1.UNDEFINED)
                i.obj3 = i.instantiateProvider(p.provider3, p.visibility3);
            list.push(i.obj3);
        }
        if (lang_1.isPresent(p.provider4) && p.provider4.key.token === query.selector) {
            if (i.obj4 === injector_1.UNDEFINED)
                i.obj4 = i.instantiateProvider(p.provider4, p.visibility4);
            list.push(i.obj4);
        }
        if (lang_1.isPresent(p.provider5) && p.provider5.key.token === query.selector) {
            if (i.obj5 === injector_1.UNDEFINED)
                i.obj5 = i.instantiateProvider(p.provider5, p.visibility5);
            list.push(i.obj5);
        }
        if (lang_1.isPresent(p.provider6) && p.provider6.key.token === query.selector) {
            if (i.obj6 === injector_1.UNDEFINED)
                i.obj6 = i.instantiateProvider(p.provider6, p.visibility6);
            list.push(i.obj6);
        }
        if (lang_1.isPresent(p.provider7) && p.provider7.key.token === query.selector) {
            if (i.obj7 === injector_1.UNDEFINED)
                i.obj7 = i.instantiateProvider(p.provider7, p.visibility7);
            list.push(i.obj7);
        }
        if (lang_1.isPresent(p.provider8) && p.provider8.key.token === query.selector) {
            if (i.obj8 === injector_1.UNDEFINED)
                i.obj8 = i.instantiateProvider(p.provider8, p.visibility8);
            list.push(i.obj8);
        }
        if (lang_1.isPresent(p.provider9) && p.provider9.key.token === query.selector) {
            if (i.obj9 === injector_1.UNDEFINED)
                i.obj9 = i.instantiateProvider(p.provider9, p.visibility9);
            list.push(i.obj9);
        }
    };
    return ElementInjectorInlineStrategy;
})();
/**
 * Strategy used by the `ElementInjector` when the number of bindings is 11 or more.
 * In such a case, there are too many fields to inline (see ElementInjectorInlineStrategy).
 */
var ElementInjectorDynamicStrategy = (function () {
    function ElementInjectorDynamicStrategy(injectorStrategy, _ei) {
        this.injectorStrategy = injectorStrategy;
        this._ei = _ei;
    }
    ElementInjectorDynamicStrategy.prototype.hydrate = function () {
        var inj = this.injectorStrategy;
        var p = inj.protoStrategy;
        inj.resetConstructionCounter();
        for (var i = 0; i < p.keyIds.length; i++) {
            if (p.providers[i] instanceof DirectiveProvider && lang_1.isPresent(p.keyIds[i]) &&
                inj.objs[i] === injector_1.UNDEFINED) {
                inj.objs[i] = inj.instantiateProvider(p.providers[i], p.visibilities[i]);
            }
        }
    };
    ElementInjectorDynamicStrategy.prototype.dehydrate = function () {
        var inj = this.injectorStrategy;
        collection_1.ListWrapper.fill(inj.objs, injector_1.UNDEFINED);
    };
    ElementInjectorDynamicStrategy.prototype.callOnDestroy = function () {
        var ist = this.injectorStrategy;
        var p = ist.protoStrategy;
        for (var i = 0; i < p.providers.length; i++) {
            if (p.providers[i] instanceof DirectiveProvider &&
                p.providers[i].callOnDestroy) {
                ist.objs[i].ngOnDestroy();
            }
        }
    };
    ElementInjectorDynamicStrategy.prototype.getComponent = function () { return this.injectorStrategy.objs[0]; };
    ElementInjectorDynamicStrategy.prototype.isComponentKey = function (key) {
        var p = this.injectorStrategy.protoStrategy;
        return this._ei._proto._firstProviderIsComponent && lang_1.isPresent(key) && key.id === p.keyIds[0];
    };
    ElementInjectorDynamicStrategy.prototype.addDirectivesMatchingQuery = function (query, list) {
        var ist = this.injectorStrategy;
        var p = ist.protoStrategy;
        for (var i = 0; i < p.providers.length; i++) {
            if (p.providers[i].key.token === query.selector) {
                if (ist.objs[i] === injector_1.UNDEFINED) {
                    ist.objs[i] = ist.instantiateProvider(p.providers[i], p.visibilities[i]);
                }
                list.push(ist.objs[i]);
            }
        }
    };
    return ElementInjectorDynamicStrategy;
})();
var ProtoQueryRef = (function () {
    function ProtoQueryRef(dirIndex, setter, query) {
        this.dirIndex = dirIndex;
        this.setter = setter;
        this.query = query;
    }
    Object.defineProperty(ProtoQueryRef.prototype, "usesPropertySyntax", {
        get: function () { return lang_1.isPresent(this.setter); },
        enumerable: true,
        configurable: true
    });
    return ProtoQueryRef;
})();
exports.ProtoQueryRef = ProtoQueryRef;
var QueryRef = (function () {
    function QueryRef(protoQueryRef, originator) {
        this.protoQueryRef = protoQueryRef;
        this.originator = originator;
    }
    Object.defineProperty(QueryRef.prototype, "isViewQuery", {
        get: function () { return this.protoQueryRef.query.isViewQuery; },
        enumerable: true,
        configurable: true
    });
    QueryRef.prototype.update = function () {
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
    };
    QueryRef.prototype._update = function () {
        var aggregator = [];
        if (this.protoQueryRef.query.isViewQuery) {
            var view = this.originator.getView();
            // intentionally skipping originator for view queries.
            var nestedView = view.getNestedView(view.elementOffset + this.originator.getBoundElementIndex());
            if (lang_1.isPresent(nestedView))
                this._visitView(nestedView, aggregator);
        }
        else {
            this._visit(this.originator, aggregator);
        }
        this.list.reset(aggregator);
    };
    ;
    QueryRef.prototype._visit = function (inj, aggregator) {
        var view = inj.getView();
        var startIdx = view.elementOffset + inj._proto.index;
        for (var i = startIdx; i < view.elementOffset + view.ownBindersCount; i++) {
            var curInj = view.elementInjectors[i];
            if (lang_1.isBlank(curInj))
                continue;
            // The first injector after inj, that is outside the subtree rooted at
            // inj has to have a null parent or a parent that is an ancestor of inj.
            if (i > startIdx && (lang_1.isBlank(curInj) || lang_1.isBlank(curInj.parent) ||
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
            if (lang_1.isPresent(vc))
                this._visitViewContainer(vc, aggregator);
        }
    };
    QueryRef.prototype._visitInjector = function (inj, aggregator) {
        if (this.protoQueryRef.query.isVarBindingQuery) {
            this._aggregateVariableBinding(inj, aggregator);
        }
        else {
            this._aggregateDirective(inj, aggregator);
        }
    };
    QueryRef.prototype._visitViewContainer = function (vc, aggregator) {
        for (var j = 0; j < vc.views.length; j++) {
            this._visitView(vc.views[j], aggregator);
        }
    };
    QueryRef.prototype._visitView = function (view, aggregator) {
        for (var i = view.elementOffset; i < view.elementOffset + view.ownBindersCount; i++) {
            var inj = view.elementInjectors[i];
            if (lang_1.isBlank(inj))
                continue;
            this._visitInjector(inj, aggregator);
            var vc = view.viewContainers[i];
            if (lang_1.isPresent(vc))
                this._visitViewContainer(vc, aggregator);
        }
    };
    QueryRef.prototype._aggregateVariableBinding = function (inj, aggregator) {
        var vb = this.protoQueryRef.query.varBindings;
        for (var i = 0; i < vb.length; ++i) {
            if (inj.hasVariableBinding(vb[i])) {
                aggregator.push(inj.getVariableBinding(vb[i]));
            }
        }
    };
    QueryRef.prototype._aggregateDirective = function (inj, aggregator) {
        inj.addDirectivesMatchingQuery(this.protoQueryRef.query, aggregator);
    };
    QueryRef.prototype.dehydrate = function () { this.list = null; };
    QueryRef.prototype.hydrate = function () {
        this.list = new query_list_1.QueryList();
        this.dirty = true;
    };
    return QueryRef;
})();
exports.QueryRef = QueryRef;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudF9pbmplY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9lbGVtZW50X2luamVjdG9yLnRzIl0sIm5hbWVzIjpbIlN0YXRpY0tleXMiLCJTdGF0aWNLZXlzLmNvbnN0cnVjdG9yIiwiU3RhdGljS2V5cy5pbnN0YW5jZSIsIlRyZWVOb2RlIiwiVHJlZU5vZGUuY29uc3RydWN0b3IiLCJUcmVlTm9kZS5hZGRDaGlsZCIsIlRyZWVOb2RlLnJlbW92ZSIsIlRyZWVOb2RlLnBhcmVudCIsIkRpcmVjdGl2ZURlcGVuZGVuY3kiLCJEaXJlY3RpdmVEZXBlbmRlbmN5LmNvbnN0cnVjdG9yIiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5fdmVyaWZ5IiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5jcmVhdGVGcm9tIiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5fYXR0cmlidXRlTmFtZSIsIkRpcmVjdGl2ZURlcGVuZGVuY3kuX3F1ZXJ5IiwiRGlyZWN0aXZlUHJvdmlkZXIiLCJEaXJlY3RpdmVQcm92aWRlci5jb25zdHJ1Y3RvciIsIkRpcmVjdGl2ZVByb3ZpZGVyLmRpc3BsYXlOYW1lIiwiRGlyZWN0aXZlUHJvdmlkZXIucXVlcmllcyIsIkRpcmVjdGl2ZVByb3ZpZGVyLmV2ZW50RW1pdHRlcnMiLCJEaXJlY3RpdmVQcm92aWRlci5jcmVhdGVGcm9tUHJvdmlkZXIiLCJEaXJlY3RpdmVQcm92aWRlci5jcmVhdGVGcm9tVHlwZSIsIlByZUJ1aWx0T2JqZWN0cyIsIlByZUJ1aWx0T2JqZWN0cy5jb25zdHJ1Y3RvciIsIlF1ZXJ5TWV0YWRhdGFXaXRoU2V0dGVyIiwiUXVlcnlNZXRhZGF0YVdpdGhTZXR0ZXIuY29uc3RydWN0b3IiLCJFdmVudEVtaXR0ZXJBY2Nlc3NvciIsIkV2ZW50RW1pdHRlckFjY2Vzc29yLmNvbnN0cnVjdG9yIiwiRXZlbnRFbWl0dGVyQWNjZXNzb3Iuc3Vic2NyaWJlIiwiX2NyZWF0ZUV2ZW50RW1pdHRlckFjY2Vzc29ycyIsIl9jcmVhdGVQcm90b1F1ZXJ5UmVmcyIsIlByb3RvRWxlbWVudEluamVjdG9yIiwiUHJvdG9FbGVtZW50SW5qZWN0b3IuY29uc3RydWN0b3IiLCJQcm90b0VsZW1lbnRJbmplY3Rvci5jcmVhdGUiLCJQcm90b0VsZW1lbnRJbmplY3Rvci5fY3JlYXRlRGlyZWN0aXZlUHJvdmlkZXJXaXRoVmlzaWJpbGl0eSIsIlByb3RvRWxlbWVudEluamVjdG9yLl9jcmVhdGVQcm92aWRlcnNXaXRoVmlzaWJpbGl0eSIsIlByb3RvRWxlbWVudEluamVjdG9yLl9jcmVhdGVQcm92aWRlcldpdGhWaXNpYmlsaXR5IiwiUHJvdG9FbGVtZW50SW5qZWN0b3IuX2NyZWF0ZVZpZXdQcm92aWRlcnNXaXRoVmlzaWJpbGl0eSIsIlByb3RvRWxlbWVudEluamVjdG9yLmluc3RhbnRpYXRlIiwiUHJvdG9FbGVtZW50SW5qZWN0b3IuZGlyZWN0UGFyZW50IiwiUHJvdG9FbGVtZW50SW5qZWN0b3IuaGFzQmluZGluZ3MiLCJQcm90b0VsZW1lbnRJbmplY3Rvci5nZXRQcm92aWRlckF0SW5kZXgiLCJfQ29udGV4dCIsIl9Db250ZXh0LmNvbnN0cnVjdG9yIiwiRWxlbWVudEluamVjdG9yIiwiRWxlbWVudEluamVjdG9yLmNvbnN0cnVjdG9yIiwiRWxlbWVudEluamVjdG9yLmRlaHlkcmF0ZSIsIkVsZW1lbnRJbmplY3Rvci5oeWRyYXRlIiwiRWxlbWVudEluamVjdG9yLl9kZWJ1Z0NvbnRleHQiLCJFbGVtZW50SW5qZWN0b3IuX3JlYXR0YWNoSW5qZWN0b3JzIiwiRWxlbWVudEluamVjdG9yLl9yZWF0dGFjaEluamVjdG9yIiwiRWxlbWVudEluamVjdG9yLmhhc1ZhcmlhYmxlQmluZGluZyIsIkVsZW1lbnRJbmplY3Rvci5nZXRWYXJpYWJsZUJpbmRpbmciLCJFbGVtZW50SW5qZWN0b3IuZ2V0IiwiRWxlbWVudEluamVjdG9yLmhhc0RpcmVjdGl2ZSIsIkVsZW1lbnRJbmplY3Rvci5nZXRFdmVudEVtaXR0ZXJBY2Nlc3NvcnMiLCJFbGVtZW50SW5qZWN0b3IuZ2V0RGlyZWN0aXZlVmFyaWFibGVCaW5kaW5ncyIsIkVsZW1lbnRJbmplY3Rvci5nZXRDb21wb25lbnQiLCJFbGVtZW50SW5qZWN0b3IuZ2V0SW5qZWN0b3IiLCJFbGVtZW50SW5qZWN0b3IuZ2V0RWxlbWVudFJlZiIsIkVsZW1lbnRJbmplY3Rvci5nZXRWaWV3Q29udGFpbmVyUmVmIiwiRWxlbWVudEluamVjdG9yLmdldE5lc3RlZFZpZXciLCJFbGVtZW50SW5qZWN0b3IuZ2V0VmlldyIsIkVsZW1lbnRJbmplY3Rvci5kaXJlY3RQYXJlbnQiLCJFbGVtZW50SW5qZWN0b3IuaXNDb21wb25lbnRLZXkiLCJFbGVtZW50SW5qZWN0b3IuZ2V0RGVwZW5kZW5jeSIsIkVsZW1lbnRJbmplY3Rvci5fYnVpbGRBdHRyaWJ1dGUiLCJFbGVtZW50SW5qZWN0b3IuYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkiLCJFbGVtZW50SW5qZWN0b3IuX2J1aWxkUXVlcnlTdHJhdGVneSIsIkVsZW1lbnRJbmplY3Rvci5saW5rIiwiRWxlbWVudEluamVjdG9yLnVubGluayIsIkVsZW1lbnRJbmplY3Rvci5nZXREaXJlY3RpdmVBdEluZGV4IiwiRWxlbWVudEluamVjdG9yLmhhc0luc3RhbmNlcyIsIkVsZW1lbnRJbmplY3Rvci5nZXRIb3N0IiwiRWxlbWVudEluamVjdG9yLmdldEJvdW5kRWxlbWVudEluZGV4IiwiRWxlbWVudEluamVjdG9yLmdldFJvb3RWaWV3SW5qZWN0b3JzIiwiRWxlbWVudEluamVjdG9yLm5nQWZ0ZXJWaWV3Q2hlY2tlZCIsIkVsZW1lbnRJbmplY3Rvci5uZ0FmdGVyQ29udGVudENoZWNrZWQiLCJFbGVtZW50SW5qZWN0b3IudHJhdmVyc2VBbmRTZXRRdWVyaWVzQXNEaXJ0eSIsIkVsZW1lbnRJbmplY3Rvci5fc2V0UXVlcmllc0FzRGlydHkiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5IiwiX0VtcHR5UXVlcnlTdHJhdGVneS5jb25zdHJ1Y3RvciIsIl9FbXB0eVF1ZXJ5U3RyYXRlZ3kuc2V0Q29udGVudFF1ZXJpZXNBc0RpcnR5IiwiX0VtcHR5UXVlcnlTdHJhdGVneS5zZXRWaWV3UXVlcmllc0FzRGlydHkiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5Lmh5ZHJhdGUiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5LmRlaHlkcmF0ZSIsIl9FbXB0eVF1ZXJ5U3RyYXRlZ3kudXBkYXRlQ29udGVudFF1ZXJpZXMiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5LnVwZGF0ZVZpZXdRdWVyaWVzIiwiX0VtcHR5UXVlcnlTdHJhdGVneS5maW5kUXVlcnkiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5IiwiSW5saW5lUXVlcnlTdHJhdGVneS5jb25zdHJ1Y3RvciIsIklubGluZVF1ZXJ5U3RyYXRlZ3kuc2V0Q29udGVudFF1ZXJpZXNBc0RpcnR5IiwiSW5saW5lUXVlcnlTdHJhdGVneS5zZXRWaWV3UXVlcmllc0FzRGlydHkiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5Lmh5ZHJhdGUiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5LmRlaHlkcmF0ZSIsIklubGluZVF1ZXJ5U3RyYXRlZ3kudXBkYXRlQ29udGVudFF1ZXJpZXMiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5LnVwZGF0ZVZpZXdRdWVyaWVzIiwiSW5saW5lUXVlcnlTdHJhdGVneS5maW5kUXVlcnkiLCJEeW5hbWljUXVlcnlTdHJhdGVneSIsIkR5bmFtaWNRdWVyeVN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kuc2V0Q29udGVudFF1ZXJpZXNBc0RpcnR5IiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kuc2V0Vmlld1F1ZXJpZXNBc0RpcnR5IiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kuaHlkcmF0ZSIsIkR5bmFtaWNRdWVyeVN0cmF0ZWd5LmRlaHlkcmF0ZSIsIkR5bmFtaWNRdWVyeVN0cmF0ZWd5LnVwZGF0ZUNvbnRlbnRRdWVyaWVzIiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kudXBkYXRlVmlld1F1ZXJpZXMiLCJEeW5hbWljUXVlcnlTdHJhdGVneS5maW5kUXVlcnkiLCJFbGVtZW50SW5qZWN0b3JJbmxpbmVTdHJhdGVneSIsIkVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiRWxlbWVudEluamVjdG9ySW5saW5lU3RyYXRlZ3kuaHlkcmF0ZSIsIkVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5LmRlaHlkcmF0ZSIsIkVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5LmNhbGxPbkRlc3Ryb3kiLCJFbGVtZW50SW5qZWN0b3JJbmxpbmVTdHJhdGVneS5nZXRDb21wb25lbnQiLCJFbGVtZW50SW5qZWN0b3JJbmxpbmVTdHJhdGVneS5pc0NvbXBvbmVudEtleSIsIkVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5LmFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5IiwiRWxlbWVudEluamVjdG9yRHluYW1pY1N0cmF0ZWd5IiwiRWxlbWVudEluamVjdG9yRHluYW1pY1N0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiRWxlbWVudEluamVjdG9yRHluYW1pY1N0cmF0ZWd5Lmh5ZHJhdGUiLCJFbGVtZW50SW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuZGVoeWRyYXRlIiwiRWxlbWVudEluamVjdG9yRHluYW1pY1N0cmF0ZWd5LmNhbGxPbkRlc3Ryb3kiLCJFbGVtZW50SW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuZ2V0Q29tcG9uZW50IiwiRWxlbWVudEluamVjdG9yRHluYW1pY1N0cmF0ZWd5LmlzQ29tcG9uZW50S2V5IiwiRWxlbWVudEluamVjdG9yRHluYW1pY1N0cmF0ZWd5LmFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5IiwiUHJvdG9RdWVyeVJlZiIsIlByb3RvUXVlcnlSZWYuY29uc3RydWN0b3IiLCJQcm90b1F1ZXJ5UmVmLnVzZXNQcm9wZXJ0eVN5bnRheCIsIlF1ZXJ5UmVmIiwiUXVlcnlSZWYuY29uc3RydWN0b3IiLCJRdWVyeVJlZi5pc1ZpZXdRdWVyeSIsIlF1ZXJ5UmVmLnVwZGF0ZSIsIlF1ZXJ5UmVmLl91cGRhdGUiLCJRdWVyeVJlZi5fdmlzaXQiLCJRdWVyeVJlZi5fdmlzaXRJbmplY3RvciIsIlF1ZXJ5UmVmLl92aXNpdFZpZXdDb250YWluZXIiLCJRdWVyeVJlZi5fdmlzaXRWaWV3IiwiUXVlcnlSZWYuX2FnZ3JlZ2F0ZVZhcmlhYmxlQmluZGluZyIsIlF1ZXJ5UmVmLl9hZ2dyZWdhdGVEaXJlY3RpdmUiLCJRdWVyeVJlZi5kZWh5ZHJhdGUiLCJRdWVyeVJlZi5oeWRyYXRlIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHFCQU9PLDBCQUEwQixDQUFDLENBQUE7QUFDbEMsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0Qsc0JBQThDLDJCQUEyQixDQUFDLENBQUE7QUFDMUUsMkJBQXdELGdDQUFnQyxDQUFDLENBQUE7QUFDekYsbUJBV08sc0JBQXNCLENBQUMsQ0FBQTtBQUM5Qix5QkFRTywrQkFBK0IsQ0FBQyxDQUFBO0FBQ3ZDLHlCQUFrRSwrQkFBK0IsQ0FBQyxDQUFBO0FBRWxHLG1CQUErQyxnQkFBZ0IsQ0FBQyxDQUFBO0FBR2hFLGNBQWMsQ0FBQyxJQUFZLFNBQVMsV0FBTSxnQkFBZ0IsQ0FBQyxDQUFBO0FBQzNELG1DQUErQixzQkFBc0IsQ0FBQyxDQUFBO0FBQ3RELDRCQUF5QixlQUFlLENBQUMsQ0FBQTtBQUN6Qyw2QkFBMEIsZ0JBQWdCLENBQUMsQ0FBQTtBQUMzQywyQkFBbUQsd0JBQXdCLENBQUMsQ0FBQTtBQUM1RSw4Q0FBK0IsaUNBQWlDLENBQUMsQ0FBQTtBQUNqRSxpQ0FHTyxxREFBcUQsQ0FBQyxDQUFBO0FBQzdELDJCQUF3QixjQUFjLENBQUMsQ0FBQTtBQUN2QywyQkFBd0IseUNBQXlDLENBQUMsQ0FBQTtBQUVsRSw2QkFBMEIsdUNBQXVDLENBQUMsQ0FBQTtBQUVsRSw4QkFBMkIsdUNBQXVDLENBQUMsQ0FBQTtBQUVuRSwyQkFBNkIsY0FBYyxDQUFDLENBQUE7QUFDNUMsbUNBQWdDLHNCQUFzQixDQUFDLENBQUE7QUFFdkQsSUFBSSxXQUFXLENBQUM7QUFF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Q0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7SUFDekVBLENBQUNBO0lBRURELHNEQUF3QkEsR0FBeEJBO1FBQ0VFLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNqRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2pGQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDbkZBLENBQUNBO0lBRURGLG1EQUFxQkEsR0FBckJBO1FBQ0VHLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNoRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO1FBQ2hGQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDbEZBLENBQUNBO0lBRURILHFDQUFPQSxHQUFQQTtRQUNFSSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7UUFDbERBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUNsREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO0lBQ3BEQSxDQUFDQTtJQUVESix1Q0FBU0EsR0FBVEE7UUFDRUssRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBO1FBQ3BEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0E7UUFDcERBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQTtJQUN0REEsQ0FBQ0E7SUFFREwsa0RBQW9CQSxHQUFwQkE7UUFDRU0sRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZEQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZEQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZEQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFRE4sK0NBQWlCQSxHQUFqQkE7UUFDRU8sRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3REQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3REQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3REQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFRFAsdUNBQVNBLEdBQVRBLFVBQVVBLEtBQW9CQTtRQUM1QlEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLEtBQUtBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hFQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUNyQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLEtBQUtBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hFQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUNyQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLEtBQUtBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hFQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUNyQkEsQ0FBQ0E7UUFDREEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLHFDQUFtQ0EsS0FBS0EsTUFBR0EsQ0FBQ0EsQ0FBQ0E7SUFDdkVBLENBQUNBO0lBeEVNUiwrQ0FBMkJBLEdBQUdBLENBQUNBLENBQUNBO0lBeUV6Q0EsMEJBQUNBO0FBQURBLENBQUNBLEFBMUVELElBMEVDO0FBRUQ7SUFHRVMsOEJBQVlBLEVBQW1CQTtRQUM3QkMsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsRUFBRUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsVUFBQUEsQ0FBQ0EsSUFBSUEsT0FBQUEsSUFBSUEsUUFBUUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFBbkJBLENBQW1CQSxDQUFDQSxDQUFDQTtJQUN4RUEsQ0FBQ0E7SUFFREQsdURBQXdCQSxHQUF4QkE7UUFDRUUsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDN0NBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQTtnQkFBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDckNBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURGLG9EQUFxQkEsR0FBckJBO1FBQ0VHLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBO1lBQzdDQSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3BDQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVESCxzQ0FBT0EsR0FBUEE7UUFDRUksR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDN0NBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hCQSxDQUFDQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtRQUNkQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVESix3Q0FBU0EsR0FBVEE7UUFDRUssR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDN0NBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hCQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQTtRQUNoQkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREwsbURBQW9CQSxHQUFwQkE7UUFDRU0sR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsTUFBTUEsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7WUFDN0NBLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbkJBLENBQUNBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1lBQ2JBLENBQUNBO1FBQ0hBLENBQUNBO0lBQ0hBLENBQUNBO0lBRUROLGdEQUFpQkEsR0FBakJBO1FBQ0VPLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLE1BQU1BLEVBQUVBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBO1lBQzdDQSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2xCQSxDQUFDQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtZQUNiQSxDQUFDQTtRQUNIQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVEUCx3Q0FBU0EsR0FBVEEsVUFBVUEsS0FBb0JBO1FBQzVCUSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQTtZQUM3Q0EsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDeEJBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLGFBQWFBLENBQUNBLEtBQUtBLEtBQUtBLEtBQUtBLENBQUNBLENBQUNBLENBQUNBO2dCQUNwQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDWEEsQ0FBQ0E7UUFDSEEsQ0FBQ0E7UUFDREEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLHFDQUFtQ0EsS0FBS0EsTUFBR0EsQ0FBQ0EsQ0FBQ0E7SUFDdkVBLENBQUNBO0lBQ0hSLDJCQUFDQTtBQUFEQSxDQUFDQSxBQTlERCxJQThEQztBQVdEOzs7R0FHRztBQUNIO0lBQ0VTLHVDQUFtQkEsZ0JBQXdDQSxFQUFTQSxHQUFvQkE7UUFBckVDLHFCQUFnQkEsR0FBaEJBLGdCQUFnQkEsQ0FBd0JBO1FBQVNBLFFBQUdBLEdBQUhBLEdBQUdBLENBQWlCQTtJQUFHQSxDQUFDQTtJQUU1RkQsK0NBQU9BLEdBQVBBO1FBQ0VFLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0E7UUFDOUJBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLGFBQWFBLENBQUNBO1FBQ3hCQSxDQUFDQSxDQUFDQSx3QkFBd0JBLEVBQUVBLENBQUNBO1FBRTdCQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtZQUMxRkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUM3REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtZQUMxRkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUM3REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtZQUMxRkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUM3REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7SUFDL0RBLENBQUNBO0lBRURGLGlEQUFTQSxHQUFUQTtRQUNFRyxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBO1FBRTlCQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxvQkFBU0EsQ0FBQ0E7UUFDbkJBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLG9CQUFTQSxDQUFDQTtRQUNuQkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0Esb0JBQVNBLENBQUNBO1FBQ25CQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxvQkFBU0EsQ0FBQ0E7UUFDbkJBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLG9CQUFTQSxDQUFDQTtRQUNuQkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0Esb0JBQVNBLENBQUNBO1FBQ25CQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxvQkFBU0EsQ0FBQ0E7UUFDbkJBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLG9CQUFTQSxDQUFDQTtRQUNuQkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0Esb0JBQVNBLENBQUNBO1FBQ25CQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxvQkFBU0EsQ0FBQ0E7SUFDckJBLENBQUNBO0lBRURILHFEQUFhQSxHQUFiQTtRQUNFSSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBO1FBQzlCQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxhQUFhQSxDQUFDQTtRQUV4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQTtZQUNwQkEsQ0FBQ0EsQ0FBQ0EsU0FBVUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBO1lBQ3BCQSxDQUFDQSxDQUFDQSxTQUFVQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkE7WUFDcEJBLENBQUNBLENBQUNBLFNBQVVBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQTtZQUNwQkEsQ0FBQ0EsQ0FBQ0EsU0FBVUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBO1lBQ3BCQSxDQUFDQSxDQUFDQSxTQUFVQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkE7WUFD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QUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO2dCQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEtBQUtBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtnQkFBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNyRkEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDcEJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO2dCQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEtBQUtBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtnQkFBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNyRkEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDcEJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO2dCQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLENBQUNB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IGlzUHJlc2VudCxcbiAgaXNCbGFuayxcbiAgVHlwZSxcbiAgc3RyaW5naWZ5LFxuICBDT05TVF9FWFBSLFxuICBTdHJpbmdXcmFwcGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0V2ZW50RW1pdHRlciwgT2JzZXJ2YWJsZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgTWFwV3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7XG4gIEluamVjdG9yLFxuICBLZXksXG4gIERlcGVuZGVuY3ksXG4gIHByb3ZpZGUsXG4gIFByb3ZpZGVyLFxuICBSZXNvbHZlZFByb3ZpZGVyLFxuICBOb1Byb3ZpZGVyRXJyb3IsXG4gIEFic3RyYWN0UHJvdmlkZXJFcnJvcixcbiAgQ3ljbGljRGVwZW5kZW5jeUVycm9yLFxuICByZXNvbHZlRm9yd2FyZFJlZlxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1xuICBVTkRFRklORUQsXG4gIFByb3RvSW5qZWN0b3IsXG4gIFZpc2liaWxpdHksXG4gIEluamVjdG9ySW5saW5lU3RyYXRlZ3ksXG4gIEluamVjdG9yRHluYW1pY1N0cmF0ZWd5LFxuICBQcm92aWRlcldpdGhWaXNpYmlsaXR5LFxuICBEZXBlbmRlbmN5UHJvdmlkZXJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvaW5qZWN0b3InO1xuaW1wb3J0IHtyZXNvbHZlUHJvdmlkZXIsIFJlc29sdmVkRmFjdG9yeSwgUmVzb2x2ZWRQcm92aWRlcl99IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpL3Byb3ZpZGVyJztcblxuaW1wb3J0IHtBdHRyaWJ1dGVNZXRhZGF0YSwgUXVlcnlNZXRhZGF0YX0gZnJvbSAnLi4vbWV0YWRhdGEvZGknO1xuXG5pbXBvcnQge0FwcFZpZXdDb250YWluZXIsIEFwcFZpZXd9IGZyb20gJy4vdmlldyc7XG4vKiBjaXJjdWxhciAqLyBpbXBvcnQgKiBhcyBhdm1Nb2R1bGUgZnJvbSAnLi92aWV3X21hbmFnZXInO1xuaW1wb3J0IHtWaWV3Q29udGFpbmVyUmVmfSBmcm9tICcuL3ZpZXdfY29udGFpbmVyX3JlZic7XG5pbXBvcnQge0VsZW1lbnRSZWZ9IGZyb20gJy4vZWxlbWVudF9yZWYnO1xuaW1wb3J0IHtUZW1wbGF0ZVJlZn0gZnJvbSAnLi90ZW1wbGF0ZV9yZWYnO1xuaW1wb3J0IHtEaXJlY3RpdmVNZXRhZGF0YSwgQ29tcG9uZW50TWV0YWRhdGF9IGZyb20gJy4uL21ldGFkYXRhL2RpcmVjdGl2ZXMnO1xuaW1wb3J0IHtoYXNMaWZlY3ljbGVIb29rfSBmcm9tICcuL2RpcmVjdGl2ZV9saWZlY3ljbGVfcmVmbGVjdG9yJztcbmltcG9ydCB7XG4gIENoYW5nZURldGVjdG9yLFxuICBDaGFuZ2VEZXRlY3RvclJlZlxufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rpb24nO1xuaW1wb3J0IHtRdWVyeUxpc3R9IGZyb20gJy4vcXVlcnlfbGlzdCc7XG5pbXBvcnQge3JlZmxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0aW9uJztcbmltcG9ydCB7U2V0dGVyRm59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vdHlwZXMnO1xuaW1wb3J0IHtFdmVudENvbmZpZ30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2V2ZW50X2NvbmZpZyc7XG5pbXBvcnQge0FmdGVyVmlld0NoZWNrZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9pbnRlcmZhY2VzJztcbmltcG9ydCB7UGlwZVByb3ZpZGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9waXBlcy9waXBlX3Byb3ZpZGVyJztcblxuaW1wb3J0IHtMaWZlY3ljbGVIb29rc30gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7Vmlld0NvbnRhaW5lclJlZl99IGZyb20gXCIuL3ZpZXdfY29udGFpbmVyX3JlZlwiO1xuXG52YXIgX3N0YXRpY0tleXM7XG5cbmV4cG9ydCBjbGFzcyBTdGF0aWNLZXlzIHtcbiAgdmlld01hbmFnZXJJZDogbnVtYmVyO1xuICB0ZW1wbGF0ZVJlZklkOiBudW1iZXI7XG4gIHZpZXdDb250YWluZXJJZDogbnVtYmVyO1xuICBjaGFuZ2VEZXRlY3RvclJlZklkOiBudW1iZXI7XG4gIGVsZW1lbnRSZWZJZDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMudmlld01hbmFnZXJJZCA9IEtleS5nZXQoYXZtTW9kdWxlLkFwcFZpZXdNYW5hZ2VyKS5pZDtcbiAgICB0aGlzLnRlbXBsYXRlUmVmSWQgPSBLZXkuZ2V0KFRlbXBsYXRlUmVmKS5pZDtcbiAgICB0aGlzLnZpZXdDb250YWluZXJJZCA9IEtleS5nZXQoVmlld0NvbnRhaW5lclJlZikuaWQ7XG4gICAgdGhpcy5jaGFuZ2VEZXRlY3RvclJlZklkID0gS2V5LmdldChDaGFuZ2VEZXRlY3RvclJlZikuaWQ7XG4gICAgdGhpcy5lbGVtZW50UmVmSWQgPSBLZXkuZ2V0KEVsZW1lbnRSZWYpLmlkO1xuICB9XG5cbiAgc3RhdGljIGluc3RhbmNlKCk6IFN0YXRpY0tleXMge1xuICAgIGlmIChpc0JsYW5rKF9zdGF0aWNLZXlzKSkgX3N0YXRpY0tleXMgPSBuZXcgU3RhdGljS2V5cygpO1xuICAgIHJldHVybiBfc3RhdGljS2V5cztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVHJlZU5vZGU8VCBleHRlbmRzIFRyZWVOb2RlPGFueT4+IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGFyZW50OiBUO1xuICBjb25zdHJ1Y3RvcihwYXJlbnQ6IFQpIHtcbiAgICBpZiAoaXNQcmVzZW50KHBhcmVudCkpIHtcbiAgICAgIHBhcmVudC5hZGRDaGlsZCh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fcGFyZW50ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBhZGRDaGlsZChjaGlsZDogVCk6IHZvaWQgeyBjaGlsZC5fcGFyZW50ID0gdGhpczsgfVxuXG4gIHJlbW92ZSgpOiB2b2lkIHsgdGhpcy5fcGFyZW50ID0gbnVsbDsgfVxuXG4gIGdldCBwYXJlbnQoKSB7IHJldHVybiB0aGlzLl9wYXJlbnQ7IH1cbn1cblxuZXhwb3J0IGNsYXNzIERpcmVjdGl2ZURlcGVuZGVuY3kgZXh0ZW5kcyBEZXBlbmRlbmN5IHtcbiAgY29uc3RydWN0b3Ioa2V5OiBLZXksIG9wdGlvbmFsOiBib29sZWFuLCBsb3dlckJvdW5kVmlzaWJpbGl0eTogT2JqZWN0LFxuICAgICAgICAgICAgICB1cHBlckJvdW5kVmlzaWJpbGl0eTogT2JqZWN0LCBwcm9wZXJ0aWVzOiBhbnlbXSwgcHVibGljIGF0dHJpYnV0ZU5hbWU6IHN0cmluZyxcbiAgICAgICAgICAgICAgcHVibGljIHF1ZXJ5RGVjb3JhdG9yOiBRdWVyeU1ldGFkYXRhKSB7XG4gICAgc3VwZXIoa2V5LCBvcHRpb25hbCwgbG93ZXJCb3VuZFZpc2liaWxpdHksIHVwcGVyQm91bmRWaXNpYmlsaXR5LCBwcm9wZXJ0aWVzKTtcbiAgICB0aGlzLl92ZXJpZnkoKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ZlcmlmeSgpOiB2b2lkIHtcbiAgICB2YXIgY291bnQgPSAwO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeURlY29yYXRvcikpIGNvdW50Kys7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmF0dHJpYnV0ZU5hbWUpKSBjb3VudCsrO1xuICAgIGlmIChjb3VudCA+IDEpXG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAnQSBkaXJlY3RpdmUgaW5qZWN0YWJsZSBjYW4gY29udGFpbiBvbmx5IG9uZSBvZiB0aGUgZm9sbG93aW5nIEBBdHRyaWJ1dGUgb3IgQFF1ZXJ5LicpO1xuICB9XG5cbiAgc3RhdGljIGNyZWF0ZUZyb20oZDogRGVwZW5kZW5jeSk6IERlcGVuZGVuY3kge1xuICAgIHJldHVybiBuZXcgRGlyZWN0aXZlRGVwZW5kZW5jeShcbiAgICAgICAgZC5rZXksIGQub3B0aW9uYWwsIGQubG93ZXJCb3VuZFZpc2liaWxpdHksIGQudXBwZXJCb3VuZFZpc2liaWxpdHksIGQucHJvcGVydGllcyxcbiAgICAgICAgRGlyZWN0aXZlRGVwZW5kZW5jeS5fYXR0cmlidXRlTmFtZShkLnByb3BlcnRpZXMpLCBEaXJlY3RpdmVEZXBlbmRlbmN5Ll9xdWVyeShkLnByb3BlcnRpZXMpKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgc3RhdGljIF9hdHRyaWJ1dGVOYW1lKHByb3BlcnRpZXM6IGFueVtdKTogc3RyaW5nIHtcbiAgICB2YXIgcCA9IDxBdHRyaWJ1dGVNZXRhZGF0YT5wcm9wZXJ0aWVzLmZpbmQocCA9PiBwIGluc3RhbmNlb2YgQXR0cmlidXRlTWV0YWRhdGEpO1xuICAgIHJldHVybiBpc1ByZXNlbnQocCkgPyBwLmF0dHJpYnV0ZU5hbWUgOiBudWxsO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBzdGF0aWMgX3F1ZXJ5KHByb3BlcnRpZXM6IGFueVtdKTogUXVlcnlNZXRhZGF0YSB7XG4gICAgcmV0dXJuIDxRdWVyeU1ldGFkYXRhPnByb3BlcnRpZXMuZmluZChwID0+IHAgaW5zdGFuY2VvZiBRdWVyeU1ldGFkYXRhKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGlyZWN0aXZlUHJvdmlkZXIgZXh0ZW5kcyBSZXNvbHZlZFByb3ZpZGVyXyB7XG4gIHB1YmxpYyBjYWxsT25EZXN0cm95OiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKGtleTogS2V5LCBmYWN0b3J5OiBGdW5jdGlvbiwgZGVwczogRGVwZW5kZW5jeVtdLCBwdWJsaWMgbWV0YWRhdGE6IERpcmVjdGl2ZU1ldGFkYXRhLFxuICAgICAgICAgICAgICBwdWJsaWMgcHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4sXG4gICAgICAgICAgICAgIHB1YmxpYyB2aWV3UHJvdmlkZXJzOiBBcnJheTxUeXBlIHwgUHJvdmlkZXIgfCBhbnlbXT4pIHtcbiAgICBzdXBlcihrZXksIFtuZXcgUmVzb2x2ZWRGYWN0b3J5KGZhY3RvcnksIGRlcHMpXSwgZmFsc2UpO1xuICAgIHRoaXMuY2FsbE9uRGVzdHJveSA9IGhhc0xpZmVjeWNsZUhvb2soTGlmZWN5Y2xlSG9va3MuT25EZXN0cm95LCBrZXkudG9rZW4pO1xuICB9XG5cbiAgZ2V0IGRpc3BsYXlOYW1lKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLmtleS5kaXNwbGF5TmFtZTsgfVxuXG4gIGdldCBxdWVyaWVzKCk6IFF1ZXJ5TWV0YWRhdGFXaXRoU2V0dGVyW10ge1xuICAgIGlmIChpc0JsYW5rKHRoaXMubWV0YWRhdGEucXVlcmllcykpIHJldHVybiBbXTtcblxuICAgIHZhciByZXMgPSBbXTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2godGhpcy5tZXRhZGF0YS5xdWVyaWVzLCAobWV0YSwgZmllbGROYW1lKSA9PiB7XG4gICAgICB2YXIgc2V0dGVyID0gcmVmbGVjdG9yLnNldHRlcihmaWVsZE5hbWUpO1xuICAgICAgcmVzLnB1c2gobmV3IFF1ZXJ5TWV0YWRhdGFXaXRoU2V0dGVyKHNldHRlciwgbWV0YSkpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXM7XG4gIH1cblxuICBnZXQgZXZlbnRFbWl0dGVycygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLm1ldGFkYXRhKSAmJiBpc1ByZXNlbnQodGhpcy5tZXRhZGF0YS5vdXRwdXRzKSA/IHRoaXMubWV0YWRhdGEub3V0cHV0cyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdO1xuICB9XG5cbiAgc3RhdGljIGNyZWF0ZUZyb21Qcm92aWRlcihwcm92aWRlcjogUHJvdmlkZXIsIG1ldGE6IERpcmVjdGl2ZU1ldGFkYXRhKTogRGlyZWN0aXZlUHJvdmlkZXIge1xuICAgIGlmIChpc0JsYW5rKG1ldGEpKSB7XG4gICAgICBtZXRhID0gbmV3IERpcmVjdGl2ZU1ldGFkYXRhKCk7XG4gICAgfVxuXG4gICAgdmFyIHJiID0gcmVzb2x2ZVByb3ZpZGVyKHByb3ZpZGVyKTtcbiAgICB2YXIgcmYgPSByYi5yZXNvbHZlZEZhY3Rvcmllc1swXTtcbiAgICB2YXIgZGVwcyA9IHJmLmRlcGVuZGVuY2llcy5tYXAoRGlyZWN0aXZlRGVwZW5kZW5jeS5jcmVhdGVGcm9tKTtcblxuICAgIHZhciBwcm92aWRlcnMgPSBpc1ByZXNlbnQobWV0YS5wcm92aWRlcnMpID8gbWV0YS5wcm92aWRlcnMgOiBbXTtcbiAgICB2YXIgdmlld0JpbmRpZ3MgPSBtZXRhIGluc3RhbmNlb2YgQ29tcG9uZW50TWV0YWRhdGEgJiYgaXNQcmVzZW50KG1ldGEudmlld1Byb3ZpZGVycykgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICBtZXRhLnZpZXdQcm92aWRlcnMgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICBbXTtcbiAgICByZXR1cm4gbmV3IERpcmVjdGl2ZVByb3ZpZGVyKHJiLmtleSwgcmYuZmFjdG9yeSwgZGVwcywgbWV0YSwgcHJvdmlkZXJzLCB2aWV3QmluZGlncyk7XG4gIH1cblxuICBzdGF0aWMgY3JlYXRlRnJvbVR5cGUodHlwZTogVHlwZSwgYW5ub3RhdGlvbjogRGlyZWN0aXZlTWV0YWRhdGEpOiBEaXJlY3RpdmVQcm92aWRlciB7XG4gICAgdmFyIHByb3ZpZGVyID0gbmV3IFByb3ZpZGVyKHR5cGUsIHt1c2VDbGFzczogdHlwZX0pO1xuICAgIHJldHVybiBEaXJlY3RpdmVQcm92aWRlci5jcmVhdGVGcm9tUHJvdmlkZXIocHJvdmlkZXIsIGFubm90YXRpb24pO1xuICB9XG59XG5cbi8vIFRPRE8ocmFkbyk6IGJlbmNobWFyayBhbmQgY29uc2lkZXIgcm9sbGluZyBpbiBhcyBFbGVtZW50SW5qZWN0b3IgZmllbGRzLlxuZXhwb3J0IGNsYXNzIFByZUJ1aWx0T2JqZWN0cyB7XG4gIG5lc3RlZFZpZXc6IEFwcFZpZXcgPSBudWxsO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmlld01hbmFnZXI6IGF2bU1vZHVsZS5BcHBWaWV3TWFuYWdlciwgcHVibGljIHZpZXc6IEFwcFZpZXcsXG4gICAgICAgICAgICAgIHB1YmxpYyBlbGVtZW50UmVmOiBFbGVtZW50UmVmLCBwdWJsaWMgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgUXVlcnlNZXRhZGF0YVdpdGhTZXR0ZXIge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgc2V0dGVyOiBTZXR0ZXJGbiwgcHVibGljIG1ldGFkYXRhOiBRdWVyeU1ldGFkYXRhKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgRXZlbnRFbWl0dGVyQWNjZXNzb3Ige1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZXZlbnROYW1lOiBzdHJpbmcsIHB1YmxpYyBnZXR0ZXI6IEZ1bmN0aW9uKSB7fVxuXG4gIHN1YnNjcmliZSh2aWV3OiBBcHBWaWV3LCBib3VuZEVsZW1lbnRJbmRleDogbnVtYmVyLCBkaXJlY3RpdmU6IE9iamVjdCk6IE9iamVjdCB7XG4gICAgdmFyIGV2ZW50RW1pdHRlciA9IHRoaXMuZ2V0dGVyKGRpcmVjdGl2ZSk7XG4gICAgcmV0dXJuIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZTxFdmVudD4oXG4gICAgICAgIGV2ZW50RW1pdHRlcixcbiAgICAgICAgZXZlbnRPYmogPT4gdmlldy50cmlnZ2VyRXZlbnRIYW5kbGVycyh0aGlzLmV2ZW50TmFtZSwgZXZlbnRPYmosIGJvdW5kRWxlbWVudEluZGV4KSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2NyZWF0ZUV2ZW50RW1pdHRlckFjY2Vzc29ycyhid3Y6IFByb3ZpZGVyV2l0aFZpc2liaWxpdHkpOiBFdmVudEVtaXR0ZXJBY2Nlc3NvcltdIHtcbiAgdmFyIHByb3ZpZGVyID0gYnd2LnByb3ZpZGVyO1xuICBpZiAoIShwcm92aWRlciBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyKSkgcmV0dXJuIFtdO1xuICB2YXIgZGIgPSA8RGlyZWN0aXZlUHJvdmlkZXI+cHJvdmlkZXI7XG4gIHJldHVybiBkYi5ldmVudEVtaXR0ZXJzLm1hcChldmVudENvbmZpZyA9PiB7XG4gICAgdmFyIHBhcnNlZEV2ZW50ID0gRXZlbnRDb25maWcucGFyc2UoZXZlbnRDb25maWcpO1xuICAgIHJldHVybiBuZXcgRXZlbnRFbWl0dGVyQWNjZXNzb3IocGFyc2VkRXZlbnQuZXZlbnROYW1lLCByZWZsZWN0b3IuZ2V0dGVyKHBhcnNlZEV2ZW50LmZpZWxkTmFtZSkpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gX2NyZWF0ZVByb3RvUXVlcnlSZWZzKHByb3ZpZGVyczogUHJvdmlkZXJXaXRoVmlzaWJpbGl0eVtdKTogUHJvdG9RdWVyeVJlZltdIHtcbiAgdmFyIHJlcyA9IFtdO1xuICBMaXN0V3JhcHBlci5mb3JFYWNoV2l0aEluZGV4KHByb3ZpZGVycywgKGIsIGkpID0+IHtcbiAgICBpZiAoYi5wcm92aWRlciBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyKSB7XG4gICAgICB2YXIgZGlyZWN0aXZlUHJvdmlkZXIgPSA8RGlyZWN0aXZlUHJvdmlkZXI+Yi5wcm92aWRlcjtcbiAgICAgIC8vIGZpZWxkIHF1ZXJpZXNcbiAgICAgIHZhciBxdWVyaWVzOiBRdWVyeU1ldGFkYXRhV2l0aFNldHRlcltdID0gZGlyZWN0aXZlUHJvdmlkZXIucXVlcmllcztcbiAgICAgIHF1ZXJpZXMuZm9yRWFjaChxID0+IHJlcy5wdXNoKG5ldyBQcm90b1F1ZXJ5UmVmKGksIHEuc2V0dGVyLCBxLm1ldGFkYXRhKSkpO1xuXG4gICAgICAvLyBxdWVyaWVzIHBhc3NlZCBpbnRvIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICAgIC8vIFRPRE86IHJlbW92ZSB0aGlzIGFmdGVyIGNvbnN0cnVjdG9yIHF1ZXJpZXMgYXJlIG5vIGxvbmdlciBzdXBwb3J0ZWRcbiAgICAgIHZhciBkZXBzOiBEaXJlY3RpdmVEZXBlbmRlbmN5W10gPVxuICAgICAgICAgIDxEaXJlY3RpdmVEZXBlbmRlbmN5W10+ZGlyZWN0aXZlUHJvdmlkZXIucmVzb2x2ZWRGYWN0b3J5LmRlcGVuZGVuY2llcztcbiAgICAgIGRlcHMuZm9yRWFjaChkID0+IHtcbiAgICAgICAgaWYgKGlzUHJlc2VudChkLnF1ZXJ5RGVjb3JhdG9yKSkgcmVzLnB1c2gobmV3IFByb3RvUXVlcnlSZWYoaSwgbnVsbCwgZC5xdWVyeURlY29yYXRvcikpO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHJlcztcbn1cblxuZXhwb3J0IGNsYXNzIFByb3RvRWxlbWVudEluamVjdG9yIHtcbiAgdmlldzogQXBwVmlldztcbiAgYXR0cmlidXRlczogTWFwPHN0cmluZywgc3RyaW5nPjtcbiAgZXZlbnRFbWl0dGVyQWNjZXNzb3JzOiBFdmVudEVtaXR0ZXJBY2Nlc3NvcltdW107XG4gIHByb3RvUXVlcnlSZWZzOiBQcm90b1F1ZXJ5UmVmW107XG4gIHByb3RvSW5qZWN0b3I6IFByb3RvSW5qZWN0b3I7XG5cbiAgc3RhdGljIGNyZWF0ZShwYXJlbnQ6IFByb3RvRWxlbWVudEluamVjdG9yLCBpbmRleDogbnVtYmVyLCBwcm92aWRlcnM6IERpcmVjdGl2ZVByb3ZpZGVyW10sXG4gICAgICAgICAgICAgICAgZmlyc3RQcm92aWRlcklzQ29tcG9uZW50OiBib29sZWFuLCBkaXN0YW5jZVRvUGFyZW50OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlVmFyaWFibGVCaW5kaW5nczogTWFwPHN0cmluZywgbnVtYmVyPik6IFByb3RvRWxlbWVudEluamVjdG9yIHtcbiAgICB2YXIgYmQgPSBbXTtcblxuICAgIFByb3RvRWxlbWVudEluamVjdG9yLl9jcmVhdGVEaXJlY3RpdmVQcm92aWRlcldpdGhWaXNpYmlsaXR5KHByb3ZpZGVycywgYmQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RQcm92aWRlcklzQ29tcG9uZW50KTtcbiAgICBpZiAoZmlyc3RQcm92aWRlcklzQ29tcG9uZW50KSB7XG4gICAgICBQcm90b0VsZW1lbnRJbmplY3Rvci5fY3JlYXRlVmlld1Byb3ZpZGVyc1dpdGhWaXNpYmlsaXR5KHByb3ZpZGVycywgYmQpO1xuICAgIH1cblxuICAgIFByb3RvRWxlbWVudEluamVjdG9yLl9jcmVhdGVQcm92aWRlcnNXaXRoVmlzaWJpbGl0eShwcm92aWRlcnMsIGJkKTtcbiAgICByZXR1cm4gbmV3IFByb3RvRWxlbWVudEluamVjdG9yKHBhcmVudCwgaW5kZXgsIGJkLCBkaXN0YW5jZVRvUGFyZW50LCBmaXJzdFByb3ZpZGVySXNDb21wb25lbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzKTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIF9jcmVhdGVEaXJlY3RpdmVQcm92aWRlcldpdGhWaXNpYmlsaXR5KGRpclByb3ZpZGVyczogRGlyZWN0aXZlUHJvdmlkZXJbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmQ6IFByb3ZpZGVyV2l0aFZpc2liaWxpdHlbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RQcm92aWRlcklzQ29tcG9uZW50OiBib29sZWFuKSB7XG4gICAgZGlyUHJvdmlkZXJzLmZvckVhY2goZGlyUHJvdmlkZXIgPT4ge1xuICAgICAgYmQucHVzaChQcm90b0VsZW1lbnRJbmplY3Rvci5fY3JlYXRlUHJvdmlkZXJXaXRoVmlzaWJpbGl0eShcbiAgICAgICAgICBmaXJzdFByb3ZpZGVySXNDb21wb25lbnQsIGRpclByb3ZpZGVyLCBkaXJQcm92aWRlcnMsIGRpclByb3ZpZGVyKSk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyBfY3JlYXRlUHJvdmlkZXJzV2l0aFZpc2liaWxpdHkoZGlyUHJvdmlkZXJzOiBEaXJlY3RpdmVQcm92aWRlcltdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmQ6IFByb3ZpZGVyV2l0aFZpc2liaWxpdHlbXSkge1xuICAgIHZhciBwcm92aWRlcnNGcm9tQWxsRGlyZWN0aXZlcyA9IFtdO1xuICAgIGRpclByb3ZpZGVycy5mb3JFYWNoKGRpclByb3ZpZGVyID0+IHtcbiAgICAgIHByb3ZpZGVyc0Zyb21BbGxEaXJlY3RpdmVzID1cbiAgICAgICAgICBMaXN0V3JhcHBlci5jb25jYXQocHJvdmlkZXJzRnJvbUFsbERpcmVjdGl2ZXMsIGRpclByb3ZpZGVyLnByb3ZpZGVycyk7XG4gICAgfSk7XG5cbiAgICB2YXIgcmVzb2x2ZWQgPSBJbmplY3Rvci5yZXNvbHZlKHByb3ZpZGVyc0Zyb21BbGxEaXJlY3RpdmVzKTtcbiAgICByZXNvbHZlZC5mb3JFYWNoKGIgPT4gYmQucHVzaChuZXcgUHJvdmlkZXJXaXRoVmlzaWJpbGl0eShiLCBWaXNpYmlsaXR5LlB1YmxpYykpKTtcbiAgfVxuXG4gIHByaXZhdGUgc3RhdGljIF9jcmVhdGVQcm92aWRlcldpdGhWaXNpYmlsaXR5KGZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudDogYm9vbGVhbixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyUHJvdmlkZXI6IERpcmVjdGl2ZVByb3ZpZGVyLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXJQcm92aWRlcnM6IERpcmVjdGl2ZVByb3ZpZGVyW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3ZpZGVyOiBSZXNvbHZlZFByb3ZpZGVyKSB7XG4gICAgdmFyIGlzQ29tcG9uZW50ID0gZmlyc3RQcm92aWRlcklzQ29tcG9uZW50ICYmIGRpclByb3ZpZGVyc1swXSA9PT0gZGlyUHJvdmlkZXI7XG4gICAgcmV0dXJuIG5ldyBQcm92aWRlcldpdGhWaXNpYmlsaXR5KFxuICAgICAgICBwcm92aWRlciwgaXNDb21wb25lbnQgPyBWaXNpYmlsaXR5LlB1YmxpY0FuZFByaXZhdGUgOiBWaXNpYmlsaXR5LlB1YmxpYyk7XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyBfY3JlYXRlVmlld1Byb3ZpZGVyc1dpdGhWaXNpYmlsaXR5KGRpclByb3ZpZGVyczogRGlyZWN0aXZlUHJvdmlkZXJbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiZDogUHJvdmlkZXJXaXRoVmlzaWJpbGl0eVtdKSB7XG4gICAgdmFyIHJlc29sdmVkVmlld1Byb3ZpZGVycyA9IEluamVjdG9yLnJlc29sdmUoZGlyUHJvdmlkZXJzWzBdLnZpZXdQcm92aWRlcnMpO1xuICAgIHJlc29sdmVkVmlld1Byb3ZpZGVycy5mb3JFYWNoKGIgPT4gYmQucHVzaChuZXcgUHJvdmlkZXJXaXRoVmlzaWJpbGl0eShiLCBWaXNpYmlsaXR5LlByaXZhdGUpKSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHB1YmxpYyBfZmlyc3RQcm92aWRlcklzQ29tcG9uZW50OiBib29sZWFuO1xuXG5cbiAgY29uc3RydWN0b3IocHVibGljIHBhcmVudDogUHJvdG9FbGVtZW50SW5qZWN0b3IsIHB1YmxpYyBpbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICBid3Y6IFByb3ZpZGVyV2l0aFZpc2liaWxpdHlbXSwgcHVibGljIGRpc3RhbmNlVG9QYXJlbnQ6IG51bWJlcixcbiAgICAgICAgICAgICAgX2ZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudDogYm9vbGVhbixcbiAgICAgICAgICAgICAgcHVibGljIGRpcmVjdGl2ZVZhcmlhYmxlQmluZGluZ3M6IE1hcDxzdHJpbmcsIG51bWJlcj4pIHtcbiAgICB0aGlzLl9maXJzdFByb3ZpZGVySXNDb21wb25lbnQgPSBfZmlyc3RQcm92aWRlcklzQ29tcG9uZW50O1xuICAgIHZhciBsZW5ndGggPSBid3YubGVuZ3RoO1xuICAgIHRoaXMucHJvdG9JbmplY3RvciA9IG5ldyBQcm90b0luamVjdG9yKGJ3dik7XG4gICAgdGhpcy5ldmVudEVtaXR0ZXJBY2Nlc3NvcnMgPSBMaXN0V3JhcHBlci5jcmVhdGVGaXhlZFNpemUobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgICB0aGlzLmV2ZW50RW1pdHRlckFjY2Vzc29yc1tpXSA9IF9jcmVhdGVFdmVudEVtaXR0ZXJBY2Nlc3NvcnMoYnd2W2ldKTtcbiAgICB9XG4gICAgdGhpcy5wcm90b1F1ZXJ5UmVmcyA9IF9jcmVhdGVQcm90b1F1ZXJ5UmVmcyhid3YpO1xuICB9XG5cbiAgaW5zdGFudGlhdGUocGFyZW50OiBFbGVtZW50SW5qZWN0b3IpOiBFbGVtZW50SW5qZWN0b3Ige1xuICAgIHJldHVybiBuZXcgRWxlbWVudEluamVjdG9yKHRoaXMsIHBhcmVudCk7XG4gIH1cblxuICBkaXJlY3RQYXJlbnQoKTogUHJvdG9FbGVtZW50SW5qZWN0b3IgeyByZXR1cm4gdGhpcy5kaXN0YW5jZVRvUGFyZW50IDwgMiA/IHRoaXMucGFyZW50IDogbnVsbDsgfVxuXG4gIGdldCBoYXNCaW5kaW5ncygpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuZXZlbnRFbWl0dGVyQWNjZXNzb3JzLmxlbmd0aCA+IDA7IH1cblxuICBnZXRQcm92aWRlckF0SW5kZXgoaW5kZXg6IG51bWJlcik6IGFueSB7IHJldHVybiB0aGlzLnByb3RvSW5qZWN0b3IuZ2V0UHJvdmlkZXJBdEluZGV4KGluZGV4KTsgfVxufVxuXG5jbGFzcyBfQ29udGV4dCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBlbGVtZW50OiBhbnksIHB1YmxpYyBjb21wb25lbnRFbGVtZW50OiBhbnksIHB1YmxpYyBpbmplY3RvcjogYW55KSB7fVxufVxuXG5leHBvcnQgY2xhc3MgRWxlbWVudEluamVjdG9yIGV4dGVuZHMgVHJlZU5vZGU8RWxlbWVudEluamVjdG9yPiBpbXBsZW1lbnRzIERlcGVuZGVuY3lQcm92aWRlcixcbiAgICBBZnRlclZpZXdDaGVja2VkIHtcbiAgcHJpdmF0ZSBfaG9zdDogRWxlbWVudEluamVjdG9yO1xuICBwcml2YXRlIF9wcmVCdWlsdE9iamVjdHM6IFByZUJ1aWx0T2JqZWN0cyA9IG51bGw7XG4gIHByaXZhdGUgX3F1ZXJ5U3RyYXRlZ3k6IF9RdWVyeVN0cmF0ZWd5O1xuXG4gIGh5ZHJhdGVkOiBib29sZWFuO1xuXG4gIHByaXZhdGUgX2luamVjdG9yOiBJbmplY3RvcjtcbiAgcHJpdmF0ZSBfc3RyYXRlZ3k6IF9FbGVtZW50SW5qZWN0b3JTdHJhdGVneTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwdWJsaWMgX3Byb3RvOiBQcm90b0VsZW1lbnRJbmplY3RvcjtcblxuICBjb25zdHJ1Y3RvcihfcHJvdG86IFByb3RvRWxlbWVudEluamVjdG9yLCBwYXJlbnQ6IEVsZW1lbnRJbmplY3Rvcikge1xuICAgIHN1cGVyKHBhcmVudCk7XG4gICAgdGhpcy5fcHJvdG8gPSBfcHJvdG87XG4gICAgdGhpcy5faW5qZWN0b3IgPVxuICAgICAgICBuZXcgSW5qZWN0b3IodGhpcy5fcHJvdG8ucHJvdG9JbmplY3RvciwgbnVsbCwgdGhpcywgKCkgPT4gdGhpcy5fZGVidWdDb250ZXh0KCkpO1xuXG4gICAgLy8gd2UgY291cGxlIG91cnNlbHZlcyB0byB0aGUgaW5qZWN0b3Igc3RyYXRlZ3kgdG8gYXZvaWQgcG9seW1vcHJoaWMgY2FsbHNcbiAgICB2YXIgaW5qZWN0b3JTdHJhdGVneSA9IDxhbnk+dGhpcy5faW5qZWN0b3IuaW50ZXJuYWxTdHJhdGVneTtcbiAgICB0aGlzLl9zdHJhdGVneSA9IGluamVjdG9yU3RyYXRlZ3kgaW5zdGFuY2VvZiBJbmplY3RvcklubGluZVN0cmF0ZWd5ID9cbiAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRWxlbWVudEluamVjdG9ySW5saW5lU3RyYXRlZ3koaW5qZWN0b3JTdHJhdGVneSwgdGhpcykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBFbGVtZW50SW5qZWN0b3JEeW5hbWljU3RyYXRlZ3koaW5qZWN0b3JTdHJhdGVneSwgdGhpcyk7XG5cbiAgICB0aGlzLmh5ZHJhdGVkID0gZmFsc2U7XG5cbiAgICB0aGlzLl9xdWVyeVN0cmF0ZWd5ID0gdGhpcy5fYnVpbGRRdWVyeVN0cmF0ZWd5KCk7XG4gIH1cblxuICBkZWh5ZHJhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5oeWRyYXRlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2hvc3QgPSBudWxsO1xuICAgIHRoaXMuX3ByZUJ1aWx0T2JqZWN0cyA9IG51bGw7XG4gICAgdGhpcy5fc3RyYXRlZ3kuY2FsbE9uRGVzdHJveSgpO1xuICAgIHRoaXMuX3N0cmF0ZWd5LmRlaHlkcmF0ZSgpO1xuICAgIHRoaXMuX3F1ZXJ5U3RyYXRlZ3kuZGVoeWRyYXRlKCk7XG4gIH1cblxuICBoeWRyYXRlKGltcGVyYXRpdmVseUNyZWF0ZWRJbmplY3RvcjogSW5qZWN0b3IsIGhvc3Q6IEVsZW1lbnRJbmplY3RvcixcbiAgICAgICAgICBwcmVCdWlsdE9iamVjdHM6IFByZUJ1aWx0T2JqZWN0cyk6IHZvaWQge1xuICAgIHRoaXMuX2hvc3QgPSBob3N0O1xuICAgIHRoaXMuX3ByZUJ1aWx0T2JqZWN0cyA9IHByZUJ1aWx0T2JqZWN0cztcblxuICAgIHRoaXMuX3JlYXR0YWNoSW5qZWN0b3JzKGltcGVyYXRpdmVseUNyZWF0ZWRJbmplY3Rvcik7XG4gICAgdGhpcy5fcXVlcnlTdHJhdGVneS5oeWRyYXRlKCk7XG4gICAgdGhpcy5fc3RyYXRlZ3kuaHlkcmF0ZSgpO1xuXG4gICAgdGhpcy5oeWRyYXRlZCA9IHRydWU7XG4gIH1cblxuICBwcml2YXRlIF9kZWJ1Z0NvbnRleHQoKTogYW55IHtcbiAgICB2YXIgcCA9IHRoaXMuX3ByZUJ1aWx0T2JqZWN0cztcbiAgICB2YXIgaW5kZXggPSBwLmVsZW1lbnRSZWYuYm91bmRFbGVtZW50SW5kZXggLSBwLnZpZXcuZWxlbWVudE9mZnNldDtcbiAgICB2YXIgYyA9IHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy52aWV3LmdldERlYnVnQ29udGV4dChpbmRleCwgbnVsbCk7XG4gICAgcmV0dXJuIGlzUHJlc2VudChjKSA/IG5ldyBfQ29udGV4dChjLmVsZW1lbnQsIGMuY29tcG9uZW50RWxlbWVudCwgYy5pbmplY3RvcikgOiBudWxsO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVhdHRhY2hJbmplY3RvcnMoaW1wZXJhdGl2ZWx5Q3JlYXRlZEluamVjdG9yOiBJbmplY3Rvcik6IHZvaWQge1xuICAgIC8vIER5bmFtaWNhbGx5LWxvYWRlZCBjb21wb25lbnQgaW4gdGhlIHRlbXBsYXRlLiBOb3QgYSByb290IEVsZW1lbnRJbmplY3Rvci5cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3BhcmVudCkpIHtcbiAgICAgIGlmIChpc1ByZXNlbnQoaW1wZXJhdGl2ZWx5Q3JlYXRlZEluamVjdG9yKSkge1xuICAgICAgICAvLyBUaGUgaW1wZXJhdGl2ZSBpbmplY3RvciBpcyBzaW1pbGFyIHRvIGhhdmluZyBhbiBlbGVtZW50IGJldHdlZW5cbiAgICAgICAgLy8gdGhlIGR5bmFtaWMtbG9hZGVkIGNvbXBvbmVudCBhbmQgaXRzIHBhcmVudCA9PiBubyBib3VuZGFyaWVzLlxuICAgICAgICB0aGlzLl9yZWF0dGFjaEluamVjdG9yKHRoaXMuX2luamVjdG9yLCBpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5fcmVhdHRhY2hJbmplY3RvcihpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IsIHRoaXMuX3BhcmVudC5faW5qZWN0b3IsIGZhbHNlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3JlYXR0YWNoSW5qZWN0b3IodGhpcy5faW5qZWN0b3IsIHRoaXMuX3BhcmVudC5faW5qZWN0b3IsIGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgLy8gRHluYW1pY2FsbHktbG9hZGVkIGNvbXBvbmVudCBpbiB0aGUgdGVtcGxhdGUuIEEgcm9vdCBFbGVtZW50SW5qZWN0b3IuXG4gICAgfSBlbHNlIGlmIChpc1ByZXNlbnQodGhpcy5faG9zdCkpIHtcbiAgICAgIC8vIFRoZSBpbXBlcmF0aXZlIGluamVjdG9yIGlzIHNpbWlsYXIgdG8gaGF2aW5nIGFuIGVsZW1lbnQgYmV0d2VlblxuICAgICAgLy8gdGhlIGR5bmFtaWMtbG9hZGVkIGNvbXBvbmVudCBhbmQgaXRzIHBhcmVudCA9PiBubyBib3VuZGFyeSBiZXR3ZWVuXG4gICAgICAvLyB0aGUgY29tcG9uZW50IGFuZCBpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IuXG4gICAgICAvLyBCdXQgc2luY2UgaXQgaXMgYSByb290IEVsZW1lbnRJbmplY3Rvciwgd2UgbmVlZCB0byBjcmVhdGUgYSBib3VuZGFyeVxuICAgICAgLy8gYmV0d2VlbiBpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IgYW5kIF9ob3N0LlxuICAgICAgaWYgKGlzUHJlc2VudChpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IpKSB7XG4gICAgICAgIHRoaXMuX3JlYXR0YWNoSW5qZWN0b3IodGhpcy5faW5qZWN0b3IsIGltcGVyYXRpdmVseUNyZWF0ZWRJbmplY3RvciwgZmFsc2UpO1xuICAgICAgICB0aGlzLl9yZWF0dGFjaEluamVjdG9yKGltcGVyYXRpdmVseUNyZWF0ZWRJbmplY3RvciwgdGhpcy5faG9zdC5faW5qZWN0b3IsIHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcmVhdHRhY2hJbmplY3Rvcih0aGlzLl9pbmplY3RvciwgdGhpcy5faG9zdC5faW5qZWN0b3IsIHRydWUpO1xuICAgICAgfVxuXG4gICAgICAvLyBCb290c3RyYXBcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGlzUHJlc2VudChpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IpKSB7XG4gICAgICAgIHRoaXMuX3JlYXR0YWNoSW5qZWN0b3IodGhpcy5faW5qZWN0b3IsIGltcGVyYXRpdmVseUNyZWF0ZWRJbmplY3RvciwgdHJ1ZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfcmVhdHRhY2hJbmplY3RvcihpbmplY3RvcjogSW5qZWN0b3IsIHBhcmVudEluamVjdG9yOiBJbmplY3RvciwgaXNCb3VuZGFyeTogYm9vbGVhbikge1xuICAgIGluamVjdG9yLmludGVybmFsU3RyYXRlZ3kuYXR0YWNoKHBhcmVudEluamVjdG9yLCBpc0JvdW5kYXJ5KTtcbiAgfVxuXG4gIGhhc1ZhcmlhYmxlQmluZGluZyhuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB2YXIgdmIgPSB0aGlzLl9wcm90by5kaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzO1xuICAgIHJldHVybiBpc1ByZXNlbnQodmIpICYmIHZiLmhhcyhuYW1lKTtcbiAgfVxuXG4gIGdldFZhcmlhYmxlQmluZGluZyhuYW1lOiBzdHJpbmcpOiBhbnkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuX3Byb3RvLmRpcmVjdGl2ZVZhcmlhYmxlQmluZGluZ3MuZ2V0KG5hbWUpO1xuICAgIHJldHVybiBpc1ByZXNlbnQoaW5kZXgpID8gdGhpcy5nZXREaXJlY3RpdmVBdEluZGV4KDxudW1iZXI+aW5kZXgpIDogdGhpcy5nZXRFbGVtZW50UmVmKCk7XG4gIH1cblxuICBnZXQodG9rZW46IGFueSk6IGFueSB7IHJldHVybiB0aGlzLl9pbmplY3Rvci5nZXQodG9rZW4pOyB9XG5cbiAgaGFzRGlyZWN0aXZlKHR5cGU6IFR5cGUpOiBib29sZWFuIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9pbmplY3Rvci5nZXRPcHRpb25hbCh0eXBlKSk7IH1cblxuICBnZXRFdmVudEVtaXR0ZXJBY2Nlc3NvcnMoKTogRXZlbnRFbWl0dGVyQWNjZXNzb3JbXVtdIHsgcmV0dXJuIHRoaXMuX3Byb3RvLmV2ZW50RW1pdHRlckFjY2Vzc29yczsgfVxuXG4gIGdldERpcmVjdGl2ZVZhcmlhYmxlQmluZGluZ3MoKTogTWFwPHN0cmluZywgbnVtYmVyPiB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3RvLmRpcmVjdGl2ZVZhcmlhYmxlQmluZGluZ3M7XG4gIH1cblxuICBnZXRDb21wb25lbnQoKTogYW55IHsgcmV0dXJuIHRoaXMuX3N0cmF0ZWd5LmdldENvbXBvbmVudCgpOyB9XG5cbiAgZ2V0SW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gdGhpcy5faW5qZWN0b3I7IH1cblxuICBnZXRFbGVtZW50UmVmKCk6IEVsZW1lbnRSZWYgeyByZXR1cm4gdGhpcy5fcHJlQnVpbHRPYmplY3RzLmVsZW1lbnRSZWY7IH1cblxuICBnZXRWaWV3Q29udGFpbmVyUmVmKCk6IFZpZXdDb250YWluZXJSZWYge1xuICAgIHJldHVybiBuZXcgVmlld0NvbnRhaW5lclJlZl8odGhpcy5fcHJlQnVpbHRPYmplY3RzLnZpZXdNYW5hZ2VyLCB0aGlzLmdldEVsZW1lbnRSZWYoKSk7XG4gIH1cblxuICBnZXROZXN0ZWRWaWV3KCk6IEFwcFZpZXcgeyByZXR1cm4gdGhpcy5fcHJlQnVpbHRPYmplY3RzLm5lc3RlZFZpZXc7IH1cblxuICBnZXRWaWV3KCk6IEFwcFZpZXcgeyByZXR1cm4gdGhpcy5fcHJlQnVpbHRPYmplY3RzLnZpZXc7IH1cblxuICBkaXJlY3RQYXJlbnQoKTogRWxlbWVudEluamVjdG9yIHsgcmV0dXJuIHRoaXMuX3Byb3RvLmRpc3RhbmNlVG9QYXJlbnQgPCAyID8gdGhpcy5wYXJlbnQgOiBudWxsOyB9XG5cbiAgaXNDb21wb25lbnRLZXkoa2V5OiBLZXkpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3N0cmF0ZWd5LmlzQ29tcG9uZW50S2V5KGtleSk7IH1cblxuICBnZXREZXBlbmRlbmN5KGluamVjdG9yOiBJbmplY3RvciwgcHJvdmlkZXI6IFJlc29sdmVkUHJvdmlkZXIsIGRlcDogRGVwZW5kZW5jeSk6IGFueSB7XG4gICAgdmFyIGtleTogS2V5ID0gZGVwLmtleTtcblxuICAgIGlmIChwcm92aWRlciBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyKSB7XG4gICAgICB2YXIgZGlyRGVwID0gPERpcmVjdGl2ZURlcGVuZGVuY3k+ZGVwO1xuICAgICAgdmFyIGRpclByb3ZpZGVyID0gcHJvdmlkZXI7XG4gICAgICB2YXIgc3RhdGljS2V5cyA9IFN0YXRpY0tleXMuaW5zdGFuY2UoKTtcblxuXG4gICAgICBpZiAoa2V5LmlkID09PSBzdGF0aWNLZXlzLnZpZXdNYW5hZ2VySWQpIHJldHVybiB0aGlzLl9wcmVCdWlsdE9iamVjdHMudmlld01hbmFnZXI7XG5cbiAgICAgIGlmIChpc1ByZXNlbnQoZGlyRGVwLmF0dHJpYnV0ZU5hbWUpKSByZXR1cm4gdGhpcy5fYnVpbGRBdHRyaWJ1dGUoZGlyRGVwKTtcblxuICAgICAgaWYgKGlzUHJlc2VudChkaXJEZXAucXVlcnlEZWNvcmF0b3IpKVxuICAgICAgICByZXR1cm4gdGhpcy5fcXVlcnlTdHJhdGVneS5maW5kUXVlcnkoZGlyRGVwLnF1ZXJ5RGVjb3JhdG9yKS5saXN0O1xuXG4gICAgICBpZiAoZGlyRGVwLmtleS5pZCA9PT0gU3RhdGljS2V5cy5pbnN0YW5jZSgpLmNoYW5nZURldGVjdG9yUmVmSWQpIHtcbiAgICAgICAgLy8gV2UgcHJvdmlkZSB0aGUgY29tcG9uZW50J3MgdmlldyBjaGFuZ2UgZGV0ZWN0b3IgdG8gY29tcG9uZW50cyBhbmRcbiAgICAgICAgLy8gdGhlIHN1cnJvdW5kaW5nIGNvbXBvbmVudCdzIGNoYW5nZSBkZXRlY3RvciB0byBkaXJlY3RpdmVzLlxuICAgICAgICBpZiAoZGlyUHJvdmlkZXIubWV0YWRhdGEgaW5zdGFuY2VvZiBDb21wb25lbnRNZXRhZGF0YSkge1xuICAgICAgICAgIHZhciBjb21wb25lbnRWaWV3ID0gdGhpcy5fcHJlQnVpbHRPYmplY3RzLnZpZXcuZ2V0TmVzdGVkVmlldyhcbiAgICAgICAgICAgICAgdGhpcy5fcHJlQnVpbHRPYmplY3RzLmVsZW1lbnRSZWYuYm91bmRFbGVtZW50SW5kZXgpO1xuICAgICAgICAgIHJldHVybiBjb21wb25lbnRWaWV3LmNoYW5nZURldGVjdG9yLnJlZjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fcHJlQnVpbHRPYmplY3RzLnZpZXcuY2hhbmdlRGV0ZWN0b3IucmVmO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChkaXJEZXAua2V5LmlkID09PSBTdGF0aWNLZXlzLmluc3RhbmNlKCkuZWxlbWVudFJlZklkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEVsZW1lbnRSZWYoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRpckRlcC5rZXkuaWQgPT09IFN0YXRpY0tleXMuaW5zdGFuY2UoKS52aWV3Q29udGFpbmVySWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Vmlld0NvbnRhaW5lclJlZigpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGlyRGVwLmtleS5pZCA9PT0gU3RhdGljS2V5cy5pbnN0YW5jZSgpLnRlbXBsYXRlUmVmSWQpIHtcbiAgICAgICAgaWYgKGlzQmxhbmsodGhpcy5fcHJlQnVpbHRPYmplY3RzLnRlbXBsYXRlUmVmKSkge1xuICAgICAgICAgIGlmIChkaXJEZXAub3B0aW9uYWwpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRocm93IG5ldyBOb1Byb3ZpZGVyRXJyb3IobnVsbCwgZGlyRGVwLmtleSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy50ZW1wbGF0ZVJlZjtcbiAgICAgIH1cblxuICAgIH0gZWxzZSBpZiAocHJvdmlkZXIgaW5zdGFuY2VvZiBQaXBlUHJvdmlkZXIpIHtcbiAgICAgIGlmIChkZXAua2V5LmlkID09PSBTdGF0aWNLZXlzLmluc3RhbmNlKCkuY2hhbmdlRGV0ZWN0b3JSZWZJZCkge1xuICAgICAgICB2YXIgY29tcG9uZW50VmlldyA9IHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy52aWV3LmdldE5lc3RlZFZpZXcoXG4gICAgICAgICAgICB0aGlzLl9wcmVCdWlsdE9iamVjdHMuZWxlbWVudFJlZi5ib3VuZEVsZW1lbnRJbmRleCk7XG4gICAgICAgIHJldHVybiBjb21wb25lbnRWaWV3LmNoYW5nZURldGVjdG9yLnJlZjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gVU5ERUZJTkVEO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRBdHRyaWJ1dGUoZGVwOiBEaXJlY3RpdmVEZXBlbmRlbmN5KTogc3RyaW5nIHtcbiAgICB2YXIgYXR0cmlidXRlcyA9IHRoaXMuX3Byb3RvLmF0dHJpYnV0ZXM7XG4gICAgaWYgKGlzUHJlc2VudChhdHRyaWJ1dGVzKSAmJiBhdHRyaWJ1dGVzLmhhcyhkZXAuYXR0cmlidXRlTmFtZSkpIHtcbiAgICAgIHJldHVybiBhdHRyaWJ1dGVzLmdldChkZXAuYXR0cmlidXRlTmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5KHF1ZXJ5OiBRdWVyeU1ldGFkYXRhLCBsaXN0OiBhbnlbXSk6IHZvaWQge1xuICAgIHZhciB0ZW1wbGF0ZVJlZiA9IGlzQmxhbmsodGhpcy5fcHJlQnVpbHRPYmplY3RzKSA/IG51bGwgOiB0aGlzLl9wcmVCdWlsdE9iamVjdHMudGVtcGxhdGVSZWY7XG4gICAgaWYgKHF1ZXJ5LnNlbGVjdG9yID09PSBUZW1wbGF0ZVJlZiAmJiBpc1ByZXNlbnQodGVtcGxhdGVSZWYpKSB7XG4gICAgICBsaXN0LnB1c2godGVtcGxhdGVSZWYpO1xuICAgIH1cbiAgICB0aGlzLl9zdHJhdGVneS5hZGREaXJlY3RpdmVzTWF0Y2hpbmdRdWVyeShxdWVyeSwgbGlzdCk7XG4gIH1cblxuICBwcml2YXRlIF9idWlsZFF1ZXJ5U3RyYXRlZ3koKTogX1F1ZXJ5U3RyYXRlZ3kge1xuICAgIGlmICh0aGlzLl9wcm90by5wcm90b1F1ZXJ5UmVmcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBfZW1wdHlRdWVyeVN0cmF0ZWd5O1xuICAgIH0gZWxzZSBpZiAodGhpcy5fcHJvdG8ucHJvdG9RdWVyeVJlZnMubGVuZ3RoIDw9XG4gICAgICAgICAgICAgICBJbmxpbmVRdWVyeVN0cmF0ZWd5Lk5VTUJFUl9PRl9TVVBQT1JURURfUVVFUklFUykge1xuICAgICAgcmV0dXJuIG5ldyBJbmxpbmVRdWVyeVN0cmF0ZWd5KHRoaXMpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IER5bmFtaWNRdWVyeVN0cmF0ZWd5KHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIGxpbmsocGFyZW50OiBFbGVtZW50SW5qZWN0b3IpOiB2b2lkIHsgcGFyZW50LmFkZENoaWxkKHRoaXMpOyB9XG5cbiAgdW5saW5rKCk6IHZvaWQgeyB0aGlzLnJlbW92ZSgpOyB9XG5cbiAgZ2V0RGlyZWN0aXZlQXRJbmRleChpbmRleDogbnVtYmVyKTogYW55IHsgcmV0dXJuIHRoaXMuX2luamVjdG9yLmdldEF0KGluZGV4KTsgfVxuXG4gIGhhc0luc3RhbmNlcygpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX3Byb3RvLmhhc0JpbmRpbmdzICYmIHRoaXMuaHlkcmF0ZWQ7IH1cblxuICBnZXRIb3N0KCk6IEVsZW1lbnRJbmplY3RvciB7IHJldHVybiB0aGlzLl9ob3N0OyB9XG5cbiAgZ2V0Qm91bmRFbGVtZW50SW5kZXgoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3Byb3RvLmluZGV4OyB9XG5cbiAgZ2V0Um9vdFZpZXdJbmplY3RvcnMoKTogRWxlbWVudEluamVjdG9yW10ge1xuICAgIGlmICghdGhpcy5oeWRyYXRlZCkgcmV0dXJuIFtdO1xuICAgIHZhciB2aWV3ID0gdGhpcy5fcHJlQnVpbHRPYmplY3RzLnZpZXc7XG4gICAgdmFyIG5lc3RlZFZpZXcgPSB2aWV3LmdldE5lc3RlZFZpZXcodmlldy5lbGVtZW50T2Zmc2V0ICsgdGhpcy5nZXRCb3VuZEVsZW1lbnRJbmRleCgpKTtcbiAgICByZXR1cm4gaXNQcmVzZW50KG5lc3RlZFZpZXcpID8gbmVzdGVkVmlldy5yb290RWxlbWVudEluamVjdG9ycyA6IFtdO1xuICB9XG5cbiAgbmdBZnRlclZpZXdDaGVja2VkKCk6IHZvaWQgeyB0aGlzLl9xdWVyeVN0cmF0ZWd5LnVwZGF0ZVZpZXdRdWVyaWVzKCk7IH1cblxuICBuZ0FmdGVyQ29udGVudENoZWNrZWQoKTogdm9pZCB7IHRoaXMuX3F1ZXJ5U3RyYXRlZ3kudXBkYXRlQ29udGVudFF1ZXJpZXMoKTsgfVxuXG4gIHRyYXZlcnNlQW5kU2V0UXVlcmllc0FzRGlydHkoKTogdm9pZCB7XG4gICAgdmFyIGluajogRWxlbWVudEluamVjdG9yID0gdGhpcztcbiAgICB3aGlsZSAoaXNQcmVzZW50KGluaikpIHtcbiAgICAgIGluai5fc2V0UXVlcmllc0FzRGlydHkoKTtcbiAgICAgIGluaiA9IGluai5wYXJlbnQ7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfc2V0UXVlcmllc0FzRGlydHkoKTogdm9pZCB7XG4gICAgdGhpcy5fcXVlcnlTdHJhdGVneS5zZXRDb250ZW50UXVlcmllc0FzRGlydHkoKTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX2hvc3QpKSB0aGlzLl9ob3N0Ll9xdWVyeVN0cmF0ZWd5LnNldFZpZXdRdWVyaWVzQXNEaXJ0eSgpO1xuICB9XG59XG5cbmludGVyZmFjZSBfUXVlcnlTdHJhdGVneSB7XG4gIHNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkO1xuICBzZXRWaWV3UXVlcmllc0FzRGlydHkoKTogdm9pZDtcbiAgaHlkcmF0ZSgpOiB2b2lkO1xuICBkZWh5ZHJhdGUoKTogdm9pZDtcbiAgdXBkYXRlQ29udGVudFF1ZXJpZXMoKTogdm9pZDtcbiAgdXBkYXRlVmlld1F1ZXJpZXMoKTogdm9pZDtcbiAgZmluZFF1ZXJ5KHF1ZXJ5OiBRdWVyeU1ldGFkYXRhKTogUXVlcnlSZWY7XG59XG5cbmNsYXNzIF9FbXB0eVF1ZXJ5U3RyYXRlZ3kgaW1wbGVtZW50cyBfUXVlcnlTdHJhdGVneSB7XG4gIHNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHt9XG4gIHNldFZpZXdRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHt9XG4gIGh5ZHJhdGUoKTogdm9pZCB7fVxuICBkZWh5ZHJhdGUoKTogdm9pZCB7fVxuICB1cGRhdGVDb250ZW50UXVlcmllcygpOiB2b2lkIHt9XG4gIHVwZGF0ZVZpZXdRdWVyaWVzKCk6IHZvaWQge31cbiAgZmluZFF1ZXJ5KHF1ZXJ5OiBRdWVyeU1ldGFkYXRhKTogUXVlcnlSZWYge1xuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW5ub3QgZmluZCBxdWVyeSBmb3IgZGlyZWN0aXZlICR7cXVlcnl9LmApO1xuICB9XG59XG5cbnZhciBfZW1wdHlRdWVyeVN0cmF0ZWd5ID0gbmV3IF9FbXB0eVF1ZXJ5U3RyYXRlZ3koKTtcblxuY2xhc3MgSW5saW5lUXVlcnlTdHJhdGVneSBpbXBsZW1lbnRzIF9RdWVyeVN0cmF0ZWd5IHtcbiAgc3RhdGljIE5VTUJFUl9PRl9TVVBQT1JURURfUVVFUklFUyA9IDM7XG5cbiAgcXVlcnkwOiBRdWVyeVJlZjtcbiAgcXVlcnkxOiBRdWVyeVJlZjtcbiAgcXVlcnkyOiBRdWVyeVJlZjtcblxuICBjb25zdHJ1Y3RvcihlaTogRWxlbWVudEluamVjdG9yKSB7XG4gICAgdmFyIHByb3RvUmVmcyA9IGVpLl9wcm90by5wcm90b1F1ZXJ5UmVmcztcbiAgICBpZiAocHJvdG9SZWZzLmxlbmd0aCA+IDApIHRoaXMucXVlcnkwID0gbmV3IFF1ZXJ5UmVmKHByb3RvUmVmc1swXSwgZWkpO1xuICAgIGlmIChwcm90b1JlZnMubGVuZ3RoID4gMSkgdGhpcy5xdWVyeTEgPSBuZXcgUXVlcnlSZWYocHJvdG9SZWZzWzFdLCBlaSk7XG4gICAgaWYgKHByb3RvUmVmcy5sZW5ndGggPiAyKSB0aGlzLnF1ZXJ5MiA9IG5ldyBRdWVyeVJlZihwcm90b1JlZnNbMl0sIGVpKTtcbiAgfVxuXG4gIHNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkwKSAmJiAhdGhpcy5xdWVyeTAuaXNWaWV3UXVlcnkpIHRoaXMucXVlcnkwLmRpcnR5ID0gdHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkxKSAmJiAhdGhpcy5xdWVyeTEuaXNWaWV3UXVlcnkpIHRoaXMucXVlcnkxLmRpcnR5ID0gdHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkyKSAmJiAhdGhpcy5xdWVyeTIuaXNWaWV3UXVlcnkpIHRoaXMucXVlcnkyLmRpcnR5ID0gdHJ1ZTtcbiAgfVxuXG4gIHNldFZpZXdRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkwKSAmJiB0aGlzLnF1ZXJ5MC5pc1ZpZXdRdWVyeSkgdGhpcy5xdWVyeTAuZGlydHkgPSB0cnVlO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTEpICYmIHRoaXMucXVlcnkxLmlzVmlld1F1ZXJ5KSB0aGlzLnF1ZXJ5MS5kaXJ0eSA9IHRydWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MikgJiYgdGhpcy5xdWVyeTIuaXNWaWV3UXVlcnkpIHRoaXMucXVlcnkyLmRpcnR5ID0gdHJ1ZTtcbiAgfVxuXG4gIGh5ZHJhdGUoKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MCkpIHRoaXMucXVlcnkwLmh5ZHJhdGUoKTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkxKSkgdGhpcy5xdWVyeTEuaHlkcmF0ZSgpO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTIpKSB0aGlzLnF1ZXJ5Mi5oeWRyYXRlKCk7XG4gIH1cblxuICBkZWh5ZHJhdGUoKTogdm9pZCB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MCkpIHRoaXMucXVlcnkwLmRlaHlkcmF0ZSgpO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTEpKSB0aGlzLnF1ZXJ5MS5kZWh5ZHJhdGUoKTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkyKSkgdGhpcy5xdWVyeTIuZGVoeWRyYXRlKCk7XG4gIH1cblxuICB1cGRhdGVDb250ZW50UXVlcmllcygpIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkwKSAmJiAhdGhpcy5xdWVyeTAuaXNWaWV3UXVlcnkpIHtcbiAgICAgIHRoaXMucXVlcnkwLnVwZGF0ZSgpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkxKSAmJiAhdGhpcy5xdWVyeTEuaXNWaWV3UXVlcnkpIHtcbiAgICAgIHRoaXMucXVlcnkxLnVwZGF0ZSgpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkyKSAmJiAhdGhpcy5xdWVyeTIuaXNWaWV3UXVlcnkpIHtcbiAgICAgIHRoaXMucXVlcnkyLnVwZGF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVZpZXdRdWVyaWVzKCkge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTApICYmIHRoaXMucXVlcnkwLmlzVmlld1F1ZXJ5KSB7XG4gICAgICB0aGlzLnF1ZXJ5MC51cGRhdGUoKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MSkgJiYgdGhpcy5xdWVyeTEuaXNWaWV3UXVlcnkpIHtcbiAgICAgIHRoaXMucXVlcnkxLnVwZGF0ZSgpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkyKSAmJiB0aGlzLnF1ZXJ5Mi5pc1ZpZXdRdWVyeSkge1xuICAgICAgdGhpcy5xdWVyeTIudXBkYXRlKCk7XG4gICAgfVxuICB9XG5cbiAgZmluZFF1ZXJ5KHF1ZXJ5OiBRdWVyeU1ldGFkYXRhKTogUXVlcnlSZWYge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTApICYmIHRoaXMucXVlcnkwLnByb3RvUXVlcnlSZWYucXVlcnkgPT09IHF1ZXJ5KSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWVyeTA7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTEpICYmIHRoaXMucXVlcnkxLnByb3RvUXVlcnlSZWYucXVlcnkgPT09IHF1ZXJ5KSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWVyeTE7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTIpICYmIHRoaXMucXVlcnkyLnByb3RvUXVlcnlSZWYucXVlcnkgPT09IHF1ZXJ5KSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWVyeTI7XG4gICAgfVxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW5ub3QgZmluZCBxdWVyeSBmb3IgZGlyZWN0aXZlICR7cXVlcnl9LmApO1xuICB9XG59XG5cbmNsYXNzIER5bmFtaWNRdWVyeVN0cmF0ZWd5IGltcGxlbWVudHMgX1F1ZXJ5U3RyYXRlZ3kge1xuICBxdWVyaWVzOiBRdWVyeVJlZltdO1xuXG4gIGNvbnN0cnVjdG9yKGVpOiBFbGVtZW50SW5qZWN0b3IpIHtcbiAgICB0aGlzLnF1ZXJpZXMgPSBlaS5fcHJvdG8ucHJvdG9RdWVyeVJlZnMubWFwKHAgPT4gbmV3IFF1ZXJ5UmVmKHAsIGVpKSk7XG4gIH1cblxuICBzZXRDb250ZW50UXVlcmllc0FzRGlydHkoKTogdm9pZCB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKCFxLmlzVmlld1F1ZXJ5KSBxLmRpcnR5ID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBzZXRWaWV3UXVlcmllc0FzRGlydHkoKTogdm9pZCB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKHEuaXNWaWV3UXVlcnkpIHEuZGlydHkgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGh5ZHJhdGUoKTogdm9pZCB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgcS5oeWRyYXRlKCk7XG4gICAgfVxuICB9XG5cbiAgZGVoeWRyYXRlKCk6IHZvaWQge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5xdWVyaWVzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgcSA9IHRoaXMucXVlcmllc1tpXTtcbiAgICAgIHEuZGVoeWRyYXRlKCk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlQ29udGVudFF1ZXJpZXMoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKCFxLmlzVmlld1F1ZXJ5KSB7XG4gICAgICAgIHEudXBkYXRlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlVmlld1F1ZXJpZXMoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKHEuaXNWaWV3UXVlcnkpIHtcbiAgICAgICAgcS51cGRhdGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmaW5kUXVlcnkocXVlcnk6IFF1ZXJ5TWV0YWRhdGEpOiBRdWVyeVJlZiB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgaWYgKHEucHJvdG9RdWVyeVJlZi5xdWVyeSA9PT0gcXVlcnkpIHtcbiAgICAgICAgcmV0dXJuIHE7XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDYW5ub3QgZmluZCBxdWVyeSBmb3IgZGlyZWN0aXZlICR7cXVlcnl9LmApO1xuICB9XG59XG5cbmludGVyZmFjZSBfRWxlbWVudEluamVjdG9yU3RyYXRlZ3kge1xuICBjYWxsT25EZXN0cm95KCk6IHZvaWQ7XG4gIGdldENvbXBvbmVudCgpOiBhbnk7XG4gIGlzQ29tcG9uZW50S2V5KGtleTogS2V5KTogYm9vbGVhbjtcbiAgYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkocTogUXVlcnlNZXRhZGF0YSwgcmVzOiBhbnlbXSk6IHZvaWQ7XG4gIGh5ZHJhdGUoKTogdm9pZDtcbiAgZGVoeWRyYXRlKCk6IHZvaWQ7XG59XG5cbi8qKlxuICogU3RyYXRlZ3kgdXNlZCBieSB0aGUgYEVsZW1lbnRJbmplY3RvcmAgd2hlbiB0aGUgbnVtYmVyIG9mIHByb3ZpZGVycyBpcyAxMCBvciBsZXNzLlxuICogSW4gc3VjaCBhIGNhc2UsIGlubGluaW5nIGZpZWxkcyBpcyBiZW5lZmljaWFsIGZvciBwZXJmb3JtYW5jZXMuXG4gKi9cbmNsYXNzIEVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5IGltcGxlbWVudHMgX0VsZW1lbnRJbmplY3RvclN0cmF0ZWd5IHtcbiAgY29uc3RydWN0b3IocHVibGljIGluamVjdG9yU3RyYXRlZ3k6IEluamVjdG9ySW5saW5lU3RyYXRlZ3ksIHB1YmxpYyBfZWk6IEVsZW1lbnRJbmplY3Rvcikge31cblxuICBoeWRyYXRlKCk6IHZvaWQge1xuICAgIHZhciBpID0gdGhpcy5pbmplY3RvclN0cmF0ZWd5O1xuICAgIHZhciBwID0gaS5wcm90b1N0cmF0ZWd5O1xuICAgIGkucmVzZXRDb25zdHJ1Y3Rpb25Db3VudGVyKCk7XG5cbiAgICBpZiAocC5wcm92aWRlcjAgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDApICYmIGkub2JqMCA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmowID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIwLCBwLnZpc2liaWxpdHkwKTtcbiAgICBpZiAocC5wcm92aWRlcjEgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDEpICYmIGkub2JqMSA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmoxID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIxLCBwLnZpc2liaWxpdHkxKTtcbiAgICBpZiAocC5wcm92aWRlcjIgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDIpICYmIGkub2JqMiA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmoyID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIyLCBwLnZpc2liaWxpdHkyKTtcbiAgICBpZiAocC5wcm92aWRlcjMgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDMpICYmIGkub2JqMyA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmozID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIzLCBwLnZpc2liaWxpdHkzKTtcbiAgICBpZiAocC5wcm92aWRlcjQgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDQpICYmIGkub2JqNCA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo0ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI0LCBwLnZpc2liaWxpdHk0KTtcbiAgICBpZiAocC5wcm92aWRlcjUgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDUpICYmIGkub2JqNSA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo1ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI1LCBwLnZpc2liaWxpdHk1KTtcbiAgICBpZiAocC5wcm92aWRlcjYgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDYpICYmIGkub2JqNiA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo2ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI2LCBwLnZpc2liaWxpdHk2KTtcbiAgICBpZiAocC5wcm92aWRlcjcgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDcpICYmIGkub2JqNyA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo3ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI3LCBwLnZpc2liaWxpdHk3KTtcbiAgICBpZiAocC5wcm92aWRlcjggaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDgpICYmIGkub2JqOCA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo4ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI4LCBwLnZpc2liaWxpdHk4KTtcbiAgICBpZiAocC5wcm92aWRlcjkgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDkpICYmIGkub2JqOSA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo5ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI5LCBwLnZpc2liaWxpdHk5KTtcbiAgfVxuXG4gIGRlaHlkcmF0ZSgpIHtcbiAgICB2YXIgaSA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneTtcblxuICAgIGkub2JqMCA9IFVOREVGSU5FRDtcbiAgICBpLm9iajEgPSBVTkRFRklORUQ7XG4gICAgaS5vYmoyID0gVU5ERUZJTkVEO1xuICAgIGkub2JqMyA9IFVOREVGSU5FRDtcbiAgICBpLm9iajQgPSBVTkRFRklORUQ7XG4gICAgaS5vYmo1ID0gVU5ERUZJTkVEO1xuICAgIGkub2JqNiA9IFVOREVGSU5FRDtcbiAgICBpLm9iajcgPSBVTkRFRklORUQ7XG4gICAgaS5vYmo4ID0gVU5ERUZJTkVEO1xuICAgIGkub2JqOSA9IFVOREVGSU5FRDtcbiAgfVxuXG4gIGNhbGxPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdmFyIGkgPSB0aGlzLmluamVjdG9yU3RyYXRlZ3k7XG4gICAgdmFyIHAgPSBpLnByb3RvU3RyYXRlZ3k7XG5cbiAgICBpZiAocC5wcm92aWRlcjAgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJlxuICAgICAgICAoPERpcmVjdGl2ZVByb3ZpZGVyPnAucHJvdmlkZXIwKS5jYWxsT25EZXN0cm95KSB7XG4gICAgICBpLm9iajAubmdPbkRlc3Ryb3koKTtcbiAgICB9XG4gICAgaWYgKHAucHJvdmlkZXIxIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiZcbiAgICAgICAgKDxEaXJlY3RpdmVQcm92aWRlcj5wLnByb3ZpZGVyMSkuY2FsbE9uRGVzdHJveSkge1xuICAgICAgaS5vYmoxLm5nT25EZXN0cm95KCk7XG4gICAgfVxuICAgIGlmIChwLnByb3ZpZGVyMiBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmXG4gICAgICAgICg8RGlyZWN0aXZlUHJvdmlkZXI+cC5wcm92aWRlcjIpLmNhbGxPbkRlc3Ryb3kpIHtcbiAgICAgIGkub2JqMi5uZ09uRGVzdHJveSgpO1xuICAgIH1cbiAgICBpZiAocC5wcm92aWRlcjMgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJlxuICAgICAgICAoPERpcmVjdGl2ZVByb3ZpZGVyPnAucHJvdmlkZXIzKS5jYWxsT25EZXN0cm95KSB7XG4gICAgICBpLm9iajMubmdPbkRlc3Ryb3koKTtcbiAgICB9XG4gICAgaWYgKHAucHJvdmlkZXI0IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiZcbiAgICAgICAgKDxEaXJlY3RpdmVQcm92aWRlcj5wLnByb3ZpZGVyNCkuY2FsbE9uRGVzdHJveSkge1xuICAgICAgaS5vYmo0Lm5nT25EZXN0cm95KCk7XG4gICAgfVxuICAgIGlmIChwLnByb3ZpZGVyNSBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmXG4gICAgICAgICg8RGlyZWN0aXZlUHJvdmlkZXI+cC5wcm92aWRlcjUpLmNhbGxPbkRlc3Ryb3kpIHtcbiAgICAgIGkub2JqNS5uZ09uRGVzdHJveSgpO1xuICAgIH1cbiAgICBpZiAocC5wcm92aWRlcjYgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJlxuICAgICAgICAoPERpcmVjdGl2ZVByb3ZpZGVyPnAucHJvdmlkZXI2KS5jYWxsT25EZXN0cm95KSB7XG4gICAgICBpLm9iajYubmdPbkRlc3Ryb3koKTtcbiAgICB9XG4gICAgaWYgKHAucHJvdmlkZXI3IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiZcbiAgICAgICAgKDxEaXJlY3RpdmVQcm92aWRlcj5wLnByb3ZpZGVyNykuY2FsbE9uRGVzdHJveSkge1xuICAgICAgaS5vYmo3Lm5nT25EZXN0cm95KCk7XG4gICAgfVxuICAgIGlmIChwLnByb3ZpZGVyOCBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmXG4gICAgICAgICg8RGlyZWN0aXZlUHJvdmlkZXI+cC5wcm92aWRlcjgpLmNhbGxPbkRlc3Ryb3kpIHtcbiAgICAgIGkub2JqOC5uZ09uRGVzdHJveSgpO1xuICAgIH1cbiAgICBpZiAocC5wcm92aWRlcjkgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJlxuICAgICAgICAoPERpcmVjdGl2ZVByb3ZpZGVyPnAucHJvdmlkZXI5KS5jYWxsT25EZXN0cm95KSB7XG4gICAgICBpLm9iajkubmdPbkRlc3Ryb3koKTtcbiAgICB9XG4gIH1cblxuICBnZXRDb21wb25lbnQoKTogYW55IHsgcmV0dXJuIHRoaXMuaW5qZWN0b3JTdHJhdGVneS5vYmowOyB9XG5cbiAgaXNDb21wb25lbnRLZXkoa2V5OiBLZXkpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZWkuX3Byb3RvLl9maXJzdFByb3ZpZGVySXNDb21wb25lbnQgJiYgaXNQcmVzZW50KGtleSkgJiZcbiAgICAgICAgICAga2V5LmlkID09PSB0aGlzLmluamVjdG9yU3RyYXRlZ3kucHJvdG9TdHJhdGVneS5rZXlJZDA7XG4gIH1cblxuICBhZGREaXJlY3RpdmVzTWF0Y2hpbmdRdWVyeShxdWVyeTogUXVlcnlNZXRhZGF0YSwgbGlzdDogYW55W10pOiB2b2lkIHtcbiAgICB2YXIgaSA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneTtcbiAgICB2YXIgcCA9IGkucHJvdG9TdHJhdGVneTtcblxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjApICYmIHAucHJvdmlkZXIwLmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajAgPT09IFVOREVGSU5FRCkgaS5vYmowID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIwLCBwLnZpc2liaWxpdHkwKTtcbiAgICAgIGxpc3QucHVzaChpLm9iajApO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXIxKSAmJiBwLnByb3ZpZGVyMS5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmoxID09PSBVTkRFRklORUQpIGkub2JqMSA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyMSwgcC52aXNpYmlsaXR5MSk7XG4gICAgICBsaXN0LnB1c2goaS5vYmoxKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyMikgJiYgcC5wcm92aWRlcjIua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqMiA9PT0gVU5ERUZJTkVEKSBpLm9iajIgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjIsIHAudmlzaWJpbGl0eTIpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqMik7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjMpICYmIHAucHJvdmlkZXIzLmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajMgPT09IFVOREVGSU5FRCkgaS5vYmozID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIzLCBwLnZpc2liaWxpdHkzKTtcbiAgICAgIGxpc3QucHVzaChpLm9iajMpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXI0KSAmJiBwLnByb3ZpZGVyNC5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmo0ID09PSBVTkRFRklORUQpIGkub2JqNCA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyNCwgcC52aXNpYmlsaXR5NCk7XG4gICAgICBsaXN0LnB1c2goaS5vYmo0KTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyNSkgJiYgcC5wcm92aWRlcjUua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqNSA9PT0gVU5ERUZJTkVEKSBpLm9iajUgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjUsIHAudmlzaWJpbGl0eTUpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqNSk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjYpICYmIHAucHJvdmlkZXI2LmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajYgPT09IFVOREVGSU5FRCkgaS5vYmo2ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI2LCBwLnZpc2liaWxpdHk2KTtcbiAgICAgIGxpc3QucHVzaChpLm9iajYpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXI3KSAmJiBwLnByb3ZpZGVyNy5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmo3ID09PSBVTkRFRklORUQpIGkub2JqNyA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyNywgcC52aXNpYmlsaXR5Nyk7XG4gICAgICBsaXN0LnB1c2goaS5vYmo3KTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyOCkgJiYgcC5wcm92aWRlcjgua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqOCA9PT0gVU5ERUZJTkVEKSBpLm9iajggPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjgsIHAudmlzaWJpbGl0eTgpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqOCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjkpICYmIHAucHJvdmlkZXI5LmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajkgPT09IFVOREVGSU5FRCkgaS5vYmo5ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI5LCBwLnZpc2liaWxpdHk5KTtcbiAgICAgIGxpc3QucHVzaChpLm9iajkpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFN0cmF0ZWd5IHVzZWQgYnkgdGhlIGBFbGVtZW50SW5qZWN0b3JgIHdoZW4gdGhlIG51bWJlciBvZiBiaW5kaW5ncyBpcyAxMSBvciBtb3JlLlxuICogSW4gc3VjaCBhIGNhc2UsIHRoZXJlIGFyZSB0b28gbWFueSBmaWVsZHMgdG8gaW5saW5lIChzZWUgRWxlbWVudEluamVjdG9ySW5saW5lU3RyYXRlZ3kpLlxuICovXG5jbGFzcyBFbGVtZW50SW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kgaW1wbGVtZW50cyBfRWxlbWVudEluamVjdG9yU3RyYXRlZ3kge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW5qZWN0b3JTdHJhdGVneTogSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3ksIHB1YmxpYyBfZWk6IEVsZW1lbnRJbmplY3Rvcikge31cblxuICBoeWRyYXRlKCk6IHZvaWQge1xuICAgIHZhciBpbmogPSB0aGlzLmluamVjdG9yU3RyYXRlZ3k7XG4gICAgdmFyIHAgPSBpbmoucHJvdG9TdHJhdGVneTtcbiAgICBpbmoucmVzZXRDb25zdHJ1Y3Rpb25Db3VudGVyKCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHAua2V5SWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocC5wcm92aWRlcnNbaV0gaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZHNbaV0pICYmXG4gICAgICAgICAgaW5qLm9ianNbaV0gPT09IFVOREVGSU5FRCkge1xuICAgICAgICBpbmoub2Jqc1tpXSA9IGluai5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXJzW2ldLCBwLnZpc2liaWxpdGllc1tpXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZGVoeWRyYXRlKCk6IHZvaWQge1xuICAgIHZhciBpbmogPSB0aGlzLmluamVjdG9yU3RyYXRlZ3k7XG4gICAgTGlzdFdyYXBwZXIuZmlsbChpbmoub2JqcywgVU5ERUZJTkVEKTtcbiAgfVxuXG4gIGNhbGxPbkRlc3Ryb3koKTogdm9pZCB7XG4gICAgdmFyIGlzdCA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneTtcbiAgICB2YXIgcCA9IGlzdC5wcm90b1N0cmF0ZWd5O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwLnByb3ZpZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHAucHJvdmlkZXJzW2ldIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiZcbiAgICAgICAgICAoPERpcmVjdGl2ZVByb3ZpZGVyPnAucHJvdmlkZXJzW2ldKS5jYWxsT25EZXN0cm95KSB7XG4gICAgICAgIGlzdC5vYmpzW2ldLm5nT25EZXN0cm95KCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0Q29tcG9uZW50KCk6IGFueSB7IHJldHVybiB0aGlzLmluamVjdG9yU3RyYXRlZ3kub2Jqc1swXTsgfVxuXG4gIGlzQ29tcG9uZW50S2V5KGtleTogS2V5KTogYm9vbGVhbiB7XG4gICAgdmFyIHAgPSB0aGlzLmluamVjdG9yU3RyYXRlZ3kucHJvdG9TdHJhdGVneTtcbiAgICByZXR1cm4gdGhpcy5fZWkuX3Byb3RvLl9maXJzdFByb3ZpZGVySXNDb21wb25lbnQgJiYgaXNQcmVzZW50KGtleSkgJiYga2V5LmlkID09PSBwLmtleUlkc1swXTtcbiAgfVxuXG4gIGFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5KHF1ZXJ5OiBRdWVyeU1ldGFkYXRhLCBsaXN0OiBhbnlbXSk6IHZvaWQge1xuICAgIHZhciBpc3QgPSB0aGlzLmluamVjdG9yU3RyYXRlZ3k7XG4gICAgdmFyIHAgPSBpc3QucHJvdG9TdHJhdGVneTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcC5wcm92aWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChwLnByb3ZpZGVyc1tpXS5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICAgIGlmIChpc3Qub2Jqc1tpXSA9PT0gVU5ERUZJTkVEKSB7XG4gICAgICAgICAgaXN0Lm9ianNbaV0gPSBpc3QuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyc1tpXSwgcC52aXNpYmlsaXRpZXNbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGxpc3QucHVzaChpc3Qub2Jqc1tpXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQcm90b1F1ZXJ5UmVmIHtcbiAgY29uc3RydWN0b3IocHVibGljIGRpckluZGV4OiBudW1iZXIsIHB1YmxpYyBzZXR0ZXI6IFNldHRlckZuLCBwdWJsaWMgcXVlcnk6IFF1ZXJ5TWV0YWRhdGEpIHt9XG5cbiAgZ2V0IHVzZXNQcm9wZXJ0eVN5bnRheCgpOiBib29sZWFuIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLnNldHRlcik7IH1cbn1cblxuZXhwb3J0IGNsYXNzIFF1ZXJ5UmVmIHtcbiAgcHVibGljIGxpc3Q6IFF1ZXJ5TGlzdDxhbnk+O1xuICBwdWJsaWMgZGlydHk6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IocHVibGljIHByb3RvUXVlcnlSZWY6IFByb3RvUXVlcnlSZWYsIHByaXZhdGUgb3JpZ2luYXRvcjogRWxlbWVudEluamVjdG9yKSB7fVxuXG4gIGdldCBpc1ZpZXdRdWVyeSgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMucHJvdG9RdWVyeVJlZi5xdWVyeS5pc1ZpZXdRdWVyeTsgfVxuXG4gIHVwZGF0ZSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuZGlydHkpIHJldHVybjtcbiAgICB0aGlzLl91cGRhdGUoKTtcbiAgICB0aGlzLmRpcnR5ID0gZmFsc2U7XG5cbiAgICAvLyBUT0RPIGRlbGV0ZSB0aGUgY2hlY2sgb25jZSBvbmx5IGZpZWxkIHF1ZXJpZXMgYXJlIHN1cHBvcnRlZFxuICAgIGlmICh0aGlzLnByb3RvUXVlcnlSZWYudXNlc1Byb3BlcnR5U3ludGF4KSB7XG4gICAgICB2YXIgZGlyID0gdGhpcy5vcmlnaW5hdG9yLmdldERpcmVjdGl2ZUF0SW5kZXgodGhpcy5wcm90b1F1ZXJ5UmVmLmRpckluZGV4KTtcbiAgICAgIGlmICh0aGlzLnByb3RvUXVlcnlSZWYucXVlcnkuZmlyc3QpIHtcbiAgICAgICAgdGhpcy5wcm90b1F1ZXJ5UmVmLnNldHRlcihkaXIsIHRoaXMubGlzdC5sZW5ndGggPiAwID8gdGhpcy5saXN0LmZpcnN0IDogbnVsbCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnByb3RvUXVlcnlSZWYuc2V0dGVyKGRpciwgdGhpcy5saXN0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmxpc3Qubm90aWZ5T25DaGFuZ2VzKCk7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGUoKTogdm9pZCB7XG4gICAgdmFyIGFnZ3JlZ2F0b3IgPSBbXTtcbiAgICBpZiAodGhpcy5wcm90b1F1ZXJ5UmVmLnF1ZXJ5LmlzVmlld1F1ZXJ5KSB7XG4gICAgICB2YXIgdmlldyA9IHRoaXMub3JpZ2luYXRvci5nZXRWaWV3KCk7XG4gICAgICAvLyBpbnRlbnRpb25hbGx5IHNraXBwaW5nIG9yaWdpbmF0b3IgZm9yIHZpZXcgcXVlcmllcy5cbiAgICAgIHZhciBuZXN0ZWRWaWV3ID1cbiAgICAgICAgICB2aWV3LmdldE5lc3RlZFZpZXcodmlldy5lbGVtZW50T2Zmc2V0ICsgdGhpcy5vcmlnaW5hdG9yLmdldEJvdW5kRWxlbWVudEluZGV4KCkpO1xuICAgICAgaWYgKGlzUHJlc2VudChuZXN0ZWRWaWV3KSkgdGhpcy5fdmlzaXRWaWV3KG5lc3RlZFZpZXcsIGFnZ3JlZ2F0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl92aXNpdCh0aGlzLm9yaWdpbmF0b3IsIGFnZ3JlZ2F0b3IpO1xuICAgIH1cbiAgICB0aGlzLmxpc3QucmVzZXQoYWdncmVnYXRvcik7XG4gIH07XG5cbiAgcHJpdmF0ZSBfdmlzaXQoaW5qOiBFbGVtZW50SW5qZWN0b3IsIGFnZ3JlZ2F0b3I6IGFueVtdKTogdm9pZCB7XG4gICAgdmFyIHZpZXcgPSBpbmouZ2V0VmlldygpO1xuICAgIHZhciBzdGFydElkeCA9IHZpZXcuZWxlbWVudE9mZnNldCArIGluai5fcHJvdG8uaW5kZXg7XG4gICAgZm9yICh2YXIgaSA9IHN0YXJ0SWR4OyBpIDwgdmlldy5lbGVtZW50T2Zmc2V0ICsgdmlldy5vd25CaW5kZXJzQ291bnQ7IGkrKykge1xuICAgICAgdmFyIGN1ckluaiA9IHZpZXcuZWxlbWVudEluamVjdG9yc1tpXTtcbiAgICAgIGlmIChpc0JsYW5rKGN1ckluaikpIGNvbnRpbnVlO1xuICAgICAgLy8gVGhlIGZpcnN0IGluamVjdG9yIGFmdGVyIGluaiwgdGhhdCBpcyBvdXRzaWRlIHRoZSBzdWJ0cmVlIHJvb3RlZCBhdFxuICAgICAgLy8gaW5qIGhhcyB0byBoYXZlIGEgbnVsbCBwYXJlbnQgb3IgYSBwYXJlbnQgdGhhdCBpcyBhbiBhbmNlc3RvciBvZiBpbmouXG4gICAgICBpZiAoaSA+IHN0YXJ0SWR4ICYmIChpc0JsYW5rKGN1ckluaikgfHwgaXNCbGFuayhjdXJJbmoucGFyZW50KSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldy5lbGVtZW50T2Zmc2V0ICsgY3VySW5qLnBhcmVudC5fcHJvdG8uaW5kZXggPCBzdGFydElkeCkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5wcm90b1F1ZXJ5UmVmLnF1ZXJ5LmRlc2NlbmRhbnRzICYmXG4gICAgICAgICAgIShjdXJJbmoucGFyZW50ID09IHRoaXMub3JpZ2luYXRvciB8fCBjdXJJbmogPT0gdGhpcy5vcmlnaW5hdG9yKSlcbiAgICAgICAgY29udGludWU7XG5cbiAgICAgIC8vIFdlIHZpc2l0IHRoZSB2aWV3IGNvbnRhaW5lcihWQykgdmlld3MgcmlnaHQgYWZ0ZXIgdGhlIGluamVjdG9yIHRoYXQgY29udGFpbnNcbiAgICAgIC8vIHRoZSBWQy4gVGhlb3JldGljYWxseSwgdGhhdCBtaWdodCBub3QgYmUgdGhlIHJpZ2h0IG9yZGVyIGlmIHRoZXJlIGFyZVxuICAgICAgLy8gY2hpbGQgaW5qZWN0b3JzIG9mIHNhaWQgaW5qZWN0b3IuIE5vdCBjbGVhciB3aGV0aGVyIGlmIHN1Y2ggY2FzZSBjYW5cbiAgICAgIC8vIGV2ZW4gYmUgY29uc3RydWN0ZWQgd2l0aCB0aGUgY3VycmVudCBhcGlzLlxuICAgICAgdGhpcy5fdmlzaXRJbmplY3RvcihjdXJJbmosIGFnZ3JlZ2F0b3IpO1xuICAgICAgdmFyIHZjID0gdmlldy52aWV3Q29udGFpbmVyc1tpXTtcbiAgICAgIGlmIChpc1ByZXNlbnQodmMpKSB0aGlzLl92aXNpdFZpZXdDb250YWluZXIodmMsIGFnZ3JlZ2F0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0SW5qZWN0b3IoaW5qOiBFbGVtZW50SW5qZWN0b3IsIGFnZ3JlZ2F0b3I6IGFueVtdKSB7XG4gICAgaWYgKHRoaXMucHJvdG9RdWVyeVJlZi5xdWVyeS5pc1ZhckJpbmRpbmdRdWVyeSkge1xuICAgICAgdGhpcy5fYWdncmVnYXRlVmFyaWFibGVCaW5kaW5nKGluaiwgYWdncmVnYXRvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2FnZ3JlZ2F0ZURpcmVjdGl2ZShpbmosIGFnZ3JlZ2F0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0Vmlld0NvbnRhaW5lcih2YzogQXBwVmlld0NvbnRhaW5lciwgYWdncmVnYXRvcjogYW55W10pIHtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHZjLnZpZXdzLmxlbmd0aDsgaisrKSB7XG4gICAgICB0aGlzLl92aXNpdFZpZXcodmMudmlld3Nbal0sIGFnZ3JlZ2F0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0Vmlldyh2aWV3OiBBcHBWaWV3LCBhZ2dyZWdhdG9yOiBhbnlbXSkge1xuICAgIGZvciAodmFyIGkgPSB2aWV3LmVsZW1lbnRPZmZzZXQ7IGkgPCB2aWV3LmVsZW1lbnRPZmZzZXQgKyB2aWV3Lm93bkJpbmRlcnNDb3VudDsgaSsrKSB7XG4gICAgICB2YXIgaW5qID0gdmlldy5lbGVtZW50SW5qZWN0b3JzW2ldO1xuICAgICAgaWYgKGlzQmxhbmsoaW5qKSkgY29udGludWU7XG5cbiAgICAgIHRoaXMuX3Zpc2l0SW5qZWN0b3IoaW5qLCBhZ2dyZWdhdG9yKTtcblxuICAgICAgdmFyIHZjID0gdmlldy52aWV3Q29udGFpbmVyc1tpXTtcbiAgICAgIGlmIChpc1ByZXNlbnQodmMpKSB0aGlzLl92aXNpdFZpZXdDb250YWluZXIodmMsIGFnZ3JlZ2F0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FnZ3JlZ2F0ZVZhcmlhYmxlQmluZGluZyhpbmo6IEVsZW1lbnRJbmplY3RvciwgYWdncmVnYXRvcjogYW55W10pOiB2b2lkIHtcbiAgICB2YXIgdmIgPSB0aGlzLnByb3RvUXVlcnlSZWYucXVlcnkudmFyQmluZGluZ3M7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2Yi5sZW5ndGg7ICsraSkge1xuICAgICAgaWYgKGluai5oYXNWYXJpYWJsZUJpbmRpbmcodmJbaV0pKSB7XG4gICAgICAgIGFnZ3JlZ2F0b3IucHVzaChpbmouZ2V0VmFyaWFibGVCaW5kaW5nKHZiW2ldKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYWdncmVnYXRlRGlyZWN0aXZlKGluajogRWxlbWVudEluamVjdG9yLCBhZ2dyZWdhdG9yOiBhbnlbXSk6IHZvaWQge1xuICAgIGluai5hZGREaXJlY3RpdmVzTWF0Y2hpbmdRdWVyeSh0aGlzLnByb3RvUXVlcnlSZWYucXVlcnksIGFnZ3JlZ2F0b3IpO1xuICB9XG5cbiAgZGVoeWRyYXRlKCk6IHZvaWQgeyB0aGlzLmxpc3QgPSBudWxsOyB9XG5cbiAgaHlkcmF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLmxpc3QgPSBuZXcgUXVlcnlMaXN0PGFueT4oKTtcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgfVxufVxuIl19