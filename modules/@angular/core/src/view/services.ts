/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, Injector} from '../di';
import {unimplemented} from '../facade/errors';
import {ComponentFactory, ComponentRef} from '../linker/component_factory';
import {ElementRef} from '../linker/element_ref';
import {TemplateRef} from '../linker/template_ref';
import {ViewContainerRef} from '../linker/view_container_ref';
import {EmbeddedViewRef, ViewRef} from '../linker/view_ref';
import {RenderComponentType, Renderer, RootRenderer} from '../render/api';
import {Sanitizer, SecurityContext} from '../security';

import {createInjector} from './provider';
import {getQueryValue} from './query';
import {DebugContext, ElementData, NodeData, NodeDef, NodeType, Services, ViewData, ViewDefinition, ViewState, asElementData} from './types';
import {findElementDef, isComponentView, renderNode, rootRenderNodes} from './util';
import {checkAndUpdateView, checkNoChangesView, createEmbeddedView, destroyView} from './view';
import {attachEmbeddedView, detachEmbeddedView} from './view_attach';

@Injectable()
export class DefaultServices implements Services {
  constructor(private _rootRenderer: RootRenderer, private _sanitizer: Sanitizer) {}

  renderComponent(rcp: RenderComponentType): Renderer {
    return this._rootRenderer.renderComponent(rcp);
  }
  sanitize(context: SecurityContext, value: string): string {
    return this._sanitizer.sanitize(context, value);
  }
  createViewRef(data: ViewData): ViewRef { return new ViewRef_(data); }
  createViewContainerRef(data: ElementData): ViewContainerRef {
    return new ViewContainerRef_(data);
  }
  createTemplateRef(parentView: ViewData, def: NodeDef): TemplateRef<any> {
    return new TemplateRef_(parentView, def);
  }
  createDebugContext(view: ViewData, nodeIndex: number): DebugContext {
    return new DebugContext_(view, nodeIndex);
  }
}

class ViewContainerRef_ implements ViewContainerRef {
  constructor(private _data: ElementData) {}

  get element(): ElementRef { return <ElementRef>unimplemented(); }

  get injector(): Injector { return <Injector>unimplemented(); }

  get parentInjector(): Injector { return <Injector>unimplemented(); }

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
    return unimplemented();
  }

  insert(viewRef: ViewRef, index?: number): ViewRef {
    const viewData = (<ViewRef_>viewRef)._view;
    attachEmbeddedView(this._data, index, viewData);
    return viewRef;
  }

  move(viewRef: ViewRef, currentIndex: number): ViewRef { return unimplemented(); }

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

  get destroyed(): boolean { return this._view.state === ViewState.Destroyed; }

  markForCheck(): void { this.reattach(); }
  detach(): void {
    if (this._view.state === ViewState.ChecksEnabled) {
      this._view.state = ViewState.ChecksDisabled;
    }
  }
  detectChanges(): void {
    if (this._view.state !== ViewState.FirstCheck) {
      checkAndUpdateView(this._view);
    }
  }
  checkNoChanges(): void {
    if (this._view.state !== ViewState.FirstCheck) {
      checkNoChangesView(this._view);
    }
  }

  reattach(): void {
    if (this._view.state === ViewState.ChecksDisabled) {
      this._view.state = ViewState.ChecksEnabled;
    }
  }
  onDestroy(callback: Function) { unimplemented(); }

  destroy() { unimplemented(); }
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
  get injector(): Injector { return createInjector(this.view, this.elDef.index); }
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