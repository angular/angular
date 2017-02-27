/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NoOpAnimationPlayer} from '../animation/animation_player';
import {ApplicationRef} from '../application_ref';
import {ChangeDetectorRef} from '../change_detection/change_detection';
import {Injector} from '../di';
import {ComponentFactory, ComponentRef} from '../linker/component_factory';
import {ElementRef} from '../linker/element_ref';
import {TemplateRef} from '../linker/template_ref';
import {ViewContainerRef} from '../linker/view_container_ref';
import {EmbeddedViewRef, InternalViewRef, ViewRef} from '../linker/view_ref';
import {Renderer as RendererV1, RendererV2} from '../render/api';
import {Type} from '../type';
import {VERSION} from '../version';

import {ArgumentType, BindingType, DebugContext, DepFlags, ElementData, NodeCheckFn, NodeData, NodeDef, NodeFlags, RootData, Services, ViewData, ViewDefinition, ViewDefinitionFactory, ViewState, asElementData, asProviderData, asTextData} from './types';
import {isComponentView, markParentViewsForCheck, renderNode, resolveViewDefinition, rootRenderNodes, splitNamespace, tokenKey, viewParentEl} from './util';
import {attachEmbeddedView, detachEmbeddedView, moveEmbeddedView, renderDetachView} from './view_attach';

const EMPTY_CONTEXT = new Object();

export function createComponentFactory(
    selector: string, componentType: Type<any>,
    viewDefFactory: ViewDefinitionFactory): ComponentFactory<any> {
  return new ComponentFactory_(selector, componentType, viewDefFactory);
}

class ComponentFactory_ extends ComponentFactory<any> {
  constructor(selector: string, componentType: Type<any>, viewDefFactory: ViewDefinitionFactory) {
    super(selector, <any>viewDefFactory, componentType);
  }

  /**
   * Creates a new component.
   */
  create(
      injector: Injector, projectableNodes: any[][] = null,
      rootSelectorOrNode: string|any = null): ComponentRef<any> {
    const viewDef = resolveViewDefinition(this._viewClass);
    const componentNodeIndex = viewDef.nodes[0].element.componentProvider.index;
    const view = Services.createRootView(
        injector, projectableNodes || [], rootSelectorOrNode, viewDef, EMPTY_CONTEXT);
    const component = asProviderData(view, componentNodeIndex).instance;
    view.renderer.setAttribute(asElementData(view, 0).renderElement, 'ng-version', VERSION.full);

    return new ComponentRef_(view, new ViewRef_(view), component);
  }
}

class ComponentRef_ extends ComponentRef<any> {
  private _elDef: NodeDef;
  constructor(private _view: ViewData, private _viewRef: ViewRef, private _component: any) {
    super();
    this._elDef = this._view.def.nodes[0];
  }
  get location(): ElementRef {
    return new ElementRef(asElementData(this._view, this._elDef.index).renderElement);
  }
  get injector(): Injector { return new Injector_(this._view, this._elDef); }
  get instance(): any { return this._component; };
  get hostView(): ViewRef { return this._viewRef; };
  get changeDetectorRef(): ChangeDetectorRef { return this._viewRef; };
  get componentType(): Type<any> { return <any>this._component.constructor; }

  destroy(): void { this._viewRef.destroy(); }
  onDestroy(callback: Function): void { this._viewRef.onDestroy(callback); }
}

export function createViewContainerRef(view: ViewData, elDef: NodeDef): ViewContainerRef {
  return new ViewContainerRef_(view, elDef);
}

class ViewContainerRef_ implements ViewContainerRef {
  private _data: ElementData;
  constructor(private _view: ViewData, private _elDef: NodeDef) {
    this._data = asElementData(_view, _elDef.index);
  }

  get element(): ElementRef { return new ElementRef(this._data.renderElement); }

  get injector(): Injector { return new Injector_(this._view, this._elDef); }

  get parentInjector(): Injector {
    let view = this._view;
    let elDef = this._elDef.parent;
    while (!elDef && view) {
      elDef = viewParentEl(view);
      view = view.parent;
    }
    return view ? new Injector_(view, elDef) : this._view.root.injector;
  }

  clear(): void {
    const len = this._data.embeddedViews.length;
    for (let i = len - 1; i >= 0; i--) {
      const view = detachEmbeddedView(this._data, i);
      Services.destroyView(view);
    }
  }

