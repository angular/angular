'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var compiler_1 = require('angular2/compiler');
var exceptions_1 = require('angular2/src/facade/exceptions');
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
var collection_1 = require('angular2/src/facade/collection');
var utils_1 = require('./utils');
var dom_tokens_1 = require('angular2/src/platform/dom/dom_tokens');
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var debug_node_1 = require('angular2/src/core/debug/debug_node');
var fake_async_1 = require('./fake_async');
exports.ComponentFixtureAutoDetect = new core_1.OpaqueToken("ComponentFixtureAutoDetect");
exports.ComponentFixtureNoNgZone = new core_1.OpaqueToken("ComponentFixtureNoNgZone");
/**
 * Fixture for debugging and testing a component.
 */
var ComponentFixture = (function () {
    function ComponentFixture(componentRef, ngZone, autoDetect) {
        var _this = this;
        this._isStable = true;
        this._completer = null;
        this._onUnstableSubscription = null;
        this._onStableSubscription = null;
        this._onMicrotaskEmptySubscription = null;
        this._onErrorSubscription = null;
        this.changeDetectorRef = componentRef.changeDetectorRef;
        this.elementRef = componentRef.location;
        this.debugElement = debug_node_1.getDebugNode(this.elementRef.nativeElement);
        this.componentInstance = componentRef.instance;
        this.nativeElement = this.elementRef.nativeElement;
        this.componentRef = componentRef;
        this.ngZone = ngZone;
        this._autoDetect = autoDetect;
        if (ngZone != null) {
            this._onUnstableSubscription =
                async_1.ObservableWrapper.subscribe(ngZone.onUnstable, function (_) { _this._isStable = false; });
            this._onMicrotaskEmptySubscription =
                async_1.ObservableWrapper.subscribe(ngZone.onMicrotaskEmpty, function (_) {
                    if (_this._autoDetect) {
                        // Do a change detection run with checkNoChanges set to true to check
                        // there are no changes on the second run.
                        _this.detectChanges(true);
                    }
                });
            this._onStableSubscription = async_1.ObservableWrapper.subscribe(ngZone.onStable, function (_) {
                _this._isStable = true;
                if (_this._completer != null) {
                    _this._completer.resolve(true);
                    _this._completer = null;
                }
            });
            this._onErrorSubscription = async_1.ObservableWrapper.subscribe(ngZone.onError, function (error) { throw error.error; });
        }
    }
    ComponentFixture.prototype._tick = function (checkNoChanges) {
        this.changeDetectorRef.detectChanges();
        if (checkNoChanges) {
            this.checkNoChanges();
        }
    };
    /**
     * Trigger a change detection cycle for the component.
     */
    ComponentFixture.prototype.detectChanges = function (checkNoChanges) {
        var _this = this;
        if (checkNoChanges === void 0) { checkNoChanges = true; }
        if (this.ngZone != null) {
            // Run the change detection inside the NgZone so that any async tasks as part of the change
            // detection are captured by the zone and can be waited for in isStable.
            this.ngZone.run(function () { _this._tick(checkNoChanges); });
        }
        else {
            // Running without zone. Just do the change detection.
            this._tick(checkNoChanges);
        }
    };
    /**
     * Do a change detection run to make sure there were no changes.
     */
    ComponentFixture.prototype.checkNoChanges = function () { this.changeDetectorRef.checkNoChanges(); };
    /**
     * Set whether the fixture should autodetect changes.
     *
     * Also runs detectChanges once so that any existing change is detected.
     */
    ComponentFixture.prototype.autoDetectChanges = function (autoDetect) {
        if (autoDetect === void 0) { autoDetect = true; }
        if (this.ngZone == null) {
            throw new exceptions_1.BaseException('Cannot call autoDetectChanges when ComponentFixtureNoNgZone is set');
        }
        this._autoDetect = autoDetect;
        this.detectChanges();
    };
    /**
     * Return whether the fixture is currently stable or has async tasks that have not been completed
     * yet.
     */
    ComponentFixture.prototype.isStable = function () { return this._isStable; };
    /**
     * Get a promise that resolves when the fixture is stable.
     *
     * This can be used to resume testing after events have triggered asynchronous activity or
     * asynchronous change detection.
     */
    ComponentFixture.prototype.whenStable = function () {
        if (this._isStable) {
            return async_1.PromiseWrapper.resolve(false);
        }
        else {
            this._completer = new async_1.PromiseCompleter();
            return this._completer.promise;
        }
    };
    /**
     * Trigger component destruction.
     */
    ComponentFixture.prototype.destroy = function () {
        this.componentRef.destroy();
        if (this._onUnstableSubscription != null) {
            async_1.ObservableWrapper.dispose(this._onUnstableSubscription);
            this._onUnstableSubscription = null;
        }
        if (this._onStableSubscription != null) {
            async_1.ObservableWrapper.dispose(this._onStableSubscription);
            this._onStableSubscription = null;
        }
        if (this._onMicrotaskEmptySubscription != null) {
            async_1.ObservableWrapper.dispose(this._onMicrotaskEmptySubscription);
            this._onMicrotaskEmptySubscription = null;
        }
        if (this._onErrorSubscription != null) {
            async_1.ObservableWrapper.dispose(this._onErrorSubscription);
            this._onErrorSubscription = null;
        }
    };
    return ComponentFixture;
}());
exports.ComponentFixture = ComponentFixture;
var _nextRootElementId = 0;
/**
 * Builds a ComponentFixture for use in component level tests.
 */
