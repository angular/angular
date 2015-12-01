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
//# sourceMappingURL=element_injector.js.map