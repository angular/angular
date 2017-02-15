/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef} from '../change_detection/change_detection';
import {Injector} from '../di';
import {ComponentFactory, ComponentRef} from '../linker/component_factory';
import {ElementRef} from '../linker/element_ref';
import {TemplateRef} from '../linker/template_ref';
import {ViewContainerRef} from '../linker/view_container_ref';
import {EmbeddedViewRef, ViewRef} from '../linker/view_ref';
import {Type} from '../type';

import {ArgumentType, BindingType, DebugContext, DepFlags, ElementData, NodeCheckFn, NodeData, NodeDef, NodeFlags, NodeType, RootData, Services, ViewData, ViewDefinition, ViewDefinitionFactory, ViewState, asElementData, asProviderData} from './types';
import {isComponentView, renderNode, resolveViewDefinition, rootRenderNodes, tokenKey, viewParentElIndex} from './util';

const EMPTY_CONTEXT = new Object();

export function createComponentFactory(
    selector: string, componentType: Type<any>,
    viewDefFactory: ViewDefinitionFactory): ComponentFactory<any> {
  return new ComponentFactory_(selector, componentType, viewDefFactory);
}

class ComponentFactory_ implements ComponentFactory<any> {
  /**
   * We are not renaming this field as the old ComponentFactory is using it.
   * @internal */
  _viewClass: any;

  constructor(
      public selector: string, public componentType: Type<any>,
      _viewDefFactory: ViewDefinitionFactory) {
    this._viewClass = _viewDefFactory;
  }

  /**
   * Creates a new component.
   */
  create(
      injector: Injector, projectableNodes: any[][] = null,
      rootSelectorOrNode: string|any = null): ComponentRef<any> {
    const viewDef = resolveViewDefinition(this._viewClass);
    let componentNodeIndex: number;
    const len = viewDef.nodes.length;
    for (let i = 0; i < len; i++) {
      const nodeDef = viewDef.nodes[i];
      if (nodeDef.flags & NodeFlags.HasComponent) {
        componentNodeIndex = i;
        break;
      }
    }
    if (componentNodeIndex == null) {
      throw new Error(`Illegal State: Could not find a component in the view definition!`);
    }
    const view = Services.createRootView(
        injector, projectableNodes || [], rootSelectorOrNode, viewDef, EMPTY_CONTEXT);
    const component = asProviderData(view, componentNodeIndex).instance;
    return new ComponentRef_(view, new ViewRef_(view), component);
  }
}

class ComponentRef_ implements ComponentRef<any> {
  constructor(private _view: ViewData, private _viewRef: ViewRef, private _component: any) {}
  get location(): ElementRef { return new ElementRef(asElementData(this._view, 0).renderElement); }
  get injector(): Injector { return new Injector_(this._view, 0); }
  get instance(): any { return this._component; };
  get hostView(): ViewRef { return this._viewRef; };
  get changeDetectorRef(): ChangeDetectorRef { return this._viewRef; };
  get componentType(): Type<any> { return <any>this._component.constructor; }

  destroy(): void { this._viewRef.destroy(); }
  onDestroy(callback: Function): void { this._viewRef.onDestroy(callback); }
}

export function createViewContainerRef(view: ViewData, elIndex: number): ViewContainerRef {
  return new ViewContainerRef_(view, elIndex);
}

class ViewContainerRef_ implements ViewContainerRef {
  private _data: ElementData;
  constructor(private _view: ViewData, private _elIndex: number) {
    this._data = asElementData(_view, _elIndex);
  }

  get element(): ElementRef { return new ElementRef(this._data.renderElement); }

  get injector(): Injector { return new Injector_(this._view, this._elIndex); }

  get parentInjector(): Injector {
    let view = this._view;
    let elIndex = view.def.nodes[this._elIndex].parent;
    while (elIndex == null && view) {
      elIndex = viewParentElIndex(view);
      view = view.parent;
    }
    return view ? new Injector_(view, elIndex) : this._view.root.injector;
  }

