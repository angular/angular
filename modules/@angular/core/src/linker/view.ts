/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef, ChangeDetectorStatus} from '../change_detection/change_detection';
import {Injector, THROW_IF_NOT_FOUND} from '../di/injector';
import {ListWrapper} from '../facade/collection';
import {isPresent} from '../facade/lang';
import {WtfScopeFn, wtfCreateScope, wtfLeave} from '../profile/profile';
import {RenderComponentType, RenderDebugInfo, Renderer} from '../render/api';

import {AnimationViewContext} from './animation_view_context';
import {ComponentRef} from './component_factory';
import {DebugContext, StaticNodeDebugInfo} from './debug_context';
import {ElementInjector} from './element_injector';
import {ExpressionChangedAfterItHasBeenCheckedError, ViewDestroyedError, ViewWrappedError} from './errors';
import {ViewContainer} from './view_container';
import {ViewRef_} from './view_ref';
import {ViewType} from './view_type';
import {ViewUtils, addToArray} from './view_utils';

var _scope_check: WtfScopeFn = wtfCreateScope(`AppView#check(ascii id)`);

/**
 * @experimental
 */
const EMPTY_CONTEXT = new Object();

const UNDEFINED = new Object();

/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
export abstract class AppView<T> {
  ref: ViewRef_<T>;
  lastRootNode: any;
  allNodes: any[];
  disposables: Function[];
  viewContainerElement: ViewContainer = null;

  numberOfChecks: number = 0;

  renderer: Renderer;

  private _hasExternalHostElement: boolean;
  private _hostInjector: Injector;
  private _hostProjectableNodes: any[][];
  private _animationContext: AnimationViewContext;

  public context: T;

  constructor(
      public clazz: any, public componentType: RenderComponentType, public type: ViewType,
      public viewUtils: ViewUtils, public parentView: AppView<any>, public parentIndex: number,
      public parentElement: any, public cdMode: ChangeDetectorStatus) {
    this.ref = new ViewRef_(this);
    if (type === ViewType.COMPONENT || type === ViewType.HOST) {
      this.renderer = viewUtils.renderComponent(componentType);
    } else {
      this.renderer = parentView.renderer;
    }
  }

  get animationContext(): AnimationViewContext {
    if (!this._animationContext) {
      this._animationContext = new AnimationViewContext();
    }
    return this._animationContext;
  }

  get destroyed(): boolean { return this.cdMode === ChangeDetectorStatus.Destroyed; }

  create(context: T) {
    this.context = context;
    return this.createInternal(null);
  }

  createHostView(rootSelectorOrNode: string|any, hostInjector: Injector, projectableNodes: any[][]):
      ComponentRef<any> {
    this.context = <any>EMPTY_CONTEXT;
    this._hasExternalHostElement = isPresent(rootSelectorOrNode);
    this._hostInjector = hostInjector;
    this._hostProjectableNodes = projectableNodes;
    return this.createInternal(rootSelectorOrNode);
  }

  /**
   * Overwritten by implementations.
   * Returns the ComponentRef for the host element for ViewType.HOST.
   */
  createInternal(rootSelectorOrNode: string|any): ComponentRef<any> { return null; }

  /**
   * Overwritten by implementations.
   */
  createEmbeddedViewInternal(templateNodeIndex: number): AppView<any> { return null; }

  init(lastRootNode: any, allNodes: any[], disposables: Function[]) {
    this.lastRootNode = lastRootNode;
    this.allNodes = allNodes;
    this.disposables = disposables;
    if (this.type === ViewType.COMPONENT) {
      this.dirtyParentQueriesInternal();
    }
  }

  injectorGet(token: any, nodeIndex: number, notFoundValue: any = THROW_IF_NOT_FOUND): any {
    let result = UNDEFINED;
    let view: AppView<any> = this;
    while (result === UNDEFINED) {
      if (isPresent(nodeIndex)) {
        result = view.injectorGetInternal(token, nodeIndex, UNDEFINED);
      }
      if (result === UNDEFINED && view.type === ViewType.HOST) {
        result = view._hostInjector.get(token, notFoundValue);
      }
      nodeIndex = view.parentIndex;
      view = view.parentView;
    }
    return result;
  }

