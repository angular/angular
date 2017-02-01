/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef} from '../change_detection/change_detection';
import {Injectable, Injector} from '../di';
import {ComponentFactory, ComponentRef} from '../linker/component_factory';
import {ElementRef} from '../linker/element_ref';
import {TemplateRef} from '../linker/template_ref';
import {ViewContainerRef} from '../linker/view_container_ref';
import {EmbeddedViewRef, ViewRef} from '../linker/view_ref';
import {RenderComponentType, Renderer, RootRenderer} from '../render/api';
import {Sanitizer, SecurityContext} from '../security';
import {Type} from '../type';

import {resolveDep, tokenKey} from './provider';
import {getQueryValue} from './query';
import {DebugContext, DepFlags, ElementData, NodeData, NodeDef, NodeType, Refs, RootData, ViewData, ViewDefinition, ViewDefinitionFactory, ViewState, asElementData, asProviderData} from './types';
import {findElementDef, isComponentView, parentDiIndex, renderNode, resolveViewDefinition, rootRenderNodes} from './util';
import {checkAndUpdateView, checkNoChangesView, createEmbeddedView, createRootView, destroyView} from './view';
import {attachEmbeddedView, detachEmbeddedView, moveEmbeddedView} from './view_attach';

const EMPTY_CONTEXT = new Object();

export function createRefs() {
  return new Refs_();
}

export class Refs_ implements Refs {
  createComponentFactory(selector: string, viewDefFactory: ViewDefinitionFactory):
      ComponentFactory<any> {
    return new ComponentFactory_(selector, viewDefFactory);
  }
  createViewRef(data: ViewData): ViewRef { return new ViewRef_(data); }
  createViewContainerRef(view: ViewData, elIndex: number): ViewContainerRef {
    return new ViewContainerRef_(view, elIndex);
  }
  createTemplateRef(parentView: ViewData, def: NodeDef): TemplateRef<any> {
    return new TemplateRef_(parentView, def);
  }
  createInjector(view: ViewData, elIndex: number): Injector { return new Injector_(view, elIndex); }
  createDebugContext(view: ViewData, nodeIndex: number): DebugContext {
    return new DebugContext_(view, nodeIndex);
  }
}

class ComponentFactory_ implements ComponentFactory<any> {
  /**
   * Only needed so that we can implement ComponentFactory
   * @internal */
  _viewClass: any;

  private _viewDef: ViewDefinition;
  private _componentNodeIndex: number;

  constructor(public selector: string, viewDefFactory: ViewDefinitionFactory) {
    const viewDef = this._viewDef = resolveViewDefinition(viewDefFactory);
    const len = viewDef.nodes.length;
    for (let i = 0; i < len; i++) {
      const nodeDef = viewDef.nodes[i];
      if (nodeDef.provider && nodeDef.provider.component) {
        this._componentNodeIndex = i;
        break;
      }
    }
    if (this._componentNodeIndex == null) {
      throw new Error(`Illegal State: Could not find a component in the view definition!`);
    }
  }

  get componentType(): Type<any> {
    return this._viewDef.nodes[this._componentNodeIndex].provider.value;
  }

  /**
   * Creates a new component.
   */
  create(
      injector: Injector, projectableNodes: any[][] = null,
      rootSelectorOrNode: string|any = null): ComponentRef<any> {
    if (!projectableNodes) {
      projectableNodes = [];
    }
    if (!rootSelectorOrNode) {
      rootSelectorOrNode = this.selector;
    }
    const renderer = injector.get(RootRenderer);
    const sanitizer = injector.get(Sanitizer);

    const root: RootData =
        {injector, projectableNodes, selectorOrNode: rootSelectorOrNode, sanitizer, renderer};

    const view = createRootView(root, this._viewDef, EMPTY_CONTEXT);
    const component = asProviderData(view, this._componentNodeIndex).instance;
    return new ComponentRef_(view, component);
  }
}

class ComponentRef_ implements ComponentRef<any> {
  private _viewRef: ViewRef_;
  constructor(private _view: ViewData, private _component: any) {
    this._viewRef = new ViewRef_(_view);
  }
  get location(): ElementRef { return new ElementRef(asElementData(this._view, 0).renderElement); }
  get injector(): Injector { return new Injector_(this._view, 0); }
  get instance(): any { return this._component; };
  get hostView(): ViewRef { return this._viewRef; };
  get changeDetectorRef(): ChangeDetectorRef { return this._viewRef; };
  get componentType(): Type<any> { return <any>this._component.constructor; }