  get(index: number): ViewRef {
    const view = this._data.embeddedViews[index];
    if (view) {
      const ref = new ViewRef_(view);
      ref.attachToViewContainerRef(this);
      return ref;
    }
    return null;
  }

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
    const viewRef_ = <ViewRef_>viewRef;
    const viewData = viewRef_._view;
    attachEmbeddedView(this._view, this._data, index, viewData);
    viewRef_.attachToViewContainerRef(this);
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
    if (viewData) {
      Services.destroyView(viewData);
    }
  }

  detach(index?: number): ViewRef {
    const view = detachEmbeddedView(this._data, index);
    return view ? new ViewRef_(view) : null;
  }
}

export function createChangeDetectorRef(view: ViewData): ChangeDetectorRef {
  return new ViewRef_(view);
}

export class ViewRef_ implements EmbeddedViewRef<any>, InternalViewRef {
  /** @internal */
  _view: ViewData;
  private _viewContainerRef: ViewContainerRef;
  private _appRef: ApplicationRef;

  constructor(_view: ViewData) {
    this._view = _view;
    this._viewContainerRef = null;
    this._appRef = null;
  }

  get rootNodes(): any[] { return rootRenderNodes(this._view); }

  get context() { return this._view.context; }

  get destroyed(): boolean { return (this._view.state & ViewState.Destroyed) !== 0; }

  markForCheck(): void { markParentViewsForCheck(this._view); }
  detach(): void { this._view.state &= ~ViewState.ChecksEnabled; }
  detectChanges(): void { Services.checkAndUpdateView(this._view); }
  checkNoChanges(): void { Services.checkNoChangesView(this._view); }

  reattach(): void { this._view.state |= ViewState.ChecksEnabled; }
  onDestroy(callback: Function) {
    if (!this._view.disposables) {
      this._view.disposables = [];
    }
    this._view.disposables.push(<any>callback);
  }

  destroy() {
    if (this._appRef) {
      this._appRef.detachView(this);
    } else if (this._viewContainerRef) {
      this._viewContainerRef.detach(this._viewContainerRef.indexOf(this));
    }
    Services.destroyView(this._view);
  }

  detachFromAppRef() {
    this._appRef = null;
    renderDetachView(this._view);
    Services.dirtyParentQueries(this._view);
  }

  attachToAppRef(appRef: ApplicationRef) {
    if (this._viewContainerRef) {
      throw new Error('This view is already attached to a ViewContainer!');
    }
    this._appRef = appRef;
  }

  attachToViewContainerRef(vcRef: ViewContainerRef) {
    if (this._appRef) {
      throw new Error('This view is already attached directly to the ApplicationRef!');
    }
    this._viewContainerRef = vcRef;
  }
}

export function createTemplateRef(view: ViewData, def: NodeDef): TemplateRef<any> {
  return new TemplateRef_(view, def);
}

class TemplateRef_ extends TemplateRef<any> {
  constructor(private _parentView: ViewData, private _def: NodeDef) { super(); }

  createEmbeddedView(context: any): EmbeddedViewRef<any> {
    return new ViewRef_(Services.createEmbeddedView(this._parentView, this._def, context));
  }

  get elementRef(): ElementRef {
    return new ElementRef(asElementData(this._parentView, this._def.index).renderElement);
  }
}

export function createInjector(view: ViewData, elDef: NodeDef): Injector {
  return new Injector_(view, elDef);
}

class Injector_ implements Injector {
  constructor(private view: ViewData, private elDef: NodeDef) {}
  get(token: any, notFoundValue: any = Injector.THROW_IF_NOT_FOUND): any {
    const allowPrivateServices = (this.elDef.flags & NodeFlags.ComponentView) !== 0;
    return Services.resolveDep(
        this.view, this.elDef, allowPrivateServices,
        {flags: DepFlags.None, token, tokenKey: tokenKey(token)}, notFoundValue);
  }
}

export function nodeValue(view: ViewData, index: number): any {
  const def = view.def.nodes[index];
  if (def.flags & NodeFlags.TypeElement) {
    if (def.element.template) {
      return createTemplateRef(view, def);
    } else {
      return asElementData(view, def.index).renderElement;
    }
  } else if (def.flags & NodeFlags.TypeText) {
    return asTextData(view, def.index).renderText;
  } else if (def.flags & (NodeFlags.CatProvider | NodeFlags.TypePipe)) {
    return asProviderData(view, def.index).instance;
  }
  throw new Error(`Illegal state: read nodeValue for node index ${index}`);
}

