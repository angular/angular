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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudF9pbmplY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9lbGVtZW50X2luamVjdG9yLnRzIl0sIm5hbWVzIjpbIlN0YXRpY0tleXMiLCJTdGF0aWNLZXlzLmNvbnN0cnVjdG9yIiwiU3RhdGljS2V5cy5pbnN0YW5jZSIsIlRyZWVOb2RlIiwiVHJlZU5vZGUuY29uc3RydWN0b3IiLCJUcmVlTm9kZS5hZGRDaGlsZCIsIlRyZWVOb2RlLnJlbW92ZSIsIlRyZWVOb2RlLnBhcmVudCIsIkRpcmVjdGl2ZURlcGVuZGVuY3kiLCJEaXJlY3RpdmVEZXBlbmRlbmN5LmNvbnN0cnVjdG9yIiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5fdmVyaWZ5IiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5jcmVhdGVGcm9tIiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5fYXR0cmlidXRlTmFtZSIsIkRpcmVjdGl2ZURlcGVuZGVuY3kuX3F1ZXJ5IiwiRGlyZWN0aXZlUHJvdmlkZXIiLCJEaXJlY3RpdmVQcm92aWRlci5jb25zdHJ1Y3RvciIsIkRpcmVjdGl2ZVByb3ZpZGVyLmRpc3BsYXlOYW1lIiwiRGlyZWN0aXZlUHJvdmlkZXIucXVlcmllcyIsIkRpcmVjdGl2ZVByb3ZpZGVyLmV2ZW50RW1pdHRlcnMiLCJEaXJlY3RpdmVQcm92aWRlci5jcmVhdGVGcm9tUHJvdmlkZXIiLCJEaXJlY3RpdmVQcm92aWRlci5jcmVhdGVGcm9tVHlwZSIsIlByZUJ1aWx0T2JqZWN0cyIsIlByZUJ1aWx0T2JqZWN0cy5jb25zdHJ1Y3RvciIsIlF1ZXJ5TWV0YWRhdGFXaXRoU2V0dGVyIiwiUXVlcnlNZXRhZGF0YVdpdGhTZXR0ZXIuY29uc3RydWN0b3IiLCJFdmVudEVtaXR0ZXJBY2Nlc3NvciIsIkV2ZW50RW1pdHRlckFjY2Vzc29yLmNvbnN0cnVjdG9yIiwiRXZlbnRFbWl0dGVyQWNjZXNzb3Iuc3Vic2NyaWJlIiwiX2NyZWF0ZUV2ZW50RW1pdHRlckFjY2Vzc29ycyIsIl9jcmVhdGVQcm90b1F1ZXJ5UmVmcyIsIlByb3RvRWxlbWVudEluamVjdG9yIiwiUHJvdG9FbGVtZW50SW5qZWN0b3IuY29uc3RydWN0b3IiLCJQcm90b0VsZW1lbnRJbmplY3Rvci5jcmVhdGUiLCJQcm90b0VsZW1lbnRJbmplY3Rvci5fY3JlYXRlRGlyZWN0aXZlUHJvdmlkZXJXaXRoVmlzaWJpbGl0eSIsIlByb3RvRWxlbWVudEluamVjdG9yLl9jcmVhdGVQcm92aWRlcnNXaXRoVmlzaWJpbGl0eSIsIlByb3RvRWxlbWVudEluamVjdG9yLl9jcmVhdGVQcm92aWRlcldpdGhWaXNpYmlsaXR5IiwiUHJvdG9FbGVtZW50SW5qZWN0b3IuX2NyZWF0ZVZpZXdQcm92aWRlcnNXaXRoVmlzaWJpbGl0eSIsIlByb3RvRWxlbWVudEluamVjdG9yLmluc3RhbnRpYXRlIiwiUHJvdG9FbGVtZW50SW5qZWN0b3IuZGlyZWN0UGFyZW50IiwiUHJvdG9FbGVtZW50SW5qZWN0b3IuaGFzQmluZGluZ3MiLCJQcm90b0VsZW1lbnRJbmplY3Rvci5nZXRQcm92aWRlckF0SW5kZXgiLCJfQ29udGV4dCIsIl9Db250ZXh0LmNvbnN0cnVjdG9yIiwiRWxlbWVudEluamVjdG9yIiwiRWxlbWVudEluamVjdG9yLmNvbnN0cnVjdG9yIiwiRWxlbWVudEluamVjdG9yLmRlaHlkcmF0ZSIsIkVsZW1lbnRJbmplY3Rvci5oeWRyYXRlIiwiRWxlbWVudEluamVjdG9yLl9kZWJ1Z0NvbnRleHQiLCJFbGVtZW50SW5qZWN0b3IuX3JlYXR0YWNoSW5qZWN0b3JzIiwiRWxlbWVudEluamVjdG9yLl9yZWF0dGFjaEluamVjdG9yIiwiRWxlbWVudEluamVjdG9yLmhhc1ZhcmlhYmxlQmluZGluZyIsIkVsZW1lbnRJbmplY3Rvci5nZXRWYXJpYWJsZUJpbmRpbmciLCJFbGVtZW50SW5qZWN0b3IuZ2V0IiwiRWxlbWVudEluamVjdG9yLmhhc0RpcmVjdGl2ZSIsIkVsZW1lbnRJbmplY3Rvci5nZXRFdmVudEVtaXR0ZXJBY2Nlc3NvcnMiLCJFbGVtZW50SW5qZWN0b3IuZ2V0RGlyZWN0aXZlVmFyaWFibGVCaW5kaW5ncyIsIkVsZW1lbnRJbmplY3Rvci5nZXRDb21wb25lbnQiLCJFbGVtZW50SW5qZWN0b3IuZ2V0SW5qZWN0b3IiLCJFbGVtZW50SW5qZWN0b3IuZ2V0RWxlbWVudFJlZiIsIkVsZW1lbnRJbmplY3Rvci5nZXRWaWV3Q29udGFpbmVyUmVmIiwiRWxlbWVudEluamVjdG9yLmdldE5lc3RlZFZpZXciLCJFbGVtZW50SW5qZWN0b3IuZ2V0VmlldyIsIkVsZW1lbnRJbmplY3Rvci5kaXJlY3RQYXJlbnQiLCJFbGVtZW50SW5qZWN0b3IuaXNDb21wb25lbnRLZXkiLCJFbGVtZW50SW5qZWN0b3IuZ2V0RGVwZW5kZW5jeSIsIkVsZW1lbnRJbmplY3Rvci5fYnVpbGRBdHRyaWJ1dGUiLCJFbGVtZW50SW5qZWN0b3IuYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkiLCJFbGVtZW50SW5qZWN0b3IuX2J1aWxkUXVlcnlTdHJhdGVneSIsIkVsZW1lbnRJbmplY3Rvci5saW5rIiwiRWxlbWVudEluamVjdG9yLnVubGluayIsIkVsZW1lbnRJbmplY3Rvci5nZXREaXJlY3RpdmVBdEluZGV4IiwiRWxlbWVudEluamVjdG9yLmhhc0luc3RhbmNlcyIsIkVsZW1lbnRJbmplY3Rvci5nZXRIb3N0IiwiRWxlbWVudEluamVjdG9yLmdldEJvdW5kRWxlbWVudEluZGV4IiwiRWxlbWVudEluamVjdG9yLmdldFJvb3RWaWV3SW5qZWN0b3JzIiwiRWxlbWVudEluamVjdG9yLm5nQWZ0ZXJWaWV3Q2hlY2tlZCIsIkVsZW1lbnRJbmplY3Rvci5uZ0FmdGVyQ29udGVudENoZWNrZWQiLCJFbGVtZW50SW5qZWN0b3IudHJhdmVyc2VBbmRTZXRRdWVyaWVzQXNEaXJ0eSIsIkVsZW1lbnRJbmplY3Rvci5fc2V0UXVlcmllc0FzRGlydHkiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5IiwiX0VtcHR5UXVlcnlTdHJhdGVneS5jb25zdHJ1Y3RvciIsIl9FbXB0eVF1ZXJ5U3RyYXRlZ3kuc2V0Q29udGVudFF1ZXJpZXNBc0RpcnR5IiwiX0VtcHR5UXVlcnlTdHJhdGVneS5zZXRWaWV3UXVlcmllc0FzRGlydHkiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5Lmh5ZHJhdGUiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5LmRlaHlkcmF0ZSIsIl9FbXB0eVF1ZXJ5U3RyYXRlZ3kudXBkYXRlQ29udGVudFF1ZXJpZXMiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5LnVwZGF0ZVZpZXdRdWVyaWVzIiwiX0VtcHR5UXVlcnlTdHJhdGVneS5maW5kUXVlcnkiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5IiwiSW5saW5lUXVlcnlTdHJhdGVneS5jb25zdHJ1Y3RvciIsIklubGluZVF1ZXJ5U3RyYXRlZ3kuc2V0Q29udGVudFF1ZXJpZXNBc0RpcnR5IiwiSW5saW5lUXVlcnlTdHJhdGVneS5zZXRWaWV3UXVlcmllc0FzRGlydHkiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5Lmh5ZHJhdGUiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5LmRlaHlkcmF0ZSIsIklubGluZVF1ZXJ5U3RyYXRlZ3kudXBkYXRlQ29udGVudFF1ZXJpZXMiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5LnVwZGF0ZVZpZXdRdWVyaWVzIiwiSW5saW5lUXVlcnlTdHJhdGVneS5maW5kUXVlcnkiLCJEeW5hbWljUXVlcnlTdHJhdGVneSIsIkR5bmFtaWNRdWVyeVN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kuc2V0Q29udGVudFF1ZXJpZXNBc0RpcnR5IiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kuc2V0Vmlld1F1ZXJpZXNBc0RpcnR5IiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kuaHlkcmF0ZSIsIkR5bmFtaWNRdWVyeVN0cmF0ZWd5LmRlaHlkcmF0ZSIsIkR5bmFtaWNRdWVyeVN0cmF0ZWd5LnVwZGF0ZUNvbnRlbnRRdWVyaWVzIiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kudXBkYXRlVmlld1F1ZXJpZXMiLCJEeW5hbWljUXVlcnlTdHJhdGVneS5maW5kUXVlcnkiLCJFbGVtZW50SW5qZWN0b3JJbmxpbmVTdHJhdGVneSIsIkVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiRWxlbWVudEluamVjdG9ySW5saW5lU3RyYXRlZ3kuaHlkcmF0ZSIsIkVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5LmRlaHlkcmF0ZSIsIkVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5LmNhbGxPbkRlc3Ryb3kiLCJFbGVtZW50SW5qZWN0b3JJbmxpbmVTdHJhdGVneS5nZXRDb21wb25lbnQiLCJFbGVtZW50SW5qZWN0b3JJbmxpbmVTdHJhdGVneS5pc0NvbXBvbmVudEtleSIsIkVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5LmFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5IiwiRWxlbWVudEluamVjdG9yRHluYW1pY1N0cmF0ZWd5IiwiRWxlbWVudEluamVjdG9yRHluYW1pY1N0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiRWxlbWVudEluamVjdG9yRHluYW1pY1N0cmF0ZWd5Lmh5ZHJhdGUiLCJFbGVtZW50SW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuZGVoeWRyYXRlIiwiRWxlbWVudEluamVjdG9yRHluYW1pY1N0cmF0ZWd5LmNhbGxPbkRlc3Ryb3kiLCJFbGVtZW50SW5qZWN0b3JEeW5hbWljU3RyYXRlZ3kuZ2V0Q29tcG9uZW50IiwiRWxlbWVudEluamVjdG9yRHluYW1pY1N0cmF0ZWd5LmlzQ29tcG9uZW50S2V5IiwiRWxlbWVudEluamVjdG9yRHluYW1pY1N0cmF0ZWd5LmFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5IiwiUHJvdG9RdWVyeVJlZiIsIlByb3RvUXVlcnlSZWYuY29uc3RydWN0b3IiLCJQcm90b1F1ZXJ5UmVmLnVzZXNQcm9wZXJ0eVN5bnRheCIsIlF1ZXJ5UmVmIiwiUXVlcnlSZWYuY29uc3RydWN0b3IiLCJRdWVyeVJlZi5pc1ZpZXdRdWVyeSIsIlF1ZXJ5UmVmLnVwZGF0ZSIsIlF1ZXJ5UmVmLl91cGRhdGUiLCJRdWVyeVJlZi5fdmlzaXQiLCJRdWVyeVJlZi5fdmlzaXRJbmplY3RvciIsIlF1ZXJ5UmVmLl92aXNpdFZpZXdDb250YWluZXIiLCJRdWVyeVJlZi5fdmlzaXRWaWV3IiwiUXVlcnlSZWYuX2FnZ3JlZ2F0ZVZhcmlhYmxlQmluZGluZyIsIlF1ZXJ5UmVmLl9hZ2dyZWdhdGVEaXJlY3RpdmUiLCJRdWVyeVJlZi5kZWh5ZHJhdGUiLCJRdWVyeVJlZi5oeWRyYXRlIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHFCQU9PLDBCQUEwQixDQUFDLENBQUE7QUFDbEMsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0Qsc0JBQThDLDJCQUEyQixDQUFDLENBQUE7QUFDMUUsMkJBQXdELGdDQUFnQyxDQUFDLENBQUE7QUFDekYsbUJBV08sc0JBQXNCLENBQUMsQ0FBQTtBQUM5Qix5QkFRTywrQkFBK0IsQ0FBQyxDQUFBO0FBQ3ZDLHlCQUFrRSwrQkFBK0IsQ0FBQyxDQUFBO0FBRWxHLG1CQUErQyxnQkFBZ0IsQ0FBQyxDQUFBO0FBR2hFLGNBQWMsQ0FBQyxJQUFZLFNBQVMsV0FBTSxnQkFBZ0IsQ0FBQyxDQUFBO0FBQzNELG1DQUErQixzQkFBc0IsQ0FBQyxDQUFBO0FBQ3RELDRCQUF5QixlQUFlLENBQUMsQ0FBQTtBQUN6Qyw2QkFBMEIsZ0JBQWdCLENBQUMsQ0FBQTtBQUMzQywyQkFBbUQsd0JBQXdCLENBQUMsQ0FBQTtBQUM1RSw4Q0FBK0IsaUNBQWlDLENBQUMsQ0FBQTtBQUNqRSxpQ0FHTyxxREFBcUQsQ0FBQyxDQUFBO0FBQzdELDJCQUF3QixjQUFjLENBQUMsQ0FBQTtBQUN2QywyQkFBd0IseUNBQXlDLENBQUMsQ0FBQTtBQUVsRSw2QkFBMEIsdUNBQXVDLENBQUMsQ0FBQTtBQUVsRSw4QkFBMkIsdUNBQXVDLENBQUMsQ0FBQTtBQUVuRSwyQkFBNkIsY0FBYyxDQUFDLENBQUE7QUFDNUMsbUNBQWdDLHNCQUFzQixDQUFDLENBQUE7QUFFdkQsSUFBSSxXQUFXLENBQUM7QUFF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QUNoRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO0lBQ2xGQSxDQUFDQTtJQUVESCxxQ0FBT0EsR0FBUEE7UUFDRUksRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBO1FBQ2xEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsT0FBT0EsRUFBRUEsQ0FBQ0E7UUFDbERBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxPQUFPQSxFQUFFQSxDQUFDQTtJQUNwREEsQ0FBQ0E7SUFFREosdUNBQVNBLEdBQVRBO1FBQ0VLLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQTtRQUNwREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBO1FBQ3BEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0E7SUFDdERBLENBQUNBO0lBRURMLGtEQUFvQkEsR0FBcEJBO1FBQ0VNLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2REEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2REEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2REEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO0lBQ0hBLENBQUNBO0lBRUROLCtDQUFpQkEsR0FBakJBO1FBQ0VPLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0REEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0REEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0REEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO0lBQ0hBLENBQUNBO0lBRURQLHVDQUFTQSxHQUFUQSxVQUFVQSxLQUFvQkE7UUFDNUJRLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4RUEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7UUFDckJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4RUEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7UUFDckJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxhQUFhQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4RUEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7UUFDckJBLENBQUNBO1FBQ0RBLE1B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LENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtZQUMxRkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUM3REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtZQUMxRkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUM3REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtZQUMxRkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUM3REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO0lBQy9EQSxDQUFDQTtJQUVERixpREFBU0EsR0FBVEE7UUFDRUcsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQTtRQUU5QkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0Esb0JBQVNBLENBQUNBO1FBQ25CQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxvQkFBU0EsQ0FBQ0E7UUFDbkJBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLG9CQUFTQSxDQUFDQTtRQUNuQkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0Esb0JBQVNBLENBQUNBO1FBQ25CQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxvQkFBU0EsQ0FBQ0E7UUFDbkJBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLG9CQUFTQSxDQUFDQTtRQUNuQkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0Esb0JBQVNBLENBQUNBO1FBQ25CQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxvQkFBU0EsQ0FBQ0E7UUFDbkJBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLG9CQUFTQSxDQUFDQTtRQUNuQkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0Esb0JBQVNBLENBQUNBO0lBQ3JCQSxDQUFDQTtJQUVESCxxREFBYUEsR0FBYkE7UUFDRUksSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQTtRQUM5QkEsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsYUFBYUEsQ0FBQ0E7UUFFeEJBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkE7WUFDcEJBLENBQUNBLENBQUNBLFNBQVVBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQTtZQUNwQkEsQ0FBQ0EsQ0FBQ0EsU0FBVUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBO1lBQ3BCQSxDQUFDQSxDQUFDQSxTQUFVQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkE7WUFDcEJBLENBQUNBLENBQUNBLFNBQVVBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQTtZQUNwQkEsQ0FBQ0EsQ0FBQ0EsU0FBVUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBO1lBQ3BCQSxDQUFDQSxDQUFDQSxTQUFVQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkE7WUFDcEJBLENBQUNBLENBQUNBLFNBQVVBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQTtZQUNwQkEsQ0FBQ0EsQ0FBQ0EsU0FBVUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBO1lBQ3BCQSxDQUFDQSxDQUFDQSxTQUFVQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNuREEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsRUFBRUEsQ0FBQ0E7UUFDdkJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkE7WUFDcEJBLENBQUNBLENBQUNBLFNBQVVBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBO1lBQ25EQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxDQUFDQTtRQUN2QkEsQ0FBQ0E7SUFDSEEsQ0FBQ0E7SUFFREosb0RBQVlBLEdBQVpBLGNBQXNCSyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO0lBRTFETCxzREFBY0EsR0FBZEEsVUFBZUEsR0FBUUE7UUFDckJNLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLE1BQU1BLENBQUNBLHlCQUF5QkEsSUFBSUEsZ0JBQVNBLENBQUNBLEdBQUdBLENBQUNBO1lBQzNEQSxHQUFHQSxDQUFDQSxFQUFFQSxLQUFLQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLGFBQWFBLENBQUNBLE1BQU1BLENBQUNBO0lBQy9EQSxDQUFDQTtJQUVETixrRUFBMEJBLEdBQTFCQSxVQUEyQkEsS0FBb0JBLEVBQUVBLElBQVdBO1FBQzFETyxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBO1FBQzlCQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxhQUFhQSxDQUFDQTtRQUV4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEtBQUtBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtnQkFBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNyRkEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDcEJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO2dCQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEtBQUtBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtnQkFBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNyRkEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDcEJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO2dCQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEtBQUtBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtnQkFBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNyRkEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDcEJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxDQUFDQSxD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c1ByZXNlbnQsXG4gIGlzQmxhbmssXG4gIFR5cGUsXG4gIHN0cmluZ2lmeSxcbiAgQ09OU1RfRVhQUixcbiAgU3RyaW5nV3JhcHBlclxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge1xuICBJbmplY3RvcixcbiAgS2V5LFxuICBEZXBlbmRlbmN5LFxuICBwcm92aWRlLFxuICBQcm92aWRlcixcbiAgUmVzb2x2ZWRQcm92aWRlcixcbiAgTm9Qcm92aWRlckVycm9yLFxuICBBYnN0cmFjdFByb3ZpZGVyRXJyb3IsXG4gIEN5Y2xpY0RlcGVuZGVuY3lFcnJvcixcbiAgcmVzb2x2ZUZvcndhcmRSZWZcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtcbiAgVU5ERUZJTkVELFxuICBQcm90b0luamVjdG9yLFxuICBWaXNpYmlsaXR5LFxuICBJbmplY3RvcklubGluZVN0cmF0ZWd5LFxuICBJbmplY3RvckR5bmFtaWNTdHJhdGVneSxcbiAgUHJvdmlkZXJXaXRoVmlzaWJpbGl0eSxcbiAgRGVwZW5kZW5jeVByb3ZpZGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpL2luamVjdG9yJztcbmltcG9ydCB7cmVzb2x2ZVByb3ZpZGVyLCBSZXNvbHZlZEZhY3RvcnksIFJlc29sdmVkUHJvdmlkZXJffSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9wcm92aWRlcic7XG5cbmltcG9ydCB7QXR0cmlidXRlTWV0YWRhdGEsIFF1ZXJ5TWV0YWRhdGF9IGZyb20gJy4uL21ldGFkYXRhL2RpJztcblxuaW1wb3J0IHtBcHBWaWV3Q29udGFpbmVyLCBBcHBWaWV3fSBmcm9tICcuL3ZpZXcnO1xuLyogY2lyY3VsYXIgKi8gaW1wb3J0ICogYXMgYXZtTW9kdWxlIGZyb20gJy4vdmlld19tYW5hZ2VyJztcbmltcG9ydCB7Vmlld0NvbnRhaW5lclJlZn0gZnJvbSAnLi92aWV3X2NvbnRhaW5lcl9yZWYnO1xuaW1wb3J0IHtFbGVtZW50UmVmfSBmcm9tICcuL2VsZW1lbnRfcmVmJztcbmltcG9ydCB7VGVtcGxhdGVSZWZ9IGZyb20gJy4vdGVtcGxhdGVfcmVmJztcbmltcG9ydCB7RGlyZWN0aXZlTWV0YWRhdGEsIENvbXBvbmVudE1ldGFkYXRhfSBmcm9tICcuLi9tZXRhZGF0YS9kaXJlY3RpdmVzJztcbmltcG9ydCB7aGFzTGlmZWN5Y2xlSG9va30gZnJvbSAnLi9kaXJlY3RpdmVfbGlmZWN5Y2xlX3JlZmxlY3Rvcic7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3RvcixcbiAgQ2hhbmdlRGV0ZWN0b3JSZWZcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7UXVlcnlMaXN0fSBmcm9tICcuL3F1ZXJ5X2xpc3QnO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge1NldHRlckZufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3R5cGVzJztcbmltcG9ydCB7RXZlbnRDb25maWd9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9ldmVudF9jb25maWcnO1xuaW1wb3J0IHtBZnRlclZpZXdDaGVja2VkfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9saW5rZXIvaW50ZXJmYWNlcyc7XG5pbXBvcnQge1BpcGVQcm92aWRlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcGlwZXMvcGlwZV9wcm92aWRlcic7XG5cbmltcG9ydCB7TGlmZWN5Y2xlSG9va3N9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQge1ZpZXdDb250YWluZXJSZWZffSBmcm9tIFwiLi92aWV3X2NvbnRhaW5lcl9yZWZcIjtcblxudmFyIF9zdGF0aWNLZXlzO1xuXG5leHBvcnQgY2xhc3MgU3RhdGljS2V5cyB7XG4gIHZpZXdNYW5hZ2VySWQ6IG51bWJlcjtcbiAgdGVtcGxhdGVSZWZJZDogbnVtYmVyO1xuICB2aWV3Q29udGFpbmVySWQ6IG51bWJlcjtcbiAgY2hhbmdlRGV0ZWN0b3JSZWZJZDogbnVtYmVyO1xuICBlbGVtZW50UmVmSWQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnZpZXdNYW5hZ2VySWQgPSBLZXkuZ2V0KGF2bU1vZHVsZS5BcHBWaWV3TWFuYWdlcikuaWQ7XG4gICAgdGhpcy50ZW1wbGF0ZVJlZklkID0gS2V5LmdldChUZW1wbGF0ZVJlZikuaWQ7XG4gICAgdGhpcy52aWV3Q29udGFpbmVySWQgPSBLZXkuZ2V0KFZpZXdDb250YWluZXJSZWYpLmlkO1xuICAgIHRoaXMuY2hhbmdlRGV0ZWN0b3JSZWZJZCA9IEtleS5nZXQoQ2hhbmdlRGV0ZWN0b3JSZWYpLmlkO1xuICAgIHRoaXMuZWxlbWVudFJlZklkID0gS2V5LmdldChFbGVtZW50UmVmKS5pZDtcbiAgfVxuXG4gIHN0YXRpYyBpbnN0YW5jZSgpOiBTdGF0aWNLZXlzIHtcbiAgICBpZiAoaXNCbGFuayhfc3RhdGljS2V5cykpIF9zdGF0aWNLZXlzID0gbmV3IFN0YXRpY0tleXMoKTtcbiAgICByZXR1cm4gX3N0YXRpY0tleXM7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFRyZWVOb2RlPFQgZXh0ZW5kcyBUcmVlTm9kZTxhbnk+PiB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BhcmVudDogVDtcbiAgY29uc3RydWN0b3IocGFyZW50OiBUKSB7XG4gICAgaWYgKGlzUHJlc2VudChwYXJlbnQpKSB7XG4gICAgICBwYXJlbnQuYWRkQ2hpbGQodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3BhcmVudCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgYWRkQ2hpbGQoY2hpbGQ6IFQpOiB2b2lkIHsgY2hpbGQuX3BhcmVudCA9IHRoaXM7IH1cblxuICByZW1vdmUoKTogdm9pZCB7IHRoaXMuX3BhcmVudCA9IG51bGw7IH1cblxuICBnZXQgcGFyZW50KCkgeyByZXR1cm4gdGhpcy5fcGFyZW50OyB9XG59XG5cbmV4cG9ydCBjbGFzcyBEaXJlY3RpdmVEZXBlbmRlbmN5IGV4dGVuZHMgRGVwZW5kZW5jeSB7XG4gIGNvbnN0cnVjdG9yKGtleTogS2V5LCBvcHRpb25hbDogYm9vbGVhbiwgbG93ZXJCb3VuZFZpc2liaWxpdHk6IE9iamVjdCxcbiAgICAgICAgICAgICAgdXBwZXJCb3VuZFZpc2liaWxpdHk6IE9iamVjdCwgcHJvcGVydGllczogYW55W10sIHB1YmxpYyBhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsXG4gICAgICAgICAgICAgIHB1YmxpYyBxdWVyeURlY29yYXRvcjogUXVlcnlNZXRhZGF0YSkge1xuICAgIHN1cGVyKGtleSwgb3B0aW9uYWwsIGxvd2VyQm91bmRWaXNpYmlsaXR5LCB1cHBlckJvdW5kVmlzaWJpbGl0eSwgcHJvcGVydGllcyk7XG4gICAgdGhpcy5fdmVyaWZ5KCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF92ZXJpZnkoKTogdm9pZCB7XG4gICAgdmFyIGNvdW50ID0gMDtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnlEZWNvcmF0b3IpKSBjb3VudCsrO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5hdHRyaWJ1dGVOYW1lKSkgY291bnQrKztcbiAgICBpZiAoY291bnQgPiAxKVxuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgJ0EgZGlyZWN0aXZlIGluamVjdGFibGUgY2FuIGNvbnRhaW4gb25seSBvbmUgb2YgdGhlIGZvbGxvd2luZyBAQXR0cmlidXRlIG9yIEBRdWVyeS4nKTtcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGVGcm9tKGQ6IERlcGVuZGVuY3kpOiBEZXBlbmRlbmN5IHtcbiAgICByZXR1cm4gbmV3IERpcmVjdGl2ZURlcGVuZGVuY3koXG4gICAgICAgIGQua2V5LCBkLm9wdGlvbmFsLCBkLmxvd2VyQm91bmRWaXNpYmlsaXR5LCBkLnVwcGVyQm91bmRWaXNpYmlsaXR5LCBkLnByb3BlcnRpZXMsXG4gICAgICAgIERpcmVjdGl2ZURlcGVuZGVuY3kuX2F0dHJpYnV0ZU5hbWUoZC5wcm9wZXJ0aWVzKSwgRGlyZWN0aXZlRGVwZW5kZW5jeS5fcXVlcnkoZC5wcm9wZXJ0aWVzKSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHN0YXRpYyBfYXR0cmlidXRlTmFtZShwcm9wZXJ0aWVzOiBhbnlbXSk6IHN0cmluZyB7XG4gICAgdmFyIHAgPSA8QXR0cmlidXRlTWV0YWRhdGE+cHJvcGVydGllcy5maW5kKHAgPT4gcCBpbnN0YW5jZW9mIEF0dHJpYnV0ZU1ldGFkYXRhKTtcbiAgICByZXR1cm4gaXNQcmVzZW50KHApID8gcC5hdHRyaWJ1dGVOYW1lIDogbnVsbDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgc3RhdGljIF9xdWVyeShwcm9wZXJ0aWVzOiBhbnlbXSk6IFF1ZXJ5TWV0YWRhdGEge1xuICAgIHJldHVybiA8UXVlcnlNZXRhZGF0YT5wcm9wZXJ0aWVzLmZpbmQocCA9PiBwIGluc3RhbmNlb2YgUXVlcnlNZXRhZGF0YSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIERpcmVjdGl2ZVByb3ZpZGVyIGV4dGVuZHMgUmVzb2x2ZWRQcm92aWRlcl8ge1xuICBwdWJsaWMgY2FsbE9uRGVzdHJveTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihrZXk6IEtleSwgZmFjdG9yeTogRnVuY3Rpb24sIGRlcHM6IERlcGVuZGVuY3lbXSwgcHVibGljIG1ldGFkYXRhOiBEaXJlY3RpdmVNZXRhZGF0YSxcbiAgICAgICAgICAgICAgcHVibGljIHByb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+LFxuICAgICAgICAgICAgICBwdWJsaWMgdmlld1Byb3ZpZGVyczogQXJyYXk8VHlwZSB8IFByb3ZpZGVyIHwgYW55W10+KSB7XG4gICAgc3VwZXIoa2V5LCBbbmV3IFJlc29sdmVkRmFjdG9yeShmYWN0b3J5LCBkZXBzKV0sIGZhbHNlKTtcbiAgICB0aGlzLmNhbGxPbkRlc3Ryb3kgPSBoYXNMaWZlY3ljbGVIb29rKExpZmVjeWNsZUhvb2tzLk9uRGVzdHJveSwga2V5LnRva2VuKTtcbiAgfVxuXG4gIGdldCBkaXNwbGF5TmFtZSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy5rZXkuZGlzcGxheU5hbWU7IH1cblxuICBnZXQgcXVlcmllcygpOiBRdWVyeU1ldGFkYXRhV2l0aFNldHRlcltdIHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLm1ldGFkYXRhLnF1ZXJpZXMpKSByZXR1cm4gW107XG5cbiAgICB2YXIgcmVzID0gW107XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHRoaXMubWV0YWRhdGEucXVlcmllcywgKG1ldGEsIGZpZWxkTmFtZSkgPT4ge1xuICAgICAgdmFyIHNldHRlciA9IHJlZmxlY3Rvci5zZXR0ZXIoZmllbGROYW1lKTtcbiAgICAgIHJlcy5wdXNoKG5ldyBRdWVyeU1ldGFkYXRhV2l0aFNldHRlcihzZXR0ZXIsIG1ldGEpKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzO1xuICB9XG5cbiAgZ2V0IGV2ZW50RW1pdHRlcnMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5tZXRhZGF0YSkgJiYgaXNQcmVzZW50KHRoaXMubWV0YWRhdGEub3V0cHV0cykgPyB0aGlzLm1ldGFkYXRhLm91dHB1dHMgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXTtcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGVGcm9tUHJvdmlkZXIocHJvdmlkZXI6IFByb3ZpZGVyLCBtZXRhOiBEaXJlY3RpdmVNZXRhZGF0YSk6IERpcmVjdGl2ZVByb3ZpZGVyIHtcbiAgICBpZiAoaXNCbGFuayhtZXRhKSkge1xuICAgICAgbWV0YSA9IG5ldyBEaXJlY3RpdmVNZXRhZGF0YSgpO1xuICAgIH1cblxuICAgIHZhciByYiA9IHJlc29sdmVQcm92aWRlcihwcm92aWRlcik7XG4gICAgdmFyIHJmID0gcmIucmVzb2x2ZWRGYWN0b3JpZXNbMF07XG4gICAgdmFyIGRlcHMgPSByZi5kZXBlbmRlbmNpZXMubWFwKERpcmVjdGl2ZURlcGVuZGVuY3kuY3JlYXRlRnJvbSk7XG5cbiAgICB2YXIgcHJvdmlkZXJzID0gaXNQcmVzZW50KG1ldGEucHJvdmlkZXJzKSA/IG1ldGEucHJvdmlkZXJzIDogW107XG4gICAgdmFyIHZpZXdCaW5kaWdzID0gbWV0YSBpbnN0YW5jZW9mIENvbXBvbmVudE1ldGFkYXRhICYmIGlzUHJlc2VudChtZXRhLnZpZXdQcm92aWRlcnMpID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0YS52aWV3UHJvdmlkZXJzIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgW107XG4gICAgcmV0dXJuIG5ldyBEaXJlY3RpdmVQcm92aWRlcihyYi5rZXksIHJmLmZhY3RvcnksIGRlcHMsIG1ldGEsIHByb3ZpZGVycywgdmlld0JpbmRpZ3MpO1xuICB9XG5cbiAgc3RhdGljIGNyZWF0ZUZyb21UeXBlKHR5cGU6IFR5cGUsIGFubm90YXRpb246IERpcmVjdGl2ZU1ldGFkYXRhKTogRGlyZWN0aXZlUHJvdmlkZXIge1xuICAgIHZhciBwcm92aWRlciA9IG5ldyBQcm92aWRlcih0eXBlLCB7dXNlQ2xhc3M6IHR5cGV9KTtcbiAgICByZXR1cm4gRGlyZWN0aXZlUHJvdmlkZXIuY3JlYXRlRnJvbVByb3ZpZGVyKHByb3ZpZGVyLCBhbm5vdGF0aW9uKTtcbiAgfVxufVxuXG4vLyBUT0RPKHJhZG8pOiBiZW5jaG1hcmsgYW5kIGNvbnNpZGVyIHJvbGxpbmcgaW4gYXMgRWxlbWVudEluamVjdG9yIGZpZWxkcy5cbmV4cG9ydCBjbGFzcyBQcmVCdWlsdE9iamVjdHMge1xuICBuZXN0ZWRWaWV3OiBBcHBWaWV3ID0gbnVsbDtcbiAgY29uc3RydWN0b3IocHVibGljIHZpZXdNYW5hZ2VyOiBhdm1Nb2R1bGUuQXBwVmlld01hbmFnZXIsIHB1YmxpYyB2aWV3OiBBcHBWaWV3LFxuICAgICAgICAgICAgICBwdWJsaWMgZWxlbWVudFJlZjogRWxlbWVudFJlZiwgcHVibGljIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZikge31cbn1cblxuZXhwb3J0IGNsYXNzIFF1ZXJ5TWV0YWRhdGFXaXRoU2V0dGVyIHtcbiAgY29uc3RydWN0b3IocHVibGljIHNldHRlcjogU2V0dGVyRm4sIHB1YmxpYyBtZXRhZGF0YTogUXVlcnlNZXRhZGF0YSkge31cbn1cblxuZXhwb3J0IGNsYXNzIEV2ZW50RW1pdHRlckFjY2Vzc29yIHtcbiAgY29uc3RydWN0b3IocHVibGljIGV2ZW50TmFtZTogc3RyaW5nLCBwdWJsaWMgZ2V0dGVyOiBGdW5jdGlvbikge31cblxuICBzdWJzY3JpYmUodmlldzogQXBwVmlldywgYm91bmRFbGVtZW50SW5kZXg6IG51bWJlciwgZGlyZWN0aXZlOiBPYmplY3QpOiBPYmplY3Qge1xuICAgIHZhciBldmVudEVtaXR0ZXIgPSB0aGlzLmdldHRlcihkaXJlY3RpdmUpO1xuICAgIHJldHVybiBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmU8RXZlbnQ+KFxuICAgICAgICBldmVudEVtaXR0ZXIsXG4gICAgICAgIGV2ZW50T2JqID0+IHZpZXcudHJpZ2dlckV2ZW50SGFuZGxlcnModGhpcy5ldmVudE5hbWUsIGV2ZW50T2JqLCBib3VuZEVsZW1lbnRJbmRleCkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVFdmVudEVtaXR0ZXJBY2Nlc3NvcnMoYnd2OiBQcm92aWRlcldpdGhWaXNpYmlsaXR5KTogRXZlbnRFbWl0dGVyQWNjZXNzb3JbXSB7XG4gIHZhciBwcm92aWRlciA9IGJ3di5wcm92aWRlcjtcbiAgaWYgKCEocHJvdmlkZXIgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlcikpIHJldHVybiBbXTtcbiAgdmFyIGRiID0gPERpcmVjdGl2ZVByb3ZpZGVyPnByb3ZpZGVyO1xuICByZXR1cm4gZGIuZXZlbnRFbWl0dGVycy5tYXAoZXZlbnRDb25maWcgPT4ge1xuICAgIHZhciBwYXJzZWRFdmVudCA9IEV2ZW50Q29uZmlnLnBhcnNlKGV2ZW50Q29uZmlnKTtcbiAgICByZXR1cm4gbmV3IEV2ZW50RW1pdHRlckFjY2Vzc29yKHBhcnNlZEV2ZW50LmV2ZW50TmFtZSwgcmVmbGVjdG9yLmdldHRlcihwYXJzZWRFdmVudC5maWVsZE5hbWUpKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVQcm90b1F1ZXJ5UmVmcyhwcm92aWRlcnM6IFByb3ZpZGVyV2l0aFZpc2liaWxpdHlbXSk6IFByb3RvUXVlcnlSZWZbXSB7XG4gIHZhciByZXMgPSBbXTtcbiAgTGlzdFdyYXBwZXIuZm9yRWFjaFdpdGhJbmRleChwcm92aWRlcnMsIChiLCBpKSA9PiB7XG4gICAgaWYgKGIucHJvdmlkZXIgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlcikge1xuICAgICAgdmFyIGRpcmVjdGl2ZVByb3ZpZGVyID0gPERpcmVjdGl2ZVByb3ZpZGVyPmIucHJvdmlkZXI7XG4gICAgICAvLyBmaWVsZCBxdWVyaWVzXG4gICAgICB2YXIgcXVlcmllczogUXVlcnlNZXRhZGF0YVdpdGhTZXR0ZXJbXSA9IGRpcmVjdGl2ZVByb3ZpZGVyLnF1ZXJpZXM7XG4gICAgICBxdWVyaWVzLmZvckVhY2gocSA9PiByZXMucHVzaChuZXcgUHJvdG9RdWVyeVJlZihpLCBxLnNldHRlciwgcS5tZXRhZGF0YSkpKTtcblxuICAgICAgLy8gcXVlcmllcyBwYXNzZWQgaW50byB0aGUgY29uc3RydWN0b3IuXG4gICAgICAvLyBUT0RPOiByZW1vdmUgdGhpcyBhZnRlciBjb25zdHJ1Y3RvciBxdWVyaWVzIGFyZSBubyBsb25nZXIgc3VwcG9ydGVkXG4gICAgICB2YXIgZGVwczogRGlyZWN0aXZlRGVwZW5kZW5jeVtdID1cbiAgICAgICAgICA8RGlyZWN0aXZlRGVwZW5kZW5jeVtdPmRpcmVjdGl2ZVByb3ZpZGVyLnJlc29sdmVkRmFjdG9yeS5kZXBlbmRlbmNpZXM7XG4gICAgICBkZXBzLmZvckVhY2goZCA9PiB7XG4gICAgICAgIGlmIChpc1ByZXNlbnQoZC5xdWVyeURlY29yYXRvcikpIHJlcy5wdXNoKG5ldyBQcm90b1F1ZXJ5UmVmKGksIG51bGwsIGQucXVlcnlEZWNvcmF0b3IpKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiByZXM7XG59XG5cbmV4cG9ydCBjbGFzcyBQcm90b0VsZW1lbnRJbmplY3RvciB7XG4gIHZpZXc6IEFwcFZpZXc7XG4gIGF0dHJpYnV0ZXM6IE1hcDxzdHJpbmcsIHN0cmluZz47XG4gIGV2ZW50RW1pdHRlckFjY2Vzc29yczogRXZlbnRFbWl0dGVyQWNjZXNzb3JbXVtdO1xuICBwcm90b1F1ZXJ5UmVmczogUHJvdG9RdWVyeVJlZltdO1xuICBwcm90b0luamVjdG9yOiBQcm90b0luamVjdG9yO1xuXG4gIHN0YXRpYyBjcmVhdGUocGFyZW50OiBQcm90b0VsZW1lbnRJbmplY3RvciwgaW5kZXg6IG51bWJlciwgcHJvdmlkZXJzOiBEaXJlY3RpdmVQcm92aWRlcltdLFxuICAgICAgICAgICAgICAgIGZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudDogYm9vbGVhbiwgZGlzdGFuY2VUb1BhcmVudDogbnVtYmVyLFxuICAgICAgICAgICAgICAgIGRpcmVjdGl2ZVZhcmlhYmxlQmluZGluZ3M6IE1hcDxzdHJpbmcsIG51bWJlcj4pOiBQcm90b0VsZW1lbnRJbmplY3RvciB7XG4gICAgdmFyIGJkID0gW107XG5cbiAgICBQcm90b0VsZW1lbnRJbmplY3Rvci5fY3JlYXRlRGlyZWN0aXZlUHJvdmlkZXJXaXRoVmlzaWJpbGl0eShwcm92aWRlcnMsIGJkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudCk7XG4gICAgaWYgKGZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudCkge1xuICAgICAgUHJvdG9FbGVtZW50SW5qZWN0b3IuX2NyZWF0ZVZpZXdQcm92aWRlcnNXaXRoVmlzaWJpbGl0eShwcm92aWRlcnMsIGJkKTtcbiAgICB9XG5cbiAgICBQcm90b0VsZW1lbnRJbmplY3Rvci5fY3JlYXRlUHJvdmlkZXJzV2l0aFZpc2liaWxpdHkocHJvdmlkZXJzLCBiZCk7XG4gICAgcmV0dXJuIG5ldyBQcm90b0VsZW1lbnRJbmplY3RvcihwYXJlbnQsIGluZGV4LCBiZCwgZGlzdGFuY2VUb1BhcmVudCwgZmlyc3RQcm92aWRlcklzQ29tcG9uZW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyZWN0aXZlVmFyaWFibGVCaW5kaW5ncyk7XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyBfY3JlYXRlRGlyZWN0aXZlUHJvdmlkZXJXaXRoVmlzaWJpbGl0eShkaXJQcm92aWRlcnM6IERpcmVjdGl2ZVByb3ZpZGVyW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJkOiBQcm92aWRlcldpdGhWaXNpYmlsaXR5W10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudDogYm9vbGVhbikge1xuICAgIGRpclByb3ZpZGVycy5mb3JFYWNoKGRpclByb3ZpZGVyID0+IHtcbiAgICAgIGJkLnB1c2goUHJvdG9FbGVtZW50SW5qZWN0b3IuX2NyZWF0ZVByb3ZpZGVyV2l0aFZpc2liaWxpdHkoXG4gICAgICAgICAgZmlyc3RQcm92aWRlcklzQ29tcG9uZW50LCBkaXJQcm92aWRlciwgZGlyUHJvdmlkZXJzLCBkaXJQcm92aWRlcikpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgX2NyZWF0ZVByb3ZpZGVyc1dpdGhWaXNpYmlsaXR5KGRpclByb3ZpZGVyczogRGlyZWN0aXZlUHJvdmlkZXJbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJkOiBQcm92aWRlcldpdGhWaXNpYmlsaXR5W10pIHtcbiAgICB2YXIgcHJvdmlkZXJzRnJvbUFsbERpcmVjdGl2ZXMgPSBbXTtcbiAgICBkaXJQcm92aWRlcnMuZm9yRWFjaChkaXJQcm92aWRlciA9PiB7XG4gICAgICBwcm92aWRlcnNGcm9tQWxsRGlyZWN0aXZlcyA9XG4gICAgICAgICAgTGlzdFdyYXBwZXIuY29uY2F0KHByb3ZpZGVyc0Zyb21BbGxEaXJlY3RpdmVzLCBkaXJQcm92aWRlci5wcm92aWRlcnMpO1xuICAgIH0pO1xuXG4gICAgdmFyIHJlc29sdmVkID0gSW5qZWN0b3IucmVzb2x2ZShwcm92aWRlcnNGcm9tQWxsRGlyZWN0aXZlcyk7XG4gICAgcmVzb2x2ZWQuZm9yRWFjaChiID0+IGJkLnB1c2gobmV3IFByb3ZpZGVyV2l0aFZpc2liaWxpdHkoYiwgVmlzaWJpbGl0eS5QdWJsaWMpKSk7XG4gIH1cblxuICBwcml2YXRlIHN0YXRpYyBfY3JlYXRlUHJvdmlkZXJXaXRoVmlzaWJpbGl0eShmaXJzdFByb3ZpZGVySXNDb21wb25lbnQ6IGJvb2xlYW4sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpclByb3ZpZGVyOiBEaXJlY3RpdmVQcm92aWRlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlyUHJvdmlkZXJzOiBEaXJlY3RpdmVQcm92aWRlcltdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm92aWRlcjogUmVzb2x2ZWRQcm92aWRlcikge1xuICAgIHZhciBpc0NvbXBvbmVudCA9IGZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudCAmJiBkaXJQcm92aWRlcnNbMF0gPT09IGRpclByb3ZpZGVyO1xuICAgIHJldHVybiBuZXcgUHJvdmlkZXJXaXRoVmlzaWJpbGl0eShcbiAgICAgICAgcHJvdmlkZXIsIGlzQ29tcG9uZW50ID8gVmlzaWJpbGl0eS5QdWJsaWNBbmRQcml2YXRlIDogVmlzaWJpbGl0eS5QdWJsaWMpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdGF0aWMgX2NyZWF0ZVZpZXdQcm92aWRlcnNXaXRoVmlzaWJpbGl0eShkaXJQcm92aWRlcnM6IERpcmVjdGl2ZVByb3ZpZGVyW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmQ6IFByb3ZpZGVyV2l0aFZpc2liaWxpdHlbXSkge1xuICAgIHZhciByZXNvbHZlZFZpZXdQcm92aWRlcnMgPSBJbmplY3Rvci5yZXNvbHZlKGRpclByb3ZpZGVyc1swXS52aWV3UHJvdmlkZXJzKTtcbiAgICByZXNvbHZlZFZpZXdQcm92aWRlcnMuZm9yRWFjaChiID0+IGJkLnB1c2gobmV3IFByb3ZpZGVyV2l0aFZpc2liaWxpdHkoYiwgVmlzaWJpbGl0eS5Qcml2YXRlKSkpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwdWJsaWMgX2ZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudDogYm9vbGVhbjtcblxuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwYXJlbnQ6IFByb3RvRWxlbWVudEluamVjdG9yLCBwdWJsaWMgaW5kZXg6IG51bWJlcixcbiAgICAgICAgICAgICAgYnd2OiBQcm92aWRlcldpdGhWaXNpYmlsaXR5W10sIHB1YmxpYyBkaXN0YW5jZVRvUGFyZW50OiBudW1iZXIsXG4gICAgICAgICAgICAgIF9maXJzdFByb3ZpZGVySXNDb21wb25lbnQ6IGJvb2xlYW4sXG4gICAgICAgICAgICAgIHB1YmxpYyBkaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzOiBNYXA8c3RyaW5nLCBudW1iZXI+KSB7XG4gICAgdGhpcy5fZmlyc3RQcm92aWRlcklzQ29tcG9uZW50ID0gX2ZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudDtcbiAgICB2YXIgbGVuZ3RoID0gYnd2Lmxlbmd0aDtcbiAgICB0aGlzLnByb3RvSW5qZWN0b3IgPSBuZXcgUHJvdG9JbmplY3Rvcihid3YpO1xuICAgIHRoaXMuZXZlbnRFbWl0dGVyQWNjZXNzb3JzID0gTGlzdFdyYXBwZXIuY3JlYXRlRml4ZWRTaXplKGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgICAgdGhpcy5ldmVudEVtaXR0ZXJBY2Nlc3NvcnNbaV0gPSBfY3JlYXRlRXZlbnRFbWl0dGVyQWNjZXNzb3JzKGJ3dltpXSk7XG4gICAgfVxuICAgIHRoaXMucHJvdG9RdWVyeVJlZnMgPSBfY3JlYXRlUHJvdG9RdWVyeVJlZnMoYnd2KTtcbiAgfVxuXG4gIGluc3RhbnRpYXRlKHBhcmVudDogRWxlbWVudEluamVjdG9yKTogRWxlbWVudEluamVjdG9yIHtcbiAgICByZXR1cm4gbmV3IEVsZW1lbnRJbmplY3Rvcih0aGlzLCBwYXJlbnQpO1xuICB9XG5cbiAgZGlyZWN0UGFyZW50KCk6IFByb3RvRWxlbWVudEluamVjdG9yIHsgcmV0dXJuIHRoaXMuZGlzdGFuY2VUb1BhcmVudCA8IDIgPyB0aGlzLnBhcmVudCA6IG51bGw7IH1cblxuICBnZXQgaGFzQmluZGluZ3MoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLmV2ZW50RW1pdHRlckFjY2Vzc29ycy5sZW5ndGggPiAwOyB9XG5cbiAgZ2V0UHJvdmlkZXJBdEluZGV4KGluZGV4OiBudW1iZXIpOiBhbnkgeyByZXR1cm4gdGhpcy5wcm90b0luamVjdG9yLmdldFByb3ZpZGVyQXRJbmRleChpbmRleCk7IH1cbn1cblxuY2xhc3MgX0NvbnRleHQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZWxlbWVudDogYW55LCBwdWJsaWMgY29tcG9uZW50RWxlbWVudDogYW55LCBwdWJsaWMgaW5qZWN0b3I6IGFueSkge31cbn1cblxuZXhwb3J0IGNsYXNzIEVsZW1lbnRJbmplY3RvciBleHRlbmRzIFRyZWVOb2RlPEVsZW1lbnRJbmplY3Rvcj4gaW1wbGVtZW50cyBEZXBlbmRlbmN5UHJvdmlkZXIsXG4gICAgQWZ0ZXJWaWV3Q2hlY2tlZCB7XG4gIHByaXZhdGUgX2hvc3Q6IEVsZW1lbnRJbmplY3RvcjtcbiAgcHJpdmF0ZSBfcHJlQnVpbHRPYmplY3RzOiBQcmVCdWlsdE9iamVjdHMgPSBudWxsO1xuICBwcml2YXRlIF9xdWVyeVN0cmF0ZWd5OiBfUXVlcnlTdHJhdGVneTtcblxuICBoeWRyYXRlZDogYm9vbGVhbjtcblxuICBwcml2YXRlIF9pbmplY3RvcjogSW5qZWN0b3I7XG4gIHByaXZhdGUgX3N0cmF0ZWd5OiBfRWxlbWVudEluamVjdG9yU3RyYXRlZ3k7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIF9wcm90bzogUHJvdG9FbGVtZW50SW5qZWN0b3I7XG5cbiAgY29uc3RydWN0b3IoX3Byb3RvOiBQcm90b0VsZW1lbnRJbmplY3RvciwgcGFyZW50OiBFbGVtZW50SW5qZWN0b3IpIHtcbiAgICBzdXBlcihwYXJlbnQpO1xuICAgIHRoaXMuX3Byb3RvID0gX3Byb3RvO1xuICAgIHRoaXMuX2luamVjdG9yID1cbiAgICAgICAgbmV3IEluamVjdG9yKHRoaXMuX3Byb3RvLnByb3RvSW5qZWN0b3IsIG51bGwsIHRoaXMsICgpID0+IHRoaXMuX2RlYnVnQ29udGV4dCgpKTtcblxuICAgIC8vIHdlIGNvdXBsZSBvdXJzZWx2ZXMgdG8gdGhlIGluamVjdG9yIHN0cmF0ZWd5IHRvIGF2b2lkIHBvbHltb3ByaGljIGNhbGxzXG4gICAgdmFyIGluamVjdG9yU3RyYXRlZ3kgPSA8YW55PnRoaXMuX2luamVjdG9yLmludGVybmFsU3RyYXRlZ3k7XG4gICAgdGhpcy5fc3RyYXRlZ3kgPSBpbmplY3RvclN0cmF0ZWd5IGluc3RhbmNlb2YgSW5qZWN0b3JJbmxpbmVTdHJhdGVneSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5KGluamVjdG9yU3RyYXRlZ3ksIHRoaXMpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgRWxlbWVudEluamVjdG9yRHluYW1pY1N0cmF0ZWd5KGluamVjdG9yU3RyYXRlZ3ksIHRoaXMpO1xuXG4gICAgdGhpcy5oeWRyYXRlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5fcXVlcnlTdHJhdGVneSA9IHRoaXMuX2J1aWxkUXVlcnlTdHJhdGVneSgpO1xuICB9XG5cbiAgZGVoeWRyYXRlKCk6IHZvaWQge1xuICAgIHRoaXMuaHlkcmF0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9ob3N0ID0gbnVsbDtcbiAgICB0aGlzLl9wcmVCdWlsdE9iamVjdHMgPSBudWxsO1xuICAgIHRoaXMuX3N0cmF0ZWd5LmNhbGxPbkRlc3Ryb3koKTtcbiAgICB0aGlzLl9zdHJhdGVneS5kZWh5ZHJhdGUoKTtcbiAgICB0aGlzLl9xdWVyeVN0cmF0ZWd5LmRlaHlkcmF0ZSgpO1xuICB9XG5cbiAgaHlkcmF0ZShpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3I6IEluamVjdG9yLCBob3N0OiBFbGVtZW50SW5qZWN0b3IsXG4gICAgICAgICAgcHJlQnVpbHRPYmplY3RzOiBQcmVCdWlsdE9iamVjdHMpOiB2b2lkIHtcbiAgICB0aGlzLl9ob3N0ID0gaG9zdDtcbiAgICB0aGlzLl9wcmVCdWlsdE9iamVjdHMgPSBwcmVCdWlsdE9iamVjdHM7XG5cbiAgICB0aGlzLl9yZWF0dGFjaEluamVjdG9ycyhpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IpO1xuICAgIHRoaXMuX3F1ZXJ5U3RyYXRlZ3kuaHlkcmF0ZSgpO1xuICAgIHRoaXMuX3N0cmF0ZWd5Lmh5ZHJhdGUoKTtcblxuICAgIHRoaXMuaHlkcmF0ZWQgPSB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfZGVidWdDb250ZXh0KCk6IGFueSB7XG4gICAgdmFyIHAgPSB0aGlzLl9wcmVCdWlsdE9iamVjdHM7XG4gICAgdmFyIGluZGV4ID0gcC5lbGVtZW50UmVmLmJvdW5kRWxlbWVudEluZGV4IC0gcC52aWV3LmVsZW1lbnRPZmZzZXQ7XG4gICAgdmFyIGMgPSB0aGlzLl9wcmVCdWlsdE9iamVjdHMudmlldy5nZXREZWJ1Z0NvbnRleHQoaW5kZXgsIG51bGwpO1xuICAgIHJldHVybiBpc1ByZXNlbnQoYykgPyBuZXcgX0NvbnRleHQoYy5lbGVtZW50LCBjLmNvbXBvbmVudEVsZW1lbnQsIGMuaW5qZWN0b3IpIDogbnVsbDtcbiAgfVxuXG4gIHByaXZhdGUgX3JlYXR0YWNoSW5qZWN0b3JzKGltcGVyYXRpdmVseUNyZWF0ZWRJbmplY3RvcjogSW5qZWN0b3IpOiB2b2lkIHtcbiAgICAvLyBEeW5hbWljYWxseS1sb2FkZWQgY29tcG9uZW50IGluIHRoZSB0ZW1wbGF0ZS4gTm90IGEgcm9vdCBFbGVtZW50SW5qZWN0b3IuXG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9wYXJlbnQpKSB7XG4gICAgICBpZiAoaXNQcmVzZW50KGltcGVyYXRpdmVseUNyZWF0ZWRJbmplY3RvcikpIHtcbiAgICAgICAgLy8gVGhlIGltcGVyYXRpdmUgaW5qZWN0b3IgaXMgc2ltaWxhciB0byBoYXZpbmcgYW4gZWxlbWVudCBiZXR3ZWVuXG4gICAgICAgIC8vIHRoZSBkeW5hbWljLWxvYWRlZCBjb21wb25lbnQgYW5kIGl0cyBwYXJlbnQgPT4gbm8gYm91bmRhcmllcy5cbiAgICAgICAgdGhpcy5fcmVhdHRhY2hJbmplY3Rvcih0aGlzLl9pbmplY3RvciwgaW1wZXJhdGl2ZWx5Q3JlYXRlZEluamVjdG9yLCBmYWxzZSk7XG4gICAgICAgIHRoaXMuX3JlYXR0YWNoSW5qZWN0b3IoaW1wZXJhdGl2ZWx5Q3JlYXRlZEluamVjdG9yLCB0aGlzLl9wYXJlbnQuX2luamVjdG9yLCBmYWxzZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9yZWF0dGFjaEluamVjdG9yKHRoaXMuX2luamVjdG9yLCB0aGlzLl9wYXJlbnQuX2luamVjdG9yLCBmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIER5bmFtaWNhbGx5LWxvYWRlZCBjb21wb25lbnQgaW4gdGhlIHRlbXBsYXRlLiBBIHJvb3QgRWxlbWVudEluamVjdG9yLlxuICAgIH0gZWxzZSBpZiAoaXNQcmVzZW50KHRoaXMuX2hvc3QpKSB7XG4gICAgICAvLyBUaGUgaW1wZXJhdGl2ZSBpbmplY3RvciBpcyBzaW1pbGFyIHRvIGhhdmluZyBhbiBlbGVtZW50IGJldHdlZW5cbiAgICAgIC8vIHRoZSBkeW5hbWljLWxvYWRlZCBjb21wb25lbnQgYW5kIGl0cyBwYXJlbnQgPT4gbm8gYm91bmRhcnkgYmV0d2VlblxuICAgICAgLy8gdGhlIGNvbXBvbmVudCBhbmQgaW1wZXJhdGl2ZWx5Q3JlYXRlZEluamVjdG9yLlxuICAgICAgLy8gQnV0IHNpbmNlIGl0IGlzIGEgcm9vdCBFbGVtZW50SW5qZWN0b3IsIHdlIG5lZWQgdG8gY3JlYXRlIGEgYm91bmRhcnlcbiAgICAgIC8vIGJldHdlZW4gaW1wZXJhdGl2ZWx5Q3JlYXRlZEluamVjdG9yIGFuZCBfaG9zdC5cbiAgICAgIGlmIChpc1ByZXNlbnQoaW1wZXJhdGl2ZWx5Q3JlYXRlZEluamVjdG9yKSkge1xuICAgICAgICB0aGlzLl9yZWF0dGFjaEluamVjdG9yKHRoaXMuX2luamVjdG9yLCBpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IsIGZhbHNlKTtcbiAgICAgICAgdGhpcy5fcmVhdHRhY2hJbmplY3RvcihpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IsIHRoaXMuX2hvc3QuX2luamVjdG9yLCB0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3JlYXR0YWNoSW5qZWN0b3IodGhpcy5faW5qZWN0b3IsIHRoaXMuX2hvc3QuX2luamVjdG9yLCB0cnVlKTtcbiAgICAgIH1cblxuICAgICAgLy8gQm9vdHN0cmFwXG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChpc1ByZXNlbnQoaW1wZXJhdGl2ZWx5Q3JlYXRlZEluamVjdG9yKSkge1xuICAgICAgICB0aGlzLl9yZWF0dGFjaEluamVjdG9yKHRoaXMuX2luamVjdG9yLCBpbXBlcmF0aXZlbHlDcmVhdGVkSW5qZWN0b3IsIHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3JlYXR0YWNoSW5qZWN0b3IoaW5qZWN0b3I6IEluamVjdG9yLCBwYXJlbnRJbmplY3RvcjogSW5qZWN0b3IsIGlzQm91bmRhcnk6IGJvb2xlYW4pIHtcbiAgICBpbmplY3Rvci5pbnRlcm5hbFN0cmF0ZWd5LmF0dGFjaChwYXJlbnRJbmplY3RvciwgaXNCb3VuZGFyeSk7XG4gIH1cblxuICBoYXNWYXJpYWJsZUJpbmRpbmcobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdmFyIHZiID0gdGhpcy5fcHJvdG8uZGlyZWN0aXZlVmFyaWFibGVCaW5kaW5ncztcbiAgICByZXR1cm4gaXNQcmVzZW50KHZiKSAmJiB2Yi5oYXMobmFtZSk7XG4gIH1cblxuICBnZXRWYXJpYWJsZUJpbmRpbmcobmFtZTogc3RyaW5nKTogYW55IHtcbiAgICB2YXIgaW5kZXggPSB0aGlzLl9wcm90by5kaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzLmdldChuYW1lKTtcbiAgICByZXR1cm4gaXNQcmVzZW50KGluZGV4KSA/IHRoaXMuZ2V0RGlyZWN0aXZlQXRJbmRleCg8bnVtYmVyPmluZGV4KSA6IHRoaXMuZ2V0RWxlbWVudFJlZigpO1xuICB9XG5cbiAgZ2V0KHRva2VuOiBhbnkpOiBhbnkgeyByZXR1cm4gdGhpcy5faW5qZWN0b3IuZ2V0KHRva2VuKTsgfVxuXG4gIGhhc0RpcmVjdGl2ZSh0eXBlOiBUeXBlKTogYm9vbGVhbiB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5faW5qZWN0b3IuZ2V0T3B0aW9uYWwodHlwZSkpOyB9XG5cbiAgZ2V0RXZlbnRFbWl0dGVyQWNjZXNzb3JzKCk6IEV2ZW50RW1pdHRlckFjY2Vzc29yW11bXSB7IHJldHVybiB0aGlzLl9wcm90by5ldmVudEVtaXR0ZXJBY2Nlc3NvcnM7IH1cblxuICBnZXREaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzKCk6IE1hcDxzdHJpbmcsIG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLl9wcm90by5kaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzO1xuICB9XG5cbiAgZ2V0Q29tcG9uZW50KCk6IGFueSB7IHJldHVybiB0aGlzLl9zdHJhdGVneS5nZXRDb21wb25lbnQoKTsgfVxuXG4gIGdldEluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIHRoaXMuX2luamVjdG9yOyB9XG5cbiAgZ2V0RWxlbWVudFJlZigpOiBFbGVtZW50UmVmIHsgcmV0dXJuIHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy5lbGVtZW50UmVmOyB9XG5cbiAgZ2V0Vmlld0NvbnRhaW5lclJlZigpOiBWaWV3Q29udGFpbmVyUmVmIHtcbiAgICByZXR1cm4gbmV3IFZpZXdDb250YWluZXJSZWZfKHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy52aWV3TWFuYWdlciwgdGhpcy5nZXRFbGVtZW50UmVmKCkpO1xuICB9XG5cbiAgZ2V0TmVzdGVkVmlldygpOiBBcHBWaWV3IHsgcmV0dXJuIHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy5uZXN0ZWRWaWV3OyB9XG5cbiAgZ2V0VmlldygpOiBBcHBWaWV3IHsgcmV0dXJuIHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy52aWV3OyB9XG5cbiAgZGlyZWN0UGFyZW50KCk6IEVsZW1lbnRJbmplY3RvciB7IHJldHVybiB0aGlzLl9wcm90by5kaXN0YW5jZVRvUGFyZW50IDwgMiA/IHRoaXMucGFyZW50IDogbnVsbDsgfVxuXG4gIGlzQ29tcG9uZW50S2V5KGtleTogS2V5KTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9zdHJhdGVneS5pc0NvbXBvbmVudEtleShrZXkpOyB9XG5cbiAgZ2V0RGVwZW5kZW5jeShpbmplY3RvcjogSW5qZWN0b3IsIHByb3ZpZGVyOiBSZXNvbHZlZFByb3ZpZGVyLCBkZXA6IERlcGVuZGVuY3kpOiBhbnkge1xuICAgIHZhciBrZXk6IEtleSA9IGRlcC5rZXk7XG5cbiAgICBpZiAocHJvdmlkZXIgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlcikge1xuICAgICAgdmFyIGRpckRlcCA9IDxEaXJlY3RpdmVEZXBlbmRlbmN5PmRlcDtcbiAgICAgIHZhciBkaXJQcm92aWRlciA9IHByb3ZpZGVyO1xuICAgICAgdmFyIHN0YXRpY0tleXMgPSBTdGF0aWNLZXlzLmluc3RhbmNlKCk7XG5cblxuICAgICAgaWYgKGtleS5pZCA9PT0gc3RhdGljS2V5cy52aWV3TWFuYWdlcklkKSByZXR1cm4gdGhpcy5fcHJlQnVpbHRPYmplY3RzLnZpZXdNYW5hZ2VyO1xuXG4gICAgICBpZiAoaXNQcmVzZW50KGRpckRlcC5hdHRyaWJ1dGVOYW1lKSkgcmV0dXJuIHRoaXMuX2J1aWxkQXR0cmlidXRlKGRpckRlcCk7XG5cbiAgICAgIGlmIChpc1ByZXNlbnQoZGlyRGVwLnF1ZXJ5RGVjb3JhdG9yKSlcbiAgICAgICAgcmV0dXJuIHRoaXMuX3F1ZXJ5U3RyYXRlZ3kuZmluZFF1ZXJ5KGRpckRlcC5xdWVyeURlY29yYXRvcikubGlzdDtcblxuICAgICAgaWYgKGRpckRlcC5rZXkuaWQgPT09IFN0YXRpY0tleXMuaW5zdGFuY2UoKS5jaGFuZ2VEZXRlY3RvclJlZklkKSB7XG4gICAgICAgIC8vIFdlIHByb3ZpZGUgdGhlIGNvbXBvbmVudCdzIHZpZXcgY2hhbmdlIGRldGVjdG9yIHRvIGNvbXBvbmVudHMgYW5kXG4gICAgICAgIC8vIHRoZSBzdXJyb3VuZGluZyBjb21wb25lbnQncyBjaGFuZ2UgZGV0ZWN0b3IgdG8gZGlyZWN0aXZlcy5cbiAgICAgICAgaWYgKGRpclByb3ZpZGVyLm1ldGFkYXRhIGluc3RhbmNlb2YgQ29tcG9uZW50TWV0YWRhdGEpIHtcbiAgICAgICAgICB2YXIgY29tcG9uZW50VmlldyA9IHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy52aWV3LmdldE5lc3RlZFZpZXcoXG4gICAgICAgICAgICAgIHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy5lbGVtZW50UmVmLmJvdW5kRWxlbWVudEluZGV4KTtcbiAgICAgICAgICByZXR1cm4gY29tcG9uZW50Vmlldy5jaGFuZ2VEZXRlY3Rvci5yZWY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy52aWV3LmNoYW5nZURldGVjdG9yLnJlZjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZGlyRGVwLmtleS5pZCA9PT0gU3RhdGljS2V5cy5pbnN0YW5jZSgpLmVsZW1lbnRSZWZJZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRFbGVtZW50UmVmKCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChkaXJEZXAua2V5LmlkID09PSBTdGF0aWNLZXlzLmluc3RhbmNlKCkudmlld0NvbnRhaW5lcklkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFZpZXdDb250YWluZXJSZWYoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRpckRlcC5rZXkuaWQgPT09IFN0YXRpY0tleXMuaW5zdGFuY2UoKS50ZW1wbGF0ZVJlZklkKSB7XG4gICAgICAgIGlmIChpc0JsYW5rKHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy50ZW1wbGF0ZVJlZikpIHtcbiAgICAgICAgICBpZiAoZGlyRGVwLm9wdGlvbmFsKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB0aHJvdyBuZXcgTm9Qcm92aWRlckVycm9yKG51bGwsIGRpckRlcC5rZXkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9wcmVCdWlsdE9iamVjdHMudGVtcGxhdGVSZWY7XG4gICAgICB9XG5cbiAgICB9IGVsc2UgaWYgKHByb3ZpZGVyIGluc3RhbmNlb2YgUGlwZVByb3ZpZGVyKSB7XG4gICAgICBpZiAoZGVwLmtleS5pZCA9PT0gU3RhdGljS2V5cy5pbnN0YW5jZSgpLmNoYW5nZURldGVjdG9yUmVmSWQpIHtcbiAgICAgICAgdmFyIGNvbXBvbmVudFZpZXcgPSB0aGlzLl9wcmVCdWlsdE9iamVjdHMudmlldy5nZXROZXN0ZWRWaWV3KFxuICAgICAgICAgICAgdGhpcy5fcHJlQnVpbHRPYmplY3RzLmVsZW1lbnRSZWYuYm91bmRFbGVtZW50SW5kZXgpO1xuICAgICAgICByZXR1cm4gY29tcG9uZW50Vmlldy5jaGFuZ2VEZXRlY3Rvci5yZWY7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIFVOREVGSU5FRDtcbiAgfVxuXG4gIHByaXZhdGUgX2J1aWxkQXR0cmlidXRlKGRlcDogRGlyZWN0aXZlRGVwZW5kZW5jeSk6IHN0cmluZyB7XG4gICAgdmFyIGF0dHJpYnV0ZXMgPSB0aGlzLl9wcm90by5hdHRyaWJ1dGVzO1xuICAgIGlmIChpc1ByZXNlbnQoYXR0cmlidXRlcykgJiYgYXR0cmlidXRlcy5oYXMoZGVwLmF0dHJpYnV0ZU5hbWUpKSB7XG4gICAgICByZXR1cm4gYXR0cmlidXRlcy5nZXQoZGVwLmF0dHJpYnV0ZU5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBhZGREaXJlY3RpdmVzTWF0Y2hpbmdRdWVyeShxdWVyeTogUXVlcnlNZXRhZGF0YSwgbGlzdDogYW55W10pOiB2b2lkIHtcbiAgICB2YXIgdGVtcGxhdGVSZWYgPSBpc0JsYW5rKHRoaXMuX3ByZUJ1aWx0T2JqZWN0cykgPyBudWxsIDogdGhpcy5fcHJlQnVpbHRPYmplY3RzLnRlbXBsYXRlUmVmO1xuICAgIGlmIChxdWVyeS5zZWxlY3RvciA9PT0gVGVtcGxhdGVSZWYgJiYgaXNQcmVzZW50KHRlbXBsYXRlUmVmKSkge1xuICAgICAgbGlzdC5wdXNoKHRlbXBsYXRlUmVmKTtcbiAgICB9XG4gICAgdGhpcy5fc3RyYXRlZ3kuYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkocXVlcnksIGxpc3QpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRRdWVyeVN0cmF0ZWd5KCk6IF9RdWVyeVN0cmF0ZWd5IHtcbiAgICBpZiAodGhpcy5fcHJvdG8ucHJvdG9RdWVyeVJlZnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gX2VtcHR5UXVlcnlTdHJhdGVneTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3Byb3RvLnByb3RvUXVlcnlSZWZzLmxlbmd0aCA8PVxuICAgICAgICAgICAgICAgSW5saW5lUXVlcnlTdHJhdGVneS5OVU1CRVJfT0ZfU1VQUE9SVEVEX1FVRVJJRVMpIHtcbiAgICAgIHJldHVybiBuZXcgSW5saW5lUXVlcnlTdHJhdGVneSh0aGlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBEeW5hbWljUXVlcnlTdHJhdGVneSh0aGlzKTtcbiAgICB9XG4gIH1cblxuICBsaW5rKHBhcmVudDogRWxlbWVudEluamVjdG9yKTogdm9pZCB7IHBhcmVudC5hZGRDaGlsZCh0aGlzKTsgfVxuXG4gIHVubGluaygpOiB2b2lkIHsgdGhpcy5yZW1vdmUoKTsgfVxuXG4gIGdldERpcmVjdGl2ZUF0SW5kZXgoaW5kZXg6IG51bWJlcik6IGFueSB7IHJldHVybiB0aGlzLl9pbmplY3Rvci5nZXRBdChpbmRleCk7IH1cblxuICBoYXNJbnN0YW5jZXMoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9wcm90by5oYXNCaW5kaW5ncyAmJiB0aGlzLmh5ZHJhdGVkOyB9XG5cbiAgZ2V0SG9zdCgpOiBFbGVtZW50SW5qZWN0b3IgeyByZXR1cm4gdGhpcy5faG9zdDsgfVxuXG4gIGdldEJvdW5kRWxlbWVudEluZGV4KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9wcm90by5pbmRleDsgfVxuXG4gIGdldFJvb3RWaWV3SW5qZWN0b3JzKCk6IEVsZW1lbnRJbmplY3RvcltdIHtcbiAgICBpZiAoIXRoaXMuaHlkcmF0ZWQpIHJldHVybiBbXTtcbiAgICB2YXIgdmlldyA9IHRoaXMuX3ByZUJ1aWx0T2JqZWN0cy52aWV3O1xuICAgIHZhciBuZXN0ZWRWaWV3ID0gdmlldy5nZXROZXN0ZWRWaWV3KHZpZXcuZWxlbWVudE9mZnNldCArIHRoaXMuZ2V0Qm91bmRFbGVtZW50SW5kZXgoKSk7XG4gICAgcmV0dXJuIGlzUHJlc2VudChuZXN0ZWRWaWV3KSA/IG5lc3RlZFZpZXcucm9vdEVsZW1lbnRJbmplY3RvcnMgOiBbXTtcbiAgfVxuXG4gIG5nQWZ0ZXJWaWV3Q2hlY2tlZCgpOiB2b2lkIHsgdGhpcy5fcXVlcnlTdHJhdGVneS51cGRhdGVWaWV3UXVlcmllcygpOyB9XG5cbiAgbmdBZnRlckNvbnRlbnRDaGVja2VkKCk6IHZvaWQgeyB0aGlzLl9xdWVyeVN0cmF0ZWd5LnVwZGF0ZUNvbnRlbnRRdWVyaWVzKCk7IH1cblxuICB0cmF2ZXJzZUFuZFNldFF1ZXJpZXNBc0RpcnR5KCk6IHZvaWQge1xuICAgIHZhciBpbmogPSB0aGlzO1xuICAgIHdoaWxlIChpc1ByZXNlbnQoaW5qKSkge1xuICAgICAgaW5qLl9zZXRRdWVyaWVzQXNEaXJ0eSgpO1xuICAgICAgaW5qID0gaW5qLnBhcmVudDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9zZXRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHtcbiAgICB0aGlzLl9xdWVyeVN0cmF0ZWd5LnNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSgpO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5faG9zdCkpIHRoaXMuX2hvc3QuX3F1ZXJ5U3RyYXRlZ3kuc2V0Vmlld1F1ZXJpZXNBc0RpcnR5KCk7XG4gIH1cbn1cblxuaW50ZXJmYWNlIF9RdWVyeVN0cmF0ZWd5IHtcbiAgc2V0Q29udGVudFF1ZXJpZXNBc0RpcnR5KCk6IHZvaWQ7XG4gIHNldFZpZXdRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkO1xuICBoeWRyYXRlKCk6IHZvaWQ7XG4gIGRlaHlkcmF0ZSgpOiB2b2lkO1xuICB1cGRhdGVDb250ZW50UXVlcmllcygpOiB2b2lkO1xuICB1cGRhdGVWaWV3UXVlcmllcygpOiB2b2lkO1xuICBmaW5kUXVlcnkocXVlcnk6IFF1ZXJ5TWV0YWRhdGEpOiBRdWVyeVJlZjtcbn1cblxuY2xhc3MgX0VtcHR5UXVlcnlTdHJhdGVneSBpbXBsZW1lbnRzIF9RdWVyeVN0cmF0ZWd5IHtcbiAgc2V0Q29udGVudFF1ZXJpZXNBc0RpcnR5KCk6IHZvaWQge31cbiAgc2V0Vmlld1F1ZXJpZXNBc0RpcnR5KCk6IHZvaWQge31cbiAgaHlkcmF0ZSgpOiB2b2lkIHt9XG4gIGRlaHlkcmF0ZSgpOiB2b2lkIHt9XG4gIHVwZGF0ZUNvbnRlbnRRdWVyaWVzKCk6IHZvaWQge31cbiAgdXBkYXRlVmlld1F1ZXJpZXMoKTogdm9pZCB7fVxuICBmaW5kUXVlcnkocXVlcnk6IFF1ZXJ5TWV0YWRhdGEpOiBRdWVyeVJlZiB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENhbm5vdCBmaW5kIHF1ZXJ5IGZvciBkaXJlY3RpdmUgJHtxdWVyeX0uYCk7XG4gIH1cbn1cblxudmFyIF9lbXB0eVF1ZXJ5U3RyYXRlZ3kgPSBuZXcgX0VtcHR5UXVlcnlTdHJhdGVneSgpO1xuXG5jbGFzcyBJbmxpbmVRdWVyeVN0cmF0ZWd5IGltcGxlbWVudHMgX1F1ZXJ5U3RyYXRlZ3kge1xuICBzdGF0aWMgTlVNQkVSX09GX1NVUFBPUlRFRF9RVUVSSUVTID0gMztcblxuICBxdWVyeTA6IFF1ZXJ5UmVmO1xuICBxdWVyeTE6IFF1ZXJ5UmVmO1xuICBxdWVyeTI6IFF1ZXJ5UmVmO1xuXG4gIGNvbnN0cnVjdG9yKGVpOiBFbGVtZW50SW5qZWN0b3IpIHtcbiAgICB2YXIgcHJvdG9SZWZzID0gZWkuX3Byb3RvLnByb3RvUXVlcnlSZWZzO1xuICAgIGlmIChwcm90b1JlZnMubGVuZ3RoID4gMCkgdGhpcy5xdWVyeTAgPSBuZXcgUXVlcnlSZWYocHJvdG9SZWZzWzBdLCBlaSk7XG4gICAgaWYgKHByb3RvUmVmcy5sZW5ndGggPiAxKSB0aGlzLnF1ZXJ5MSA9IG5ldyBRdWVyeVJlZihwcm90b1JlZnNbMV0sIGVpKTtcbiAgICBpZiAocHJvdG9SZWZzLmxlbmd0aCA+IDIpIHRoaXMucXVlcnkyID0gbmV3IFF1ZXJ5UmVmKHByb3RvUmVmc1syXSwgZWkpO1xuICB9XG5cbiAgc2V0Q29udGVudFF1ZXJpZXNBc0RpcnR5KCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTApICYmICF0aGlzLnF1ZXJ5MC5pc1ZpZXdRdWVyeSkgdGhpcy5xdWVyeTAuZGlydHkgPSB0cnVlO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTEpICYmICF0aGlzLnF1ZXJ5MS5pc1ZpZXdRdWVyeSkgdGhpcy5xdWVyeTEuZGlydHkgPSB0cnVlO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTIpICYmICF0aGlzLnF1ZXJ5Mi5pc1ZpZXdRdWVyeSkgdGhpcy5xdWVyeTIuZGlydHkgPSB0cnVlO1xuICB9XG5cbiAgc2V0Vmlld1F1ZXJpZXNBc0RpcnR5KCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTApICYmIHRoaXMucXVlcnkwLmlzVmlld1F1ZXJ5KSB0aGlzLnF1ZXJ5MC5kaXJ0eSA9IHRydWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MSkgJiYgdGhpcy5xdWVyeTEuaXNWaWV3UXVlcnkpIHRoaXMucXVlcnkxLmRpcnR5ID0gdHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkyKSAmJiB0aGlzLnF1ZXJ5Mi5pc1ZpZXdRdWVyeSkgdGhpcy5xdWVyeTIuZGlydHkgPSB0cnVlO1xuICB9XG5cbiAgaHlkcmF0ZSgpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkwKSkgdGhpcy5xdWVyeTAuaHlkcmF0ZSgpO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTEpKSB0aGlzLnF1ZXJ5MS5oeWRyYXRlKCk7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MikpIHRoaXMucXVlcnkyLmh5ZHJhdGUoKTtcbiAgfVxuXG4gIGRlaHlkcmF0ZSgpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkwKSkgdGhpcy5xdWVyeTAuZGVoeWRyYXRlKCk7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MSkpIHRoaXMucXVlcnkxLmRlaHlkcmF0ZSgpO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTIpKSB0aGlzLnF1ZXJ5Mi5kZWh5ZHJhdGUoKTtcbiAgfVxuXG4gIHVwZGF0ZUNvbnRlbnRRdWVyaWVzKCkge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTApICYmICF0aGlzLnF1ZXJ5MC5pc1ZpZXdRdWVyeSkge1xuICAgICAgdGhpcy5xdWVyeTAudXBkYXRlKCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTEpICYmICF0aGlzLnF1ZXJ5MS5pc1ZpZXdRdWVyeSkge1xuICAgICAgdGhpcy5xdWVyeTEudXBkYXRlKCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTIpICYmICF0aGlzLnF1ZXJ5Mi5pc1ZpZXdRdWVyeSkge1xuICAgICAgdGhpcy5xdWVyeTIudXBkYXRlKCk7XG4gICAgfVxuICB9XG5cbiAgdXBkYXRlVmlld1F1ZXJpZXMoKSB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MCkgJiYgdGhpcy5xdWVyeTAuaXNWaWV3UXVlcnkpIHtcbiAgICAgIHRoaXMucXVlcnkwLnVwZGF0ZSgpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkxKSAmJiB0aGlzLnF1ZXJ5MS5pc1ZpZXdRdWVyeSkge1xuICAgICAgdGhpcy5xdWVyeTEudXBkYXRlKCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTIpICYmIHRoaXMucXVlcnkyLmlzVmlld1F1ZXJ5KSB7XG4gICAgICB0aGlzLnF1ZXJ5Mi51cGRhdGUoKTtcbiAgICB9XG4gIH1cblxuICBmaW5kUXVlcnkocXVlcnk6IFF1ZXJ5TWV0YWRhdGEpOiBRdWVyeVJlZiB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MCkgJiYgdGhpcy5xdWVyeTAucHJvdG9RdWVyeVJlZi5xdWVyeSA9PT0gcXVlcnkpIHtcbiAgICAgIHJldHVybiB0aGlzLnF1ZXJ5MDtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MSkgJiYgdGhpcy5xdWVyeTEucHJvdG9RdWVyeVJlZi5xdWVyeSA9PT0gcXVlcnkpIHtcbiAgICAgIHJldHVybiB0aGlzLnF1ZXJ5MTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MikgJiYgdGhpcy5xdWVyeTIucHJvdG9RdWVyeVJlZi5xdWVyeSA9PT0gcXVlcnkpIHtcbiAgICAgIHJldHVybiB0aGlzLnF1ZXJ5MjtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENhbm5vdCBmaW5kIHF1ZXJ5IGZvciBkaXJlY3RpdmUgJHtxdWVyeX0uYCk7XG4gIH1cbn1cblxuY2xhc3MgRHluYW1pY1F1ZXJ5U3RyYXRlZ3kgaW1wbGVtZW50cyBfUXVlcnlTdHJhdGVneSB7XG4gIHF1ZXJpZXM6IFF1ZXJ5UmVmW107XG5cbiAgY29uc3RydWN0b3IoZWk6IEVsZW1lbnRJbmplY3Rvcikge1xuICAgIHRoaXMucXVlcmllcyA9IGVpLl9wcm90by5wcm90b1F1ZXJ5UmVmcy5tYXAocCA9PiBuZXcgUXVlcnlSZWYocCwgZWkpKTtcbiAgfVxuXG4gIHNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVlcmllcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHEgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICBpZiAoIXEuaXNWaWV3UXVlcnkpIHEuZGlydHkgPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIHNldFZpZXdRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVlcmllcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHEgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICBpZiAocS5pc1ZpZXdRdWVyeSkgcS5kaXJ0eSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgaHlkcmF0ZSgpOiB2b2lkIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVlcmllcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHEgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICBxLmh5ZHJhdGUoKTtcbiAgICB9XG4gIH1cblxuICBkZWh5ZHJhdGUoKTogdm9pZCB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHZhciBxID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgcS5kZWh5ZHJhdGUoKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVDb250ZW50UXVlcmllcygpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVlcmllcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHEgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICBpZiAoIXEuaXNWaWV3UXVlcnkpIHtcbiAgICAgICAgcS51cGRhdGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1cGRhdGVWaWV3UXVlcmllcygpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVlcmllcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHEgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICBpZiAocS5pc1ZpZXdRdWVyeSkge1xuICAgICAgICBxLnVwZGF0ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZpbmRRdWVyeShxdWVyeTogUXVlcnlNZXRhZGF0YSk6IFF1ZXJ5UmVmIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVlcmllcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHEgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICBpZiAocS5wcm90b1F1ZXJ5UmVmLnF1ZXJ5ID09PSBxdWVyeSkge1xuICAgICAgICByZXR1cm4gcTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENhbm5vdCBmaW5kIHF1ZXJ5IGZvciBkaXJlY3RpdmUgJHtxdWVyeX0uYCk7XG4gIH1cbn1cblxuaW50ZXJmYWNlIF9FbGVtZW50SW5qZWN0b3JTdHJhdGVneSB7XG4gIGNhbGxPbkRlc3Ryb3koKTogdm9pZDtcbiAgZ2V0Q29tcG9uZW50KCk6IGFueTtcbiAgaXNDb21wb25lbnRLZXkoa2V5OiBLZXkpOiBib29sZWFuO1xuICBhZGREaXJlY3RpdmVzTWF0Y2hpbmdRdWVyeShxOiBRdWVyeU1ldGFkYXRhLCByZXM6IGFueVtdKTogdm9pZDtcbiAgaHlkcmF0ZSgpOiB2b2lkO1xuICBkZWh5ZHJhdGUoKTogdm9pZDtcbn1cblxuLyoqXG4gKiBTdHJhdGVneSB1c2VkIGJ5IHRoZSBgRWxlbWVudEluamVjdG9yYCB3aGVuIHRoZSBudW1iZXIgb2YgcHJvdmlkZXJzIGlzIDEwIG9yIGxlc3MuXG4gKiBJbiBzdWNoIGEgY2FzZSwgaW5saW5pbmcgZmllbGRzIGlzIGJlbmVmaWNpYWwgZm9yIHBlcmZvcm1hbmNlcy5cbiAqL1xuY2xhc3MgRWxlbWVudEluamVjdG9ySW5saW5lU3RyYXRlZ3kgaW1wbGVtZW50cyBfRWxlbWVudEluamVjdG9yU3RyYXRlZ3kge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW5qZWN0b3JTdHJhdGVneTogSW5qZWN0b3JJbmxpbmVTdHJhdGVneSwgcHVibGljIF9laTogRWxlbWVudEluamVjdG9yKSB7fVxuXG4gIGh5ZHJhdGUoKTogdm9pZCB7XG4gICAgdmFyIGkgPSB0aGlzLmluamVjdG9yU3RyYXRlZ3k7XG4gICAgdmFyIHAgPSBpLnByb3RvU3RyYXRlZ3k7XG4gICAgaS5yZXNldENvbnN0cnVjdGlvbkNvdW50ZXIoKTtcblxuICAgIGlmIChwLnByb3ZpZGVyMCBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmIGlzUHJlc2VudChwLmtleUlkMCkgJiYgaS5vYmowID09PSBVTkRFRklORUQpXG4gICAgICBpLm9iajAgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjAsIHAudmlzaWJpbGl0eTApO1xuICAgIGlmIChwLnByb3ZpZGVyMSBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmIGlzUHJlc2VudChwLmtleUlkMSkgJiYgaS5vYmoxID09PSBVTkRFRklORUQpXG4gICAgICBpLm9iajEgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjEsIHAudmlzaWJpbGl0eTEpO1xuICAgIGlmIChwLnByb3ZpZGVyMiBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmIGlzUHJlc2VudChwLmtleUlkMikgJiYgaS5vYmoyID09PSBVTkRFRklORUQpXG4gICAgICBpLm9iajIgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjIsIHAudmlzaWJpbGl0eTIpO1xuICAgIGlmIChwLnByb3ZpZGVyMyBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmIGlzUHJlc2VudChwLmtleUlkMykgJiYgaS5vYmozID09PSBVTkRFRklORUQpXG4gICAgICBpLm9iajMgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjMsIHAudmlzaWJpbGl0eTMpO1xuICAgIGlmIChwLnByb3ZpZGVyNCBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmIGlzUHJlc2VudChwLmtleUlkNCkgJiYgaS5vYmo0ID09PSBVTkRFRklORUQpXG4gICAgICBpLm9iajQgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjQsIHAudmlzaWJpbGl0eTQpO1xuICAgIGlmIChwLnByb3ZpZGVyNSBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmIGlzUHJlc2VudChwLmtleUlkNSkgJiYgaS5vYmo1ID09PSBVTkRFRklORUQpXG4gICAgICBpLm9iajUgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjUsIHAudmlzaWJpbGl0eTUpO1xuICAgIGlmIChwLnByb3ZpZGVyNiBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmIGlzUHJlc2VudChwLmtleUlkNikgJiYgaS5vYmo2ID09PSBVTkRFRklORUQpXG4gICAgICBpLm9iajYgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjYsIHAudmlzaWJpbGl0eTYpO1xuICAgIGlmIChwLnByb3ZpZGVyNyBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmIGlzUHJlc2VudChwLmtleUlkNykgJiYgaS5vYmo3ID09PSBVTkRFRklORUQpXG4gICAgICBpLm9iajcgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjcsIHAudmlzaWJpbGl0eTcpO1xuICAgIGlmIChwLnByb3ZpZGVyOCBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmIGlzUHJlc2VudChwLmtleUlkOCkgJiYgaS5vYmo4ID09PSBVTkRFRklORUQpXG4gICAgICBpLm9iajggPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjgsIHAudmlzaWJpbGl0eTgpO1xuICAgIGlmIChwLnByb3ZpZGVyOSBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmIGlzUHJlc2VudChwLmtleUlkOSkgJiYgaS5vYmo5ID09PSBVTkRFRklORUQpXG4gICAgICBpLm9iajkgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjksIHAudmlzaWJpbGl0eTkpO1xuICB9XG5cbiAgZGVoeWRyYXRlKCkge1xuICAgIHZhciBpID0gdGhpcy5pbmplY3RvclN0cmF0ZWd5O1xuXG4gICAgaS5vYmowID0gVU5ERUZJTkVEO1xuICAgIGkub2JqMSA9IFVOREVGSU5FRDtcbiAgICBpLm9iajIgPSBVTkRFRklORUQ7XG4gICAgaS5vYmozID0gVU5ERUZJTkVEO1xuICAgIGkub2JqNCA9IFVOREVGSU5FRDtcbiAgICBpLm9iajUgPSBVTkRFRklORUQ7XG4gICAgaS5vYmo2ID0gVU5ERUZJTkVEO1xuICAgIGkub2JqNyA9IFVOREVGSU5FRDtcbiAgICBpLm9iajggPSBVTkRFRklORUQ7XG4gICAgaS5vYmo5ID0gVU5ERUZJTkVEO1xuICB9XG5cbiAgY2FsbE9uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB2YXIgaSA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneTtcbiAgICB2YXIgcCA9IGkucHJvdG9TdHJhdGVneTtcblxuICAgIGlmIChwLnByb3ZpZGVyMCBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmXG4gICAgICAgICg8RGlyZWN0aXZlUHJvdmlkZXI+cC5wcm92aWRlcjApLmNhbGxPbkRlc3Ryb3kpIHtcbiAgICAgIGkub2JqMC5uZ09uRGVzdHJveSgpO1xuICAgIH1cbiAgICBpZiAocC5wcm92aWRlcjEgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJlxuICAgICAgICAoPERpcmVjdGl2ZVByb3ZpZGVyPnAucHJvdmlkZXIxKS5jYWxsT25EZXN0cm95KSB7XG4gICAgICBpLm9iajEubmdPbkRlc3Ryb3koKTtcbiAgICB9XG4gICAgaWYgKHAucHJvdmlkZXIyIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiZcbiAgICAgICAgKDxEaXJlY3RpdmVQcm92aWRlcj5wLnByb3ZpZGVyMikuY2FsbE9uRGVzdHJveSkge1xuICAgICAgaS5vYmoyLm5nT25EZXN0cm95KCk7XG4gICAgfVxuICAgIGlmIChwLnByb3ZpZGVyMyBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmXG4gICAgICAgICg8RGlyZWN0aXZlUHJvdmlkZXI+cC5wcm92aWRlcjMpLmNhbGxPbkRlc3Ryb3kpIHtcbiAgICAgIGkub2JqMy5uZ09uRGVzdHJveSgpO1xuICAgIH1cbiAgICBpZiAocC5wcm92aWRlcjQgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJlxuICAgICAgICAoPERpcmVjdGl2ZVByb3ZpZGVyPnAucHJvdmlkZXI0KS5jYWxsT25EZXN0cm95KSB7XG4gICAgICBpLm9iajQubmdPbkRlc3Ryb3koKTtcbiAgICB9XG4gICAgaWYgKHAucHJvdmlkZXI1IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiZcbiAgICAgICAgKDxEaXJlY3RpdmVQcm92aWRlcj5wLnByb3ZpZGVyNSkuY2FsbE9uRGVzdHJveSkge1xuICAgICAgaS5vYmo1Lm5nT25EZXN0cm95KCk7XG4gICAgfVxuICAgIGlmIChwLnByb3ZpZGVyNiBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmXG4gICAgICAgICg8RGlyZWN0aXZlUHJvdmlkZXI+cC5wcm92aWRlcjYpLmNhbGxPbkRlc3Ryb3kpIHtcbiAgICAgIGkub2JqNi5uZ09uRGVzdHJveSgpO1xuICAgIH1cbiAgICBpZiAocC5wcm92aWRlcjcgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJlxuICAgICAgICAoPERpcmVjdGl2ZVByb3ZpZGVyPnAucHJvdmlkZXI3KS5jYWxsT25EZXN0cm95KSB7XG4gICAgICBpLm9iajcubmdPbkRlc3Ryb3koKTtcbiAgICB9XG4gICAgaWYgKHAucHJvdmlkZXI4IGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiZcbiAgICAgICAgKDxEaXJlY3RpdmVQcm92aWRlcj5wLnByb3ZpZGVyOCkuY2FsbE9uRGVzdHJveSkge1xuICAgICAgaS5vYmo4Lm5nT25EZXN0cm95KCk7XG4gICAgfVxuICAgIGlmIChwLnByb3ZpZGVyOSBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmXG4gICAgICAgICg8RGlyZWN0aXZlUHJvdmlkZXI+cC5wcm92aWRlcjkpLmNhbGxPbkRlc3Ryb3kpIHtcbiAgICAgIGkub2JqOS5uZ09uRGVzdHJveSgpO1xuICAgIH1cbiAgfVxuXG4gIGdldENvbXBvbmVudCgpOiBhbnkgeyByZXR1cm4gdGhpcy5pbmplY3RvclN0cmF0ZWd5Lm9iajA7IH1cblxuICBpc0NvbXBvbmVudEtleShrZXk6IEtleSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9laS5fcHJvdG8uX2ZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudCAmJiBpc1ByZXNlbnQoa2V5KSAmJlxuICAgICAgICAgICBrZXkuaWQgPT09IHRoaXMuaW5qZWN0b3JTdHJhdGVneS5wcm90b1N0cmF0ZWd5LmtleUlkMDtcbiAgfVxuXG4gIGFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5KHF1ZXJ5OiBRdWVyeU1ldGFkYXRhLCBsaXN0OiBhbnlbXSk6IHZvaWQge1xuICAgIHZhciBpID0gdGhpcy5pbmplY3RvclN0cmF0ZWd5O1xuICAgIHZhciBwID0gaS5wcm90b1N0cmF0ZWd5O1xuXG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyMCkgJiYgcC5wcm92aWRlcjAua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqMCA9PT0gVU5ERUZJTkVEKSBpLm9iajAgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjAsIHAudmlzaWJpbGl0eTApO1xuICAgICAgbGlzdC5wdXNoKGkub2JqMCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjEpICYmIHAucHJvdmlkZXIxLmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajEgPT09IFVOREVGSU5FRCkgaS5vYmoxID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIxLCBwLnZpc2liaWxpdHkxKTtcbiAgICAgIGxpc3QucHVzaChpLm9iajEpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXIyKSAmJiBwLnByb3ZpZGVyMi5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmoyID09PSBVTkRFRklORUQpIGkub2JqMiA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyMiwgcC52aXNpYmlsaXR5Mik7XG4gICAgICBsaXN0LnB1c2goaS5vYmoyKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyMykgJiYgcC5wcm92aWRlcjMua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqMyA9PT0gVU5ERUZJTkVEKSBpLm9iajMgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjMsIHAudmlzaWJpbGl0eTMpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqMyk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjQpICYmIHAucHJvdmlkZXI0LmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajQgPT09IFVOREVGSU5FRCkgaS5vYmo0ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI0LCBwLnZpc2liaWxpdHk0KTtcbiAgICAgIGxpc3QucHVzaChpLm9iajQpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXI1KSAmJiBwLnByb3ZpZGVyNS5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmo1ID09PSBVTkRFRklORUQpIGkub2JqNSA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyNSwgcC52aXNpYmlsaXR5NSk7XG4gICAgICBsaXN0LnB1c2goaS5vYmo1KTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyNikgJiYgcC5wcm92aWRlcjYua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqNiA9PT0gVU5ERUZJTkVEKSBpLm9iajYgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjYsIHAudmlzaWJpbGl0eTYpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqNik7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjcpICYmIHAucHJvdmlkZXI3LmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajcgPT09IFVOREVGSU5FRCkgaS5vYmo3ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI3LCBwLnZpc2liaWxpdHk3KTtcbiAgICAgIGxpc3QucHVzaChpLm9iajcpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXI4KSAmJiBwLnByb3ZpZGVyOC5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmo4ID09PSBVTkRFRklORUQpIGkub2JqOCA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyOCwgcC52aXNpYmlsaXR5OCk7XG4gICAgICBsaXN0LnB1c2goaS5vYmo4KTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyOSkgJiYgcC5wcm92aWRlcjkua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqOSA9PT0gVU5ERUZJTkVEKSBpLm9iajkgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjksIHAudmlzaWJpbGl0eTkpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqOSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogU3RyYXRlZ3kgdXNlZCBieSB0aGUgYEVsZW1lbnRJbmplY3RvcmAgd2hlbiB0aGUgbnVtYmVyIG9mIGJpbmRpbmdzIGlzIDExIG9yIG1vcmUuXG4gKiBJbiBzdWNoIGEgY2FzZSwgdGhlcmUgYXJlIHRvbyBtYW55IGZpZWxkcyB0byBpbmxpbmUgKHNlZSBFbGVtZW50SW5qZWN0b3JJbmxpbmVTdHJhdGVneSkuXG4gKi9cbmNsYXNzIEVsZW1lbnRJbmplY3RvckR5bmFtaWNTdHJhdGVneSBpbXBsZW1lbnRzIF9FbGVtZW50SW5qZWN0b3JTdHJhdGVneSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbmplY3RvclN0cmF0ZWd5OiBJbmplY3RvckR5bmFtaWNTdHJhdGVneSwgcHVibGljIF9laTogRWxlbWVudEluamVjdG9yKSB7fVxuXG4gIGh5ZHJhdGUoKTogdm9pZCB7XG4gICAgdmFyIGluaiA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneTtcbiAgICB2YXIgcCA9IGluai5wcm90b1N0cmF0ZWd5O1xuICAgIGluai5yZXNldENvbnN0cnVjdGlvbkNvdW50ZXIoKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcC5rZXlJZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChwLnByb3ZpZGVyc1tpXSBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyICYmIGlzUHJlc2VudChwLmtleUlkc1tpXSkgJiZcbiAgICAgICAgICBpbmoub2Jqc1tpXSA9PT0gVU5ERUZJTkVEKSB7XG4gICAgICAgIGluai5vYmpzW2ldID0gaW5qLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcnNbaV0sIHAudmlzaWJpbGl0aWVzW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBkZWh5ZHJhdGUoKTogdm9pZCB7XG4gICAgdmFyIGluaiA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneTtcbiAgICBMaXN0V3JhcHBlci5maWxsKGluai5vYmpzLCBVTkRFRklORUQpO1xuICB9XG5cbiAgY2FsbE9uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB2YXIgaXN0ID0gdGhpcy5pbmplY3RvclN0cmF0ZWd5O1xuICAgIHZhciBwID0gaXN0LnByb3RvU3RyYXRlZ3k7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHAucHJvdmlkZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocC5wcm92aWRlcnNbaV0gaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJlxuICAgICAgICAgICg8RGlyZWN0aXZlUHJvdmlkZXI+cC5wcm92aWRlcnNbaV0pLmNhbGxPbkRlc3Ryb3kpIHtcbiAgICAgICAgaXN0Lm9ianNbaV0ubmdPbkRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRDb21wb25lbnQoKTogYW55IHsgcmV0dXJuIHRoaXMuaW5qZWN0b3JTdHJhdGVneS5vYmpzWzBdOyB9XG5cbiAgaXNDb21wb25lbnRLZXkoa2V5OiBLZXkpOiBib29sZWFuIHtcbiAgICB2YXIgcCA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneS5wcm90b1N0cmF0ZWd5O1xuICAgIHJldHVybiB0aGlzLl9laS5fcHJvdG8uX2ZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudCAmJiBpc1ByZXNlbnQoa2V5KSAmJiBrZXkuaWQgPT09IHAua2V5SWRzWzBdO1xuICB9XG5cbiAgYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkocXVlcnk6IFF1ZXJ5TWV0YWRhdGEsIGxpc3Q6IGFueVtdKTogdm9pZCB7XG4gICAgdmFyIGlzdCA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneTtcbiAgICB2YXIgcCA9IGlzdC5wcm90b1N0cmF0ZWd5O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwLnByb3ZpZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHAucHJvdmlkZXJzW2ldLmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKGlzdC5vYmpzW2ldID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgICBpc3Qub2Jqc1tpXSA9IGlzdC5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXJzW2ldLCBwLnZpc2liaWxpdGllc1tpXSk7XG4gICAgICAgIH1cbiAgICAgICAgbGlzdC5wdXNoKGlzdC5vYmpzW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFByb3RvUXVlcnlSZWYge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZGlySW5kZXg6IG51bWJlciwgcHVibGljIHNldHRlcjogU2V0dGVyRm4sIHB1YmxpYyBxdWVyeTogUXVlcnlNZXRhZGF0YSkge31cblxuICBnZXQgdXNlc1Byb3BlcnR5U3ludGF4KCk6IGJvb2xlYW4geyByZXR1cm4gaXNQcmVzZW50KHRoaXMuc2V0dGVyKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgUXVlcnlSZWYge1xuICBwdWJsaWMgbGlzdDogUXVlcnlMaXN0PGFueT47XG4gIHB1YmxpYyBkaXJ0eTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcHJvdG9RdWVyeVJlZjogUHJvdG9RdWVyeVJlZiwgcHJpdmF0ZSBvcmlnaW5hdG9yOiBFbGVtZW50SW5qZWN0b3IpIHt9XG5cbiAgZ2V0IGlzVmlld1F1ZXJ5KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5wcm90b1F1ZXJ5UmVmLnF1ZXJ5LmlzVmlld1F1ZXJ5OyB9XG5cbiAgdXBkYXRlKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5kaXJ0eSkgcmV0dXJuO1xuICAgIHRoaXMuX3VwZGF0ZSgpO1xuICAgIHRoaXMuZGlydHkgPSBmYWxzZTtcblxuICAgIC8vIFRPRE8gZGVsZXRlIHRoZSBjaGVjayBvbmNlIG9ubHkgZmllbGQgcXVlcmllcyBhcmUgc3VwcG9ydGVkXG4gICAgaWYgKHRoaXMucHJvdG9RdWVyeVJlZi51c2VzUHJvcGVydHlTeW50YXgpIHtcbiAgICAgIHZhciBkaXIgPSB0aGlzLm9yaWdpbmF0b3IuZ2V0RGlyZWN0aXZlQXRJbmRleCh0aGlzLnByb3RvUXVlcnlSZWYuZGlySW5kZXgpO1xuICAgICAgaWYgKHRoaXMucHJvdG9RdWVyeVJlZi5xdWVyeS5maXJzdCkge1xuICAgICAgICB0aGlzLnByb3RvUXVlcnlSZWYuc2V0dGVyKGRpciwgdGhpcy5saXN0Lmxlbmd0aCA+IDAgPyB0aGlzLmxpc3QuZmlyc3QgOiBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucHJvdG9RdWVyeVJlZi5zZXR0ZXIoZGlyLCB0aGlzLmxpc3QpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubGlzdC5ub3RpZnlPbkNoYW5nZXMoKTtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZSgpOiB2b2lkIHtcbiAgICB2YXIgYWdncmVnYXRvciA9IFtdO1xuICAgIGlmICh0aGlzLnByb3RvUXVlcnlSZWYucXVlcnkuaXNWaWV3UXVlcnkpIHtcbiAgICAgIHZhciB2aWV3ID0gdGhpcy5vcmlnaW5hdG9yLmdldFZpZXcoKTtcbiAgICAgIC8vIGludGVudGlvbmFsbHkgc2tpcHBpbmcgb3JpZ2luYXRvciBmb3IgdmlldyBxdWVyaWVzLlxuICAgICAgdmFyIG5lc3RlZFZpZXcgPVxuICAgICAgICAgIHZpZXcuZ2V0TmVzdGVkVmlldyh2aWV3LmVsZW1lbnRPZmZzZXQgKyB0aGlzLm9yaWdpbmF0b3IuZ2V0Qm91bmRFbGVtZW50SW5kZXgoKSk7XG4gICAgICBpZiAoaXNQcmVzZW50KG5lc3RlZFZpZXcpKSB0aGlzLl92aXNpdFZpZXcobmVzdGVkVmlldywgYWdncmVnYXRvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3Zpc2l0KHRoaXMub3JpZ2luYXRvciwgYWdncmVnYXRvcik7XG4gICAgfVxuICAgIHRoaXMubGlzdC5yZXNldChhZ2dyZWdhdG9yKTtcbiAgfTtcblxuICBwcml2YXRlIF92aXNpdChpbmo6IEVsZW1lbnRJbmplY3RvciwgYWdncmVnYXRvcjogYW55W10pOiB2b2lkIHtcbiAgICB2YXIgdmlldyA9IGluai5nZXRWaWV3KCk7XG4gICAgdmFyIHN0YXJ0SWR4ID0gdmlldy5lbGVtZW50T2Zmc2V0ICsgaW5qLl9wcm90by5pbmRleDtcbiAgICBmb3IgKHZhciBpID0gc3RhcnRJZHg7IGkgPCB2aWV3LmVsZW1lbnRPZmZzZXQgKyB2aWV3Lm93bkJpbmRlcnNDb3VudDsgaSsrKSB7XG4gICAgICB2YXIgY3VySW5qID0gdmlldy5lbGVtZW50SW5qZWN0b3JzW2ldO1xuICAgICAgaWYgKGlzQmxhbmsoY3VySW5qKSkgY29udGludWU7XG4gICAgICAvLyBUaGUgZmlyc3QgaW5qZWN0b3IgYWZ0ZXIgaW5qLCB0aGF0IGlzIG91dHNpZGUgdGhlIHN1YnRyZWUgcm9vdGVkIGF0XG4gICAgICAvLyBpbmogaGFzIHRvIGhhdmUgYSBudWxsIHBhcmVudCBvciBhIHBhcmVudCB0aGF0IGlzIGFuIGFuY2VzdG9yIG9mIGluai5cbiAgICAgIGlmIChpID4gc3RhcnRJZHggJiYgKGlzQmxhbmsoY3VySW5qKSB8fCBpc0JsYW5rKGN1ckluai5wYXJlbnQpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3LmVsZW1lbnRPZmZzZXQgKyBjdXJJbmoucGFyZW50Ll9wcm90by5pbmRleCA8IHN0YXJ0SWR4KSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLnByb3RvUXVlcnlSZWYucXVlcnkuZGVzY2VuZGFudHMgJiZcbiAgICAgICAgICAhKGN1ckluai5wYXJlbnQgPT0gdGhpcy5vcmlnaW5hdG9yIHx8IGN1ckluaiA9PSB0aGlzLm9yaWdpbmF0b3IpKVxuICAgICAgICBjb250aW51ZTtcblxuICAgICAgLy8gV2UgdmlzaXQgdGhlIHZpZXcgY29udGFpbmVyKFZDKSB2aWV3cyByaWdodCBhZnRlciB0aGUgaW5qZWN0b3IgdGhhdCBjb250YWluc1xuICAgICAgLy8gdGhlIFZDLiBUaGVvcmV0aWNhbGx5LCB0aGF0IG1pZ2h0IG5vdCBiZSB0aGUgcmlnaHQgb3JkZXIgaWYgdGhlcmUgYXJlXG4gICAgICAvLyBjaGlsZCBpbmplY3RvcnMgb2Ygc2FpZCBpbmplY3Rvci4gTm90IGNsZWFyIHdoZXRoZXIgaWYgc3VjaCBjYXNlIGNhblxuICAgICAgLy8gZXZlbiBiZSBjb25zdHJ1Y3RlZCB3aXRoIHRoZSBjdXJyZW50IGFwaXMuXG4gICAgICB0aGlzLl92aXNpdEluamVjdG9yKGN1ckluaiwgYWdncmVnYXRvcik7XG4gICAgICB2YXIgdmMgPSB2aWV3LnZpZXdDb250YWluZXJzW2ldO1xuICAgICAgaWYgKGlzUHJlc2VudCh2YykpIHRoaXMuX3Zpc2l0Vmlld0NvbnRhaW5lcih2YywgYWdncmVnYXRvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRJbmplY3Rvcihpbmo6IEVsZW1lbnRJbmplY3RvciwgYWdncmVnYXRvcjogYW55W10pIHtcbiAgICBpZiAodGhpcy5wcm90b1F1ZXJ5UmVmLnF1ZXJ5LmlzVmFyQmluZGluZ1F1ZXJ5KSB7XG4gICAgICB0aGlzLl9hZ2dyZWdhdGVWYXJpYWJsZUJpbmRpbmcoaW5qLCBhZ2dyZWdhdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYWdncmVnYXRlRGlyZWN0aXZlKGluaiwgYWdncmVnYXRvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRWaWV3Q29udGFpbmVyKHZjOiBBcHBWaWV3Q29udGFpbmVyLCBhZ2dyZWdhdG9yOiBhbnlbXSkge1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgdmMudmlld3MubGVuZ3RoOyBqKyspIHtcbiAgICAgIHRoaXMuX3Zpc2l0Vmlldyh2Yy52aWV3c1tqXSwgYWdncmVnYXRvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRWaWV3KHZpZXc6IEFwcFZpZXcsIGFnZ3JlZ2F0b3I6IGFueVtdKSB7XG4gICAgZm9yICh2YXIgaSA9IHZpZXcuZWxlbWVudE9mZnNldDsgaSA8IHZpZXcuZWxlbWVudE9mZnNldCArIHZpZXcub3duQmluZGVyc0NvdW50OyBpKyspIHtcbiAgICAgIHZhciBpbmogPSB2aWV3LmVsZW1lbnRJbmplY3RvcnNbaV07XG4gICAgICBpZiAoaXNCbGFuayhpbmopKSBjb250aW51ZTtcblxuICAgICAgdGhpcy5fdmlzaXRJbmplY3RvcihpbmosIGFnZ3JlZ2F0b3IpO1xuXG4gICAgICB2YXIgdmMgPSB2aWV3LnZpZXdDb250YWluZXJzW2ldO1xuICAgICAgaWYgKGlzUHJlc2VudCh2YykpIHRoaXMuX3Zpc2l0Vmlld0NvbnRhaW5lcih2YywgYWdncmVnYXRvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYWdncmVnYXRlVmFyaWFibGVCaW5kaW5nKGluajogRWxlbWVudEluamVjdG9yLCBhZ2dyZWdhdG9yOiBhbnlbXSk6IHZvaWQge1xuICAgIHZhciB2YiA9IHRoaXMucHJvdG9RdWVyeVJlZi5xdWVyeS52YXJCaW5kaW5ncztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZiLmxlbmd0aDsgKytpKSB7XG4gICAgICBpZiAoaW5qLmhhc1ZhcmlhYmxlQmluZGluZyh2YltpXSkpIHtcbiAgICAgICAgYWdncmVnYXRvci5wdXNoKGluai5nZXRWYXJpYWJsZUJpbmRpbmcodmJbaV0pKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hZ2dyZWdhdGVEaXJlY3RpdmUoaW5qOiBFbGVtZW50SW5qZWN0b3IsIGFnZ3JlZ2F0b3I6IGFueVtdKTogdm9pZCB7XG4gICAgaW5qLmFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5KHRoaXMucHJvdG9RdWVyeVJlZi5xdWVyeSwgYWdncmVnYXRvcik7XG4gIH1cblxuICBkZWh5ZHJhdGUoKTogdm9pZCB7IHRoaXMubGlzdCA9IG51bGw7IH1cblxuICBoeWRyYXRlKCk6IHZvaWQge1xuICAgIHRoaXMubGlzdCA9IG5ldyBRdWVyeUxpc3Q8YW55PigpO1xuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xuICB9XG59XG4iXX0=