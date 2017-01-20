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

import {NodeData, NodeDef, Services, ViewData, ViewDefinition} from './types';
import {checkAndUpdateView, checkNoChangesView, createEmbeddedView, destroyView} from './view';
import {attachEmbeddedView, detachEmbeddedView, rootRenderNodes} from './view_attach';

@Injectable()
export class DefaultServices implements Services {
  constructor(private _rootRenderer: RootRenderer, private _sanitizer: Sanitizer) {}

  renderComponent(rcp: RenderComponentType): Renderer {
    return this._rootRenderer.renderComponent(rcp);
  }
  sanitize(context: SecurityContext, value: string): string {
    return this._sanitizer.sanitize(context, value);
  }
  // Note: This needs to be here to prevent a cycle in source files.
  createViewContainerRef(data: NodeData): ViewContainerRef { return new ViewContainerRef_(data); }
  // Note: This needs to be here to prevent a cycle in source files.
  createTemplateRef(parentView: ViewData, def: NodeDef): TemplateRef<any> {
    return new TemplateRef_(parentView, def);
  }
}

class ViewContainerRef_ implements ViewContainerRef {
  constructor(private _data: NodeData) {}

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

  get destroyed(): boolean { return unimplemented(); }

  markForCheck(): void { unimplemented(); }
  detach(): void { unimplemented(); }
  detectChanges(): void { checkAndUpdateView(this._view); }
  checkNoChanges(): void { checkNoChangesView(this._view); }
  reattach(): void { unimplemented(); }
  onDestroy(callback: Function) { unimplemented(); }

  destroy() { unimplemented(); }
}

class TemplateRef_ implements TemplateRef<any> {
  constructor(private _parentView: ViewData, private _def: NodeDef) {}

  createEmbeddedView(context: any): EmbeddedViewRef<any> {
    return new ViewRef_(createEmbeddedView(this._parentView, this._def, context));
  }

  get elementRef(): ElementRef {
    return new ElementRef(this._parentView.nodes[this._def.index].renderNode);
  }
}
