/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef} from '../change_detection/change_detection';
import {Injector} from '../di/injector';
import {InjectFlags} from '../di/interface/injector';
import {Type} from '../interface/type';
import {ComponentFactory, ComponentRef} from '../linker/component_factory';
import {ComponentFactoryBoundToModule, ComponentFactoryResolver} from '../linker/component_factory_resolver';
import {ElementRef} from '../linker/element_ref';
import {InternalNgModuleRef, NgModuleRef} from '../linker/ng_module_factory';
import {TemplateRef} from '../linker/template_ref';
import {ViewContainerRef} from '../linker/view_container_ref';
import {EmbeddedViewRef, InternalViewRef, ViewRef, ViewRefTracker} from '../linker/view_ref';
import {stringify} from '../util/stringify';
import {VERSION} from '../version';

import {callNgModuleLifecycle, initNgModule, resolveNgModuleDep} from './ng_module';
import {asElementData, asProviderData, asTextData, DepFlags, ElementData, NgModuleData, NgModuleDefinition, NodeDef, NodeFlags, Services, TemplateData, ViewContainerData, ViewData, ViewDefinitionFactory, ViewState} from './types';
import {markParentViewsForCheck, resolveDefinition, rootRenderNodes, tokenKey, viewParentEl} from './util';
import {attachEmbeddedView, detachEmbeddedView, moveEmbeddedView, renderDetachView} from './view_attach';

const EMPTY_CONTEXT = {};

// Attention: this function is called as top level function.
// Putting any logic in here will destroy closure tree shaking!
export function createComponentFactory(
    selector: string, componentType: Type<any>, viewDefFactory: ViewDefinitionFactory,
    inputs: {[propName: string]: string}|null, outputs: {[propName: string]: string},
    ngContentSelectors: string[]): ComponentFactory<any> {
  return new ComponentFactory_(
      selector, componentType, viewDefFactory, inputs, outputs, ngContentSelectors);
}

export function getComponentViewDefinitionFactory(componentFactory: ComponentFactory<any>):
    ViewDefinitionFactory {
  return (componentFactory as ComponentFactory_).viewDefFactory;
}

class ComponentFactory_ extends ComponentFactory<any> {
  /**
   * @internal
   */
  viewDefFactory: ViewDefinitionFactory;

  constructor(
      public selector: string, public componentType: Type<any>,
      viewDefFactory: ViewDefinitionFactory, private _inputs: {[propName: string]: string}|null,
      private _outputs: {[propName: string]: string}, public ngContentSelectors: string[]) {
    // Attention: this ctor is called as top level function.
    // Putting any logic in here will destroy closure tree shaking!
    super();
    this.viewDefFactory = viewDefFactory;
  }

  get inputs() {
    const inputsArr: {propName: string, templateName: string}[] = [];
    const inputs = this._inputs!;
    for (let propName in inputs) {
      const templateName = inputs[propName];
      inputsArr.push({propName, templateName});
    }
    return inputsArr;
  }

  get outputs() {
    const outputsArr: {propName: string, templateName: string}[] = [];
    for (let propName in this._outputs) {
      const templateName = this._outputs[propName];
      outputsArr.push({propName, templateName});
    }
    return outputsArr;
  }

  /**
   * Creates a new component.
   */
  create(
      injector: Injector, projectableNodes?: any[][], rootSelectorOrNode?: string|any,
      ngModule?: NgModuleRef<any>): ComponentRef<any> {
    if (!ngModule) {
      throw new Error('ngModule should be provided');
    }
    const viewDef = resolveDefinition(this.viewDefFactory);
    const componentNodeIndex = viewDef.nodes[0].element!.componentProvider!.nodeIndex;
    const view = Services.createRootView(
        injector, projectableNodes || [], rootSelectorOrNode, viewDef, ngModule, EMPTY_CONTEXT);
    const component = asProviderData(view, componentNodeIndex).instance;
    if (rootSelectorOrNode) {
      view.renderer.setAttribute(asElementData(view, 0).renderElement, 'ng-version', VERSION.full);
    }

    return new ComponentRef_(view, new ViewRef_(view), component);
  }
}

class ComponentRef_ extends ComponentRef<any> {
  public readonly hostView: ViewRef;
  public readonly instance: any;
  public readonly changeDetectorRef: ChangeDetectorRef;
  private _elDef: NodeDef;
  constructor(private _view: ViewData, private _viewRef: ViewRef, private _component: any) {
    super();
    this._elDef = this._view.def.nodes[0];
    this.hostView = _viewRef;
    this.changeDetectorRef = _viewRef;
    this.instance = _component;
  }
  get location(): ElementRef {
    return new ElementRef(asElementData(this._view, this._elDef.nodeIndex).renderElement);
  }
  get injector(): Injector {
    return new Injector_(this._view, this._elDef);
  }
  get componentType(): Type<any> {
    return <any>this._component.constructor;
  }

