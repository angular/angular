var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Inject, Injectable } from 'angular2/src/core/di';
import { isPresent, isBlank } from 'angular2/src/facade/lang';
import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { BaseException } from 'angular2/src/facade/exceptions';
import { flattenNestedViewRenderNodes } from './view';
import { AppElement } from './element';
import { AppViewListener } from './view_listener';
import { RootRenderer, RenderComponentType } from 'angular2/src/core/render/api';
import { wtfCreateScope, wtfLeave } from '../profile/profile';
import { APP_ID } from 'angular2/src/core/application_tokens';
import { ViewType } from './view_type';
/**
 * Service exposing low level API for creating, moving and destroying Views.
 *
 * Most applications should use higher-level abstractions like {@link DynamicComponentLoader} and
 * {@link ViewContainerRef} instead.
 */
export class AppViewManager {
}
export let AppViewManager_ = class extends AppViewManager {
    constructor(_renderer, _viewListener, _appId) {
        super();
        this._renderer = _renderer;
        this._viewListener = _viewListener;
        this._appId = _appId;
        this._nextCompTypeId = 0;
        /** @internal */
        this._createRootHostViewScope = wtfCreateScope('AppViewManager#createRootHostView()');
        /** @internal */
        this._destroyRootHostViewScope = wtfCreateScope('AppViewManager#destroyRootHostView()');
        /** @internal */
        this._createEmbeddedViewInContainerScope = wtfCreateScope('AppViewManager#createEmbeddedViewInContainer()');
        /** @internal */
        this._createHostViewInContainerScope = wtfCreateScope('AppViewManager#createHostViewInContainer()');
        /** @internal */
        this._destroyViewInContainerScope = wtfCreateScope('AppViewMananger#destroyViewInContainer()');
        /** @internal */
        this._attachViewInContainerScope = wtfCreateScope('AppViewMananger#attachViewInContainer()');
        /** @internal */
        this._detachViewInContainerScope = wtfCreateScope('AppViewMananger#detachViewInContainer()');
    }
    getViewContainer(location) {
        return location.internalElement.getViewContainerRef();
    }
    getHostElement(hostViewRef) {
        var hostView = hostViewRef.internalView;
        if (hostView.proto.type !== ViewType.HOST) {
            throw new BaseException('This operation is only allowed on host views');
        }
        return hostView.appElements[0].ref;
    }
    getNamedElementInComponentView(hostLocation, variableName) {
        var appEl = hostLocation.internalElement;
        var componentView = appEl.componentView;
        if (isBlank(componentView)) {
            throw new BaseException(`There is no component directive at element ${hostLocation}`);
        }
        for (var i = 0; i < componentView.appElements.length; i++) {
            var compAppEl = componentView.appElements[i];
            if (StringMapWrapper.contains(compAppEl.proto.directiveVariableBindings, variableName)) {
                return compAppEl.ref;
            }
        }
        throw new BaseException(`Could not find variable ${variableName}`);
    }
    getComponent(hostLocation) {
        return hostLocation.internalElement.getComponent();
    }
    createRootHostView(hostViewFactoryRef, overrideSelector, injector, projectableNodes = null) {
        var s = this._createRootHostViewScope();
        var hostViewFactory = hostViewFactoryRef.internalHostViewFactory;
        var selector = isPresent(overrideSelector) ? overrideSelector : hostViewFactory.selector;
        var view = hostViewFactory.viewFactory(this._renderer, this, null, projectableNodes, selector, null, injector);
        return wtfLeave(s, view.ref);
    }
    destroyRootHostView(hostViewRef) {
        var s = this._destroyRootHostViewScope();
        var hostView = hostViewRef.internalView;
        hostView.renderer.detachView(flattenNestedViewRenderNodes(hostView.rootNodesOrAppElements));
        hostView.destroy();
        wtfLeave(s);
    }
    createEmbeddedViewInContainer(viewContainerLocation, index, templateRef) {
        var s = this._createEmbeddedViewInContainerScope();
        var contextEl = templateRef.elementRef.internalElement;
        var view = contextEl.embeddedViewFactory(contextEl.parentView.renderer, this, contextEl, contextEl.parentView.projectableNodes, null, null, null);
        this._attachViewToContainer(view, viewContainerLocation.internalElement, index);
        return wtfLeave(s, view.ref);
    }
    createHostViewInContainer(viewContainerLocation, index, hostViewFactoryRef, dynamicallyCreatedProviders, projectableNodes) {
        var s = this._createHostViewInContainerScope();
        // TODO(tbosch): This should be specifiable via an additional argument!
        var viewContainerLocation_ = viewContainerLocation;
        var contextEl = viewContainerLocation_.internalElement;
        var hostViewFactory = hostViewFactoryRef.internalHostViewFactory;
        var view = hostViewFactory.viewFactory(contextEl.parentView.renderer, contextEl.parentView.viewManager, contextEl, projectableNodes, null, dynamicallyCreatedProviders, null);
        this._attachViewToContainer(view, viewContainerLocation_.internalElement, index);
        return wtfLeave(s, view.ref);
    }
    destroyViewInContainer(viewContainerLocation, index) {
        var s = this._destroyViewInContainerScope();
        var view = this._detachViewInContainer(viewContainerLocation.internalElement, index);
        view.destroy();
        wtfLeave(s);
    }
    // TODO(i): refactor detachViewInContainer+attachViewInContainer to moveViewInContainer
    attachViewInContainer(viewContainerLocation, index, viewRef) {
        var viewRef_ = viewRef;
        var s = this._attachViewInContainerScope();
        this._attachViewToContainer(viewRef_.internalView, viewContainerLocation.internalElement, index);
        return wtfLeave(s, viewRef_);
    }
    // TODO(i): refactor detachViewInContainer+attachViewInContainer to moveViewInContainer
    detachViewInContainer(viewContainerLocation, index) {
        var s = this._detachViewInContainerScope();
        var view = this._detachViewInContainer(viewContainerLocation.internalElement, index);
        return wtfLeave(s, view.ref);
    }
    /** @internal */
    onViewCreated(view) { this._viewListener.onViewCreated(view); }
    /** @internal */
    onViewDestroyed(view) { this._viewListener.onViewDestroyed(view); }
    /** @internal */
    createRenderComponentType(encapsulation, styles) {
        return new RenderComponentType(`${this._appId}-${this._nextCompTypeId++}`, encapsulation, styles);
    }
    _attachViewToContainer(view, vcAppElement, viewIndex) {
        if (view.proto.type === ViewType.COMPONENT) {
            throw new BaseException(`Component views can't be moved!`);
        }
        var nestedViews = vcAppElement.nestedViews;
        if (nestedViews == null) {
            nestedViews = [];
            vcAppElement.nestedViews = nestedViews;
        }
        ListWrapper.insert(nestedViews, viewIndex, view);
        var refNode;
        if (viewIndex > 0) {
            var prevView = nestedViews[viewIndex - 1];
            refNode = prevView.rootNodesOrAppElements.length > 0 ?
                prevView.rootNodesOrAppElements[prevView.rootNodesOrAppElements.length - 1] :
                null;
        }
        else {
            refNode = vcAppElement.nativeElement;
        }
        if (isPresent(refNode)) {
            var refRenderNode;
            if (refNode instanceof AppElement) {
                refRenderNode = refNode.nativeElement;
            }
            else {
                refRenderNode = refNode;
            }
            view.renderer.attachViewAfter(refRenderNode, flattenNestedViewRenderNodes(view.rootNodesOrAppElements));
        }
        // TODO: This is only needed when a view is destroyed,
        // not when it is detached for reordering with ng-for...
        vcAppElement.parentView.changeDetector.addContentChild(view.changeDetector);
        vcAppElement.traverseAndSetQueriesAsDirty();
    }
    _detachViewInContainer(vcAppElement, viewIndex) {
        var view = ListWrapper.removeAt(vcAppElement.nestedViews, viewIndex);
        if (view.proto.type === ViewType.COMPONENT) {
            throw new BaseException(`Component views can't be moved!`);
        }
        vcAppElement.traverseAndSetQueriesAsDirty();
        view.renderer.detachView(flattenNestedViewRenderNodes(view.rootNodesOrAppElements));
        // TODO: This is only needed when a view is destroyed,
        // not when it is detached for reordering with ng-for...
        view.changeDetector.remove();
        return view;
    }
};
AppViewManager_ = __decorate([
    Injectable(),
    __param(2, Inject(APP_ID)), 
    __metadata('design:paramtypes', [RootRenderer, AppViewListener, String])
], AppViewManager_);