  /**
   * Overwritten by implementations
   */
  injectorGetInternal(token: any, nodeIndex: number, notFoundResult: any): any {
    return notFoundResult;
  }

  injector(nodeIndex: number): Injector { return new ElementInjector(this, nodeIndex); }

  detachAndDestroy() {
    if (this._hasExternalHostElement) {
      this.renderer.detachView(this.flatRootNodes);
    } else if (isPresent(this.viewContainerElement)) {
      this.viewContainerElement.detachView(this.viewContainerElement.nestedViews.indexOf(this));
    }
    this.destroy();
  }

  destroy() {
    if (this.cdMode === ChangeDetectorStatus.Destroyed) {
      return;
    }
    var hostElement = this.type === ViewType.COMPONENT ? this.parentElement : null;
    if (this.disposables) {
      for (var i = 0; i < this.disposables.length; i++) {
        this.disposables[i]();
      }
    }
    this.destroyInternal();
    this.dirtyParentQueriesInternal();

    if (this._animationContext) {
      this._animationContext.onAllActiveAnimationsDone(
          () => this.renderer.destroyView(hostElement, this.allNodes));
    } else {
      this.renderer.destroyView(hostElement, this.allNodes);
    }

    this.cdMode = ChangeDetectorStatus.Destroyed;
  }

  /**
   * Overwritten by implementations
   */
  destroyInternal(): void {}

  /**
   * Overwritten by implementations
   */
  detachInternal(): void {}

  detach(): void {
    this.detachInternal();
    if (this._animationContext) {
      this._animationContext.onAllActiveAnimationsDone(
          () => this.renderer.detachView(this.flatRootNodes));
    } else {
      this.renderer.detachView(this.flatRootNodes);
    }
  }

  get changeDetectorRef(): ChangeDetectorRef { return this.ref; }

  get flatRootNodes(): any[] {
    const nodes: any[] = [];
    this.visitRootNodesInternal(addToArray, nodes);
    return nodes;
  }

  projectedNodes(ngContentIndex: number): any[] {
    const nodes: any[] = [];
    this.visitProjectedNodes(ngContentIndex, addToArray, nodes);
    return nodes;
  }

  visitProjectedNodes<C>(ngContentIndex: number, cb: (node: any, ctx: C) => void, c: C): void {
    switch (this.type) {
      case ViewType.EMBEDDED:
        this.parentView.visitProjectedNodes(ngContentIndex, cb, c);
        break;
      case ViewType.COMPONENT:
        if (this.parentView.type === ViewType.HOST) {
          const nodes = this.parentView._hostProjectableNodes[ngContentIndex] || [];
          for (var i = 0; i < nodes.length; i++) {
            cb(nodes[i], c);
          }
        } else {
          this.parentView.visitProjectableNodesInternal(this.parentIndex, ngContentIndex, cb, c);
        }
        break;
    }
  }

  /**
   * Overwritten by implementations
   */
  visitRootNodesInternal<C>(cb: (node: any, ctx: C) => void, c: C): void {}

  /**
   * Overwritten by implementations
   */
  visitProjectableNodesInternal<C>(
      nodeIndex: number, ngContentIndex: number, cb: (node: any, ctx: C) => void, c: C): void {}

  /**
   * Overwritten by implementations
   */
  dirtyParentQueriesInternal(): void {}

  detectChanges(throwOnChange: boolean): void {
    var s = _scope_check(this.clazz);
    if (this.cdMode === ChangeDetectorStatus.Checked ||
        this.cdMode === ChangeDetectorStatus.Errored ||
        this.cdMode === ChangeDetectorStatus.Detached)
      return;
    if (this.cdMode === ChangeDetectorStatus.Destroyed) {
      this.throwDestroyedError('detectChanges');
    }
    this.detectChangesInternal(throwOnChange);
    if (this.cdMode === ChangeDetectorStatus.CheckOnce) this.cdMode = ChangeDetectorStatus.Checked;

    this.numberOfChecks++;
    wtfLeave(s);
  }

  /**
   * Overwritten by implementations
   */
  detectChangesInternal(throwOnChange: boolean): void {}

