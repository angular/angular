import {
  ListWrapper,
  MapWrapper,
  Map,
  StringMapWrapper,
  isListLikeIterable,
  areIterablesEqual
} from 'angular2/src/facade/collection';

import {Injector} from 'angular2/src/core/di';
import {AppElement} from './element';
import {
  assertionsEnabled,
  isPresent,
  isBlank,
  Type,
  isArray,
  isNumber,
  CONST,
  CONST_EXPR,
  stringify,
  isPrimitive
} from 'angular2/src/facade/lang';

import {ObservableWrapper} from 'angular2/src/facade/async';
import {Renderer, RootRenderer, RenderComponentType} from 'angular2/src/core/render/api';
import {ViewRef_, HostViewFactoryRef} from './view_ref';

import {AppViewManager_, AppViewManager} from './view_manager';
import {ViewType} from './view_type';
import {
  flattenNestedViewRenderNodes,
  ensureSlotCount,
  arrayLooseIdentical,
  mapLooseIdentical
} from './view_utils';
import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ChangeDetectorState,
  isDefaultChangeDetectionStrategy,
  devModeEqual
} from 'angular2/src/core/change_detection/change_detection';
import {wtfCreateScope, wtfLeave, WtfScopeFn} from '../profile/profile';
import {
  ExpressionChangedAfterItHasBeenCheckedException,
  ViewDestroyedException,
  ViewWrappedException
} from './exceptions';
import {StaticNodeDebugInfo, DebugContext} from './debug_context';
import {ElementInjector} from './element_injector';

export const HOST_VIEW_ELEMENT_NAME = '$hostViewEl';

const EMPTY_CONTEXT = CONST_EXPR(new Object());

var _scope_check: WtfScopeFn = wtfCreateScope(`AppView#check(ascii id)`);

/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
export abstract class AppView<T> {
  ref: ViewRef_;
  rootNodesOrAppElements: any[];
  allNodes: any[];
  disposables: Function[];
  subscriptions: any[];
  namedAppElements: {[key: string]: AppElement};
  contentChildren: AppView<any>[] = [];
  viewChildren: AppView<any>[] = [];

  private _literalArrayCache: any[][];
  private _literalMapCache: Array<{[key: string]: any}>;
  viewContainerElement: AppElement = null;

  // The names of the below fields must be kept in sync with codegen_name_util.ts or
  // change detection will fail.
  cdState: ChangeDetectorState = ChangeDetectorState.NeverChecked;

  /**
   * The context against which data-binding expressions in this view are evaluated against.
   * This is always a component instance.
   */
  context: T = null;

  projectableNodes: Array<any | any[]>;

  destroyed: boolean = false;

  renderer: Renderer;

  constructor(public clazz: any, public componentType: RenderComponentType, public type: ViewType,
              public locals: {[key: string]: any}, public viewManager: AppViewManager_,
              public parentInjector: Injector, public declarationAppElement: AppElement,
              public cdMode: ChangeDetectionStrategy, literalArrayCacheSize: number,
              literalMapCacheSize: number) {
    this.ref = new ViewRef_(this);
    if (type === ViewType.COMPONENT || type === ViewType.HOST) {
      this.renderer = viewManager.renderComponent(componentType);
    } else {
      this.renderer = declarationAppElement.parentView.renderer;
    }
    this._literalArrayCache = ListWrapper.createFixedSize(literalArrayCacheSize);
    this._literalMapCache = ListWrapper.createFixedSize(literalMapCacheSize);
  }

  create(givenProjectableNodes: Array<any | any[]>, rootSelector: string): void {
    var context;
    var projectableNodes;
    switch (this.type) {
      case ViewType.COMPONENT:
        context = this.declarationAppElement.component;
        projectableNodes = ensureSlotCount(givenProjectableNodes, this.componentType.slotCount);
        break;
      case ViewType.EMBEDDED:
        context = this.declarationAppElement.parentView.context;
        projectableNodes = this.declarationAppElement.parentView.projectableNodes;
        break;
      case ViewType.HOST:
        context = EMPTY_CONTEXT;
        // Note: Don't ensure the slot count for the projectableNodes as we store
        // them only for the contained component view (which will later check the slot count...)
        projectableNodes = givenProjectableNodes;
        break;
    }
    this.context = context;
    this.projectableNodes = projectableNodes;
    this.createInternal(rootSelector);
  }

  /**
   * Overwritten by implementations
   */
  createInternal(rootSelector: string): void {}