  destroy(): void {
    this._viewRef.destroy();
  }
  onDestroy(callback: Function): void {
    this._viewRef.onDestroy(callback);
  }
}

export function createViewContainerData(
    view: ViewData, elDef: NodeDef, elData: ElementData): ViewContainerData {
  return new ViewContainerRef_(view, elDef, elData);
}

class ViewContainerRef_ implements ViewContainerData {
  /**
   * @internal
   */
  _embeddedViews: ViewData[] = [];
  constructor(private _view: ViewData, private _elDef: NodeDef, private _data: ElementData) {}

  get element(): ElementRef {
    return new ElementRef(this._data.renderElement);
  }

  get injector(): Injector {
    return new Injector_(this._view, this._elDef);
  }

  /** @deprecated No replacement */
  get parentInjector(): Injector {
    let view = this._view;
    let elDef = this._elDef.parent;
    while (!elDef && view) {
      elDef = viewParentEl(view);
      view = view.parent!;
    }

    return view ? new Injector_(view, elDef) : new Injector_(this._view, null);
  }

  clear(): void {
    const len = this._embeddedViews.length;
    for (let i = len - 1; i >= 0; i--) {
      const view = detachEmbeddedView(this._data, i)!;
      Services.destroyView(view);
    }
  }

  get(index: number): ViewRef|null {
    const view = this._embeddedViews[index];
    if (view) {
      const ref = new ViewRef_(view);
      ref.attachToViewContainerRef(this);
      return ref;
    }
    return null;
  }

  get length(): number {
    return this._embeddedViews.length;
  }

  createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, index?: number):
      EmbeddedViewRef<C> {
    const viewRef = templateRef.createEmbeddedView(context || <any>{});
    this.insert(viewRef, index);
    return viewRef;
  }

  createComponent<C>(
      componentFactory: ComponentFactory<C>, index?: number, injector?: Injector,
      projectableNodes?: any[][], ngModuleRef?: NgModuleRef<any>): ComponentRef<C> {
    const contextInjector = injector || this.parentInjector;
    if (!ngModuleRef && !(componentFactory instanceof ComponentFactoryBoundToModule)) {
      ngModuleRef = contextInjector.get(NgModuleRef);
    }
    const componentRef =
        componentFactory.create(contextInjector, projectableNodes, undefined, ngModuleRef);
    this.insert(componentRef.hostView, index);
    return componentRef;
  }

  insert(viewRef: ViewRef, index?: number): ViewRef {
    if (viewRef.destroyed) {
      throw new Error('Cannot insert a destroyed View in a ViewContainer!');
    }
    const viewRef_ = <ViewRef_>viewRef;
    const viewData = viewRef_._view;
    attachEmbeddedView(this._view, this._data, index, viewData);
    viewRef_.attachToViewContainerRef(this);
    return viewRef;
  }

  move(viewRef: ViewRef_, currentIndex: number): ViewRef {
    if (viewRef.destroyed) {
      throw new Error('Cannot move a destroyed View in a ViewContainer!');
    }
    const previousIndex = this._embeddedViews.indexOf(viewRef._view);
    moveEmbeddedView(this._data, previousIndex, currentIndex);
    return viewRef;
  }

  indexOf(viewRef: ViewRef): number {
    return this._embeddedViews.indexOf((<ViewRef_>viewRef)._view);
  }

  remove(index?: number): void {
    const viewData = detachEmbeddedView(this._data, index);
    if (viewData) {
      Services.destroyView(viewData);
    }
  }

  detach(index?: number): ViewRef|null {
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
  private _viewContainerRef: ViewContainerRef|null;
  private _appRef: ViewRefTracker|null;

  constructor(_view: ViewData) {
    this._view = _view;
    this._viewContainerRef = null;
    this._appRef = null;
  }

  get rootNodes(): any[] {
    return rootRenderNodes(this._view);
  }

  get context() {
    return this._view.context;
  }

  set context(value: any) {
    this._view.context = value;
  }

  get destroyed(): boolean {
    return (this._view.state & ViewState.Destroyed) !== 0;
  }

  markForCheck(): void {
    markParentViewsForCheck(this._view);
  }
  detach(): void {
    this._view.state &= ~ViewState.Attached;
  }
  detectChanges(): void {
    const fs = this._view.root.rendererFactory;
    if (fs.begin) {
      fs.begin();
    }
    try {
      Services.checkAndUpdateView(this._view);
    } finally {
      if (fs.end) {
        fs.end();
      }
    }
  }
  checkNoChanges(): void {
    Services.checkNoChangesView(this._view);
  }

  reattach(): void {
    this._view.state |= ViewState.Attached;
  }
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

  attachToAppRef(appRef: ViewRefTracker) {
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

export function createTemplateData(view: ViewData, def: NodeDef): TemplateData {
  return new TemplateRef_(view, def);
}

class TemplateRef_ extends TemplateRef<any> implements TemplateData {
  /**
   * @internal
   */
  // TODO(issue/24571): remove '!'.
  _projectedViews!: ViewData[];

  constructor(private _parentView: ViewData, private _def: NodeDef) {
    super();
  }

  createEmbeddedView(context: any): EmbeddedViewRef<any> {
    return new ViewRef_(Services.createEmbeddedView(
        this._parentView, this._def, this._def.element!.template !, context));
  }

  get elementRef(): ElementRef {
    return new ElementRef(asElementData(this._parentView, this._def.nodeIndex).renderElement);
  }
}

export function createInjector(view: ViewData, elDef: NodeDef): Injector {
  return new Injector_(view, elDef);
}

class Injector_ implements Injector {
  constructor(private view: ViewData, private elDef: NodeDef|null) {}
  get(token: any, notFoundValue: any = Injector.THROW_IF_NOT_FOUND): any {
    const allowPrivateServices =
        this.elDef ? (this.elDef.flags & NodeFlags.ComponentView) !== 0 : false;
    return Services.resolveDep(
        this.view, this.elDef, allowPrivateServices,
        {flags: DepFlags.None, token, tokenKey: tokenKey(token)}, notFoundValue);
  }
}

export function nodeValue(view: ViewData, index: number): any {
  const def = view.def.nodes[index];
  if (def.flags & NodeFlags.TypeElement) {
    const elData = asElementData(view, def.nodeIndex);
    return def.element!.template ? elData.template : elData.renderElement;
  } else if (def.flags & NodeFlags.TypeText) {
    return asTextData(view, def.nodeIndex).renderText;
  } else if (def.flags & (NodeFlags.CatProvider | NodeFlags.TypePipe)) {
    return asProviderData(view, def.nodeIndex).instance;
  }
  throw new Error(`Illegal state: read nodeValue for node index ${index}`);
}

export function createNgModuleRef(
    moduleType: Type<any>, parent: Injector, bootstrapComponents: Type<any>[],
    def: NgModuleDefinition): NgModuleRef<any> {
  return new NgModuleRef_(moduleType, parent, bootstrapComponents, def);
}

class NgModuleRef_ implements NgModuleData, InternalNgModuleRef<any> {
  private _destroyListeners: (() => void)[] = [];
  private _destroyed: boolean = false;
  /** @internal */
  // TODO(issue/24571): remove '!'.
  _providers!: any[];
  /** @internal */
  // TODO(issue/24571): remove '!'.
  _modules!: any[];

  readonly injector: Injector = this;

  constructor(
      private _moduleType: Type<any>, public _parent: Injector,
      public _bootstrapComponents: Type<any>[], public _def: NgModuleDefinition) {
    initNgModule(this);
  }

  get(token: any, notFoundValue: any = Injector.THROW_IF_NOT_FOUND,
      injectFlags: InjectFlags = InjectFlags.Default): any {
    let flags = DepFlags.None;
    if (injectFlags & InjectFlags.SkipSelf) {
      flags |= DepFlags.SkipSelf;
    } else if (injectFlags & InjectFlags.Self) {
      flags |= DepFlags.Self;
    }
    return resolveNgModuleDep(
        this, {token: token, tokenKey: tokenKey(token), flags: flags}, notFoundValue);
  }

  get instance() {
    return this.get(this._moduleType);
  }

  get componentFactoryResolver() {
    return this.get(ComponentFactoryResolver);
  }

  destroy(): void {
    if (this._destroyed) {
      throw new Error(
          `The ng module ${stringify(this.instance.constructor)} has already been destroyed.`);
    }
    this._destroyed = true;
    callNgModuleLifecycle(this, NodeFlags.OnDestroy);
    this._destroyListeners.forEach((listener) => listener());
  }

  onDestroy(callback: () => void): void {
    this._destroyListeners.push(callback);
  }
}