  markContentChildAsMoved(viewContainer: ViewContainer): void { this.dirtyParentQueriesInternal(); }

  addToContentChildren(viewContainer: ViewContainer): void {
    this.viewContainerElement = viewContainer;
    this.dirtyParentQueriesInternal();
  }

  removeFromContentChildren(viewContainer: ViewContainer): void {
    this.dirtyParentQueriesInternal();
    this.viewContainerElement = null;
  }

  markAsCheckOnce(): void { this.cdMode = ChangeDetectorStatus.CheckOnce; }

  markPathToRootAsCheckOnce(): void {
    let c: AppView<any> = this;
    while (isPresent(c) && c.cdMode !== ChangeDetectorStatus.Detached) {
      if (c.cdMode === ChangeDetectorStatus.Checked) {
        c.cdMode = ChangeDetectorStatus.CheckOnce;
      }
      if (c.type === ViewType.COMPONENT) {
        c = c.parentView;
      } else {
        c = c.viewContainerElement ? c.viewContainerElement.parentView : null;
      }
    }
  }

  eventHandler<E, R>(cb: (eventName: string, event?: E) => R): (eventName: string, event?: E) => R {
    return cb;
  }

  throwDestroyedError(details: string): void { throw new ViewDestroyedError(details); }
}

export class DebugAppView<T> extends AppView<T> {
  private _currentDebugContext: DebugContext = null;

  constructor(
      clazz: any, componentType: RenderComponentType, type: ViewType, viewUtils: ViewUtils,
      parentView: AppView<any>, parentIndex: number, parentNode: any, cdMode: ChangeDetectorStatus,
      public staticNodeDebugInfos: StaticNodeDebugInfo[]) {
    super(clazz, componentType, type, viewUtils, parentView, parentIndex, parentNode, cdMode);
  }

  create(context: T) {
    this._resetDebug();
    try {
      return super.create(context);
    } catch (e) {
      this._rethrowWithContext(e);
      throw e;
    }
  }

  createHostView(
      rootSelectorOrNode: string|any, injector: Injector,
      projectableNodes: any[][] = null): ComponentRef<any> {
    this._resetDebug();
    try {
      return super.createHostView(rootSelectorOrNode, injector, projectableNodes);
    } catch (e) {
      this._rethrowWithContext(e);
      throw e;
    }
  }

  injectorGet(token: any, nodeIndex: number, notFoundResult: any): any {
    this._resetDebug();
    try {
      return super.injectorGet(token, nodeIndex, notFoundResult);
    } catch (e) {
      this._rethrowWithContext(e);
      throw e;
    }
  }

  detach(): void {
    this._resetDebug();
    try {
      super.detach();
    } catch (e) {
      this._rethrowWithContext(e);
      throw e;
    }
  }

  destroy() {
    this._resetDebug();
    try {
      super.destroy();
    } catch (e) {
      this._rethrowWithContext(e);
      throw e;
    }
  }

  detectChanges(throwOnChange: boolean): void {
    this._resetDebug();
    try {
      super.detectChanges(throwOnChange);
    } catch (e) {
      this._rethrowWithContext(e);
      throw e;
    }
  }

  private _resetDebug() { this._currentDebugContext = null; }

  debug(nodeIndex: number, rowNum: number, colNum: number): DebugContext {
    return this._currentDebugContext = new DebugContext(this, nodeIndex, rowNum, colNum);
  }

  private _rethrowWithContext(e: any) {
    if (!(e instanceof ViewWrappedError)) {
      if (!(e instanceof ExpressionChangedAfterItHasBeenCheckedError)) {
        this.cdMode = ChangeDetectorStatus.Errored;
      }
      if (isPresent(this._currentDebugContext)) {
        throw new ViewWrappedError(e, this._currentDebugContext);
      }
    }
  }

  eventHandler<E, R>(cb: (eventName: string, event?: E) => R): (eventName: string, event?: E) => R {
    var superHandler = super.eventHandler(cb);
    return (eventName: string, event?: any) => {
      this._resetDebug();
      try {
        return superHandler.call(this, eventName, event);
      } catch (e) {
        this._rethrowWithContext(e);
        throw e;
      }
    };
  }
}