  init(rootNodesOrAppElements: any[], allNodes: any[], appElements: {[key: string]: AppElement},
       disposables: Function[], subscriptions: any[]) {
    this.rootNodesOrAppElements = rootNodesOrAppElements;
    this.allNodes = allNodes;
    this.namedAppElements = appElements;
    this.disposables = disposables;
    this.subscriptions = subscriptions;
    if (this.type === ViewType.COMPONENT) {
      // Note: the render nodes have been attached to their host element
      // in the ViewFactory already.
      this.declarationAppElement.parentView.viewChildren.push(this);
      this.dirtyParentQueriesInternal();
    }
  }

  getHostViewElement(): AppElement { return this.namedAppElements[HOST_VIEW_ELEMENT_NAME]; }

  injectorGet(token: any, nodeIndex: number, notFoundResult: any): any {
    return this.injectorGetInternal(token, nodeIndex, notFoundResult);
  }

  /**
   * Overwritten by implementations
   */
  injectorGetInternal(token: any, nodeIndex: number, notFoundResult: any): any {
    return notFoundResult;
  }

  injector(nodeIndex: number): Injector {
    if (isPresent(nodeIndex)) {
      return new ElementInjector(this, nodeIndex);
    } else {
      return this.parentInjector;
    }
  }

  destroy() {
    if (this.destroyed) {
      return;
    }
    var children = this.contentChildren;
    for (var i = 0; i < children.length; i++) {
      children[i].destroy();
    }
    children = this.viewChildren;
    for (var i = 0; i < children.length; i++) {
      children[i].destroy();
    }
    this.destroyLocal();

    this.destroyed = true;
  }

  destroyLocal() {
    var hostElement =
        this.type === ViewType.COMPONENT ? this.declarationAppElement.nativeElement : null;
    this.renderer.destroyView(hostElement, this.allNodes);
    for (var i = 0; i < this.disposables.length; i++) {
      this.disposables[i]();
    }
    for (var i = 0; i < this.subscriptions.length; i++) {
      ObservableWrapper.dispose(this.subscriptions[i]);
    }
    this.destroyInternal();

    this.dirtyParentQueriesInternal();
  }

  /**
   * Overwritten by implementations
   */
  destroyInternal(): void {}

  get changeDetectorRef(): ChangeDetectorRef { return this.ref; }

  get flatRootNodes(): any[] { return flattenNestedViewRenderNodes(this.rootNodesOrAppElements); }

  get lastRootNode(): any {
    var lastNode = this.rootNodesOrAppElements.length > 0 ?
                       this.rootNodesOrAppElements[this.rootNodesOrAppElements.length - 1] :
                       null;
    return _findLastRenderNode(lastNode);
  }

  hasLocal(contextName: string): boolean {
    return StringMapWrapper.contains(this.locals, contextName);
  }

  setLocal(contextName: string, value: any): void { this.locals[contextName] = value; }

  /**
   * Overwritten by implementations
   */
  dirtyParentQueriesInternal(): void {}

  detectChanges(throwOnChange: boolean): void {
    var s = _scope_check(this.clazz);
    if (this.cdMode === ChangeDetectionStrategy.Detached ||
        this.cdMode === ChangeDetectionStrategy.Checked ||
        this.cdState === ChangeDetectorState.Errored)
      return;
    if (this.destroyed) {
      this.throwDestroyedError('detectChanges');
    }
    this.detectChangesInternal(throwOnChange);
    if (this.cdMode === ChangeDetectionStrategy.CheckOnce)
      this.cdMode = ChangeDetectionStrategy.Checked;

    this.cdState = ChangeDetectorState.CheckedBefore;
    wtfLeave(s);
  }

  /**
   * Overwritten by implementations
   */
  detectChangesInternal(throwOnChange: boolean): void {
    this.detectContentChildrenChanges(throwOnChange);
    this.detectViewChildrenChanges(throwOnChange);
  }

  detectContentChildrenChanges(throwOnChange: boolean) {
    for (var i = 0; i < this.contentChildren.length; ++i) {
      this.contentChildren[i].detectChanges(throwOnChange);
    }
  }

  detectViewChildrenChanges(throwOnChange: boolean) {
    for (var i = 0; i < this.viewChildren.length; ++i) {
      this.viewChildren[i].detectChanges(throwOnChange);
    }
  }

  addToContentChildren(renderAppElement: AppElement): void {
    renderAppElement.parentView.contentChildren.push(this);
    this.viewContainerElement = renderAppElement;
    this.dirtyParentQueriesInternal();
  }

  removeFromContentChildren(renderAppElement: AppElement): void {
    ListWrapper.remove(renderAppElement.parentView.contentChildren, this);
    this.dirtyParentQueriesInternal();
    this.viewContainerElement = null;
  }

  literalArray(id: number, value: any[]): any[] {
    var prevValue = this._literalArrayCache[id];
    if (isBlank(value)) {
      return value;
    }
    if (isBlank(prevValue) || !arrayLooseIdentical(prevValue, value)) {
      prevValue = this._literalArrayCache[id] = value;
    }
    return prevValue;
  }