  clear(): void {
    const len = this._data.embeddedViews.length;
    for (let i = len - 1; i >= 0; i--) {
      const view = Services.detachEmbeddedView(this._data, i);
      Services.destroyView(view);
    }
  }

  get(index: number): ViewRef { return new ViewRef_(this._data.embeddedViews[index]); }

  get length(): number { return this._data.embeddedViews.length; };

  createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, index?: number):
      EmbeddedViewRef<C> {
    const viewRef = templateRef.createEmbeddedView(context || <any>{});
    this.insert(viewRef, index);
    return viewRef;
  }

  createComponent<C>(
      componentFactory: ComponentFactory<C>, index?: number, injector?: Injector,
      projectableNodes?: any[][]): ComponentRef<C> {
    const contextInjector = injector || this.parentInjector;
    const componentRef = componentFactory.create(contextInjector, projectableNodes);
    this.insert(componentRef.hostView, index);
    return componentRef;
  }

  insert(viewRef: ViewRef, index?: number): ViewRef {
    const viewData = (<ViewRef_>viewRef)._view;
    Services.attachEmbeddedView(this._data, index, viewData);
    return viewRef;
  }

  move(viewRef: ViewRef_, currentIndex: number): ViewRef {
    const previousIndex = this._data.embeddedViews.indexOf(viewRef._view);
    Services.moveEmbeddedView(this._data, previousIndex, currentIndex);
    return viewRef;
  }

  indexOf(viewRef: ViewRef): number {
    return this._data.embeddedViews.indexOf((<ViewRef_>viewRef)._view);
  }

  remove(index?: number): void {
    const viewData = Services.detachEmbeddedView(this._data, index);
    Services.destroyView(viewData);
  }

  detach(index?: number): ViewRef {
    const view = this.get(index);
    Services.detachEmbeddedView(this._data, index);
    return view;
  }
}

export function createChangeDetectorRef(view: ViewData): ChangeDetectorRef {
  return new ViewRef_(view);
}

class ViewRef_ implements EmbeddedViewRef<any> {
  /** @internal */
  _view: ViewData;

  constructor(_view: ViewData) { this._view = _view; }

  get rootNodes(): any[] { return rootRenderNodes(this._view); }

  get context() { return this._view.context; }

  get destroyed(): boolean { return (this._view.state & ViewState.Destroyed) !== 0; }

  markForCheck(): void { this.reattach(); }
  detach(): void { this._view.state &= ~ViewState.ChecksEnabled; }
  detectChanges(): void { Services.checkAndUpdateView(this._view); }
  checkNoChanges(): void { Services.checkNoChangesView(this._view); }

  reattach(): void { this._view.state |= ViewState.ChecksEnabled; }
  onDestroy(callback: Function) { this._view.disposables.push(<any>callback); }

  destroy() { Services.destroyView(this._view); }
}

export function createTemplateRef(view: ViewData, def: NodeDef): TemplateRef<any> {
  return new TemplateRef_(view, def);
}

class TemplateRef_ implements TemplateRef<any> {
  constructor(private _parentView: ViewData, private _def: NodeDef) {}

  createEmbeddedView(context: any): EmbeddedViewRef<any> {
    return new ViewRef_(Services.createEmbeddedView(this._parentView, this._def, context));
  }

  get elementRef(): ElementRef {
    return new ElementRef(asElementData(this._parentView, this._def.index).renderElement);
  }
}

export function createInjector(view: ViewData, elIndex: number): Injector {
  return new Injector_(view, elIndex);
}

class Injector_ implements Injector {
  constructor(private view: ViewData, private elIndex: number) {}
  get(token: any, notFoundValue: any = Injector.THROW_IF_NOT_FOUND): any {
    return Services.resolveDep(
        this.view, undefined, this.elIndex,
        {flags: DepFlags.None, token, tokenKey: tokenKey(token)}, notFoundValue);
  }
}
