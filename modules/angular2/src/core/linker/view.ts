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
  looseIdentical,
  isPrimitive
} from 'angular2/src/facade/lang';

import {ObservableWrapper} from 'angular2/src/facade/async';
import {Renderer, RootRenderer, RenderDebugInfo} from 'angular2/src/core/render/api';
import {ViewRef_, HostViewFactoryRef} from './view_ref';

import {AppViewManager_, AppViewManager} from './view_manager';
import {ViewType} from './view_type';
import {flattenNestedViewRenderNodes} from './view_utils';
import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ChangeDetectorState,
  isDefaultChangeDetectionStrategy
} from 'angular2/src/core/change_detection/change_detection';
import {wtfCreateScope, wtfLeave, WtfScopeFn} from '../profile/profile';
import {
  ViewWrappedException,
  ExpressionChangedAfterItHasBeenCheckedException,
  ViewDestroyedException
} from './exceptions';
import {StaticNodeDebugInfo, StaticBindingDebugInfo, DebugContext} from './debug_context';
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
  renderParent: AppView<any>;

  // The names of the below fields must be kept in sync with codegen_name_util.ts or
  // change detection will fail.
  state: ChangeDetectorState = ChangeDetectorState.NeverChecked;
  mode: ChangeDetectionStrategy;

  /**
   * The context against which data-binding expressions in this view are evaluated against.
   * This is always a component instance.
   */
  context: T = null;

  destroyed: boolean = false;

  constructor(public clazz: any, public type: ViewType, public locals: {[key: string]: any},
              public renderer: Renderer, public viewManager: AppViewManager_,
              public parentInjector: Injector, public projectableNodes: Array<any | any[]>,
              public declarationAppElement: AppElement, strategy: ChangeDetectionStrategy,
              public staticNodeDebugInfos: StaticNodeDebugInfo[],
              public staticBindingDebugInfos: StaticBindingDebugInfo[]) {
    this.ref = new ViewRef_(this);
    var context;
    var mode = ChangeDetectionStrategy.CheckAlways;
    switch (this.type) {
      case ViewType.COMPONENT:
        context = this.declarationAppElement.component;
        mode = isDefaultChangeDetectionStrategy(strategy) ? ChangeDetectionStrategy.CheckAlways :
                                                            ChangeDetectionStrategy.CheckOnce;
        break;
      case ViewType.EMBEDDED:
        context = this.declarationAppElement.parentView.context;
        break;
      case ViewType.HOST:
        context = EMPTY_CONTEXT;
        break;
    }
    this.context = context;
    this.mode = mode;
    this.state = ChangeDetectorState.NeverChecked;
  }

  init(rootNodesOrAppElements: any[], allNodes: any[], appElements: {[key: string]: AppElement},
       disposables: Function[], subscriptions: any[], hadError: boolean) {
    this.rootNodesOrAppElements = rootNodesOrAppElements;
    this.allNodes = allNodes;
    this.namedAppElements = appElements;
    this.disposables = disposables;
    this.subscriptions = subscriptions;
    if (!hadError) {
      if (this.type === ViewType.COMPONENT) {
        // Note: the render nodes have been attached to their host element
        // in the ViewFactory already.
        this.declarationAppElement.initComponentView(this);
        this.declarationAppElement.parentView.viewChildren.push(this);
        this.renderParent = this.declarationAppElement.parentView;
        this.dirtyParentQueriesInternal();
      }
    }
  }

  getHostViewElement(): AppElement { return this.namedAppElements[HOST_VIEW_ELEMENT_NAME]; }

  /**
   * Overwritten by implementations
   */
  injectorGet(token: any, nodeIndex: number, notFoundResult: any): any { return notFoundResult; }

  /**
   * Overwritten by implementations
   */
  injectorPrivateGet(token: any, nodeIndex: number, notFoundResult: any): any {
    return notFoundResult;
  }

  injector(nodeIndex: number, readPrivate: boolean): Injector {
    if (isPresent(nodeIndex)) {
      return new ElementInjector(this, nodeIndex, readPrivate);
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
    this.destroyed = true;
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
  afterContentLifecycleCallbacksInternal(): void {}

  /**
   * Overwritten by implementations
   */
  updateContentQueriesInternal(): void {}

  /**
   * Overwritten by implementations
   */
  afterViewLifecycleCallbacksInternal(): void {}

  /**
   * Overwritten by implementations
   */
  updateViewQueriesInternal(): void {}

  /**
   * Overwritten by implementations
   */
  dirtyParentQueriesInternal(): void {}

  addRenderContentChild(view: AppView<any>): void {
    this.contentChildren.push(view);
    view.renderParent = this;
    view.dirtyParentQueriesInternal();
  }

  removeContentChild(view: AppView<any>): void {
    ListWrapper.remove(this.contentChildren, view);
    view.dirtyParentQueriesInternal();
    view.renderParent = null;
  }

  detectChanges(): void {
    var s = _scope_check(this.clazz);
    if (this.mode === ChangeDetectionStrategy.Detached ||
        this.mode === ChangeDetectionStrategy.Checked || this.state === ChangeDetectorState.Errored)
      return;
    if (this.destroyed) {
      this.throwDestroyedError('detectChanges');
    }
    this.detectChangesInInputsInternal();

    for (var i = 0; i < this.contentChildren.length; ++i) {
      this.contentChildren[i].detectChanges();
    }
    this.updateContentQueriesInternal();
    this.afterContentLifecycleCallbacksInternal();

    this.detectChangesHostPropertiesInternal();

    for (var i = 0; i < this.viewChildren.length; ++i) {
      this.viewChildren[i].detectChanges();
    }
    this.updateViewQueriesInternal();
    this.afterViewLifecycleCallbacksInternal();

    if (this.mode === ChangeDetectionStrategy.CheckOnce)
      this.mode = ChangeDetectionStrategy.Checked;

    this.state = ChangeDetectorState.CheckedBefore;
    wtfLeave(s);
  }

  checkNoChanges(): void {
    if (!assertionsEnabled()) return;
    if (this.mode === ChangeDetectionStrategy.Detached ||
        this.mode === ChangeDetectionStrategy.Checked || this.state === ChangeDetectorState.Errored)
      return;
    if (this.destroyed) {
      this.throwDestroyedError('checkNoChanges');
    }
    this.checkNoChangesInternal();

    for (var i = 0; i < this.contentChildren.length; ++i) {
      this.contentChildren[i].checkNoChanges();
    }
    for (var i = 0; i < this.viewChildren.length; ++i) {
      this.viewChildren[i].checkNoChanges();
    }
  }

  /**
   * Overwritten by implementations
   */
  detectChangesInInputsInternal(): void {}

  /**
   * Overwritten by implementations
   */
  detectChangesHostPropertiesInternal(): void {}

  /**
   * Overwritten by implementations
   */
  checkNoChangesInternal(): void {}

  markAsCheckOnce(): void { this.mode = ChangeDetectionStrategy.CheckOnce; }

  markPathToRootAsCheckOnce(): void {
    var c: AppView<any> = this;
    while (isPresent(c) && c.mode !== ChangeDetectionStrategy.Detached) {
      if (c.mode === ChangeDetectionStrategy.Checked) {
        c.mode = ChangeDetectionStrategy.CheckOnce;
      }
      c = c.renderParent;
    }
  }

  debugContext(nodeIndex: number, bindingIndex: number): DebugContext {
    return new DebugContext(this, nodeIndex, bindingIndex);
  }

  throwOnChangeError(debugCtx: DebugContext, oldValue: any, newValue: any): void {
    throw new ExpressionChangedAfterItHasBeenCheckedException(debugCtx.bindingSource, oldValue,
                                                              newValue, null);
  }

  rethrowWithContext(methodName: string, debugCtx: DebugContext, e: any, stack: any) {
    if ((e instanceof ViewWrappedException)) {
      throw e;
    }
    if (!(e instanceof ExpressionChangedAfterItHasBeenCheckedException)) {
      this.state = ChangeDetectorState.Errored;
    }
    throw new ViewWrappedException(methodName, e, stack, debugCtx);
  }

  throwDestroyedError(details: string): void { throw new ViewDestroyedException(details); }
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