  literalMap(id: number, value: {[key: string]: any}): {[key: string]: any} {
    var prevValue = this._literalMapCache[id];
    if (isBlank(value)) {
      return value;
    }
    if (isBlank(prevValue) || !mapLooseIdentical(prevValue, value)) {
      prevValue = this._literalMapCache[id] = value;
    }
    return prevValue;
  }

  markAsCheckOnce(): void { this.cdMode = ChangeDetectionStrategy.CheckOnce; }

  markPathToRootAsCheckOnce(): void {
    let c: AppView<any> = this;
    while (isPresent(c) && c.cdMode !== ChangeDetectionStrategy.Detached) {
      if (c.cdMode === ChangeDetectionStrategy.Checked) {
        c.cdMode = ChangeDetectionStrategy.CheckOnce;
      }
      let parentEl =
          c.type === ViewType.COMPONENT ? c.declarationAppElement : c.viewContainerElement;
      c = isPresent(parentEl) ? parentEl.parentView : null;
    }
  }

  eventHandler(cb: Function): Function { return cb; }

  throwDestroyedError(details: string): void { throw new ViewDestroyedException(details); }
}

export class DebugAppView<T> extends AppView<T> {
  private _currentDebugContext: DebugContext = null;

  constructor(clazz: any, componentType: RenderComponentType, type: ViewType,
              locals: {[key: string]: any}, viewManager: AppViewManager_, parentInjector: Injector,
              declarationAppElement: AppElement, cdMode: ChangeDetectionStrategy,
              literalArrayCacheSize: number, literalMapCacheSize: number,
              public staticNodeDebugInfos: StaticNodeDebugInfo[]) {
    super(clazz, componentType, type, locals, viewManager, parentInjector, declarationAppElement,
          cdMode, literalArrayCacheSize, literalMapCacheSize);
  }

  create(givenProjectableNodes: Array<any | any[]>, rootSelector: string): void {
    this._resetDebug();
    try {
      super.create(givenProjectableNodes, rootSelector);
    } catch (e) {
      this._rethrowWithContext(e, e.stack);
      throw e;
    }
  }

  injectorGet(token: any, nodeIndex: number, notFoundResult: any): any {
    this._resetDebug();
    try {
      return super.injectorGet(token, nodeIndex, notFoundResult);
    } catch (e) {
      this._rethrowWithContext(e, e.stack);
      throw e;
    }
  }

  destroyLocal() {
    this._resetDebug();
    try {
      super.destroyLocal();
    } catch (e) {
      this._rethrowWithContext(e, e.stack);
      throw e;
    }
  }

  detectChanges(throwOnChange: boolean): void {
    this._resetDebug();
    try {
      super.detectChanges(throwOnChange);
    } catch (e) {
      this._rethrowWithContext(e, e.stack);
      throw e;
    }
  }

  private _resetDebug() { this._currentDebugContext = null; }

  debug(nodeIndex: number, rowNum: number, colNum: number): DebugContext {
    return this._currentDebugContext = new DebugContext(this, nodeIndex, rowNum, colNum);
  }

  private _rethrowWithContext(e: any, stack: any) {
    if (!(e instanceof ViewWrappedException)) {
      if (!(e instanceof ExpressionChangedAfterItHasBeenCheckedException)) {
        this.cdState = ChangeDetectorState.Errored;
      }
      if (isPresent(this._currentDebugContext)) {
        throw new ViewWrappedException(e, stack, this._currentDebugContext);
      }
    }
  }

  eventHandler(cb: Function): Function {
    var superHandler = super.eventHandler(cb);
    return (event) => {
      this._resetDebug();
      try {
        return superHandler(event);
      } catch (e) {
        this._rethrowWithContext(e, e.stack);
        throw e;
      }
    };
  }
}

@CONST()
export class HostViewFactory {
  constructor(public selector: string, public viewFactory: Function) {}
}

function _findLastRenderNode(node: any): any {
  var lastNode;
  if (node instanceof AppElement) {
    var appEl = <AppElement>node;
    lastNode = appEl.nativeElement;
    if (isPresent(appEl.nestedViews)) {
      // Note: Views might have no root nodes at all!
      for (var i = appEl.nestedViews.length - 1; i >= 0; i--) {
        var nestedView = appEl.nestedViews[i];
        if (nestedView.rootNodesOrAppElements.length > 0) {
          lastNode = _findLastRenderNode(
              nestedView.rootNodesOrAppElements[nestedView.rootNodesOrAppElements.length - 1]);
        }
      }
    }
  } else {
    lastNode = node;
  }
  return lastNode;
}
