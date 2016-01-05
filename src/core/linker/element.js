'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var di_1 = require('angular2/src/core/di');
var provider_1 = require('angular2/src/core/di/provider');
var injector_1 = require('angular2/src/core/di/injector');
var provider_2 = require('angular2/src/core/di/provider');
var di_2 = require('../metadata/di');
var view_type_1 = require('./view_type');
var element_ref_1 = require('./element_ref');
var view_container_ref_1 = require('./view_container_ref');
var element_ref_2 = require('./element_ref');
var api_1 = require('angular2/src/core/render/api');
var template_ref_1 = require('./template_ref');
var directives_1 = require('../metadata/directives');
var change_detection_1 = require('angular2/src/core/change_detection/change_detection');
var query_list_1 = require('./query_list');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var pipe_provider_1 = require('angular2/src/core/pipes/pipe_provider');
var view_container_ref_2 = require("./view_container_ref");
var _staticKeys;
var StaticKeys = (function () {
    function StaticKeys() {
        this.templateRefId = di_1.Key.get(template_ref_1.TemplateRef).id;
        this.viewContainerId = di_1.Key.get(view_container_ref_1.ViewContainerRef).id;
        this.changeDetectorRefId = di_1.Key.get(change_detection_1.ChangeDetectorRef).id;
        this.elementRefId = di_1.Key.get(element_ref_2.ElementRef).id;
        this.rendererId = di_1.Key.get(api_1.Renderer).id;
    }
    StaticKeys.instance = function () {
        if (lang_1.isBlank(_staticKeys))
            _staticKeys = new StaticKeys();
        return _staticKeys;
    };
    return StaticKeys;
})();
exports.StaticKeys = StaticKeys;
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
    function DirectiveProvider(key, factory, deps, isComponent, providers, viewProviders, queries) {
        _super.call(this, key, [new provider_2.ResolvedFactory(factory, deps)], false);
        this.isComponent = isComponent;
        this.providers = providers;
        this.viewProviders = viewProviders;
        this.queries = queries;
    }
    Object.defineProperty(DirectiveProvider.prototype, "displayName", {
        get: function () { return this.key.displayName; },
        enumerable: true,
        configurable: true
    });
    DirectiveProvider.createFromType = function (type, meta) {
        var provider = new di_1.Provider(type, { useClass: type });
        if (lang_1.isBlank(meta)) {
            meta = new directives_1.DirectiveMetadata();
        }
        var rb = provider_2.resolveProvider(provider);
        var rf = rb.resolvedFactories[0];
        var deps = rf.dependencies.map(DirectiveDependency.createFrom);
        var isComponent = meta instanceof directives_1.ComponentMetadata;
        var resolvedProviders = lang_1.isPresent(meta.providers) ? di_1.Injector.resolve(meta.providers) : null;
        var resolvedViewProviders = meta instanceof directives_1.ComponentMetadata && lang_1.isPresent(meta.viewProviders) ?
            di_1.Injector.resolve(meta.viewProviders) :
            null;
        var queries = [];
        if (lang_1.isPresent(meta.queries)) {
            collection_1.StringMapWrapper.forEach(meta.queries, function (meta, fieldName) {
                var setter = reflection_1.reflector.setter(fieldName);
                queries.push(new QueryMetadataWithSetter(setter, meta));
            });
        }
        // queries passed into the constructor.
        // TODO: remove this after constructor queries are no longer supported
        deps.forEach(function (d) {
            if (lang_1.isPresent(d.queryDecorator)) {
                queries.push(new QueryMetadataWithSetter(null, d.queryDecorator));
            }
        });
        return new DirectiveProvider(rb.key, rf.factory, deps, isComponent, resolvedProviders, resolvedViewProviders, queries);
    };
    return DirectiveProvider;
})(provider_2.ResolvedProvider_);
exports.DirectiveProvider = DirectiveProvider;
var QueryMetadataWithSetter = (function () {
    function QueryMetadataWithSetter(setter, metadata) {
        this.setter = setter;
        this.metadata = metadata;
    }
    return QueryMetadataWithSetter;
})();
exports.QueryMetadataWithSetter = QueryMetadataWithSetter;
function setProvidersVisibility(providers, visibility, result) {
    for (var i = 0; i < providers.length; i++) {
        result.set(providers[i].key.id, visibility);
    }
}
var AppProtoElement = (function () {
    function AppProtoElement(firstProviderIsComponent, index, attributes, pwvs, protoQueryRefs, directiveVariableBindings) {
        this.firstProviderIsComponent = firstProviderIsComponent;
        this.index = index;
        this.attributes = attributes;
        this.protoQueryRefs = protoQueryRefs;
        this.directiveVariableBindings = directiveVariableBindings;
        var length = pwvs.length;
        if (length > 0) {
            this.protoInjector = new injector_1.ProtoInjector(pwvs);
        }
        else {
            this.protoInjector = null;
            this.protoQueryRefs = [];
        }
    }
    AppProtoElement.create = function (metadataCache, index, attributes, directiveTypes, directiveVariableBindings) {
        var componentDirProvider = null;
        var mergedProvidersMap = new Map();
        var providerVisibilityMap = new Map();
        var providers = collection_1.ListWrapper.createGrowableSize(directiveTypes.length);
        var protoQueryRefs = [];
        for (var i = 0; i < directiveTypes.length; i++) {
            var dirProvider = metadataCache.getResolvedDirectiveMetadata(directiveTypes[i]);
            providers[i] = new injector_1.ProviderWithVisibility(dirProvider, dirProvider.isComponent ? injector_1.Visibility.PublicAndPrivate : injector_1.Visibility.Public);
            if (dirProvider.isComponent) {
                componentDirProvider = dirProvider;
            }
            else {
                if (lang_1.isPresent(dirProvider.providers)) {
                    provider_1.mergeResolvedProviders(dirProvider.providers, mergedProvidersMap);
                    setProvidersVisibility(dirProvider.providers, injector_1.Visibility.Public, providerVisibilityMap);
                }
            }
            if (lang_1.isPresent(dirProvider.viewProviders)) {
                provider_1.mergeResolvedProviders(dirProvider.viewProviders, mergedProvidersMap);
                setProvidersVisibility(dirProvider.viewProviders, injector_1.Visibility.Private, providerVisibilityMap);
            }
            for (var queryIdx = 0; queryIdx < dirProvider.queries.length; queryIdx++) {
                var q = dirProvider.queries[queryIdx];
                protoQueryRefs.push(new ProtoQueryRef(i, q.setter, q.metadata));
            }
        }
        if (lang_1.isPresent(componentDirProvider) && lang_1.isPresent(componentDirProvider.providers)) {
            // directive providers need to be prioritized over component providers
            provider_1.mergeResolvedProviders(componentDirProvider.providers, mergedProvidersMap);
            setProvidersVisibility(componentDirProvider.providers, injector_1.Visibility.Public, providerVisibilityMap);
        }
        mergedProvidersMap.forEach(function (provider, _) {
            providers.push(new injector_1.ProviderWithVisibility(provider, providerVisibilityMap.get(provider.key.id)));
        });
        return new AppProtoElement(lang_1.isPresent(componentDirProvider), index, attributes, providers, protoQueryRefs, directiveVariableBindings);
    };
    AppProtoElement.prototype.getProviderAtIndex = function (index) { return this.protoInjector.getProviderAtIndex(index); };
    return AppProtoElement;
})();
exports.AppProtoElement = AppProtoElement;
var _Context = (function () {
    function _Context(element, componentElement, injector) {
        this.element = element;
        this.componentElement = componentElement;
        this.injector = injector;
    }
    return _Context;
})();
var InjectorWithHostBoundary = (function () {
    function InjectorWithHostBoundary(injector, hostInjectorBoundary) {
        this.injector = injector;
        this.hostInjectorBoundary = hostInjectorBoundary;
    }
    return InjectorWithHostBoundary;
})();
exports.InjectorWithHostBoundary = InjectorWithHostBoundary;
var AppElement = (function () {
    function AppElement(proto, parentView, parent, nativeElement, embeddedViewFactory) {
        var _this = this;
        this.proto = proto;
        this.parentView = parentView;
        this.parent = parent;
        this.nativeElement = nativeElement;
        this.embeddedViewFactory = embeddedViewFactory;
        this.nestedViews = null;
        this.componentView = null;
        this.ref = new element_ref_1.ElementRef_(this);
        var parentInjector = lang_1.isPresent(parent) ? parent._injector : parentView.parentInjector;
        if (lang_1.isPresent(this.proto.protoInjector)) {
            var isBoundary;
            if (lang_1.isPresent(parent) && lang_1.isPresent(parent.proto.protoInjector)) {
                isBoundary = false;
            }
            else {
                isBoundary = parentView.hostInjectorBoundary;
            }
            this._queryStrategy = this._buildQueryStrategy();
            this._injector = new di_1.Injector(this.proto.protoInjector, parentInjector, isBoundary, this, function () { return _this._debugContext(); });
            // we couple ourselves to the injector strategy to avoid polymorphic calls
            var injectorStrategy = this._injector.internalStrategy;
            this._strategy = injectorStrategy instanceof injector_1.InjectorInlineStrategy ?
                new ElementDirectiveInlineStrategy(injectorStrategy, this) :
                new ElementDirectiveDynamicStrategy(injectorStrategy, this);
            this._strategy.init();
        }
        else {
            this._queryStrategy = null;
            this._injector = parentInjector;
            this._strategy = null;
        }
    }
    AppElement.getViewParentInjector = function (parentViewType, containerAppElement, imperativelyCreatedProviders, rootInjector) {
        var parentInjector;
        var hostInjectorBoundary;
        switch (parentViewType) {
            case view_type_1.ViewType.COMPONENT:
                parentInjector = containerAppElement._injector;
                hostInjectorBoundary = true;
                break;
            case view_type_1.ViewType.EMBEDDED:
                parentInjector = lang_1.isPresent(containerAppElement.proto.protoInjector) ?
                    containerAppElement._injector.parent :
                    containerAppElement._injector;
                hostInjectorBoundary = containerAppElement._injector.hostBoundary;
                break;
            case view_type_1.ViewType.HOST:
                if (lang_1.isPresent(containerAppElement)) {
                    // host view is attached to a container
                    parentInjector = lang_1.isPresent(containerAppElement.proto.protoInjector) ?
                        containerAppElement._injector.parent :
                        containerAppElement._injector;
                    if (lang_1.isPresent(imperativelyCreatedProviders)) {
                        var imperativeProvidersWithVisibility = imperativelyCreatedProviders.map(function (p) { return new injector_1.ProviderWithVisibility(p, injector_1.Visibility.Public); });
                        // The imperative injector is similar to having an element between
                        // the dynamic-loaded component and its parent => no boundary between
                        // the component and imperativelyCreatedInjector.
                        parentInjector = new di_1.Injector(new injector_1.ProtoInjector(imperativeProvidersWithVisibility), parentInjector, true, null, null);
                        hostInjectorBoundary = false;
                    }
                    else {
                        hostInjectorBoundary = containerAppElement._injector.hostBoundary;
                    }
                }
                else {
                    // bootstrap
                    parentInjector = rootInjector;
                    hostInjectorBoundary = true;
                }
                break;
        }
        return new InjectorWithHostBoundary(parentInjector, hostInjectorBoundary);
    };
    AppElement.prototype.attachComponentView = function (componentView) { this.componentView = componentView; };
    AppElement.prototype._debugContext = function () {
        var c = this.parentView.getDebugContext(this, null, null);
        return lang_1.isPresent(c) ? new _Context(c.element, c.componentElement, c.injector) : null;
    };
    AppElement.prototype.hasVariableBinding = function (name) {
        var vb = this.proto.directiveVariableBindings;
        return lang_1.isPresent(vb) && collection_1.StringMapWrapper.contains(vb, name);
    };
    AppElement.prototype.getVariableBinding = function (name) {
        var index = this.proto.directiveVariableBindings[name];
        return lang_1.isPresent(index) ? this.getDirectiveAtIndex(index) : this.getElementRef();
    };
    AppElement.prototype.get = function (token) { return this._injector.get(token); };
    AppElement.prototype.hasDirective = function (type) { return lang_1.isPresent(this._injector.getOptional(type)); };
    AppElement.prototype.getComponent = function () { return lang_1.isPresent(this._strategy) ? this._strategy.getComponent() : null; };
    AppElement.prototype.getInjector = function () { return this._injector; };
    AppElement.prototype.getElementRef = function () { return this.ref; };
    AppElement.prototype.getViewContainerRef = function () { return new view_container_ref_2.ViewContainerRef_(this); };
    AppElement.prototype.getTemplateRef = function () {
        if (lang_1.isPresent(this.embeddedViewFactory)) {
            return new template_ref_1.TemplateRef_(this.ref);
        }
        return null;
    };
    AppElement.prototype.getDependency = function (injector, provider, dep) {
        if (provider instanceof DirectiveProvider) {
            var dirDep = dep;
            if (lang_1.isPresent(dirDep.attributeName))
                return this._buildAttribute(dirDep);
            if (lang_1.isPresent(dirDep.queryDecorator))
                return this._queryStrategy.findQuery(dirDep.queryDecorator).list;
            if (dirDep.key.id === StaticKeys.instance().changeDetectorRefId) {
                // We provide the component's view change detector to components and
                // the surrounding component's change detector to directives.
                if (this.proto.firstProviderIsComponent) {
                    // Note: The component view is not yet created when
                    // this method is called!
                    return new _ComponentViewChangeDetectorRef(this);
                }
                else {
                    return this.parentView.changeDetector.ref;
                }
            }
            if (dirDep.key.id === StaticKeys.instance().elementRefId) {
                return this.getElementRef();
            }
            if (dirDep.key.id === StaticKeys.instance().viewContainerId) {
                return this.getViewContainerRef();
            }
            if (dirDep.key.id === StaticKeys.instance().templateRefId) {
                var tr = this.getTemplateRef();
                if (lang_1.isBlank(tr) && !dirDep.optional) {
                    throw new di_1.NoProviderError(null, dirDep.key);
                }
                return tr;
            }
            if (dirDep.key.id === StaticKeys.instance().rendererId) {
                return this.parentView.renderer;
            }
        }
        else if (provider instanceof pipe_provider_1.PipeProvider) {
            if (dep.key.id === StaticKeys.instance().changeDetectorRefId) {
                // We provide the component's view change detector to components and
                // the surrounding component's change detector to directives.
                if (this.proto.firstProviderIsComponent) {
                    // Note: The component view is not yet created when
                    // this method is called!
                    return new _ComponentViewChangeDetectorRef(this);
                }
                else {
                    return this.parentView.changeDetector;
                }
            }
        }
        return injector_1.UNDEFINED;
    };
    AppElement.prototype._buildAttribute = function (dep) {
        var attributes = this.proto.attributes;
        if (lang_1.isPresent(attributes) && collection_1.StringMapWrapper.contains(attributes, dep.attributeName)) {
            return attributes[dep.attributeName];
        }
        else {
            return null;
        }
    };
    AppElement.prototype.addDirectivesMatchingQuery = function (query, list) {
        var templateRef = this.getTemplateRef();
        if (query.selector === template_ref_1.TemplateRef && lang_1.isPresent(templateRef)) {
            list.push(templateRef);
        }
        if (this._strategy != null) {
            this._strategy.addDirectivesMatchingQuery(query, list);
        }
    };
    AppElement.prototype._buildQueryStrategy = function () {
        if (this.proto.protoQueryRefs.length === 0) {
            return _emptyQueryStrategy;
        }
        else if (this.proto.protoQueryRefs.length <=
            InlineQueryStrategy.NUMBER_OF_SUPPORTED_QUERIES) {
            return new InlineQueryStrategy(this);
        }
        else {
            return new DynamicQueryStrategy(this);
        }
    };
    AppElement.prototype.getDirectiveAtIndex = function (index) { return this._injector.getAt(index); };
    AppElement.prototype.ngAfterViewChecked = function () {
        if (lang_1.isPresent(this._queryStrategy))
            this._queryStrategy.updateViewQueries();
    };
    AppElement.prototype.ngAfterContentChecked = function () {
        if (lang_1.isPresent(this._queryStrategy))
            this._queryStrategy.updateContentQueries();
    };
    AppElement.prototype.traverseAndSetQueriesAsDirty = function () {
        var inj = this;
        while (lang_1.isPresent(inj)) {
            inj._setQueriesAsDirty();
            inj = inj.parent;
        }
    };
    AppElement.prototype._setQueriesAsDirty = function () {
        if (lang_1.isPresent(this._queryStrategy)) {
            this._queryStrategy.setContentQueriesAsDirty();
        }
        if (this.parentView.proto.type === view_type_1.ViewType.COMPONENT) {
            this.parentView.containerAppElement._queryStrategy.setViewQueriesAsDirty();
        }
    };
    return AppElement;
})();
exports.AppElement = AppElement;
var _EmptyQueryStrategy = (function () {
    function _EmptyQueryStrategy() {
    }
    _EmptyQueryStrategy.prototype.setContentQueriesAsDirty = function () { };
    _EmptyQueryStrategy.prototype.setViewQueriesAsDirty = function () { };
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
        var protoRefs = ei.proto.protoQueryRefs;
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
        this.queries = ei.proto.protoQueryRefs.map(function (p) { return new QueryRef(p, ei); });
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
var ElementDirectiveInlineStrategy = (function () {
    function ElementDirectiveInlineStrategy(injectorStrategy, _ei) {
        this.injectorStrategy = injectorStrategy;
        this._ei = _ei;
    }
    ElementDirectiveInlineStrategy.prototype.init = function () {
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
    ElementDirectiveInlineStrategy.prototype.getComponent = function () { return this.injectorStrategy.obj0; };
    ElementDirectiveInlineStrategy.prototype.isComponentKey = function (key) {
        return this._ei.proto.firstProviderIsComponent && lang_1.isPresent(key) &&
            key.id === this.injectorStrategy.protoStrategy.keyId0;
    };
    ElementDirectiveInlineStrategy.prototype.addDirectivesMatchingQuery = function (query, list) {
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
    return ElementDirectiveInlineStrategy;
})();
/**
 * Strategy used by the `ElementInjector` when the number of bindings is 11 or more.
 * In such a case, there are too many fields to inline (see ElementInjectorInlineStrategy).
 */
var ElementDirectiveDynamicStrategy = (function () {
    function ElementDirectiveDynamicStrategy(injectorStrategy, _ei) {
        this.injectorStrategy = injectorStrategy;
        this._ei = _ei;
    }
    ElementDirectiveDynamicStrategy.prototype.init = function () {
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
    ElementDirectiveDynamicStrategy.prototype.getComponent = function () { return this.injectorStrategy.objs[0]; };
    ElementDirectiveDynamicStrategy.prototype.isComponentKey = function (key) {
        var p = this.injectorStrategy.protoStrategy;
        return this._ei.proto.firstProviderIsComponent && lang_1.isPresent(key) && key.id === p.keyIds[0];
    };
    ElementDirectiveDynamicStrategy.prototype.addDirectivesMatchingQuery = function (query, list) {
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
    return ElementDirectiveDynamicStrategy;
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
        this.list = new query_list_1.QueryList();
        this.dirty = true;
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
            // intentionally skipping originator for view queries.
            var nestedView = this.originator.componentView;
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
        var view = inj.parentView;
        var startIdx = inj.proto.index;
        for (var i = startIdx; i < view.appElements.length; i++) {
            var curInj = view.appElements[i];
            // The first injector after inj, that is outside the subtree rooted at
            // inj has to have a null parent or a parent that is an ancestor of inj.
            if (i > startIdx && (lang_1.isBlank(curInj.parent) || curInj.parent.proto.index < startIdx)) {
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
            this._visitViewContainerViews(curInj.nestedViews, aggregator);
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
    QueryRef.prototype._visitViewContainerViews = function (views, aggregator) {
        if (lang_1.isPresent(views)) {
            for (var j = 0; j < views.length; j++) {
                this._visitView(views[j], aggregator);
            }
        }
    };
    QueryRef.prototype._visitView = function (view, aggregator) {
        for (var i = 0; i < view.appElements.length; i++) {
            var inj = view.appElements[i];
            this._visitInjector(inj, aggregator);
            this._visitViewContainerViews(inj.nestedViews, aggregator);
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
    return QueryRef;
})();
exports.QueryRef = QueryRef;
var _ComponentViewChangeDetectorRef = (function (_super) {
    __extends(_ComponentViewChangeDetectorRef, _super);
    function _ComponentViewChangeDetectorRef(_appElement) {
        _super.call(this);
        this._appElement = _appElement;
    }
    _ComponentViewChangeDetectorRef.prototype.markForCheck = function () { this._appElement.componentView.changeDetector.ref.markForCheck(); };
    _ComponentViewChangeDetectorRef.prototype.detach = function () { this._appElement.componentView.changeDetector.ref.detach(); };
    _ComponentViewChangeDetectorRef.prototype.detectChanges = function () { this._appElement.componentView.changeDetector.ref.detectChanges(); };
    _ComponentViewChangeDetectorRef.prototype.checkNoChanges = function () { this._appElement.componentView.changeDetector.ref.checkNoChanges(); };
    _ComponentViewChangeDetectorRef.prototype.reattach = function () { this._appElement.componentView.changeDetector.ref.reattach(); };
    return _ComponentViewChangeDetectorRef;
})(change_detection_1.ChangeDetectorRef);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9lbGVtZW50LnRzIl0sIm5hbWVzIjpbIlN0YXRpY0tleXMiLCJTdGF0aWNLZXlzLmNvbnN0cnVjdG9yIiwiU3RhdGljS2V5cy5pbnN0YW5jZSIsIkRpcmVjdGl2ZURlcGVuZGVuY3kiLCJEaXJlY3RpdmVEZXBlbmRlbmN5LmNvbnN0cnVjdG9yIiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5fdmVyaWZ5IiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5jcmVhdGVGcm9tIiwiRGlyZWN0aXZlRGVwZW5kZW5jeS5fYXR0cmlidXRlTmFtZSIsIkRpcmVjdGl2ZURlcGVuZGVuY3kuX3F1ZXJ5IiwiRGlyZWN0aXZlUHJvdmlkZXIiLCJEaXJlY3RpdmVQcm92aWRlci5jb25zdHJ1Y3RvciIsIkRpcmVjdGl2ZVByb3ZpZGVyLmRpc3BsYXlOYW1lIiwiRGlyZWN0aXZlUHJvdmlkZXIuY3JlYXRlRnJvbVR5cGUiLCJRdWVyeU1ldGFkYXRhV2l0aFNldHRlciIsIlF1ZXJ5TWV0YWRhdGFXaXRoU2V0dGVyLmNvbnN0cnVjdG9yIiwic2V0UHJvdmlkZXJzVmlzaWJpbGl0eSIsIkFwcFByb3RvRWxlbWVudCIsIkFwcFByb3RvRWxlbWVudC5jb25zdHJ1Y3RvciIsIkFwcFByb3RvRWxlbWVudC5jcmVhdGUiLCJBcHBQcm90b0VsZW1lbnQuZ2V0UHJvdmlkZXJBdEluZGV4IiwiX0NvbnRleHQiLCJfQ29udGV4dC5jb25zdHJ1Y3RvciIsIkluamVjdG9yV2l0aEhvc3RCb3VuZGFyeSIsIkluamVjdG9yV2l0aEhvc3RCb3VuZGFyeS5jb25zdHJ1Y3RvciIsIkFwcEVsZW1lbnQiLCJBcHBFbGVtZW50LmNvbnN0cnVjdG9yIiwiQXBwRWxlbWVudC5nZXRWaWV3UGFyZW50SW5qZWN0b3IiLCJBcHBFbGVtZW50LmF0dGFjaENvbXBvbmVudFZpZXciLCJBcHBFbGVtZW50Ll9kZWJ1Z0NvbnRleHQiLCJBcHBFbGVtZW50Lmhhc1ZhcmlhYmxlQmluZGluZyIsIkFwcEVsZW1lbnQuZ2V0VmFyaWFibGVCaW5kaW5nIiwiQXBwRWxlbWVudC5nZXQiLCJBcHBFbGVtZW50Lmhhc0RpcmVjdGl2ZSIsIkFwcEVsZW1lbnQuZ2V0Q29tcG9uZW50IiwiQXBwRWxlbWVudC5nZXRJbmplY3RvciIsIkFwcEVsZW1lbnQuZ2V0RWxlbWVudFJlZiIsIkFwcEVsZW1lbnQuZ2V0Vmlld0NvbnRhaW5lclJlZiIsIkFwcEVsZW1lbnQuZ2V0VGVtcGxhdGVSZWYiLCJBcHBFbGVtZW50LmdldERlcGVuZGVuY3kiLCJBcHBFbGVtZW50Ll9idWlsZEF0dHJpYnV0ZSIsIkFwcEVsZW1lbnQuYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkiLCJBcHBFbGVtZW50Ll9idWlsZFF1ZXJ5U3RyYXRlZ3kiLCJBcHBFbGVtZW50LmdldERpcmVjdGl2ZUF0SW5kZXgiLCJBcHBFbGVtZW50Lm5nQWZ0ZXJWaWV3Q2hlY2tlZCIsIkFwcEVsZW1lbnQubmdBZnRlckNvbnRlbnRDaGVja2VkIiwiQXBwRWxlbWVudC50cmF2ZXJzZUFuZFNldFF1ZXJpZXNBc0RpcnR5IiwiQXBwRWxlbWVudC5fc2V0UXVlcmllc0FzRGlydHkiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5IiwiX0VtcHR5UXVlcnlTdHJhdGVneS5jb25zdHJ1Y3RvciIsIl9FbXB0eVF1ZXJ5U3RyYXRlZ3kuc2V0Q29udGVudFF1ZXJpZXNBc0RpcnR5IiwiX0VtcHR5UXVlcnlTdHJhdGVneS5zZXRWaWV3UXVlcmllc0FzRGlydHkiLCJfRW1wdHlRdWVyeVN0cmF0ZWd5LnVwZGF0ZUNvbnRlbnRRdWVyaWVzIiwiX0VtcHR5UXVlcnlTdHJhdGVneS51cGRhdGVWaWV3UXVlcmllcyIsIl9FbXB0eVF1ZXJ5U3RyYXRlZ3kuZmluZFF1ZXJ5IiwiSW5saW5lUXVlcnlTdHJhdGVneSIsIklubGluZVF1ZXJ5U3RyYXRlZ3kuY29uc3RydWN0b3IiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5LnNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSIsIklubGluZVF1ZXJ5U3RyYXRlZ3kuc2V0Vmlld1F1ZXJpZXNBc0RpcnR5IiwiSW5saW5lUXVlcnlTdHJhdGVneS51cGRhdGVDb250ZW50UXVlcmllcyIsIklubGluZVF1ZXJ5U3RyYXRlZ3kudXBkYXRlVmlld1F1ZXJpZXMiLCJJbmxpbmVRdWVyeVN0cmF0ZWd5LmZpbmRRdWVyeSIsIkR5bmFtaWNRdWVyeVN0cmF0ZWd5IiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kuY29uc3RydWN0b3IiLCJEeW5hbWljUXVlcnlTdHJhdGVneS5zZXRDb250ZW50UXVlcmllc0FzRGlydHkiLCJEeW5hbWljUXVlcnlTdHJhdGVneS5zZXRWaWV3UXVlcmllc0FzRGlydHkiLCJEeW5hbWljUXVlcnlTdHJhdGVneS51cGRhdGVDb250ZW50UXVlcmllcyIsIkR5bmFtaWNRdWVyeVN0cmF0ZWd5LnVwZGF0ZVZpZXdRdWVyaWVzIiwiRHluYW1pY1F1ZXJ5U3RyYXRlZ3kuZmluZFF1ZXJ5IiwiRWxlbWVudERpcmVjdGl2ZUlubGluZVN0cmF0ZWd5IiwiRWxlbWVudERpcmVjdGl2ZUlubGluZVN0cmF0ZWd5LmNvbnN0cnVjdG9yIiwiRWxlbWVudERpcmVjdGl2ZUlubGluZVN0cmF0ZWd5LmluaXQiLCJFbGVtZW50RGlyZWN0aXZlSW5saW5lU3RyYXRlZ3kuZ2V0Q29tcG9uZW50IiwiRWxlbWVudERpcmVjdGl2ZUlubGluZVN0cmF0ZWd5LmlzQ29tcG9uZW50S2V5IiwiRWxlbWVudERpcmVjdGl2ZUlubGluZVN0cmF0ZWd5LmFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5IiwiRWxlbWVudERpcmVjdGl2ZUR5bmFtaWNTdHJhdGVneSIsIkVsZW1lbnREaXJlY3RpdmVEeW5hbWljU3RyYXRlZ3kuY29uc3RydWN0b3IiLCJFbGVtZW50RGlyZWN0aXZlRHluYW1pY1N0cmF0ZWd5LmluaXQiLCJFbGVtZW50RGlyZWN0aXZlRHluYW1pY1N0cmF0ZWd5LmdldENvbXBvbmVudCIsIkVsZW1lbnREaXJlY3RpdmVEeW5hbWljU3RyYXRlZ3kuaXNDb21wb25lbnRLZXkiLCJFbGVtZW50RGlyZWN0aXZlRHluYW1pY1N0cmF0ZWd5LmFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5IiwiUHJvdG9RdWVyeVJlZiIsIlByb3RvUXVlcnlSZWYuY29uc3RydWN0b3IiLCJQcm90b1F1ZXJ5UmVmLnVzZXNQcm9wZXJ0eVN5bnRheCIsIlF1ZXJ5UmVmIiwiUXVlcnlSZWYuY29uc3RydWN0b3IiLCJRdWVyeVJlZi5pc1ZpZXdRdWVyeSIsIlF1ZXJ5UmVmLnVwZGF0ZSIsIlF1ZXJ5UmVmLl91cGRhdGUiLCJRdWVyeVJlZi5fdmlzaXQiLCJRdWVyeVJlZi5fdmlzaXRJbmplY3RvciIsIlF1ZXJ5UmVmLl92aXNpdFZpZXdDb250YWluZXJWaWV3cyIsIlF1ZXJ5UmVmLl92aXNpdFZpZXciLCJRdWVyeVJlZi5fYWdncmVnYXRlVmFyaWFibGVCaW5kaW5nIiwiUXVlcnlSZWYuX2FnZ3JlZ2F0ZURpcmVjdGl2ZSIsIl9Db21wb25lbnRWaWV3Q2hhbmdlRGV0ZWN0b3JSZWYiLCJfQ29tcG9uZW50Vmlld0NoYW5nZURldGVjdG9yUmVmLmNvbnN0cnVjdG9yIiwiX0NvbXBvbmVudFZpZXdDaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2siLCJfQ29tcG9uZW50Vmlld0NoYW5nZURldGVjdG9yUmVmLmRldGFjaCIsIl9Db21wb25lbnRWaWV3Q2hhbmdlRGV0ZWN0b3JSZWYuZGV0ZWN0Q2hhbmdlcyIsIl9Db21wb25lbnRWaWV3Q2hhbmdlRGV0ZWN0b3JSZWYuY2hlY2tOb0NoYW5nZXMiLCJfQ29tcG9uZW50Vmlld0NoYW5nZURldGVjdG9yUmVmLnJlYXR0YWNoIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHFCQU9PLDBCQUEwQixDQUFDLENBQUE7QUFDbEMsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0QsMkJBQXdELGdDQUFnQyxDQUFDLENBQUE7QUFDekYsbUJBWU8sc0JBQXNCLENBQUMsQ0FBQTtBQUM5Qix5QkFBcUMsK0JBQStCLENB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Q0EsQ0FBQ0EsQ0FBQ0E7WUFDdkRBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkRBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkRBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVESiwrQ0FBaUJBLEdBQWpCQTtRQUNFSyxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdERBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdERBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ3ZCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsSUFB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QUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtZQUMxRkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUM3REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtZQUMxRkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUM3REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQzdEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxpQkFBaUJBLElBQUlBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7WUFDMUZBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDN0RBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLGlCQUFpQkEsSUFBSUEsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtZQUMxRkEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtRQUM3REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsWUFBWUEsaUJBQWlCQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO1lBQzFGQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO0lBQy9EQSxDQUFDQTtJQUVERixxREFBWUEsR0FBWkEsY0FBc0JHLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFMURILHVEQUFjQSxHQUFkQSxVQUFlQSxHQUFRQTtRQUNyQkksTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsQ0FBQ0Esd0JBQXdCQSxJQUFJQSxnQkFBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0E7WUFDekRBLEdBQUdBLENBQUNBLEVBQUVBLEtBQUtBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7SUFDL0RBLENBQUNBO0lBRURKLG1FQUEwQkEsR0FBMUJBLFVBQTJCQSxLQUFvQkEsRUFBRUEsSUFBV0E7UUFDMURLLElBQUlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0E7UUFDOUJBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLGFBQWFBLENBQUNBO1FBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtnQkFBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNyRkEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDcEJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO2dCQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEtBQUtBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtnQkFBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNyRkEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDcEJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO2dCQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEtBQUtBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsS0FBS0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLG9CQUFTQSxDQUFDQTtnQkFBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQTtZQUNyRkEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDcEJBLENBQUNBO1FBQ0RBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxLQUFLQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2RUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsS0FBS0Esb0JBQVNBLENBQUNBO2dCQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLEVBQUVBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBQ3JGQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNwQkEsQ0FBQ0E7UUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLEdBQUdBLENBQUNBLEtBQUtBLEtBQUtBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxvQkFBU0EsQ0FBQ0E7Z0JBQUNBLENBQUNBLENBQUNBLElBQUlBLEdBQUdBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7WUFDckZBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUNEQSxFQUFFQSxDQUFDQSxDQUFDQSxnQkFBU0EsQ0FBQ0EsQ0FBQ0EsQ0FB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QUFyR1ksZ0JBQVEsV0FxR3BCLENBQUE7QUFFRDtJQUE4Q1csbURBQWlCQTtJQUM3REEseUNBQW9CQSxXQUF1QkE7UUFBSUMsaUJBQU9BLENBQUNBO1FBQW5DQSxnQkFBV0EsR0FBWEEsV0FBV0EsQ0FBWUE7SUFBYUEsQ0FBQ0E7SUFFekRELHNEQUFZQSxHQUFaQSxjQUF1QkUsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsWUFBWUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDMUZGLGdEQUFNQSxHQUFOQSxjQUFpQkcsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDOUVILHVEQUFhQSxHQUFiQSxjQUF3QkksSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsYUFBYUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDNUZKLHdEQUFjQSxHQUFkQSxjQUF5QkssSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsY0FBY0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDOUZMLGtEQUFRQSxHQUFSQSxjQUFtQk0sSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsUUFBUUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDcEZOLHNDQUFDQTtBQUFEQSxDQUFDQSxBQVJELEVBQThDLG9DQUFpQixFQVE5RCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIGlzUHJlc2VudCxcbiAgaXNCbGFuayxcbiAgVHlwZSxcbiAgc3RyaW5naWZ5LFxuICBDT05TVF9FWFBSLFxuICBTdHJpbmdXcmFwcGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBNYXBXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtcbiAgSW5qZWN0b3IsXG4gIEtleSxcbiAgRGVwZW5kZW5jeSxcbiAgcHJvdmlkZSxcbiAgUHJvdmlkZXIsXG4gIFJlc29sdmVkUHJvdmlkZXIsXG4gIE5vUHJvdmlkZXJFcnJvcixcbiAgQWJzdHJhY3RQcm92aWRlckVycm9yLFxuICBDeWNsaWNEZXBlbmRlbmN5RXJyb3IsXG4gIHJlc29sdmVGb3J3YXJkUmVmLFxuICBJbmplY3RhYmxlXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7bWVyZ2VSZXNvbHZlZFByb3ZpZGVyc30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvcHJvdmlkZXInO1xuaW1wb3J0IHtcbiAgVU5ERUZJTkVELFxuICBQcm90b0luamVjdG9yLFxuICBWaXNpYmlsaXR5LFxuICBJbmplY3RvcklubGluZVN0cmF0ZWd5LFxuICBJbmplY3RvckR5bmFtaWNTdHJhdGVneSxcbiAgUHJvdmlkZXJXaXRoVmlzaWJpbGl0eSxcbiAgRGVwZW5kZW5jeVByb3ZpZGVyXG59IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpL2luamVjdG9yJztcbmltcG9ydCB7cmVzb2x2ZVByb3ZpZGVyLCBSZXNvbHZlZEZhY3RvcnksIFJlc29sdmVkUHJvdmlkZXJffSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9wcm92aWRlcic7XG5cbmltcG9ydCB7QXR0cmlidXRlTWV0YWRhdGEsIFF1ZXJ5TWV0YWRhdGF9IGZyb20gJy4uL21ldGFkYXRhL2RpJztcblxuaW1wb3J0IHtBcHBWaWV3fSBmcm9tICcuL3ZpZXcnO1xuaW1wb3J0IHtWaWV3VHlwZX0gZnJvbSAnLi92aWV3X3R5cGUnO1xuaW1wb3J0IHtFbGVtZW50UmVmX30gZnJvbSAnLi9lbGVtZW50X3JlZic7XG5cbmltcG9ydCB7Vmlld0NvbnRhaW5lclJlZn0gZnJvbSAnLi92aWV3X2NvbnRhaW5lcl9yZWYnO1xuaW1wb3J0IHtFbGVtZW50UmVmfSBmcm9tICcuL2VsZW1lbnRfcmVmJztcbmltcG9ydCB7UmVuZGVyZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlbmRlci9hcGknO1xuaW1wb3J0IHtUZW1wbGF0ZVJlZiwgVGVtcGxhdGVSZWZffSBmcm9tICcuL3RlbXBsYXRlX3JlZic7XG5pbXBvcnQge0RpcmVjdGl2ZU1ldGFkYXRhLCBDb21wb25lbnRNZXRhZGF0YX0gZnJvbSAnLi4vbWV0YWRhdGEvZGlyZWN0aXZlcyc7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3RvcixcbiAgQ2hhbmdlRGV0ZWN0b3JSZWZcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7UXVlcnlMaXN0fSBmcm9tICcuL3F1ZXJ5X2xpc3QnO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge1NldHRlckZufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3R5cGVzJztcbmltcG9ydCB7QWZ0ZXJWaWV3Q2hlY2tlZH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL2ludGVyZmFjZXMnO1xuaW1wb3J0IHtQaXBlUHJvdmlkZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3BpcGVzL3BpcGVfcHJvdmlkZXInO1xuXG5pbXBvcnQge1ZpZXdDb250YWluZXJSZWZffSBmcm9tIFwiLi92aWV3X2NvbnRhaW5lcl9yZWZcIjtcbmltcG9ydCB7UmVzb2x2ZWRNZXRhZGF0YUNhY2hlfSBmcm9tICcuL3Jlc29sdmVkX21ldGFkYXRhX2NhY2hlJztcblxudmFyIF9zdGF0aWNLZXlzO1xuXG5leHBvcnQgY2xhc3MgU3RhdGljS2V5cyB7XG4gIHRlbXBsYXRlUmVmSWQ6IG51bWJlcjtcbiAgdmlld0NvbnRhaW5lcklkOiBudW1iZXI7XG4gIGNoYW5nZURldGVjdG9yUmVmSWQ6IG51bWJlcjtcbiAgZWxlbWVudFJlZklkOiBudW1iZXI7XG4gIHJlbmRlcmVySWQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnRlbXBsYXRlUmVmSWQgPSBLZXkuZ2V0KFRlbXBsYXRlUmVmKS5pZDtcbiAgICB0aGlzLnZpZXdDb250YWluZXJJZCA9IEtleS5nZXQoVmlld0NvbnRhaW5lclJlZikuaWQ7XG4gICAgdGhpcy5jaGFuZ2VEZXRlY3RvclJlZklkID0gS2V5LmdldChDaGFuZ2VEZXRlY3RvclJlZikuaWQ7XG4gICAgdGhpcy5lbGVtZW50UmVmSWQgPSBLZXkuZ2V0KEVsZW1lbnRSZWYpLmlkO1xuICAgIHRoaXMucmVuZGVyZXJJZCA9IEtleS5nZXQoUmVuZGVyZXIpLmlkO1xuICB9XG5cbiAgc3RhdGljIGluc3RhbmNlKCk6IFN0YXRpY0tleXMge1xuICAgIGlmIChpc0JsYW5rKF9zdGF0aWNLZXlzKSkgX3N0YXRpY0tleXMgPSBuZXcgU3RhdGljS2V5cygpO1xuICAgIHJldHVybiBfc3RhdGljS2V5cztcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRGlyZWN0aXZlRGVwZW5kZW5jeSBleHRlbmRzIERlcGVuZGVuY3kge1xuICBjb25zdHJ1Y3RvcihrZXk6IEtleSwgb3B0aW9uYWw6IGJvb2xlYW4sIGxvd2VyQm91bmRWaXNpYmlsaXR5OiBPYmplY3QsXG4gICAgICAgICAgICAgIHVwcGVyQm91bmRWaXNpYmlsaXR5OiBPYmplY3QsIHByb3BlcnRpZXM6IGFueVtdLCBwdWJsaWMgYXR0cmlidXRlTmFtZTogc3RyaW5nLFxuICAgICAgICAgICAgICBwdWJsaWMgcXVlcnlEZWNvcmF0b3I6IFF1ZXJ5TWV0YWRhdGEpIHtcbiAgICBzdXBlcihrZXksIG9wdGlvbmFsLCBsb3dlckJvdW5kVmlzaWJpbGl0eSwgdXBwZXJCb3VuZFZpc2liaWxpdHksIHByb3BlcnRpZXMpO1xuICAgIHRoaXMuX3ZlcmlmeSgpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdmVyaWZ5KCk6IHZvaWQge1xuICAgIHZhciBjb3VudCA9IDA7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5RGVjb3JhdG9yKSkgY291bnQrKztcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuYXR0cmlidXRlTmFtZSkpIGNvdW50Kys7XG4gICAgaWYgKGNvdW50ID4gMSlcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICdBIGRpcmVjdGl2ZSBpbmplY3RhYmxlIGNhbiBjb250YWluIG9ubHkgb25lIG9mIHRoZSBmb2xsb3dpbmcgQEF0dHJpYnV0ZSBvciBAUXVlcnkuJyk7XG4gIH1cblxuICBzdGF0aWMgY3JlYXRlRnJvbShkOiBEZXBlbmRlbmN5KTogRGlyZWN0aXZlRGVwZW5kZW5jeSB7XG4gICAgcmV0dXJuIG5ldyBEaXJlY3RpdmVEZXBlbmRlbmN5KFxuICAgICAgICBkLmtleSwgZC5vcHRpb25hbCwgZC5sb3dlckJvdW5kVmlzaWJpbGl0eSwgZC51cHBlckJvdW5kVmlzaWJpbGl0eSwgZC5wcm9wZXJ0aWVzLFxuICAgICAgICBEaXJlY3RpdmVEZXBlbmRlbmN5Ll9hdHRyaWJ1dGVOYW1lKGQucHJvcGVydGllcyksIERpcmVjdGl2ZURlcGVuZGVuY3kuX3F1ZXJ5KGQucHJvcGVydGllcykpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBzdGF0aWMgX2F0dHJpYnV0ZU5hbWUocHJvcGVydGllczogYW55W10pOiBzdHJpbmcge1xuICAgIHZhciBwID0gPEF0dHJpYnV0ZU1ldGFkYXRhPnByb3BlcnRpZXMuZmluZChwID0+IHAgaW5zdGFuY2VvZiBBdHRyaWJ1dGVNZXRhZGF0YSk7XG4gICAgcmV0dXJuIGlzUHJlc2VudChwKSA/IHAuYXR0cmlidXRlTmFtZSA6IG51bGw7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIHN0YXRpYyBfcXVlcnkocHJvcGVydGllczogYW55W10pOiBRdWVyeU1ldGFkYXRhIHtcbiAgICByZXR1cm4gPFF1ZXJ5TWV0YWRhdGE+cHJvcGVydGllcy5maW5kKHAgPT4gcCBpbnN0YW5jZW9mIFF1ZXJ5TWV0YWRhdGEpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBEaXJlY3RpdmVQcm92aWRlciBleHRlbmRzIFJlc29sdmVkUHJvdmlkZXJfIHtcbiAgY29uc3RydWN0b3Ioa2V5OiBLZXksIGZhY3Rvcnk6IEZ1bmN0aW9uLCBkZXBzOiBEZXBlbmRlbmN5W10sIHB1YmxpYyBpc0NvbXBvbmVudDogYm9vbGVhbixcbiAgICAgICAgICAgICAgcHVibGljIHByb3ZpZGVyczogUmVzb2x2ZWRQcm92aWRlcltdLCBwdWJsaWMgdmlld1Byb3ZpZGVyczogUmVzb2x2ZWRQcm92aWRlcltdLFxuICAgICAgICAgICAgICBwdWJsaWMgcXVlcmllczogUXVlcnlNZXRhZGF0YVdpdGhTZXR0ZXJbXSkge1xuICAgIHN1cGVyKGtleSwgW25ldyBSZXNvbHZlZEZhY3RvcnkoZmFjdG9yeSwgZGVwcyldLCBmYWxzZSk7XG4gIH1cblxuICBnZXQgZGlzcGxheU5hbWUoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMua2V5LmRpc3BsYXlOYW1lOyB9XG5cbiAgc3RhdGljIGNyZWF0ZUZyb21UeXBlKHR5cGU6IFR5cGUsIG1ldGE6IERpcmVjdGl2ZU1ldGFkYXRhKTogRGlyZWN0aXZlUHJvdmlkZXIge1xuICAgIHZhciBwcm92aWRlciA9IG5ldyBQcm92aWRlcih0eXBlLCB7dXNlQ2xhc3M6IHR5cGV9KTtcbiAgICBpZiAoaXNCbGFuayhtZXRhKSkge1xuICAgICAgbWV0YSA9IG5ldyBEaXJlY3RpdmVNZXRhZGF0YSgpO1xuICAgIH1cbiAgICB2YXIgcmIgPSByZXNvbHZlUHJvdmlkZXIocHJvdmlkZXIpO1xuICAgIHZhciByZiA9IHJiLnJlc29sdmVkRmFjdG9yaWVzWzBdO1xuICAgIHZhciBkZXBzOiBEaXJlY3RpdmVEZXBlbmRlbmN5W10gPSByZi5kZXBlbmRlbmNpZXMubWFwKERpcmVjdGl2ZURlcGVuZGVuY3kuY3JlYXRlRnJvbSk7XG4gICAgdmFyIGlzQ29tcG9uZW50ID0gbWV0YSBpbnN0YW5jZW9mIENvbXBvbmVudE1ldGFkYXRhO1xuICAgIHZhciByZXNvbHZlZFByb3ZpZGVycyA9IGlzUHJlc2VudChtZXRhLnByb3ZpZGVycykgPyBJbmplY3Rvci5yZXNvbHZlKG1ldGEucHJvdmlkZXJzKSA6IG51bGw7XG4gICAgdmFyIHJlc29sdmVkVmlld1Byb3ZpZGVycyA9IG1ldGEgaW5zdGFuY2VvZiBDb21wb25lbnRNZXRhZGF0YSAmJiBpc1ByZXNlbnQobWV0YS52aWV3UHJvdmlkZXJzKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJbmplY3Rvci5yZXNvbHZlKG1ldGEudmlld1Byb3ZpZGVycykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVsbDtcbiAgICB2YXIgcXVlcmllcyA9IFtdO1xuICAgIGlmIChpc1ByZXNlbnQobWV0YS5xdWVyaWVzKSkge1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKG1ldGEucXVlcmllcywgKG1ldGEsIGZpZWxkTmFtZSkgPT4ge1xuICAgICAgICB2YXIgc2V0dGVyID0gcmVmbGVjdG9yLnNldHRlcihmaWVsZE5hbWUpO1xuICAgICAgICBxdWVyaWVzLnB1c2gobmV3IFF1ZXJ5TWV0YWRhdGFXaXRoU2V0dGVyKHNldHRlciwgbWV0YSkpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIHF1ZXJpZXMgcGFzc2VkIGludG8gdGhlIGNvbnN0cnVjdG9yLlxuICAgIC8vIFRPRE86IHJlbW92ZSB0aGlzIGFmdGVyIGNvbnN0cnVjdG9yIHF1ZXJpZXMgYXJlIG5vIGxvbmdlciBzdXBwb3J0ZWRcbiAgICBkZXBzLmZvckVhY2goZCA9PiB7XG4gICAgICBpZiAoaXNQcmVzZW50KGQucXVlcnlEZWNvcmF0b3IpKSB7XG4gICAgICAgIHF1ZXJpZXMucHVzaChuZXcgUXVlcnlNZXRhZGF0YVdpdGhTZXR0ZXIobnVsbCwgZC5xdWVyeURlY29yYXRvcikpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBuZXcgRGlyZWN0aXZlUHJvdmlkZXIocmIua2V5LCByZi5mYWN0b3J5LCBkZXBzLCBpc0NvbXBvbmVudCwgcmVzb2x2ZWRQcm92aWRlcnMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlZFZpZXdQcm92aWRlcnMsIHF1ZXJpZXMpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBRdWVyeU1ldGFkYXRhV2l0aFNldHRlciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBzZXR0ZXI6IFNldHRlckZuLCBwdWJsaWMgbWV0YWRhdGE6IFF1ZXJ5TWV0YWRhdGEpIHt9XG59XG5cblxuZnVuY3Rpb24gc2V0UHJvdmlkZXJzVmlzaWJpbGl0eShwcm92aWRlcnM6IFJlc29sdmVkUHJvdmlkZXJbXSwgdmlzaWJpbGl0eTogVmlzaWJpbGl0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0OiBNYXA8bnVtYmVyLCBWaXNpYmlsaXR5Pikge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3ZpZGVycy5sZW5ndGg7IGkrKykge1xuICAgIHJlc3VsdC5zZXQocHJvdmlkZXJzW2ldLmtleS5pZCwgdmlzaWJpbGl0eSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFwcFByb3RvRWxlbWVudCB7XG4gIHByb3RvSW5qZWN0b3I6IFByb3RvSW5qZWN0b3I7XG5cbiAgc3RhdGljIGNyZWF0ZShtZXRhZGF0YUNhY2hlOiBSZXNvbHZlZE1ldGFkYXRhQ2FjaGUsIGluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgYXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sIGRpcmVjdGl2ZVR5cGVzOiBUeXBlW10sXG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlVmFyaWFibGVCaW5kaW5nczoge1trZXk6IHN0cmluZ106IG51bWJlcn0pOiBBcHBQcm90b0VsZW1lbnQge1xuICAgIHZhciBjb21wb25lbnREaXJQcm92aWRlciA9IG51bGw7XG4gICAgdmFyIG1lcmdlZFByb3ZpZGVyc01hcDogTWFwPG51bWJlciwgUmVzb2x2ZWRQcm92aWRlcj4gPSBuZXcgTWFwPG51bWJlciwgUmVzb2x2ZWRQcm92aWRlcj4oKTtcbiAgICB2YXIgcHJvdmlkZXJWaXNpYmlsaXR5TWFwOiBNYXA8bnVtYmVyLCBWaXNpYmlsaXR5PiA9IG5ldyBNYXA8bnVtYmVyLCBWaXNpYmlsaXR5PigpO1xuICAgIHZhciBwcm92aWRlcnMgPSBMaXN0V3JhcHBlci5jcmVhdGVHcm93YWJsZVNpemUoZGlyZWN0aXZlVHlwZXMubGVuZ3RoKTtcblxuICAgIHZhciBwcm90b1F1ZXJ5UmVmcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGlyZWN0aXZlVHlwZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkaXJQcm92aWRlciA9IG1ldGFkYXRhQ2FjaGUuZ2V0UmVzb2x2ZWREaXJlY3RpdmVNZXRhZGF0YShkaXJlY3RpdmVUeXBlc1tpXSk7XG4gICAgICBwcm92aWRlcnNbaV0gPSBuZXcgUHJvdmlkZXJXaXRoVmlzaWJpbGl0eShcbiAgICAgICAgICBkaXJQcm92aWRlciwgZGlyUHJvdmlkZXIuaXNDb21wb25lbnQgPyBWaXNpYmlsaXR5LlB1YmxpY0FuZFByaXZhdGUgOiBWaXNpYmlsaXR5LlB1YmxpYyk7XG5cbiAgICAgIGlmIChkaXJQcm92aWRlci5pc0NvbXBvbmVudCkge1xuICAgICAgICBjb21wb25lbnREaXJQcm92aWRlciA9IGRpclByb3ZpZGVyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGlzUHJlc2VudChkaXJQcm92aWRlci5wcm92aWRlcnMpKSB7XG4gICAgICAgICAgbWVyZ2VSZXNvbHZlZFByb3ZpZGVycyhkaXJQcm92aWRlci5wcm92aWRlcnMsIG1lcmdlZFByb3ZpZGVyc01hcCk7XG4gICAgICAgICAgc2V0UHJvdmlkZXJzVmlzaWJpbGl0eShkaXJQcm92aWRlci5wcm92aWRlcnMsIFZpc2liaWxpdHkuUHVibGljLCBwcm92aWRlclZpc2liaWxpdHlNYXApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoaXNQcmVzZW50KGRpclByb3ZpZGVyLnZpZXdQcm92aWRlcnMpKSB7XG4gICAgICAgIG1lcmdlUmVzb2x2ZWRQcm92aWRlcnMoZGlyUHJvdmlkZXIudmlld1Byb3ZpZGVycywgbWVyZ2VkUHJvdmlkZXJzTWFwKTtcbiAgICAgICAgc2V0UHJvdmlkZXJzVmlzaWJpbGl0eShkaXJQcm92aWRlci52aWV3UHJvdmlkZXJzLCBWaXNpYmlsaXR5LlByaXZhdGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJWaXNpYmlsaXR5TWFwKTtcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIHF1ZXJ5SWR4ID0gMDsgcXVlcnlJZHggPCBkaXJQcm92aWRlci5xdWVyaWVzLmxlbmd0aDsgcXVlcnlJZHgrKykge1xuICAgICAgICB2YXIgcSA9IGRpclByb3ZpZGVyLnF1ZXJpZXNbcXVlcnlJZHhdO1xuICAgICAgICBwcm90b1F1ZXJ5UmVmcy5wdXNoKG5ldyBQcm90b1F1ZXJ5UmVmKGksIHEuc2V0dGVyLCBxLm1ldGFkYXRhKSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQoY29tcG9uZW50RGlyUHJvdmlkZXIpICYmIGlzUHJlc2VudChjb21wb25lbnREaXJQcm92aWRlci5wcm92aWRlcnMpKSB7XG4gICAgICAvLyBkaXJlY3RpdmUgcHJvdmlkZXJzIG5lZWQgdG8gYmUgcHJpb3JpdGl6ZWQgb3ZlciBjb21wb25lbnQgcHJvdmlkZXJzXG4gICAgICBtZXJnZVJlc29sdmVkUHJvdmlkZXJzKGNvbXBvbmVudERpclByb3ZpZGVyLnByb3ZpZGVycywgbWVyZ2VkUHJvdmlkZXJzTWFwKTtcbiAgICAgIHNldFByb3ZpZGVyc1Zpc2liaWxpdHkoY29tcG9uZW50RGlyUHJvdmlkZXIucHJvdmlkZXJzLCBWaXNpYmlsaXR5LlB1YmxpYyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvdmlkZXJWaXNpYmlsaXR5TWFwKTtcbiAgICB9XG4gICAgbWVyZ2VkUHJvdmlkZXJzTWFwLmZvckVhY2goKHByb3ZpZGVyLCBfKSA9PiB7XG4gICAgICBwcm92aWRlcnMucHVzaChcbiAgICAgICAgICBuZXcgUHJvdmlkZXJXaXRoVmlzaWJpbGl0eShwcm92aWRlciwgcHJvdmlkZXJWaXNpYmlsaXR5TWFwLmdldChwcm92aWRlci5rZXkuaWQpKSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbmV3IEFwcFByb3RvRWxlbWVudChpc1ByZXNlbnQoY29tcG9uZW50RGlyUHJvdmlkZXIpLCBpbmRleCwgYXR0cmlidXRlcywgcHJvdmlkZXJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3RvUXVlcnlSZWZzLCBkaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBmaXJzdFByb3ZpZGVySXNDb21wb25lbnQ6IGJvb2xlYW4sIHB1YmxpYyBpbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICBwdWJsaWMgYXR0cmlidXRlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30sIHB3dnM6IFByb3ZpZGVyV2l0aFZpc2liaWxpdHlbXSxcbiAgICAgICAgICAgICAgcHVibGljIHByb3RvUXVlcnlSZWZzOiBQcm90b1F1ZXJ5UmVmW10sXG4gICAgICAgICAgICAgIHB1YmxpYyBkaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzOiB7W2tleTogc3RyaW5nXTogbnVtYmVyfSkge1xuICAgIHZhciBsZW5ndGggPSBwd3ZzLmxlbmd0aDtcbiAgICBpZiAobGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5wcm90b0luamVjdG9yID0gbmV3IFByb3RvSW5qZWN0b3IocHd2cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucHJvdG9JbmplY3RvciA9IG51bGw7XG4gICAgICB0aGlzLnByb3RvUXVlcnlSZWZzID0gW107XG4gICAgfVxuICB9XG5cbiAgZ2V0UHJvdmlkZXJBdEluZGV4KGluZGV4OiBudW1iZXIpOiBhbnkgeyByZXR1cm4gdGhpcy5wcm90b0luamVjdG9yLmdldFByb3ZpZGVyQXRJbmRleChpbmRleCk7IH1cbn1cblxuY2xhc3MgX0NvbnRleHQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZWxlbWVudDogYW55LCBwdWJsaWMgY29tcG9uZW50RWxlbWVudDogYW55LCBwdWJsaWMgaW5qZWN0b3I6IGFueSkge31cbn1cblxuZXhwb3J0IGNsYXNzIEluamVjdG9yV2l0aEhvc3RCb3VuZGFyeSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbmplY3RvcjogSW5qZWN0b3IsIHB1YmxpYyBob3N0SW5qZWN0b3JCb3VuZGFyeTogYm9vbGVhbikge31cbn1cblxuZXhwb3J0IGNsYXNzIEFwcEVsZW1lbnQgaW1wbGVtZW50cyBEZXBlbmRlbmN5UHJvdmlkZXIsIEVsZW1lbnRSZWYsIEFmdGVyVmlld0NoZWNrZWQge1xuICBzdGF0aWMgZ2V0Vmlld1BhcmVudEluamVjdG9yKHBhcmVudFZpZXdUeXBlOiBWaWV3VHlwZSwgY29udGFpbmVyQXBwRWxlbWVudDogQXBwRWxlbWVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbXBlcmF0aXZlbHlDcmVhdGVkUHJvdmlkZXJzOiBSZXNvbHZlZFByb3ZpZGVyW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm9vdEluamVjdG9yOiBJbmplY3Rvcik6IEluamVjdG9yV2l0aEhvc3RCb3VuZGFyeSB7XG4gICAgdmFyIHBhcmVudEluamVjdG9yO1xuICAgIHZhciBob3N0SW5qZWN0b3JCb3VuZGFyeTtcbiAgICBzd2l0Y2ggKHBhcmVudFZpZXdUeXBlKSB7XG4gICAgICBjYXNlIFZpZXdUeXBlLkNPTVBPTkVOVDpcbiAgICAgICAgcGFyZW50SW5qZWN0b3IgPSBjb250YWluZXJBcHBFbGVtZW50Ll9pbmplY3RvcjtcbiAgICAgICAgaG9zdEluamVjdG9yQm91bmRhcnkgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgVmlld1R5cGUuRU1CRURERUQ6XG4gICAgICAgIHBhcmVudEluamVjdG9yID0gaXNQcmVzZW50KGNvbnRhaW5lckFwcEVsZW1lbnQucHJvdG8ucHJvdG9JbmplY3RvcikgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJBcHBFbGVtZW50Ll9pbmplY3Rvci5wYXJlbnQgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJBcHBFbGVtZW50Ll9pbmplY3RvcjtcbiAgICAgICAgaG9zdEluamVjdG9yQm91bmRhcnkgPSBjb250YWluZXJBcHBFbGVtZW50Ll9pbmplY3Rvci5ob3N0Qm91bmRhcnk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBWaWV3VHlwZS5IT1NUOlxuICAgICAgICBpZiAoaXNQcmVzZW50KGNvbnRhaW5lckFwcEVsZW1lbnQpKSB7XG4gICAgICAgICAgLy8gaG9zdCB2aWV3IGlzIGF0dGFjaGVkIHRvIGEgY29udGFpbmVyXG4gICAgICAgICAgcGFyZW50SW5qZWN0b3IgPSBpc1ByZXNlbnQoY29udGFpbmVyQXBwRWxlbWVudC5wcm90by5wcm90b0luamVjdG9yKSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyQXBwRWxlbWVudC5faW5qZWN0b3IucGFyZW50IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXJBcHBFbGVtZW50Ll9pbmplY3RvcjtcbiAgICAgICAgICBpZiAoaXNQcmVzZW50KGltcGVyYXRpdmVseUNyZWF0ZWRQcm92aWRlcnMpKSB7XG4gICAgICAgICAgICB2YXIgaW1wZXJhdGl2ZVByb3ZpZGVyc1dpdGhWaXNpYmlsaXR5ID0gaW1wZXJhdGl2ZWx5Q3JlYXRlZFByb3ZpZGVycy5tYXAoXG4gICAgICAgICAgICAgICAgcCA9PiBuZXcgUHJvdmlkZXJXaXRoVmlzaWJpbGl0eShwLCBWaXNpYmlsaXR5LlB1YmxpYykpO1xuICAgICAgICAgICAgLy8gVGhlIGltcGVyYXRpdmUgaW5qZWN0b3IgaXMgc2ltaWxhciB0byBoYXZpbmcgYW4gZWxlbWVudCBiZXR3ZWVuXG4gICAgICAgICAgICAvLyB0aGUgZHluYW1pYy1sb2FkZWQgY29tcG9uZW50IGFuZCBpdHMgcGFyZW50ID0+IG5vIGJvdW5kYXJ5IGJldHdlZW5cbiAgICAgICAgICAgIC8vIHRoZSBjb21wb25lbnQgYW5kIGltcGVyYXRpdmVseUNyZWF0ZWRJbmplY3Rvci5cbiAgICAgICAgICAgIHBhcmVudEluamVjdG9yID0gbmV3IEluamVjdG9yKG5ldyBQcm90b0luamVjdG9yKGltcGVyYXRpdmVQcm92aWRlcnNXaXRoVmlzaWJpbGl0eSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRJbmplY3RvciwgdHJ1ZSwgbnVsbCwgbnVsbCk7XG4gICAgICAgICAgICBob3N0SW5qZWN0b3JCb3VuZGFyeSA9IGZhbHNlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBob3N0SW5qZWN0b3JCb3VuZGFyeSA9IGNvbnRhaW5lckFwcEVsZW1lbnQuX2luamVjdG9yLmhvc3RCb3VuZGFyeTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gYm9vdHN0cmFwXG4gICAgICAgICAgcGFyZW50SW5qZWN0b3IgPSByb290SW5qZWN0b3I7XG4gICAgICAgICAgaG9zdEluamVjdG9yQm91bmRhcnkgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEluamVjdG9yV2l0aEhvc3RCb3VuZGFyeShwYXJlbnRJbmplY3RvciwgaG9zdEluamVjdG9yQm91bmRhcnkpO1xuICB9XG5cbiAgcHVibGljIG5lc3RlZFZpZXdzOiBBcHBWaWV3W10gPSBudWxsO1xuICBwdWJsaWMgY29tcG9uZW50VmlldzogQXBwVmlldyA9IG51bGw7XG5cbiAgcHJpdmF0ZSBfcXVlcnlTdHJhdGVneTogX1F1ZXJ5U3RyYXRlZ3k7XG4gIHByaXZhdGUgX2luamVjdG9yOiBJbmplY3RvcjtcbiAgcHJpdmF0ZSBfc3RyYXRlZ3k6IF9FbGVtZW50RGlyZWN0aXZlU3RyYXRlZ3k7XG4gIHB1YmxpYyByZWY6IEVsZW1lbnRSZWZfO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwcm90bzogQXBwUHJvdG9FbGVtZW50LCBwdWJsaWMgcGFyZW50VmlldzogQXBwVmlldywgcHVibGljIHBhcmVudDogQXBwRWxlbWVudCxcbiAgICAgICAgICAgICAgcHVibGljIG5hdGl2ZUVsZW1lbnQ6IGFueSwgcHVibGljIGVtYmVkZGVkVmlld0ZhY3Rvcnk6IEZ1bmN0aW9uKSB7XG4gICAgdGhpcy5yZWYgPSBuZXcgRWxlbWVudFJlZl8odGhpcyk7XG4gICAgdmFyIHBhcmVudEluamVjdG9yID0gaXNQcmVzZW50KHBhcmVudCkgPyBwYXJlbnQuX2luamVjdG9yIDogcGFyZW50Vmlldy5wYXJlbnRJbmplY3RvcjtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucHJvdG8ucHJvdG9JbmplY3RvcikpIHtcbiAgICAgIHZhciBpc0JvdW5kYXJ5O1xuICAgICAgaWYgKGlzUHJlc2VudChwYXJlbnQpICYmIGlzUHJlc2VudChwYXJlbnQucHJvdG8ucHJvdG9JbmplY3RvcikpIHtcbiAgICAgICAgaXNCb3VuZGFyeSA9IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXNCb3VuZGFyeSA9IHBhcmVudFZpZXcuaG9zdEluamVjdG9yQm91bmRhcnk7XG4gICAgICB9XG4gICAgICB0aGlzLl9xdWVyeVN0cmF0ZWd5ID0gdGhpcy5fYnVpbGRRdWVyeVN0cmF0ZWd5KCk7XG4gICAgICB0aGlzLl9pbmplY3RvciA9IG5ldyBJbmplY3Rvcih0aGlzLnByb3RvLnByb3RvSW5qZWN0b3IsIHBhcmVudEluamVjdG9yLCBpc0JvdW5kYXJ5LCB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCkgPT4gdGhpcy5fZGVidWdDb250ZXh0KCkpO1xuXG4gICAgICAvLyB3ZSBjb3VwbGUgb3Vyc2VsdmVzIHRvIHRoZSBpbmplY3RvciBzdHJhdGVneSB0byBhdm9pZCBwb2x5bW9ycGhpYyBjYWxsc1xuICAgICAgdmFyIGluamVjdG9yU3RyYXRlZ3kgPSA8YW55PnRoaXMuX2luamVjdG9yLmludGVybmFsU3RyYXRlZ3k7XG4gICAgICB0aGlzLl9zdHJhdGVneSA9IGluamVjdG9yU3RyYXRlZ3kgaW5zdGFuY2VvZiBJbmplY3RvcklubGluZVN0cmF0ZWd5ID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBFbGVtZW50RGlyZWN0aXZlSW5saW5lU3RyYXRlZ3koaW5qZWN0b3JTdHJhdGVneSwgdGhpcykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEVsZW1lbnREaXJlY3RpdmVEeW5hbWljU3RyYXRlZ3koaW5qZWN0b3JTdHJhdGVneSwgdGhpcyk7XG4gICAgICB0aGlzLl9zdHJhdGVneS5pbml0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3F1ZXJ5U3RyYXRlZ3kgPSBudWxsO1xuICAgICAgdGhpcy5faW5qZWN0b3IgPSBwYXJlbnRJbmplY3RvcjtcbiAgICAgIHRoaXMuX3N0cmF0ZWd5ID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBhdHRhY2hDb21wb25lbnRWaWV3KGNvbXBvbmVudFZpZXc6IEFwcFZpZXcpIHsgdGhpcy5jb21wb25lbnRWaWV3ID0gY29tcG9uZW50VmlldzsgfVxuXG4gIHByaXZhdGUgX2RlYnVnQ29udGV4dCgpOiBhbnkge1xuICAgIHZhciBjID0gdGhpcy5wYXJlbnRWaWV3LmdldERlYnVnQ29udGV4dCh0aGlzLCBudWxsLCBudWxsKTtcbiAgICByZXR1cm4gaXNQcmVzZW50KGMpID8gbmV3IF9Db250ZXh0KGMuZWxlbWVudCwgYy5jb21wb25lbnRFbGVtZW50LCBjLmluamVjdG9yKSA6IG51bGw7XG4gIH1cblxuICBoYXNWYXJpYWJsZUJpbmRpbmcobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdmFyIHZiID0gdGhpcy5wcm90by5kaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzO1xuICAgIHJldHVybiBpc1ByZXNlbnQodmIpICYmIFN0cmluZ01hcFdyYXBwZXIuY29udGFpbnModmIsIG5hbWUpO1xuICB9XG5cbiAgZ2V0VmFyaWFibGVCaW5kaW5nKG5hbWU6IHN0cmluZyk6IGFueSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5wcm90by5kaXJlY3RpdmVWYXJpYWJsZUJpbmRpbmdzW25hbWVdO1xuICAgIHJldHVybiBpc1ByZXNlbnQoaW5kZXgpID8gdGhpcy5nZXREaXJlY3RpdmVBdEluZGV4KDxudW1iZXI+aW5kZXgpIDogdGhpcy5nZXRFbGVtZW50UmVmKCk7XG4gIH1cblxuICBnZXQodG9rZW46IGFueSk6IGFueSB7IHJldHVybiB0aGlzLl9pbmplY3Rvci5nZXQodG9rZW4pOyB9XG5cbiAgaGFzRGlyZWN0aXZlKHR5cGU6IFR5cGUpOiBib29sZWFuIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9pbmplY3Rvci5nZXRPcHRpb25hbCh0eXBlKSk7IH1cblxuICBnZXRDb21wb25lbnQoKTogYW55IHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9zdHJhdGVneSkgPyB0aGlzLl9zdHJhdGVneS5nZXRDb21wb25lbnQoKSA6IG51bGw7IH1cblxuICBnZXRJbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLl9pbmplY3RvcjsgfVxuXG4gIGdldEVsZW1lbnRSZWYoKTogRWxlbWVudFJlZiB7IHJldHVybiB0aGlzLnJlZjsgfVxuXG4gIGdldFZpZXdDb250YWluZXJSZWYoKTogVmlld0NvbnRhaW5lclJlZiB7IHJldHVybiBuZXcgVmlld0NvbnRhaW5lclJlZl8odGhpcyk7IH1cblxuICBnZXRUZW1wbGF0ZVJlZigpOiBUZW1wbGF0ZVJlZiB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmVtYmVkZGVkVmlld0ZhY3RvcnkpKSB7XG4gICAgICByZXR1cm4gbmV3IFRlbXBsYXRlUmVmXyh0aGlzLnJlZik7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZ2V0RGVwZW5kZW5jeShpbmplY3RvcjogSW5qZWN0b3IsIHByb3ZpZGVyOiBSZXNvbHZlZFByb3ZpZGVyLCBkZXA6IERlcGVuZGVuY3kpOiBhbnkge1xuICAgIGlmIChwcm92aWRlciBpbnN0YW5jZW9mIERpcmVjdGl2ZVByb3ZpZGVyKSB7XG4gICAgICB2YXIgZGlyRGVwID0gPERpcmVjdGl2ZURlcGVuZGVuY3k+ZGVwO1xuXG4gICAgICBpZiAoaXNQcmVzZW50KGRpckRlcC5hdHRyaWJ1dGVOYW1lKSkgcmV0dXJuIHRoaXMuX2J1aWxkQXR0cmlidXRlKGRpckRlcCk7XG5cbiAgICAgIGlmIChpc1ByZXNlbnQoZGlyRGVwLnF1ZXJ5RGVjb3JhdG9yKSlcbiAgICAgICAgcmV0dXJuIHRoaXMuX3F1ZXJ5U3RyYXRlZ3kuZmluZFF1ZXJ5KGRpckRlcC5xdWVyeURlY29yYXRvcikubGlzdDtcblxuICAgICAgaWYgKGRpckRlcC5rZXkuaWQgPT09IFN0YXRpY0tleXMuaW5zdGFuY2UoKS5jaGFuZ2VEZXRlY3RvclJlZklkKSB7XG4gICAgICAgIC8vIFdlIHByb3ZpZGUgdGhlIGNvbXBvbmVudCdzIHZpZXcgY2hhbmdlIGRldGVjdG9yIHRvIGNvbXBvbmVudHMgYW5kXG4gICAgICAgIC8vIHRoZSBzdXJyb3VuZGluZyBjb21wb25lbnQncyBjaGFuZ2UgZGV0ZWN0b3IgdG8gZGlyZWN0aXZlcy5cbiAgICAgICAgaWYgKHRoaXMucHJvdG8uZmlyc3RQcm92aWRlcklzQ29tcG9uZW50KSB7XG4gICAgICAgICAgLy8gTm90ZTogVGhlIGNvbXBvbmVudCB2aWV3IGlzIG5vdCB5ZXQgY3JlYXRlZCB3aGVuXG4gICAgICAgICAgLy8gdGhpcyBtZXRob2QgaXMgY2FsbGVkIVxuICAgICAgICAgIHJldHVybiBuZXcgX0NvbXBvbmVudFZpZXdDaGFuZ2VEZXRlY3RvclJlZih0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wYXJlbnRWaWV3LmNoYW5nZURldGVjdG9yLnJlZjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZGlyRGVwLmtleS5pZCA9PT0gU3RhdGljS2V5cy5pbnN0YW5jZSgpLmVsZW1lbnRSZWZJZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRFbGVtZW50UmVmKCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChkaXJEZXAua2V5LmlkID09PSBTdGF0aWNLZXlzLmluc3RhbmNlKCkudmlld0NvbnRhaW5lcklkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFZpZXdDb250YWluZXJSZWYoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRpckRlcC5rZXkuaWQgPT09IFN0YXRpY0tleXMuaW5zdGFuY2UoKS50ZW1wbGF0ZVJlZklkKSB7XG4gICAgICAgIHZhciB0ciA9IHRoaXMuZ2V0VGVtcGxhdGVSZWYoKTtcbiAgICAgICAgaWYgKGlzQmxhbmsodHIpICYmICFkaXJEZXAub3B0aW9uYWwpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgTm9Qcm92aWRlckVycm9yKG51bGwsIGRpckRlcC5rZXkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cjtcbiAgICAgIH1cblxuICAgICAgaWYgKGRpckRlcC5rZXkuaWQgPT09IFN0YXRpY0tleXMuaW5zdGFuY2UoKS5yZW5kZXJlcklkKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmVudFZpZXcucmVuZGVyZXI7XG4gICAgICB9XG5cbiAgICB9IGVsc2UgaWYgKHByb3ZpZGVyIGluc3RhbmNlb2YgUGlwZVByb3ZpZGVyKSB7XG4gICAgICBpZiAoZGVwLmtleS5pZCA9PT0gU3RhdGljS2V5cy5pbnN0YW5jZSgpLmNoYW5nZURldGVjdG9yUmVmSWQpIHtcbiAgICAgICAgLy8gV2UgcHJvdmlkZSB0aGUgY29tcG9uZW50J3MgdmlldyBjaGFuZ2UgZGV0ZWN0b3IgdG8gY29tcG9uZW50cyBhbmRcbiAgICAgICAgLy8gdGhlIHN1cnJvdW5kaW5nIGNvbXBvbmVudCdzIGNoYW5nZSBkZXRlY3RvciB0byBkaXJlY3RpdmVzLlxuICAgICAgICBpZiAodGhpcy5wcm90by5maXJzdFByb3ZpZGVySXNDb21wb25lbnQpIHtcbiAgICAgICAgICAvLyBOb3RlOiBUaGUgY29tcG9uZW50IHZpZXcgaXMgbm90IHlldCBjcmVhdGVkIHdoZW5cbiAgICAgICAgICAvLyB0aGlzIG1ldGhvZCBpcyBjYWxsZWQhXG4gICAgICAgICAgcmV0dXJuIG5ldyBfQ29tcG9uZW50Vmlld0NoYW5nZURldGVjdG9yUmVmKHRoaXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB0aGlzLnBhcmVudFZpZXcuY2hhbmdlRGV0ZWN0b3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gVU5ERUZJTkVEO1xuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRBdHRyaWJ1dGUoZGVwOiBEaXJlY3RpdmVEZXBlbmRlbmN5KTogc3RyaW5nIHtcbiAgICB2YXIgYXR0cmlidXRlcyA9IHRoaXMucHJvdG8uYXR0cmlidXRlcztcbiAgICBpZiAoaXNQcmVzZW50KGF0dHJpYnV0ZXMpICYmIFN0cmluZ01hcFdyYXBwZXIuY29udGFpbnMoYXR0cmlidXRlcywgZGVwLmF0dHJpYnV0ZU5hbWUpKSB7XG4gICAgICByZXR1cm4gYXR0cmlidXRlc1tkZXAuYXR0cmlidXRlTmFtZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5KHF1ZXJ5OiBRdWVyeU1ldGFkYXRhLCBsaXN0OiBhbnlbXSk6IHZvaWQge1xuICAgIHZhciB0ZW1wbGF0ZVJlZiA9IHRoaXMuZ2V0VGVtcGxhdGVSZWYoKTtcbiAgICBpZiAocXVlcnkuc2VsZWN0b3IgPT09IFRlbXBsYXRlUmVmICYmIGlzUHJlc2VudCh0ZW1wbGF0ZVJlZikpIHtcbiAgICAgIGxpc3QucHVzaCh0ZW1wbGF0ZVJlZik7XG4gICAgfVxuICAgIGlmICh0aGlzLl9zdHJhdGVneSAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9zdHJhdGVneS5hZGREaXJlY3RpdmVzTWF0Y2hpbmdRdWVyeShxdWVyeSwgbGlzdCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfYnVpbGRRdWVyeVN0cmF0ZWd5KCk6IF9RdWVyeVN0cmF0ZWd5IHtcbiAgICBpZiAodGhpcy5wcm90by5wcm90b1F1ZXJ5UmVmcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBfZW1wdHlRdWVyeVN0cmF0ZWd5O1xuICAgIH0gZWxzZSBpZiAodGhpcy5wcm90by5wcm90b1F1ZXJ5UmVmcy5sZW5ndGggPD1cbiAgICAgICAgICAgICAgIElubGluZVF1ZXJ5U3RyYXRlZ3kuTlVNQkVSX09GX1NVUFBPUlRFRF9RVUVSSUVTKSB7XG4gICAgICByZXR1cm4gbmV3IElubGluZVF1ZXJ5U3RyYXRlZ3kodGhpcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgRHluYW1pY1F1ZXJ5U3RyYXRlZ3kodGhpcyk7XG4gICAgfVxuICB9XG5cblxuICBnZXREaXJlY3RpdmVBdEluZGV4KGluZGV4OiBudW1iZXIpOiBhbnkgeyByZXR1cm4gdGhpcy5faW5qZWN0b3IuZ2V0QXQoaW5kZXgpOyB9XG5cbiAgbmdBZnRlclZpZXdDaGVja2VkKCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fcXVlcnlTdHJhdGVneSkpIHRoaXMuX3F1ZXJ5U3RyYXRlZ3kudXBkYXRlVmlld1F1ZXJpZXMoKTtcbiAgfVxuXG4gIG5nQWZ0ZXJDb250ZW50Q2hlY2tlZCgpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3F1ZXJ5U3RyYXRlZ3kpKSB0aGlzLl9xdWVyeVN0cmF0ZWd5LnVwZGF0ZUNvbnRlbnRRdWVyaWVzKCk7XG4gIH1cblxuICB0cmF2ZXJzZUFuZFNldFF1ZXJpZXNBc0RpcnR5KCk6IHZvaWQge1xuICAgIHZhciBpbmo6IEFwcEVsZW1lbnQgPSB0aGlzO1xuICAgIHdoaWxlIChpc1ByZXNlbnQoaW5qKSkge1xuICAgICAgaW5qLl9zZXRRdWVyaWVzQXNEaXJ0eSgpO1xuICAgICAgaW5qID0gaW5qLnBhcmVudDtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9zZXRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3F1ZXJ5U3RyYXRlZ3kpKSB7XG4gICAgICB0aGlzLl9xdWVyeVN0cmF0ZWd5LnNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5wYXJlbnRWaWV3LnByb3RvLnR5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCkge1xuICAgICAgdGhpcy5wYXJlbnRWaWV3LmNvbnRhaW5lckFwcEVsZW1lbnQuX3F1ZXJ5U3RyYXRlZ3kuc2V0Vmlld1F1ZXJpZXNBc0RpcnR5KCk7XG4gICAgfVxuICB9XG59XG5cbmludGVyZmFjZSBfUXVlcnlTdHJhdGVneSB7XG4gIHNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkO1xuICBzZXRWaWV3UXVlcmllc0FzRGlydHkoKTogdm9pZDtcbiAgdXBkYXRlQ29udGVudFF1ZXJpZXMoKTogdm9pZDtcbiAgdXBkYXRlVmlld1F1ZXJpZXMoKTogdm9pZDtcbiAgZmluZFF1ZXJ5KHF1ZXJ5OiBRdWVyeU1ldGFkYXRhKTogUXVlcnlSZWY7XG59XG5cbmNsYXNzIF9FbXB0eVF1ZXJ5U3RyYXRlZ3kgaW1wbGVtZW50cyBfUXVlcnlTdHJhdGVneSB7XG4gIHNldENvbnRlbnRRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHt9XG4gIHNldFZpZXdRdWVyaWVzQXNEaXJ0eSgpOiB2b2lkIHt9XG4gIHVwZGF0ZUNvbnRlbnRRdWVyaWVzKCk6IHZvaWQge31cbiAgdXBkYXRlVmlld1F1ZXJpZXMoKTogdm9pZCB7fVxuICBmaW5kUXVlcnkocXVlcnk6IFF1ZXJ5TWV0YWRhdGEpOiBRdWVyeVJlZiB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENhbm5vdCBmaW5kIHF1ZXJ5IGZvciBkaXJlY3RpdmUgJHtxdWVyeX0uYCk7XG4gIH1cbn1cblxudmFyIF9lbXB0eVF1ZXJ5U3RyYXRlZ3kgPSBuZXcgX0VtcHR5UXVlcnlTdHJhdGVneSgpO1xuXG5jbGFzcyBJbmxpbmVRdWVyeVN0cmF0ZWd5IGltcGxlbWVudHMgX1F1ZXJ5U3RyYXRlZ3kge1xuICBzdGF0aWMgTlVNQkVSX09GX1NVUFBPUlRFRF9RVUVSSUVTID0gMztcblxuICBxdWVyeTA6IFF1ZXJ5UmVmO1xuICBxdWVyeTE6IFF1ZXJ5UmVmO1xuICBxdWVyeTI6IFF1ZXJ5UmVmO1xuXG4gIGNvbnN0cnVjdG9yKGVpOiBBcHBFbGVtZW50KSB7XG4gICAgdmFyIHByb3RvUmVmcyA9IGVpLnByb3RvLnByb3RvUXVlcnlSZWZzO1xuICAgIGlmIChwcm90b1JlZnMubGVuZ3RoID4gMCkgdGhpcy5xdWVyeTAgPSBuZXcgUXVlcnlSZWYocHJvdG9SZWZzWzBdLCBlaSk7XG4gICAgaWYgKHByb3RvUmVmcy5sZW5ndGggPiAxKSB0aGlzLnF1ZXJ5MSA9IG5ldyBRdWVyeVJlZihwcm90b1JlZnNbMV0sIGVpKTtcbiAgICBpZiAocHJvdG9SZWZzLmxlbmd0aCA+IDIpIHRoaXMucXVlcnkyID0gbmV3IFF1ZXJ5UmVmKHByb3RvUmVmc1syXSwgZWkpO1xuICB9XG5cbiAgc2V0Q29udGVudFF1ZXJpZXNBc0RpcnR5KCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTApICYmICF0aGlzLnF1ZXJ5MC5pc1ZpZXdRdWVyeSkgdGhpcy5xdWVyeTAuZGlydHkgPSB0cnVlO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTEpICYmICF0aGlzLnF1ZXJ5MS5pc1ZpZXdRdWVyeSkgdGhpcy5xdWVyeTEuZGlydHkgPSB0cnVlO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTIpICYmICF0aGlzLnF1ZXJ5Mi5pc1ZpZXdRdWVyeSkgdGhpcy5xdWVyeTIuZGlydHkgPSB0cnVlO1xuICB9XG5cbiAgc2V0Vmlld1F1ZXJpZXNBc0RpcnR5KCk6IHZvaWQge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTApICYmIHRoaXMucXVlcnkwLmlzVmlld1F1ZXJ5KSB0aGlzLnF1ZXJ5MC5kaXJ0eSA9IHRydWU7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MSkgJiYgdGhpcy5xdWVyeTEuaXNWaWV3UXVlcnkpIHRoaXMucXVlcnkxLmRpcnR5ID0gdHJ1ZTtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkyKSAmJiB0aGlzLnF1ZXJ5Mi5pc1ZpZXdRdWVyeSkgdGhpcy5xdWVyeTIuZGlydHkgPSB0cnVlO1xuICB9XG5cbiAgdXBkYXRlQ29udGVudFF1ZXJpZXMoKSB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MCkgJiYgIXRoaXMucXVlcnkwLmlzVmlld1F1ZXJ5KSB7XG4gICAgICB0aGlzLnF1ZXJ5MC51cGRhdGUoKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MSkgJiYgIXRoaXMucXVlcnkxLmlzVmlld1F1ZXJ5KSB7XG4gICAgICB0aGlzLnF1ZXJ5MS51cGRhdGUoKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MikgJiYgIXRoaXMucXVlcnkyLmlzVmlld1F1ZXJ5KSB7XG4gICAgICB0aGlzLnF1ZXJ5Mi51cGRhdGUoKTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVWaWV3UXVlcmllcygpIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkwKSAmJiB0aGlzLnF1ZXJ5MC5pc1ZpZXdRdWVyeSkge1xuICAgICAgdGhpcy5xdWVyeTAudXBkYXRlKCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5xdWVyeTEpICYmIHRoaXMucXVlcnkxLmlzVmlld1F1ZXJ5KSB7XG4gICAgICB0aGlzLnF1ZXJ5MS51cGRhdGUoKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLnF1ZXJ5MikgJiYgdGhpcy5xdWVyeTIuaXNWaWV3UXVlcnkpIHtcbiAgICAgIHRoaXMucXVlcnkyLnVwZGF0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIGZpbmRRdWVyeShxdWVyeTogUXVlcnlNZXRhZGF0YSk6IFF1ZXJ5UmVmIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkwKSAmJiB0aGlzLnF1ZXJ5MC5wcm90b1F1ZXJ5UmVmLnF1ZXJ5ID09PSBxdWVyeSkge1xuICAgICAgcmV0dXJuIHRoaXMucXVlcnkwO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkxKSAmJiB0aGlzLnF1ZXJ5MS5wcm90b1F1ZXJ5UmVmLnF1ZXJ5ID09PSBxdWVyeSkge1xuICAgICAgcmV0dXJuIHRoaXMucXVlcnkxO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMucXVlcnkyKSAmJiB0aGlzLnF1ZXJ5Mi5wcm90b1F1ZXJ5UmVmLnF1ZXJ5ID09PSBxdWVyeSkge1xuICAgICAgcmV0dXJuIHRoaXMucXVlcnkyO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgQ2Fubm90IGZpbmQgcXVlcnkgZm9yIGRpcmVjdGl2ZSAke3F1ZXJ5fS5gKTtcbiAgfVxufVxuXG5jbGFzcyBEeW5hbWljUXVlcnlTdHJhdGVneSBpbXBsZW1lbnRzIF9RdWVyeVN0cmF0ZWd5IHtcbiAgcXVlcmllczogUXVlcnlSZWZbXTtcblxuICBjb25zdHJ1Y3RvcihlaTogQXBwRWxlbWVudCkge1xuICAgIHRoaXMucXVlcmllcyA9IGVpLnByb3RvLnByb3RvUXVlcnlSZWZzLm1hcChwID0+IG5ldyBRdWVyeVJlZihwLCBlaSkpO1xuICB9XG5cbiAgc2V0Q29udGVudFF1ZXJpZXNBc0RpcnR5KCk6IHZvaWQge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5xdWVyaWVzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgcSA9IHRoaXMucXVlcmllc1tpXTtcbiAgICAgIGlmICghcS5pc1ZpZXdRdWVyeSkgcS5kaXJ0eSA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgc2V0Vmlld1F1ZXJpZXNBc0RpcnR5KCk6IHZvaWQge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5xdWVyaWVzLmxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgcSA9IHRoaXMucXVlcmllc1tpXTtcbiAgICAgIGlmIChxLmlzVmlld1F1ZXJ5KSBxLmRpcnR5ID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICB1cGRhdGVDb250ZW50UXVlcmllcygpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVlcmllcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHEgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICBpZiAoIXEuaXNWaWV3UXVlcnkpIHtcbiAgICAgICAgcS51cGRhdGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1cGRhdGVWaWV3UXVlcmllcygpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVlcmllcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHEgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICBpZiAocS5pc1ZpZXdRdWVyeSkge1xuICAgICAgICBxLnVwZGF0ZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZpbmRRdWVyeShxdWVyeTogUXVlcnlNZXRhZGF0YSk6IFF1ZXJ5UmVmIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVlcmllcy5sZW5ndGg7ICsraSkge1xuICAgICAgdmFyIHEgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICBpZiAocS5wcm90b1F1ZXJ5UmVmLnF1ZXJ5ID09PSBxdWVyeSkge1xuICAgICAgICByZXR1cm4gcTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENhbm5vdCBmaW5kIHF1ZXJ5IGZvciBkaXJlY3RpdmUgJHtxdWVyeX0uYCk7XG4gIH1cbn1cblxuaW50ZXJmYWNlIF9FbGVtZW50RGlyZWN0aXZlU3RyYXRlZ3kge1xuICBnZXRDb21wb25lbnQoKTogYW55O1xuICBpc0NvbXBvbmVudEtleShrZXk6IEtleSk6IGJvb2xlYW47XG4gIGFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5KHE6IFF1ZXJ5TWV0YWRhdGEsIHJlczogYW55W10pOiB2b2lkO1xuICBpbml0KCk6IHZvaWQ7XG59XG5cbi8qKlxuICogU3RyYXRlZ3kgdXNlZCBieSB0aGUgYEVsZW1lbnRJbmplY3RvcmAgd2hlbiB0aGUgbnVtYmVyIG9mIHByb3ZpZGVycyBpcyAxMCBvciBsZXNzLlxuICogSW4gc3VjaCBhIGNhc2UsIGlubGluaW5nIGZpZWxkcyBpcyBiZW5lZmljaWFsIGZvciBwZXJmb3JtYW5jZXMuXG4gKi9cbmNsYXNzIEVsZW1lbnREaXJlY3RpdmVJbmxpbmVTdHJhdGVneSBpbXBsZW1lbnRzIF9FbGVtZW50RGlyZWN0aXZlU3RyYXRlZ3kge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW5qZWN0b3JTdHJhdGVneTogSW5qZWN0b3JJbmxpbmVTdHJhdGVneSwgcHVibGljIF9laTogQXBwRWxlbWVudCkge31cblxuICBpbml0KCk6IHZvaWQge1xuICAgIHZhciBpID0gdGhpcy5pbmplY3RvclN0cmF0ZWd5O1xuICAgIHZhciBwID0gaS5wcm90b1N0cmF0ZWd5O1xuICAgIGkucmVzZXRDb25zdHJ1Y3Rpb25Db3VudGVyKCk7XG5cbiAgICBpZiAocC5wcm92aWRlcjAgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDApICYmIGkub2JqMCA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmowID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIwLCBwLnZpc2liaWxpdHkwKTtcbiAgICBpZiAocC5wcm92aWRlcjEgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDEpICYmIGkub2JqMSA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmoxID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIxLCBwLnZpc2liaWxpdHkxKTtcbiAgICBpZiAocC5wcm92aWRlcjIgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDIpICYmIGkub2JqMiA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmoyID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIyLCBwLnZpc2liaWxpdHkyKTtcbiAgICBpZiAocC5wcm92aWRlcjMgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDMpICYmIGkub2JqMyA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmozID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIzLCBwLnZpc2liaWxpdHkzKTtcbiAgICBpZiAocC5wcm92aWRlcjQgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDQpICYmIGkub2JqNCA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo0ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI0LCBwLnZpc2liaWxpdHk0KTtcbiAgICBpZiAocC5wcm92aWRlcjUgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDUpICYmIGkub2JqNSA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo1ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI1LCBwLnZpc2liaWxpdHk1KTtcbiAgICBpZiAocC5wcm92aWRlcjYgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDYpICYmIGkub2JqNiA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo2ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI2LCBwLnZpc2liaWxpdHk2KTtcbiAgICBpZiAocC5wcm92aWRlcjcgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDcpICYmIGkub2JqNyA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo3ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI3LCBwLnZpc2liaWxpdHk3KTtcbiAgICBpZiAocC5wcm92aWRlcjggaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDgpICYmIGkub2JqOCA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo4ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI4LCBwLnZpc2liaWxpdHk4KTtcbiAgICBpZiAocC5wcm92aWRlcjkgaW5zdGFuY2VvZiBEaXJlY3RpdmVQcm92aWRlciAmJiBpc1ByZXNlbnQocC5rZXlJZDkpICYmIGkub2JqOSA9PT0gVU5ERUZJTkVEKVxuICAgICAgaS5vYmo5ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI5LCBwLnZpc2liaWxpdHk5KTtcbiAgfVxuXG4gIGdldENvbXBvbmVudCgpOiBhbnkgeyByZXR1cm4gdGhpcy5pbmplY3RvclN0cmF0ZWd5Lm9iajA7IH1cblxuICBpc0NvbXBvbmVudEtleShrZXk6IEtleSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9laS5wcm90by5maXJzdFByb3ZpZGVySXNDb21wb25lbnQgJiYgaXNQcmVzZW50KGtleSkgJiZcbiAgICAgICAgICAga2V5LmlkID09PSB0aGlzLmluamVjdG9yU3RyYXRlZ3kucHJvdG9TdHJhdGVneS5rZXlJZDA7XG4gIH1cblxuICBhZGREaXJlY3RpdmVzTWF0Y2hpbmdRdWVyeShxdWVyeTogUXVlcnlNZXRhZGF0YSwgbGlzdDogYW55W10pOiB2b2lkIHtcbiAgICB2YXIgaSA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneTtcbiAgICB2YXIgcCA9IGkucHJvdG9TdHJhdGVneTtcbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXIwKSAmJiBwLnByb3ZpZGVyMC5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmowID09PSBVTkRFRklORUQpIGkub2JqMCA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyMCwgcC52aXNpYmlsaXR5MCk7XG4gICAgICBsaXN0LnB1c2goaS5vYmowKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyMSkgJiYgcC5wcm92aWRlcjEua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqMSA9PT0gVU5ERUZJTkVEKSBpLm9iajEgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjEsIHAudmlzaWJpbGl0eTEpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqMSk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjIpICYmIHAucHJvdmlkZXIyLmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajIgPT09IFVOREVGSU5FRCkgaS5vYmoyID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXIyLCBwLnZpc2liaWxpdHkyKTtcbiAgICAgIGxpc3QucHVzaChpLm9iajIpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXIzKSAmJiBwLnByb3ZpZGVyMy5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmozID09PSBVTkRFRklORUQpIGkub2JqMyA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyMywgcC52aXNpYmlsaXR5Myk7XG4gICAgICBsaXN0LnB1c2goaS5vYmozKTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyNCkgJiYgcC5wcm92aWRlcjQua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqNCA9PT0gVU5ERUZJTkVEKSBpLm9iajQgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjQsIHAudmlzaWJpbGl0eTQpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqNCk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjUpICYmIHAucHJvdmlkZXI1LmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajUgPT09IFVOREVGSU5FRCkgaS5vYmo1ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI1LCBwLnZpc2liaWxpdHk1KTtcbiAgICAgIGxpc3QucHVzaChpLm9iajUpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXI2KSAmJiBwLnByb3ZpZGVyNi5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmo2ID09PSBVTkRFRklORUQpIGkub2JqNiA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyNiwgcC52aXNpYmlsaXR5Nik7XG4gICAgICBsaXN0LnB1c2goaS5vYmo2KTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudChwLnByb3ZpZGVyNykgJiYgcC5wcm92aWRlcjcua2V5LnRva2VuID09PSBxdWVyeS5zZWxlY3Rvcikge1xuICAgICAgaWYgKGkub2JqNyA9PT0gVU5ERUZJTkVEKSBpLm9iajcgPSBpLmluc3RhbnRpYXRlUHJvdmlkZXIocC5wcm92aWRlcjcsIHAudmlzaWJpbGl0eTcpO1xuICAgICAgbGlzdC5wdXNoKGkub2JqNyk7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQocC5wcm92aWRlcjgpICYmIHAucHJvdmlkZXI4LmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgIGlmIChpLm9iajggPT09IFVOREVGSU5FRCkgaS5vYmo4ID0gaS5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXI4LCBwLnZpc2liaWxpdHk4KTtcbiAgICAgIGxpc3QucHVzaChpLm9iajgpO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHAucHJvdmlkZXI5KSAmJiBwLnByb3ZpZGVyOS5rZXkudG9rZW4gPT09IHF1ZXJ5LnNlbGVjdG9yKSB7XG4gICAgICBpZiAoaS5vYmo5ID09PSBVTkRFRklORUQpIGkub2JqOSA9IGkuaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyOSwgcC52aXNpYmlsaXR5OSk7XG4gICAgICBsaXN0LnB1c2goaS5vYmo5KTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBTdHJhdGVneSB1c2VkIGJ5IHRoZSBgRWxlbWVudEluamVjdG9yYCB3aGVuIHRoZSBudW1iZXIgb2YgYmluZGluZ3MgaXMgMTEgb3IgbW9yZS5cbiAqIEluIHN1Y2ggYSBjYXNlLCB0aGVyZSBhcmUgdG9vIG1hbnkgZmllbGRzIHRvIGlubGluZSAoc2VlIEVsZW1lbnRJbmplY3RvcklubGluZVN0cmF0ZWd5KS5cbiAqL1xuY2xhc3MgRWxlbWVudERpcmVjdGl2ZUR5bmFtaWNTdHJhdGVneSBpbXBsZW1lbnRzIF9FbGVtZW50RGlyZWN0aXZlU3RyYXRlZ3kge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW5qZWN0b3JTdHJhdGVneTogSW5qZWN0b3JEeW5hbWljU3RyYXRlZ3ksIHB1YmxpYyBfZWk6IEFwcEVsZW1lbnQpIHt9XG5cbiAgaW5pdCgpOiB2b2lkIHtcbiAgICB2YXIgaW5qID0gdGhpcy5pbmplY3RvclN0cmF0ZWd5O1xuICAgIHZhciBwID0gaW5qLnByb3RvU3RyYXRlZ3k7XG4gICAgaW5qLnJlc2V0Q29uc3RydWN0aW9uQ291bnRlcigpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwLmtleUlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHAucHJvdmlkZXJzW2ldIGluc3RhbmNlb2YgRGlyZWN0aXZlUHJvdmlkZXIgJiYgaXNQcmVzZW50KHAua2V5SWRzW2ldKSAmJlxuICAgICAgICAgIGluai5vYmpzW2ldID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgaW5qLm9ianNbaV0gPSBpbmouaW5zdGFudGlhdGVQcm92aWRlcihwLnByb3ZpZGVyc1tpXSwgcC52aXNpYmlsaXRpZXNbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldENvbXBvbmVudCgpOiBhbnkgeyByZXR1cm4gdGhpcy5pbmplY3RvclN0cmF0ZWd5Lm9ianNbMF07IH1cblxuICBpc0NvbXBvbmVudEtleShrZXk6IEtleSk6IGJvb2xlYW4ge1xuICAgIHZhciBwID0gdGhpcy5pbmplY3RvclN0cmF0ZWd5LnByb3RvU3RyYXRlZ3k7XG4gICAgcmV0dXJuIHRoaXMuX2VpLnByb3RvLmZpcnN0UHJvdmlkZXJJc0NvbXBvbmVudCAmJiBpc1ByZXNlbnQoa2V5KSAmJiBrZXkuaWQgPT09IHAua2V5SWRzWzBdO1xuICB9XG5cbiAgYWRkRGlyZWN0aXZlc01hdGNoaW5nUXVlcnkocXVlcnk6IFF1ZXJ5TWV0YWRhdGEsIGxpc3Q6IGFueVtdKTogdm9pZCB7XG4gICAgdmFyIGlzdCA9IHRoaXMuaW5qZWN0b3JTdHJhdGVneTtcbiAgICB2YXIgcCA9IGlzdC5wcm90b1N0cmF0ZWd5O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwLnByb3ZpZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHAucHJvdmlkZXJzW2ldLmtleS50b2tlbiA9PT0gcXVlcnkuc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKGlzdC5vYmpzW2ldID09PSBVTkRFRklORUQpIHtcbiAgICAgICAgICBpc3Qub2Jqc1tpXSA9IGlzdC5pbnN0YW50aWF0ZVByb3ZpZGVyKHAucHJvdmlkZXJzW2ldLCBwLnZpc2liaWxpdGllc1tpXSk7XG4gICAgICAgIH1cbiAgICAgICAgbGlzdC5wdXNoKGlzdC5vYmpzW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFByb3RvUXVlcnlSZWYge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZGlySW5kZXg6IG51bWJlciwgcHVibGljIHNldHRlcjogU2V0dGVyRm4sIHB1YmxpYyBxdWVyeTogUXVlcnlNZXRhZGF0YSkge31cblxuICBnZXQgdXNlc1Byb3BlcnR5U3ludGF4KCk6IGJvb2xlYW4geyByZXR1cm4gaXNQcmVzZW50KHRoaXMuc2V0dGVyKTsgfVxufVxuXG5leHBvcnQgY2xhc3MgUXVlcnlSZWYge1xuICBwdWJsaWMgbGlzdDogUXVlcnlMaXN0PGFueT47XG4gIHB1YmxpYyBkaXJ0eTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgcHJvdG9RdWVyeVJlZjogUHJvdG9RdWVyeVJlZiwgcHJpdmF0ZSBvcmlnaW5hdG9yOiBBcHBFbGVtZW50KSB7XG4gICAgdGhpcy5saXN0ID0gbmV3IFF1ZXJ5TGlzdDxhbnk+KCk7XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG4gIH1cblxuICBnZXQgaXNWaWV3UXVlcnkoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLnByb3RvUXVlcnlSZWYucXVlcnkuaXNWaWV3UXVlcnk7IH1cblxuICB1cGRhdGUoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmRpcnR5KSByZXR1cm47XG4gICAgdGhpcy5fdXBkYXRlKCk7XG4gICAgdGhpcy5kaXJ0eSA9IGZhbHNlO1xuXG4gICAgLy8gVE9ETyBkZWxldGUgdGhlIGNoZWNrIG9uY2Ugb25seSBmaWVsZCBxdWVyaWVzIGFyZSBzdXBwb3J0ZWRcbiAgICBpZiAodGhpcy5wcm90b1F1ZXJ5UmVmLnVzZXNQcm9wZXJ0eVN5bnRheCkge1xuICAgICAgdmFyIGRpciA9IHRoaXMub3JpZ2luYXRvci5nZXREaXJlY3RpdmVBdEluZGV4KHRoaXMucHJvdG9RdWVyeVJlZi5kaXJJbmRleCk7XG4gICAgICBpZiAodGhpcy5wcm90b1F1ZXJ5UmVmLnF1ZXJ5LmZpcnN0KSB7XG4gICAgICAgIHRoaXMucHJvdG9RdWVyeVJlZi5zZXR0ZXIoZGlyLCB0aGlzLmxpc3QubGVuZ3RoID4gMCA/IHRoaXMubGlzdC5maXJzdCA6IG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5wcm90b1F1ZXJ5UmVmLnNldHRlcihkaXIsIHRoaXMubGlzdCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5saXN0Lm5vdGlmeU9uQ2hhbmdlcygpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlKCk6IHZvaWQge1xuICAgIHZhciBhZ2dyZWdhdG9yID0gW107XG4gICAgaWYgKHRoaXMucHJvdG9RdWVyeVJlZi5xdWVyeS5pc1ZpZXdRdWVyeSkge1xuICAgICAgLy8gaW50ZW50aW9uYWxseSBza2lwcGluZyBvcmlnaW5hdG9yIGZvciB2aWV3IHF1ZXJpZXMuXG4gICAgICB2YXIgbmVzdGVkVmlldyA9IHRoaXMub3JpZ2luYXRvci5jb21wb25lbnRWaWV3O1xuICAgICAgaWYgKGlzUHJlc2VudChuZXN0ZWRWaWV3KSkgdGhpcy5fdmlzaXRWaWV3KG5lc3RlZFZpZXcsIGFnZ3JlZ2F0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl92aXNpdCh0aGlzLm9yaWdpbmF0b3IsIGFnZ3JlZ2F0b3IpO1xuICAgIH1cbiAgICB0aGlzLmxpc3QucmVzZXQoYWdncmVnYXRvcik7XG4gIH07XG5cbiAgcHJpdmF0ZSBfdmlzaXQoaW5qOiBBcHBFbGVtZW50LCBhZ2dyZWdhdG9yOiBhbnlbXSk6IHZvaWQge1xuICAgIHZhciB2aWV3ID0gaW5qLnBhcmVudFZpZXc7XG4gICAgdmFyIHN0YXJ0SWR4ID0gaW5qLnByb3RvLmluZGV4O1xuICAgIGZvciAodmFyIGkgPSBzdGFydElkeDsgaSA8IHZpZXcuYXBwRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBjdXJJbmogPSB2aWV3LmFwcEVsZW1lbnRzW2ldO1xuICAgICAgLy8gVGhlIGZpcnN0IGluamVjdG9yIGFmdGVyIGluaiwgdGhhdCBpcyBvdXRzaWRlIHRoZSBzdWJ0cmVlIHJvb3RlZCBhdFxuICAgICAgLy8gaW5qIGhhcyB0byBoYXZlIGEgbnVsbCBwYXJlbnQgb3IgYSBwYXJlbnQgdGhhdCBpcyBhbiBhbmNlc3RvciBvZiBpbmouXG4gICAgICBpZiAoaSA+IHN0YXJ0SWR4ICYmIChpc0JsYW5rKGN1ckluai5wYXJlbnQpIHx8IGN1ckluai5wYXJlbnQucHJvdG8uaW5kZXggPCBzdGFydElkeCkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5wcm90b1F1ZXJ5UmVmLnF1ZXJ5LmRlc2NlbmRhbnRzICYmXG4gICAgICAgICAgIShjdXJJbmoucGFyZW50ID09IHRoaXMub3JpZ2luYXRvciB8fCBjdXJJbmogPT0gdGhpcy5vcmlnaW5hdG9yKSlcbiAgICAgICAgY29udGludWU7XG5cbiAgICAgIC8vIFdlIHZpc2l0IHRoZSB2aWV3IGNvbnRhaW5lcihWQykgdmlld3MgcmlnaHQgYWZ0ZXIgdGhlIGluamVjdG9yIHRoYXQgY29udGFpbnNcbiAgICAgIC8vIHRoZSBWQy4gVGhlb3JldGljYWxseSwgdGhhdCBtaWdodCBub3QgYmUgdGhlIHJpZ2h0IG9yZGVyIGlmIHRoZXJlIGFyZVxuICAgICAgLy8gY2hpbGQgaW5qZWN0b3JzIG9mIHNhaWQgaW5qZWN0b3IuIE5vdCBjbGVhciB3aGV0aGVyIGlmIHN1Y2ggY2FzZSBjYW5cbiAgICAgIC8vIGV2ZW4gYmUgY29uc3RydWN0ZWQgd2l0aCB0aGUgY3VycmVudCBhcGlzLlxuICAgICAgdGhpcy5fdmlzaXRJbmplY3RvcihjdXJJbmosIGFnZ3JlZ2F0b3IpO1xuICAgICAgdGhpcy5fdmlzaXRWaWV3Q29udGFpbmVyVmlld3MoY3VySW5qLm5lc3RlZFZpZXdzLCBhZ2dyZWdhdG9yKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF92aXNpdEluamVjdG9yKGluajogQXBwRWxlbWVudCwgYWdncmVnYXRvcjogYW55W10pIHtcbiAgICBpZiAodGhpcy5wcm90b1F1ZXJ5UmVmLnF1ZXJ5LmlzVmFyQmluZGluZ1F1ZXJ5KSB7XG4gICAgICB0aGlzLl9hZ2dyZWdhdGVWYXJpYWJsZUJpbmRpbmcoaW5qLCBhZ2dyZWdhdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fYWdncmVnYXRlRGlyZWN0aXZlKGluaiwgYWdncmVnYXRvcik7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfdmlzaXRWaWV3Q29udGFpbmVyVmlld3Modmlld3M6IEFwcFZpZXdbXSwgYWdncmVnYXRvcjogYW55W10pIHtcbiAgICBpZiAoaXNQcmVzZW50KHZpZXdzKSkge1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2aWV3cy5sZW5ndGg7IGorKykge1xuICAgICAgICB0aGlzLl92aXNpdFZpZXcodmlld3Nbal0sIGFnZ3JlZ2F0b3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3Zpc2l0Vmlldyh2aWV3OiBBcHBWaWV3LCBhZ2dyZWdhdG9yOiBhbnlbXSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmlldy5hcHBFbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGluaiA9IHZpZXcuYXBwRWxlbWVudHNbaV07XG4gICAgICB0aGlzLl92aXNpdEluamVjdG9yKGluaiwgYWdncmVnYXRvcik7XG4gICAgICB0aGlzLl92aXNpdFZpZXdDb250YWluZXJWaWV3cyhpbmoubmVzdGVkVmlld3MsIGFnZ3JlZ2F0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FnZ3JlZ2F0ZVZhcmlhYmxlQmluZGluZyhpbmo6IEFwcEVsZW1lbnQsIGFnZ3JlZ2F0b3I6IGFueVtdKTogdm9pZCB7XG4gICAgdmFyIHZiID0gdGhpcy5wcm90b1F1ZXJ5UmVmLnF1ZXJ5LnZhckJpbmRpbmdzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmIubGVuZ3RoOyArK2kpIHtcbiAgICAgIGlmIChpbmouaGFzVmFyaWFibGVCaW5kaW5nKHZiW2ldKSkge1xuICAgICAgICBhZ2dyZWdhdG9yLnB1c2goaW5qLmdldFZhcmlhYmxlQmluZGluZyh2YltpXSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2FnZ3JlZ2F0ZURpcmVjdGl2ZShpbmo6IEFwcEVsZW1lbnQsIGFnZ3JlZ2F0b3I6IGFueVtdKTogdm9pZCB7XG4gICAgaW5qLmFkZERpcmVjdGl2ZXNNYXRjaGluZ1F1ZXJ5KHRoaXMucHJvdG9RdWVyeVJlZi5xdWVyeSwgYWdncmVnYXRvcik7XG4gIH1cbn1cblxuY2xhc3MgX0NvbXBvbmVudFZpZXdDaGFuZ2VEZXRlY3RvclJlZiBleHRlbmRzIENoYW5nZURldGVjdG9yUmVmIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfYXBwRWxlbWVudDogQXBwRWxlbWVudCkgeyBzdXBlcigpOyB9XG5cbiAgbWFya0ZvckNoZWNrKCk6IHZvaWQgeyB0aGlzLl9hcHBFbGVtZW50LmNvbXBvbmVudFZpZXcuY2hhbmdlRGV0ZWN0b3IucmVmLm1hcmtGb3JDaGVjaygpOyB9XG4gIGRldGFjaCgpOiB2b2lkIHsgdGhpcy5fYXBwRWxlbWVudC5jb21wb25lbnRWaWV3LmNoYW5nZURldGVjdG9yLnJlZi5kZXRhY2goKTsgfVxuICBkZXRlY3RDaGFuZ2VzKCk6IHZvaWQgeyB0aGlzLl9hcHBFbGVtZW50LmNvbXBvbmVudFZpZXcuY2hhbmdlRGV0ZWN0b3IucmVmLmRldGVjdENoYW5nZXMoKTsgfVxuICBjaGVja05vQ2hhbmdlcygpOiB2b2lkIHsgdGhpcy5fYXBwRWxlbWVudC5jb21wb25lbnRWaWV3LmNoYW5nZURldGVjdG9yLnJlZi5jaGVja05vQ2hhbmdlcygpOyB9XG4gIHJlYXR0YWNoKCk6IHZvaWQgeyB0aGlzLl9hcHBFbGVtZW50LmNvbXBvbmVudFZpZXcuY2hhbmdlRGV0ZWN0b3IucmVmLnJlYXR0YWNoKCk7IH1cbn1cbiJdfQ==