var TestComponentBuilder = (function () {
    function TestComponentBuilder(_injector) {
        this._injector = _injector;
        /** @internal */
        this._bindingsOverrides = new Map();
        /** @internal */
        this._directiveOverrides = new Map();
        /** @internal */
        this._templateOverrides = new Map();
        /** @internal */
        this._viewBindingsOverrides = new Map();
        /** @internal */
        this._viewOverrides = new Map();
    }
    /** @internal */
    TestComponentBuilder.prototype._clone = function () {
        var clone = new TestComponentBuilder(this._injector);
        clone._viewOverrides = collection_1.MapWrapper.clone(this._viewOverrides);
        clone._directiveOverrides = collection_1.MapWrapper.clone(this._directiveOverrides);
        clone._templateOverrides = collection_1.MapWrapper.clone(this._templateOverrides);
        clone._bindingsOverrides = collection_1.MapWrapper.clone(this._bindingsOverrides);
        clone._viewBindingsOverrides = collection_1.MapWrapper.clone(this._viewBindingsOverrides);
        return clone;
    };
    /**
     * Overrides only the html of a {@link ComponentMetadata}.
     * All the other properties of the component's {@link ViewMetadata} are preserved.
     *
     * @param {Type} component
     * @param {string} html
     *
     * @return {TestComponentBuilder}
     */
    TestComponentBuilder.prototype.overrideTemplate = function (componentType, template) {
        var clone = this._clone();
        clone._templateOverrides.set(componentType, template);
        return clone;
    };
    /**
     * Overrides a component's {@link ViewMetadata}.
     *
     * @param {Type} component
     * @param {view} View
     *
     * @return {TestComponentBuilder}
     */
    TestComponentBuilder.prototype.overrideView = function (componentType, view) {
        var clone = this._clone();
        clone._viewOverrides.set(componentType, view);
        return clone;
    };
    /**
     * Overrides the directives from the component {@link ViewMetadata}.
     *
     * @param {Type} component
     * @param {Type} from
     * @param {Type} to
     *
     * @return {TestComponentBuilder}
     */
    TestComponentBuilder.prototype.overrideDirective = function (componentType, from, to) {
        var clone = this._clone();
        var overridesForComponent = clone._directiveOverrides.get(componentType);
        if (!lang_1.isPresent(overridesForComponent)) {
            clone._directiveOverrides.set(componentType, new Map());
            overridesForComponent = clone._directiveOverrides.get(componentType);
        }
        overridesForComponent.set(from, to);
        return clone;
    };
    /**
     * Overrides one or more injectables configured via `providers` metadata property of a directive
     * or
     * component.
     * Very useful when certain providers need to be mocked out.
     *
     * The providers specified via this method are appended to the existing `providers` causing the
     * duplicated providers to
     * be overridden.
     *
     * @param {Type} component
     * @param {any[]} providers
     *
     * @return {TestComponentBuilder}
     */
    TestComponentBuilder.prototype.overrideProviders = function (type, providers) {
        var clone = this._clone();
        clone._bindingsOverrides.set(type, providers);
        return clone;
    };
    /**
     * @deprecated
     */
    TestComponentBuilder.prototype.overrideBindings = function (type, providers) {
        return this.overrideProviders(type, providers);
    };
    /**
     * Overrides one or more injectables configured via `providers` metadata property of a directive
     * or
     * component.
     * Very useful when certain providers need to be mocked out.
     *
     * The providers specified via this method are appended to the existing `providers` causing the
     * duplicated providers to
     * be overridden.
     *
     * @param {Type} component
     * @param {any[]} providers
     *
     * @return {TestComponentBuilder}
     */
    TestComponentBuilder.prototype.overrideViewProviders = function (type, providers) {
        var clone = this._clone();
        clone._viewBindingsOverrides.set(type, providers);
        return clone;
    };
    /**
     * @deprecated
     */
    TestComponentBuilder.prototype.overrideViewBindings = function (type, providers) {
        return this.overrideViewProviders(type, providers);
    };
    TestComponentBuilder.prototype._create = function (ngZone, componentFactory) {
        var rootElId = "root" + _nextRootElementId++;
        var rootEl = utils_1.el("<div id=\"" + rootElId + "\"></div>");
        var doc = this._injector.get(dom_tokens_1.DOCUMENT);
        // TODO(juliemr): can/should this be optional?
        var oldRoots = dom_adapter_1.DOM.querySelectorAll(doc, '[id^=root]');
        for (var i = 0; i < oldRoots.length; i++) {
            dom_adapter_1.DOM.remove(oldRoots[i]);
        }
        dom_adapter_1.DOM.appendChild(doc.body, rootEl);
        var componentRef = componentFactory.create(this._injector, [], "#" + rootElId);
        var autoDetect = this._injector.get(exports.ComponentFixtureAutoDetect, false);
        return new ComponentFixture(componentRef, ngZone, autoDetect);
    };
    /**
     * Builds and returns a ComponentFixture.
     *
     * @return {Promise<ComponentFixture>}
     */
    TestComponentBuilder.prototype.createAsync = function (rootComponentType) {
        var _this = this;
        var noNgZone = lang_1.IS_DART || this._injector.get(exports.ComponentFixtureNoNgZone, false);
        var ngZone = noNgZone ? null : this._injector.get(core_1.NgZone, null);
        var initComponent = function () {
            var mockDirectiveResolver = _this._injector.get(compiler_1.DirectiveResolver);
            var mockViewResolver = _this._injector.get(compiler_1.ViewResolver);
            _this._viewOverrides.forEach(function (view, type) { return mockViewResolver.setView(type, view); });
            _this._templateOverrides.forEach(function (template, type) {
                return mockViewResolver.setInlineTemplate(type, template);
            });
            _this._directiveOverrides.forEach(function (overrides, component) {
                overrides.forEach(function (to, from) { mockViewResolver.overrideViewDirective(component, from, to); });
            });
            _this._bindingsOverrides.forEach(function (bindings, type) { return mockDirectiveResolver.setBindingsOverride(type, bindings); });
            _this._viewBindingsOverrides.forEach(function (bindings, type) { return mockDirectiveResolver.setViewBindingsOverride(type, bindings); });
            var promise = _this._injector.get(core_1.ComponentResolver).resolveComponent(rootComponentType);
            return promise.then(function (componentFactory) { return _this._create(ngZone, componentFactory); });
        };
        return ngZone == null ? initComponent() : ngZone.run(initComponent);
    };
    TestComponentBuilder.prototype.createFakeAsync = function (rootComponentType) {
        var result;
        var error;
        async_1.PromiseWrapper.then(this.createAsync(rootComponentType), function (_result) { result = _result; }, function (_error) { error = _error; });
        fake_async_1.tick();
        if (lang_1.isPresent(error)) {
            throw error;
        }
        return result;
    };
    TestComponentBuilder.prototype.createSync = function (componentFactory) {
        var _this = this;
        var noNgZone = lang_1.IS_DART || this._injector.get(exports.ComponentFixtureNoNgZone, false);
        var ngZone = noNgZone ? null : this._injector.get(core_1.NgZone, null);
        var initComponent = function () { return _this._create(ngZone, componentFactory); };
        return ngZone == null ? initComponent() : ngZone.run(initComponent);
    };
    TestComponentBuilder = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [core_1.Injector])
    ], TestComponentBuilder);
    return TestComponentBuilder;
}());
exports.TestComponentBuilder = TestComponentBuilder;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdF9jb21wb25lbnRfYnVpbGRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtWGN1b2ZQeEcudG1wL2FuZ3VsYXIyL3NyYy90ZXN0aW5nL3Rlc3RfY29tcG9uZW50X2J1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLHFCQWNPLGVBQWUsQ0FBQyxDQUFBO0FBQ3ZCLHlCQUE4QyxtQkFBbUIsQ0FBQyxDQUFBO0FBRWxFLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzdELHFCQUFnRCwwQkFBMEIsQ0FBQyxDQUFBO0FBQzNFLHNCQUFrRSwyQkFBMkIsQ0FBQyxDQUFBO0FBQzlGLDJCQUFzQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBRXZFLHNCQUFpQixTQUFTLENBQUMsQ0FBQTtBQUUzQiwyQkFBdUIsc0NBQXNDLENBQUMsQ0FBQTtBQUM5RCw0QkFBa0IsdUNBQXVDLENBQUMsQ0FBQTtBQUUxRCwyQkFBb0Qsb0NBQW9DLENBQUMsQ0FBQTtBQUV6RiwyQkFBbUIsY0FBYyxDQUFDLENBQUE7QUFFdkIsa0NBQTBCLEdBQUcsSUFBSSxrQkFBVyxDQUFDLDRCQUE0QixDQUFDLENBQUM7QUFDM0UsZ0NBQXdCLEdBQUcsSUFBSSxrQkFBVyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFFbEY7O0dBRUc7QUFDSDtJQTZDRSwwQkFBWSxZQUE2QixFQUFFLE1BQWMsRUFBRSxVQUFtQjtRQTdDaEYsaUJBaUtDO1FBM0hTLGNBQVMsR0FBWSxJQUFJLENBQUM7UUFDMUIsZUFBVSxHQUEwQixJQUFJLENBQUM7UUFDekMsNEJBQXVCLEdBQUcsSUFBSSxDQUFDO1FBQy9CLDBCQUFxQixHQUFHLElBQUksQ0FBQztRQUM3QixrQ0FBNkIsR0FBRyxJQUFJLENBQUM7UUFDckMseUJBQW9CLEdBQUcsSUFBSSxDQUFDO1FBR2xDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxZQUFZLENB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QUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JELGlCQUFJLEVBQUUsQ0FBQztRQUNQLEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sS0FBSyxDQUFDO1FBQ2QsQ0FBQztRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVELHlDQUFVLEdBQVYsVUFBYyxnQkFBcUM7UUFBbkQsaUJBTUM7UUFMQyxJQUFJLFFBQVEsR0FBRyxjQUFPLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZ0NBQXdCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDOUUsSUFBSSxNQUFNLEdBQVcsUUFBUSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxhQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFeEUsSUFBSSxhQUFhLEdBQUcsY0FBTSxPQUFBLEtBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDLEVBQXRDLENBQXNDLENBQUM7UUFDakUsTUFBTSxDQUFDLE1BQU0sSUFBSSxJQUFJLEdBQUcsYUFBYSxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBdE1IO1FBQUMsaUJBQVUsRUFBRTs7NEJBQUE7SUF1TWIsMkJBQUM7QUFBRCxDQUFDLEFBdE1ELElBc01DO0FBdE1ZLDRCQUFvQix1QkFzTWhDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBPcGFxdWVUb2tlbixcbiAgQ29tcG9uZW50UmVmLFxuICBDb21wb25lbnRGYWN0b3J5LFxuICBDb21wb25lbnRSZXNvbHZlcixcbiAgSW5qZWN0b3IsXG4gIEluamVjdGFibGUsXG4gIFZpZXdNZXRhZGF0YSxcbiAgRWxlbWVudFJlZixcbiAgRW1iZWRkZWRWaWV3UmVmLFxuICBDaGFuZ2VEZXRlY3RvclJlZixcbiAgcHJvdmlkZSxcbiAgTmdab25lLFxuICBOZ1pvbmVFcnJvclxufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7RGlyZWN0aXZlUmVzb2x2ZXIsIFZpZXdSZXNvbHZlcn0gZnJvbSAnYW5ndWxhcjIvY29tcGlsZXInO1xuXG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge1R5cGUsIGlzUHJlc2VudCwgaXNCbGFuaywgSVNfREFSVH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7UHJvbWlzZVdyYXBwZXIsIE9ic2VydmFibGVXcmFwcGVyLCBQcm9taXNlQ29tcGxldGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbmltcG9ydCB7ZWx9IGZyb20gJy4vdXRpbHMnO1xuXG5pbXBvcnQge0RPQ1VNRU5UfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV90b2tlbnMnO1xuaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuXG5pbXBvcnQge0RlYnVnTm9kZSwgRGVidWdFbGVtZW50LCBnZXREZWJ1Z05vZGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RlYnVnL2RlYnVnX25vZGUnO1xuXG5pbXBvcnQge3RpY2t9IGZyb20gJy4vZmFrZV9hc3luYyc7XG5cbmV4cG9ydCB2YXIgQ29tcG9uZW50Rml4dHVyZUF1dG9EZXRlY3QgPSBuZXcgT3BhcXVlVG9rZW4oXCJDb21wb25lbnRGaXh0dXJlQXV0b0RldGVjdFwiKTtcbmV4cG9ydCB2YXIgQ29tcG9uZW50Rml4dHVyZU5vTmdab25lID0gbmV3IE9wYXF1ZVRva2VuKFwiQ29tcG9uZW50Rml4dHVyZU5vTmdab25lXCIpO1xuXG4vKipcbiAqIEZpeHR1cmUgZm9yIGRlYnVnZ2luZyBhbmQgdGVzdGluZyBhIGNvbXBvbmVudC5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBvbmVudEZpeHR1cmU8VD4ge1xuICAvKipcbiAgICogVGhlIERlYnVnRWxlbWVudCBhc3NvY2lhdGVkIHdpdGggdGhlIHJvb3QgZWxlbWVudCBvZiB0aGlzIGNvbXBvbmVudC5cbiAgICovXG4gIGRlYnVnRWxlbWVudDogRGVidWdFbGVtZW50O1xuXG4gIC8qKlxuICAgKiBUaGUgaW5zdGFuY2Ugb2YgdGhlIHJvb3QgY29tcG9uZW50IGNsYXNzLlxuICAgKi9cbiAgY29tcG9uZW50SW5zdGFuY2U6IGFueTtcblxuICAvKipcbiAgICogVGhlIG5hdGl2ZSBlbGVtZW50IGF0IHRoZSByb290IG9mIHRoZSBjb21wb25lbnQuXG4gICAqL1xuICBuYXRpdmVFbGVtZW50OiBhbnk7XG5cbiAgLyoqXG4gICAqIFRoZSBFbGVtZW50UmVmIGZvciB0aGUgZWxlbWVudCBhdCB0aGUgcm9vdCBvZiB0aGUgY29tcG9uZW50LlxuICAgKi9cbiAgZWxlbWVudFJlZjogRWxlbWVudFJlZjtcblxuICAvKipcbiAgICogVGhlIENvbXBvbmVudFJlZiBmb3IgdGhlIGNvbXBvbmVudFxuICAgKi9cbiAgY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8VD47XG5cbiAgLyoqXG4gICAqIFRoZSBDaGFuZ2VEZXRlY3RvclJlZiBmb3IgdGhlIGNvbXBvbmVudFxuICAgKi9cbiAgY2hhbmdlRGV0ZWN0b3JSZWY6IENoYW5nZURldGVjdG9yUmVmO1xuXG4gIC8qKlxuICAgKiBUaGUgTmdab25lIGluIHdoaWNoIHRoaXMgY29tcG9uZW50IHdhcyBpbnN0YW50aWF0ZWQuXG4gICAqL1xuICBuZ1pvbmU6IE5nWm9uZTtcblxuICBwcml2YXRlIF9hdXRvRGV0ZWN0OiBib29sZWFuO1xuXG4gIHByaXZhdGUgX2lzU3RhYmxlOiBib29sZWFuID0gdHJ1ZTtcbiAgcHJpdmF0ZSBfY29tcGxldGVyOiBQcm9taXNlQ29tcGxldGVyPGFueT4gPSBudWxsO1xuICBwcml2YXRlIF9vblVuc3RhYmxlU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgcHJpdmF0ZSBfb25TdGFibGVTdWJzY3JpcHRpb24gPSBudWxsO1xuICBwcml2YXRlIF9vbk1pY3JvdGFza0VtcHR5U3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgcHJpdmF0ZSBfb25FcnJvclN1YnNjcmlwdGlvbiA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoY29tcG9uZW50UmVmOiBDb21wb25lbnRSZWY8VD4sIG5nWm9uZTogTmdab25lLCBhdXRvRGV0ZWN0OiBib29sZWFuKSB7XG4gICAgdGhpcy5jaGFuZ2VEZXRlY3RvclJlZiA9IGNvbXBvbmVudFJlZi5jaGFuZ2VEZXRlY3RvclJlZjtcbiAgICB0aGlzLmVsZW1lbnRSZWYgPSBjb21wb25lbnRSZWYubG9jYXRpb247XG4gICAgdGhpcy5kZWJ1Z0VsZW1lbnQgPSA8RGVidWdFbGVtZW50PmdldERlYnVnTm9kZSh0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudCk7XG4gICAgdGhpcy5jb21wb25lbnRJbnN0YW5jZSA9IGNvbXBvbmVudFJlZi5pbnN0YW5jZTtcbiAgICB0aGlzLm5hdGl2ZUVsZW1lbnQgPSB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcbiAgICB0aGlzLmNvbXBvbmVudFJlZiA9IGNvbXBvbmVudFJlZjtcbiAgICB0aGlzLm5nWm9uZSA9IG5nWm9uZTtcbiAgICB0aGlzLl9hdXRvRGV0ZWN0ID0gYXV0b0RldGVjdDtcblxuICAgIGlmIChuZ1pvbmUgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fb25VbnN0YWJsZVN1YnNjcmlwdGlvbiA9XG4gICAgICAgICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKG5nWm9uZS5vblVuc3RhYmxlLCAoXykgPT4geyB0aGlzLl9pc1N0YWJsZSA9IGZhbHNlOyB9KTtcbiAgICAgIHRoaXMuX29uTWljcm90YXNrRW1wdHlTdWJzY3JpcHRpb24gPVxuICAgICAgICAgIE9ic2VydmFibGVXcmFwcGVyLnN1YnNjcmliZShuZ1pvbmUub25NaWNyb3Rhc2tFbXB0eSwgKF8pID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9hdXRvRGV0ZWN0KSB7XG4gICAgICAgICAgICAgIC8vIERvIGEgY2hhbmdlIGRldGVjdGlvbiBydW4gd2l0aCBjaGVja05vQ2hhbmdlcyBzZXQgdG8gdHJ1ZSB0byBjaGVja1xuICAgICAgICAgICAgICAvLyB0aGVyZSBhcmUgbm8gY2hhbmdlcyBvbiB0aGUgc2Vjb25kIHJ1bi5cbiAgICAgICAgICAgICAgdGhpcy5kZXRlY3RDaGFuZ2VzKHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgdGhpcy5fb25TdGFibGVTdWJzY3JpcHRpb24gPSBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUobmdab25lLm9uU3RhYmxlLCAoXykgPT4ge1xuICAgICAgICB0aGlzLl9pc1N0YWJsZSA9IHRydWU7XG4gICAgICAgIGlmICh0aGlzLl9jb21wbGV0ZXIgIT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuX2NvbXBsZXRlci5yZXNvbHZlKHRydWUpO1xuICAgICAgICAgIHRoaXMuX2NvbXBsZXRlciA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl9vbkVycm9yU3Vic2NyaXB0aW9uID0gT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKFxuICAgICAgICAgIG5nWm9uZS5vbkVycm9yLCAoZXJyb3I6IE5nWm9uZUVycm9yKSA9PiB7IHRocm93IGVycm9yLmVycm9yOyB9KTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF90aWNrKGNoZWNrTm9DaGFuZ2VzOiBib29sZWFuKSB7XG4gICAgdGhpcy5jaGFuZ2VEZXRlY3RvclJlZi5kZXRlY3RDaGFuZ2VzKCk7XG4gICAgaWYgKGNoZWNrTm9DaGFuZ2VzKSB7XG4gICAgICB0aGlzLmNoZWNrTm9DaGFuZ2VzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRyaWdnZXIgYSBjaGFuZ2UgZGV0ZWN0aW9uIGN5Y2xlIGZvciB0aGUgY29tcG9uZW50LlxuICAgKi9cbiAgZGV0ZWN0Q2hhbmdlcyhjaGVja05vQ2hhbmdlczogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5uZ1pvbmUgIT0gbnVsbCkge1xuICAgICAgLy8gUnVuIHRoZSBjaGFuZ2UgZGV0ZWN0aW9uIGluc2lkZSB0aGUgTmdab25lIHNvIHRoYXQgYW55IGFzeW5jIHRhc2tzIGFzIHBhcnQgb2YgdGhlIGNoYW5nZVxuICAgICAgLy8gZGV0ZWN0aW9uIGFyZSBjYXB0dXJlZCBieSB0aGUgem9uZSBhbmQgY2FuIGJlIHdhaXRlZCBmb3IgaW4gaXNTdGFibGUuXG4gICAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4geyB0aGlzLl90aWNrKGNoZWNrTm9DaGFuZ2VzKTsgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFJ1bm5pbmcgd2l0aG91dCB6b25lLiBKdXN0IGRvIHRoZSBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgICAgdGhpcy5fdGljayhjaGVja05vQ2hhbmdlcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERvIGEgY2hhbmdlIGRldGVjdGlvbiBydW4gdG8gbWFrZSBzdXJlIHRoZXJlIHdlcmUgbm8gY2hhbmdlcy5cbiAgICovXG4gIGNoZWNrTm9DaGFuZ2VzKCk6IHZvaWQgeyB0aGlzLmNoYW5nZURldGVjdG9yUmVmLmNoZWNrTm9DaGFuZ2VzKCk7IH1cblxuICAvKipcbiAgICogU2V0IHdoZXRoZXIgdGhlIGZpeHR1cmUgc2hvdWxkIGF1dG9kZXRlY3QgY2hhbmdlcy5cbiAgICpcbiAgICogQWxzbyBydW5zIGRldGVjdENoYW5nZXMgb25jZSBzbyB0aGF0IGFueSBleGlzdGluZyBjaGFuZ2UgaXMgZGV0ZWN0ZWQuXG4gICAqL1xuICBhdXRvRGV0ZWN0Q2hhbmdlcyhhdXRvRGV0ZWN0OiBib29sZWFuID0gdHJ1ZSkge1xuICAgIGlmICh0aGlzLm5nWm9uZSA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignQ2Fubm90IGNhbGwgYXV0b0RldGVjdENoYW5nZXMgd2hlbiBDb21wb25lbnRGaXh0dXJlTm9OZ1pvbmUgaXMgc2V0Jyk7XG4gICAgfVxuICAgIHRoaXMuX2F1dG9EZXRlY3QgPSBhdXRvRGV0ZWN0O1xuICAgIHRoaXMuZGV0ZWN0Q2hhbmdlcygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB3aGV0aGVyIHRoZSBmaXh0dXJlIGlzIGN1cnJlbnRseSBzdGFibGUgb3IgaGFzIGFzeW5jIHRhc2tzIHRoYXQgaGF2ZSBub3QgYmVlbiBjb21wbGV0ZWRcbiAgICogeWV0LlxuICAgKi9cbiAgaXNTdGFibGUoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9pc1N0YWJsZTsgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgZml4dHVyZSBpcyBzdGFibGUuXG4gICAqXG4gICAqIFRoaXMgY2FuIGJlIHVzZWQgdG8gcmVzdW1lIHRlc3RpbmcgYWZ0ZXIgZXZlbnRzIGhhdmUgdHJpZ2dlcmVkIGFzeW5jaHJvbm91cyBhY3Rpdml0eSBvclxuICAgKiBhc3luY2hyb25vdXMgY2hhbmdlIGRldGVjdGlvbi5cbiAgICovXG4gIHdoZW5TdGFibGUoKTogUHJvbWlzZTxhbnk+IHtcbiAgICBpZiAodGhpcy5faXNTdGFibGUpIHtcbiAgICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKGZhbHNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY29tcGxldGVyID0gbmV3IFByb21pc2VDb21wbGV0ZXI8YW55PigpO1xuICAgICAgcmV0dXJuIHRoaXMuX2NvbXBsZXRlci5wcm9taXNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmlnZ2VyIGNvbXBvbmVudCBkZXN0cnVjdGlvbi5cbiAgICovXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5jb21wb25lbnRSZWYuZGVzdHJveSgpO1xuICAgIGlmICh0aGlzLl9vblVuc3RhYmxlU3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgIE9ic2VydmFibGVXcmFwcGVyLmRpc3Bvc2UodGhpcy5fb25VbnN0YWJsZVN1YnNjcmlwdGlvbik7XG4gICAgICB0aGlzLl9vblVuc3RhYmxlU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX29uU3RhYmxlU3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgIE9ic2VydmFibGVXcmFwcGVyLmRpc3Bvc2UodGhpcy5fb25TdGFibGVTdWJzY3JpcHRpb24pO1xuICAgICAgdGhpcy5fb25TdGFibGVTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5fb25NaWNyb3Rhc2tFbXB0eVN1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICBPYnNlcnZhYmxlV3JhcHBlci5kaXNwb3NlKHRoaXMuX29uTWljcm90YXNrRW1wdHlTdWJzY3JpcHRpb24pO1xuICAgICAgdGhpcy5fb25NaWNyb3Rhc2tFbXB0eVN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9vbkVycm9yU3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgIE9ic2VydmFibGVXcmFwcGVyLmRpc3Bvc2UodGhpcy5fb25FcnJvclN1YnNjcmlwdGlvbik7XG4gICAgICB0aGlzLl9vbkVycm9yU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxudmFyIF9uZXh0Um9vdEVsZW1lbnRJZCA9IDA7XG5cbi8qKlxuICogQnVpbGRzIGEgQ29tcG9uZW50Rml4dHVyZSBmb3IgdXNlIGluIGNvbXBvbmVudCBsZXZlbCB0ZXN0cy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYmluZGluZ3NPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIGFueVtdPigpO1xuICAvKiogQGludGVybmFsICovXG4gIF9kaXJlY3RpdmVPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIE1hcDxUeXBlLCBUeXBlPj4oKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdGVtcGxhdGVPdmVycmlkZXMgPSBuZXcgTWFwPFR5cGUsIHN0cmluZz4oKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdmlld0JpbmRpbmdzT3ZlcnJpZGVzID0gbmV3IE1hcDxUeXBlLCBhbnlbXT4oKTtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdmlld092ZXJyaWRlcyA9IG5ldyBNYXA8VHlwZSwgVmlld01ldGFkYXRhPigpO1xuXG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfaW5qZWN0b3I6IEluamVjdG9yKSB7fVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2Nsb25lKCk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICBsZXQgY2xvbmUgPSBuZXcgVGVzdENvbXBvbmVudEJ1aWxkZXIodGhpcy5faW5qZWN0b3IpO1xuICAgIGNsb25lLl92aWV3T3ZlcnJpZGVzID0gTWFwV3JhcHBlci5jbG9uZSh0aGlzLl92aWV3T3ZlcnJpZGVzKTtcbiAgICBjbG9uZS5fZGlyZWN0aXZlT3ZlcnJpZGVzID0gTWFwV3JhcHBlci5jbG9uZSh0aGlzLl9kaXJlY3RpdmVPdmVycmlkZXMpO1xuICAgIGNsb25lLl90ZW1wbGF0ZU92ZXJyaWRlcyA9IE1hcFdyYXBwZXIuY2xvbmUodGhpcy5fdGVtcGxhdGVPdmVycmlkZXMpO1xuICAgIGNsb25lLl9iaW5kaW5nc092ZXJyaWRlcyA9IE1hcFdyYXBwZXIuY2xvbmUodGhpcy5fYmluZGluZ3NPdmVycmlkZXMpO1xuICAgIGNsb25lLl92aWV3QmluZGluZ3NPdmVycmlkZXMgPSBNYXBXcmFwcGVyLmNsb25lKHRoaXMuX3ZpZXdCaW5kaW5nc092ZXJyaWRlcyk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyBvbmx5IHRoZSBodG1sIG9mIGEge0BsaW5rIENvbXBvbmVudE1ldGFkYXRhfS5cbiAgICogQWxsIHRoZSBvdGhlciBwcm9wZXJ0aWVzIG9mIHRoZSBjb21wb25lbnQncyB7QGxpbmsgVmlld01ldGFkYXRhfSBhcmUgcHJlc2VydmVkLlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge3N0cmluZ30gaHRtbFxuICAgKlxuICAgKiBAcmV0dXJuIHtUZXN0Q29tcG9uZW50QnVpbGRlcn1cbiAgICovXG4gIG92ZXJyaWRlVGVtcGxhdGUoY29tcG9uZW50VHlwZTogVHlwZSwgdGVtcGxhdGU6IHN0cmluZyk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICBsZXQgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGNsb25lLl90ZW1wbGF0ZU92ZXJyaWRlcy5zZXQoY29tcG9uZW50VHlwZSwgdGVtcGxhdGUpO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgYSBjb21wb25lbnQncyB7QGxpbmsgVmlld01ldGFkYXRhfS5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHt2aWV3fSBWaWV3XG4gICAqXG4gICAqIEByZXR1cm4ge1Rlc3RDb21wb25lbnRCdWlsZGVyfVxuICAgKi9cbiAgb3ZlcnJpZGVWaWV3KGNvbXBvbmVudFR5cGU6IFR5cGUsIHZpZXc6IFZpZXdNZXRhZGF0YSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICBsZXQgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGNsb25lLl92aWV3T3ZlcnJpZGVzLnNldChjb21wb25lbnRUeXBlLCB2aWV3KTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogT3ZlcnJpZGVzIHRoZSBkaXJlY3RpdmVzIGZyb20gdGhlIGNvbXBvbmVudCB7QGxpbmsgVmlld01ldGFkYXRhfS5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHtUeXBlfSBmcm9tXG4gICAqIEBwYXJhbSB7VHlwZX0gdG9cbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZURpcmVjdGl2ZShjb21wb25lbnRUeXBlOiBUeXBlLCBmcm9tOiBUeXBlLCB0bzogVHlwZSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICBsZXQgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGxldCBvdmVycmlkZXNGb3JDb21wb25lbnQgPSBjbG9uZS5fZGlyZWN0aXZlT3ZlcnJpZGVzLmdldChjb21wb25lbnRUeXBlKTtcbiAgICBpZiAoIWlzUHJlc2VudChvdmVycmlkZXNGb3JDb21wb25lbnQpKSB7XG4gICAgICBjbG9uZS5fZGlyZWN0aXZlT3ZlcnJpZGVzLnNldChjb21wb25lbnRUeXBlLCBuZXcgTWFwPFR5cGUsIFR5cGU+KCkpO1xuICAgICAgb3ZlcnJpZGVzRm9yQ29tcG9uZW50ID0gY2xvbmUuX2RpcmVjdGl2ZU92ZXJyaWRlcy5nZXQoY29tcG9uZW50VHlwZSk7XG4gICAgfVxuICAgIG92ZXJyaWRlc0ZvckNvbXBvbmVudC5zZXQoZnJvbSwgdG8pO1xuICAgIHJldHVybiBjbG9uZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBPdmVycmlkZXMgb25lIG9yIG1vcmUgaW5qZWN0YWJsZXMgY29uZmlndXJlZCB2aWEgYHByb3ZpZGVyc2AgbWV0YWRhdGEgcHJvcGVydHkgb2YgYSBkaXJlY3RpdmVcbiAgICogb3JcbiAgICogY29tcG9uZW50LlxuICAgKiBWZXJ5IHVzZWZ1bCB3aGVuIGNlcnRhaW4gcHJvdmlkZXJzIG5lZWQgdG8gYmUgbW9ja2VkIG91dC5cbiAgICpcbiAgICogVGhlIHByb3ZpZGVycyBzcGVjaWZpZWQgdmlhIHRoaXMgbWV0aG9kIGFyZSBhcHBlbmRlZCB0byB0aGUgZXhpc3RpbmcgYHByb3ZpZGVyc2AgY2F1c2luZyB0aGVcbiAgICogZHVwbGljYXRlZCBwcm92aWRlcnMgdG9cbiAgICogYmUgb3ZlcnJpZGRlbi5cbiAgICpcbiAgICogQHBhcmFtIHtUeXBlfSBjb21wb25lbnRcbiAgICogQHBhcmFtIHthbnlbXX0gcHJvdmlkZXJzXG4gICAqXG4gICAqIEByZXR1cm4ge1Rlc3RDb21wb25lbnRCdWlsZGVyfVxuICAgKi9cbiAgb3ZlcnJpZGVQcm92aWRlcnModHlwZTogVHlwZSwgcHJvdmlkZXJzOiBhbnlbXSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICBsZXQgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGNsb25lLl9iaW5kaW5nc092ZXJyaWRlcy5zZXQodHlwZSwgcHJvdmlkZXJzKTtcbiAgICByZXR1cm4gY2xvbmU7XG4gIH1cblxuICAvKipcbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIG92ZXJyaWRlQmluZGluZ3ModHlwZTogVHlwZSwgcHJvdmlkZXJzOiBhbnlbXSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICByZXR1cm4gdGhpcy5vdmVycmlkZVByb3ZpZGVycyh0eXBlLCBwcm92aWRlcnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlcyBvbmUgb3IgbW9yZSBpbmplY3RhYmxlcyBjb25maWd1cmVkIHZpYSBgcHJvdmlkZXJzYCBtZXRhZGF0YSBwcm9wZXJ0eSBvZiBhIGRpcmVjdGl2ZVxuICAgKiBvclxuICAgKiBjb21wb25lbnQuXG4gICAqIFZlcnkgdXNlZnVsIHdoZW4gY2VydGFpbiBwcm92aWRlcnMgbmVlZCB0byBiZSBtb2NrZWQgb3V0LlxuICAgKlxuICAgKiBUaGUgcHJvdmlkZXJzIHNwZWNpZmllZCB2aWEgdGhpcyBtZXRob2QgYXJlIGFwcGVuZGVkIHRvIHRoZSBleGlzdGluZyBgcHJvdmlkZXJzYCBjYXVzaW5nIHRoZVxuICAgKiBkdXBsaWNhdGVkIHByb3ZpZGVycyB0b1xuICAgKiBiZSBvdmVycmlkZGVuLlxuICAgKlxuICAgKiBAcGFyYW0ge1R5cGV9IGNvbXBvbmVudFxuICAgKiBAcGFyYW0ge2FueVtdfSBwcm92aWRlcnNcbiAgICpcbiAgICogQHJldHVybiB7VGVzdENvbXBvbmVudEJ1aWxkZXJ9XG4gICAqL1xuICBvdmVycmlkZVZpZXdQcm92aWRlcnModHlwZTogVHlwZSwgcHJvdmlkZXJzOiBhbnlbXSk6IFRlc3RDb21wb25lbnRCdWlsZGVyIHtcbiAgICBsZXQgY2xvbmUgPSB0aGlzLl9jbG9uZSgpO1xuICAgIGNsb25lLl92aWV3QmluZGluZ3NPdmVycmlkZXMuc2V0KHR5cGUsIHByb3ZpZGVycyk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkXG4gICAqL1xuICBvdmVycmlkZVZpZXdCaW5kaW5ncyh0eXBlOiBUeXBlLCBwcm92aWRlcnM6IGFueVtdKTogVGVzdENvbXBvbmVudEJ1aWxkZXIge1xuICAgIHJldHVybiB0aGlzLm92ZXJyaWRlVmlld1Byb3ZpZGVycyh0eXBlLCBwcm92aWRlcnMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfY3JlYXRlPEM+KG5nWm9uZTogTmdab25lLCBjb21wb25lbnRGYWN0b3J5OiBDb21wb25lbnRGYWN0b3J5PEM+KTogQ29tcG9uZW50Rml4dHVyZTxDPiB7XG4gICAgbGV0IHJvb3RFbElkID0gYHJvb3Qke19uZXh0Um9vdEVsZW1lbnRJZCsrfWA7XG4gICAgbGV0IHJvb3RFbCA9IGVsKGA8ZGl2IGlkPVwiJHtyb290RWxJZH1cIj48L2Rpdj5gKTtcbiAgICBsZXQgZG9jID0gdGhpcy5faW5qZWN0b3IuZ2V0KERPQ1VNRU5UKTtcblxuICAgIC8vIFRPRE8oanVsaWVtcik6IGNhbi9zaG91bGQgdGhpcyBiZSBvcHRpb25hbD9cbiAgICBsZXQgb2xkUm9vdHMgPSBET00ucXVlcnlTZWxlY3RvckFsbChkb2MsICdbaWRePXJvb3RdJyk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvbGRSb290cy5sZW5ndGg7IGkrKykge1xuICAgICAgRE9NLnJlbW92ZShvbGRSb290c1tpXSk7XG4gICAgfVxuICAgIERPTS5hcHBlbmRDaGlsZChkb2MuYm9keSwgcm9vdEVsKTtcbiAgICB2YXIgY29tcG9uZW50UmVmID0gY29tcG9uZW50RmFjdG9yeS5jcmVhdGUodGhpcy5faW5qZWN0b3IsIFtdLCBgIyR7cm9vdEVsSWR9YCk7XG4gICAgbGV0IGF1dG9EZXRlY3Q6IGJvb2xlYW4gPSB0aGlzLl9pbmplY3Rvci5nZXQoQ29tcG9uZW50Rml4dHVyZUF1dG9EZXRlY3QsIGZhbHNlKTtcbiAgICByZXR1cm4gbmV3IENvbXBvbmVudEZpeHR1cmU8YW55IC8qQyovPihjb21wb25lbnRSZWYsIG5nWm9uZSwgYXV0b0RldGVjdCk7XG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIGFuZCByZXR1cm5zIGEgQ29tcG9uZW50Rml4dHVyZS5cbiAgICpcbiAgICogQHJldHVybiB7UHJvbWlzZTxDb21wb25lbnRGaXh0dXJlPn1cbiAgICovXG4gIGNyZWF0ZUFzeW5jKHJvb3RDb21wb25lbnRUeXBlOiBUeXBlKTogUHJvbWlzZTxDb21wb25lbnRGaXh0dXJlPGFueT4+IHtcbiAgICBsZXQgbm9OZ1pvbmUgPSBJU19EQVJUIHx8IHRoaXMuX2luamVjdG9yLmdldChDb21wb25lbnRGaXh0dXJlTm9OZ1pvbmUsIGZhbHNlKTtcbiAgICBsZXQgbmdab25lOiBOZ1pvbmUgPSBub05nWm9uZSA/IG51bGwgOiB0aGlzLl9pbmplY3Rvci5nZXQoTmdab25lLCBudWxsKTtcblxuICAgIGxldCBpbml0Q29tcG9uZW50ID0gKCkgPT4ge1xuICAgICAgbGV0IG1vY2tEaXJlY3RpdmVSZXNvbHZlciA9IHRoaXMuX2luamVjdG9yLmdldChEaXJlY3RpdmVSZXNvbHZlcik7XG4gICAgICBsZXQgbW9ja1ZpZXdSZXNvbHZlciA9IHRoaXMuX2luamVjdG9yLmdldChWaWV3UmVzb2x2ZXIpO1xuICAgICAgdGhpcy5fdmlld092ZXJyaWRlcy5mb3JFYWNoKCh2aWV3LCB0eXBlKSA9PiBtb2NrVmlld1Jlc29sdmVyLnNldFZpZXcodHlwZSwgdmlldykpO1xuICAgICAgdGhpcy5fdGVtcGxhdGVPdmVycmlkZXMuZm9yRWFjaCgodGVtcGxhdGUsIHR5cGUpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtb2NrVmlld1Jlc29sdmVyLnNldElubGluZVRlbXBsYXRlKHR5cGUsIHRlbXBsYXRlKSk7XG4gICAgICB0aGlzLl9kaXJlY3RpdmVPdmVycmlkZXMuZm9yRWFjaCgob3ZlcnJpZGVzLCBjb21wb25lbnQpID0+IHtcbiAgICAgICAgb3ZlcnJpZGVzLmZvckVhY2goXG4gICAgICAgICAgICAodG8sIGZyb20pID0+IHsgbW9ja1ZpZXdSZXNvbHZlci5vdmVycmlkZVZpZXdEaXJlY3RpdmUoY29tcG9uZW50LCBmcm9tLCB0byk7IH0pO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9iaW5kaW5nc092ZXJyaWRlcy5mb3JFYWNoKFxuICAgICAgICAgIChiaW5kaW5ncywgdHlwZSkgPT4gbW9ja0RpcmVjdGl2ZVJlc29sdmVyLnNldEJpbmRpbmdzT3ZlcnJpZGUodHlwZSwgYmluZGluZ3MpKTtcbiAgICAgIHRoaXMuX3ZpZXdCaW5kaW5nc092ZXJyaWRlcy5mb3JFYWNoKFxuICAgICAgICAgIChiaW5kaW5ncywgdHlwZSkgPT4gbW9ja0RpcmVjdGl2ZVJlc29sdmVyLnNldFZpZXdCaW5kaW5nc092ZXJyaWRlKHR5cGUsIGJpbmRpbmdzKSk7XG5cbiAgICAgIGxldCBwcm9taXNlOiBQcm9taXNlPENvbXBvbmVudEZhY3Rvcnk8YW55Pj4gPVxuICAgICAgICAgIHRoaXMuX2luamVjdG9yLmdldChDb21wb25lbnRSZXNvbHZlcikucmVzb2x2ZUNvbXBvbmVudChyb290Q29tcG9uZW50VHlwZSk7XG4gICAgICByZXR1cm4gcHJvbWlzZS50aGVuKGNvbXBvbmVudEZhY3RvcnkgPT4gdGhpcy5fY3JlYXRlKG5nWm9uZSwgY29tcG9uZW50RmFjdG9yeSkpO1xuICAgIH07XG5cbiAgICByZXR1cm4gbmdab25lID09IG51bGwgPyBpbml0Q29tcG9uZW50KCkgOiBuZ1pvbmUucnVuKGluaXRDb21wb25lbnQpO1xuICB9XG5cbiAgY3JlYXRlRmFrZUFzeW5jKHJvb3RDb21wb25lbnRUeXBlOiBUeXBlKTogQ29tcG9uZW50Rml4dHVyZTxhbnk+IHtcbiAgICBsZXQgcmVzdWx0O1xuICAgIGxldCBlcnJvcjtcbiAgICBQcm9taXNlV3JhcHBlci50aGVuKHRoaXMuY3JlYXRlQXN5bmMocm9vdENvbXBvbmVudFR5cGUpLCAoX3Jlc3VsdCkgPT4geyByZXN1bHQgPSBfcmVzdWx0OyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgKF9lcnJvcikgPT4geyBlcnJvciA9IF9lcnJvcjsgfSk7XG4gICAgdGljaygpO1xuICAgIGlmIChpc1ByZXNlbnQoZXJyb3IpKSB7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGNyZWF0ZVN5bmM8Qz4oY29tcG9uZW50RmFjdG9yeTogQ29tcG9uZW50RmFjdG9yeTxDPik6IENvbXBvbmVudEZpeHR1cmU8Qz4ge1xuICAgIGxldCBub05nWm9uZSA9IElTX0RBUlQgfHwgdGhpcy5faW5qZWN0b3IuZ2V0KENvbXBvbmVudEZpeHR1cmVOb05nWm9uZSwgZmFsc2UpO1xuICAgIGxldCBuZ1pvbmU6IE5nWm9uZSA9IG5vTmdab25lID8gbnVsbCA6IHRoaXMuX2luamVjdG9yLmdldChOZ1pvbmUsIG51bGwpO1xuXG4gICAgbGV0IGluaXRDb21wb25lbnQgPSAoKSA9PiB0aGlzLl9jcmVhdGUobmdab25lLCBjb21wb25lbnRGYWN0b3J5KTtcbiAgICByZXR1cm4gbmdab25lID09IG51bGwgPyBpbml0Q29tcG9uZW50KCkgOiBuZ1pvbmUucnVuKGluaXRDb21wb25lbnQpO1xuICB9XG59XG4iXX0=