export function createRendererV1(view: ViewData): RendererV1 {
  return new RendererAdapter(view.renderer);
}

class RendererAdapter implements RendererV1 {
  constructor(private delegate: RendererV2) {}
  selectRootElement(selectorOrNode: string|Element): Element {
    return this.delegate.selectRootElement(selectorOrNode);
  }

  createElement(parent: Element|DocumentFragment, namespaceAndName: string): Element {
    const [ns, name] = splitNamespace(namespaceAndName);
    const el = this.delegate.createElement(name, ns);
    if (parent) {
      this.delegate.appendChild(parent, el);
    }
    return el;
  }

  createViewRoot(hostElement: Element): Element|DocumentFragment { return hostElement; }

  createTemplateAnchor(parentElement: Element|DocumentFragment): Comment {
    const comment = this.delegate.createComment('');
    if (parentElement) {
      this.delegate.appendChild(parentElement, comment);
    }
    return comment;
  }

  createText(parentElement: Element|DocumentFragment, value: string): any {
    const node = this.delegate.createText(value);
    if (parentElement) {
      this.delegate.appendChild(parentElement, node);
    }
    return node;
  }

  projectNodes(parentElement: Element|DocumentFragment, nodes: Node[]) {
    for (let i = 0; i < nodes.length; i++) {
      this.delegate.appendChild(parentElement, nodes[i]);
    }
  }

  attachViewAfter(node: Node, viewRootNodes: Node[]) {
    const parentElement = this.delegate.parentNode(node);
    const nextSibling = this.delegate.nextSibling(node);
    for (let i = 0; i < viewRootNodes.length; i++) {
      this.delegate.insertBefore(parentElement, viewRootNodes[i], nextSibling);
    }
  }

  detachView(viewRootNodes: (Element|Text|Comment)[]) {
    for (let i = 0; i < viewRootNodes.length; i++) {
      const node = viewRootNodes[i];
      const parentElement = this.delegate.parentNode(node);
      this.delegate.removeChild(parentElement, node);
    }
  }

  destroyView(hostElement: Element|DocumentFragment, viewAllNodes: Node[]) {
    for (let i = 0; i < viewAllNodes.length; i++) {
      this.delegate.destroyNode(viewAllNodes[i]);
    }
  }

  listen(renderElement: any, name: string, callback: Function): Function {
    return this.delegate.listen(renderElement, name, <any>callback);
  }

  listenGlobal(target: string, name: string, callback: Function): Function {
    return this.delegate.listen(target, name, <any>callback);
  }

  setElementProperty(
      renderElement: Element|DocumentFragment, propertyName: string, propertyValue: any): void {
    this.delegate.setProperty(renderElement, propertyName, propertyValue);
  }

  setElementAttribute(renderElement: Element, namespaceAndName: string, attributeValue: string):
      void {
    const [ns, name] = splitNamespace(namespaceAndName);
    if (attributeValue != null) {
      this.delegate.setAttribute(renderElement, name, attributeValue, ns);
    } else {
      this.delegate.removeAttribute(renderElement, name, ns);
    }
  }

  setBindingDebugInfo(renderElement: Element, propertyName: string, propertyValue: string): void {}

  setElementClass(renderElement: Element, className: string, isAdd: boolean): void {
    if (isAdd) {
      this.delegate.addClass(renderElement, className);
    } else {
      this.delegate.removeClass(renderElement, className);
    }
  }

  setElementStyle(renderElement: HTMLElement, styleName: string, styleValue: string): void {
    if (styleValue != null) {
      this.delegate.setStyle(renderElement, styleName, styleValue, false, false);
    } else {
      this.delegate.removeStyle(renderElement, styleName, false);
    }
  }

  invokeElementMethod(renderElement: Element, methodName: string, args: any[]): void {
    (renderElement as any)[methodName].apply(renderElement, args);
  }

  setText(renderNode: Text, text: string): void { this.delegate.setValue(renderNode, text); }

  animate(): NoOpAnimationPlayer { return new NoOpAnimationPlayer(); }
}