  destroy(): void { this._viewRef.destroy(); }
  onDestroy(callback: Function): void { this._viewRef.onDestroy(callback); }
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
      elIndex = parentDiIndex(view);
      view = view.parent;
    }
    return view ? new Injector_(view, elIndex) : this._view.root.injector;
  }

  clear(): void {
    const len = this._data.embeddedViews.length;
    for (let i = len - 1; i >= 0; i--) {
      const view = detachEmbeddedView(this._data, i);
      destroyView(view);
    }
  }

  get(index: number): ViewRef { return new ViewRef_(this._data.embeddedViews[index]); }

  get length(): number { return this._data.embeddedViews.length; };

  createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, index?: number):
      EmbeddedViewRef<C> {
    const viewRef = templateRef.createEmbeddedView(context);
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
    attachEmbeddedView(this._data, index, viewData);
    return viewRef;
  }

  move(viewRef: ViewRef_, currentIndex: number): ViewRef {
    const previousIndex = this._data.embeddedViews.indexOf(viewRef._view);
    moveEmbeddedView(this._data, previousIndex, currentIndex);
    return viewRef;
  }

  indexOf(viewRef: ViewRef): number {
    return this._data.embeddedViews.indexOf((<ViewRef_>viewRef)._view);
  }

  remove(index?: number): void {
    const viewData = detachEmbeddedView(this._data, index);
    destroyView(viewData);
  }

  detach(index?: number): ViewRef {
    const view = this.get(index);
    detachEmbeddedView(this._data, index);
    return view;
  }
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
  detectChanges(): void { checkAndUpdateView(this._view); }
  checkNoChanges(): void { checkNoChangesView(this._view); }

  reattach(): void { this._view.state |= ViewState.ChecksEnabled; }
  onDestroy(callback: Function) { this._view.disposables.push(<any>callback); }

  destroy() { destroyView(this._view); }
}

class TemplateRef_ implements TemplateRef<any> {
  constructor(private _parentView: ViewData, private _def: NodeDef) {}

  createEmbeddedView(context: any): EmbeddedViewRef<any> {
    return new ViewRef_(createEmbeddedView(this._parentView, this._def, context));
  }

  get elementRef(): ElementRef {
    return new ElementRef(asElementData(this._parentView, this._def.index).renderElement);
  }
}

class Injector_ implements Injector {
  constructor(private view: ViewData, private elIndex: number) {}
  get(token: any, notFoundValue: any = Injector.THROW_IF_NOT_FOUND): any {
    return resolveDep(
        this.view, undefined, this.elIndex,
        {flags: DepFlags.None, token, tokenKey: tokenKey(token)}, notFoundValue);
  }
}

class DebugContext_ implements DebugContext {
  private nodeDef: NodeDef;
  private elDef: NodeDef;
  constructor(public view: ViewData, public nodeIndex: number) {
    if (nodeIndex == null) {
      this.nodeIndex = nodeIndex = view.parentIndex;
      this.view = view = view.parent;
    }
    this.nodeDef = view.def.nodes[nodeIndex];
    this.elDef = findElementDef(view, nodeIndex);
  }
  get injector(): Injector { return new Injector_(this.view, this.elDef.index); }
  get component(): any { return this.view.component; }
  get providerTokens(): any[] {
    const tokens: any[] = [];
    if (this.elDef) {
      for (let i = this.elDef.index + 1; i <= this.elDef.index + this.elDef.childCount; i++) {
        const childDef = this.view.def.nodes[i];
        if (childDef.type === NodeType.Provider) {
          tokens.push(childDef.provider.token);
        } else {
          i += childDef.childCount;
        }
      }
    }
    return tokens;
  }
  get references(): {[key: string]: any} {
    const references: {[key: string]: any} = {};
    if (this.elDef) {
      collectReferences(this.view, this.elDef, references);

      for (let i = this.elDef.index + 1; i <= this.elDef.index + this.elDef.childCount; i++) {
        const childDef = this.view.def.nodes[i];
        if (childDef.type === NodeType.Provider) {
          collectReferences(this.view, childDef, references);
        } else {
          i += childDef.childCount;
        }
      }
    }
    return references;
  }
  get context(): any { return this.view.context; }
  get source(): string {
    if (this.nodeDef.type === NodeType.Text) {
      return this.nodeDef.text.source;
    } else {
      return this.elDef.element.source;
    }
  }
  get componentRenderElement() {
    const elData = findHostElement(this.view);
    return elData ? elData.renderElement : undefined;
  }
  get renderNode(): any {
    let nodeDef = this.nodeDef.type === NodeType.Text ? this.nodeDef : this.elDef;
    return renderNode(this.view, nodeDef);
  }
}

function findHostElement(view: ViewData): ElementData {
  while (view && !isComponentView(view)) {
    view = view.parent;
  }
  if (view.parent) {
    const hostData = asElementData(view.parent, view.parentIndex);
    return hostData;
  }
  return undefined;
}

function collectReferences(view: ViewData, nodeDef: NodeDef, references: {[key: string]: any}) {
  for (let queryId in nodeDef.matchedQueries) {
    if (queryId.startsWith('#')) {
      references[queryId.slice(1)] = getQueryValue(view, nodeDef, queryId);
    }
  }
}