import {ComponentFactory, ComponentRef, ElementRef, Injector, TemplateRef, ViewContainerRef, ViewRef} from '@angular/core';

export function unimplemented(): any {
  throw new Error('unimplemented');
}

export interface FtlView<C> {
  context: C;
  detectChangesInternal(throwOnChange: boolean): void;
  createEmbeddedView?<NC>(context: NC, nodeIndex: number): FtlEmbeddedView<NC>;
  destroyInternal(): void;
}

export interface FtlEmbeddedView<C> extends FtlView<C> {
  // Note: if the view has a view container as first node,
  // create a comment node before it. This makes
  // inserting a view before this view simpler!
  _node0: any;
  prev: FtlEmbeddedView<any>;
  next: FtlEmbeddedView<any>;
  // Purpose of the `ctx` argument:
  // Allows to use top level functions, i.e. no need to create closures!
  visitRootNodes<CTX>(callback: (node: any, ctx: CTX) => void, ctx: CTX): void;
}

// TODO(tbosch): FTL EmbeddedViewRefs should have no
// methods / properties at all. Because of this we can just use the FtlView for it as well!
// TODO(tbosch): We can't cast to EmbededViewRef as that also has the `rootNodes` filled
// -> would need to generate code for that as well.
//    Rather: change API for FTL to allow to call View.attachBefore / View.detach
//    -> faster and we don't need to flatten the root nodes!
export type FtlEmbeddedViewRef<C> = FtlView<C>;

export class FtlTemplateRef<C> implements TemplateRef<C> {
  constructor(private _index: number, private _view: FtlView<any>) {}
  get elementRef(): ElementRef { return unimplemented(); }
  createEmbeddedView(context: C): any {
    return this._view.createEmbeddedView(context, this._index);
  }
}

export class FtlViewContainerRef implements ViewContainerRef {
  private _firstView: FtlEmbeddedView<any> = null;
  private _lastView: FtlEmbeddedView<any> = null;
  private _length = 0;

  constructor(private _anchor: any) {}

  detectChangesInternal(throwOnChange: boolean) {
    let view = this._firstView;
    while (view) {
      view.detectChangesInternal(throwOnChange);
      view = view.next;
    }
  }

  // TODO(tbosch): don't allow this API in FTL mode!
  get element(): ElementRef { return <ElementRef>unimplemented(); }

  // TODO(tbosch): don't allow this API in FTL mode!
  get injector(): Injector { return <Injector>unimplemented(); }

  // TODO(tbosch): don't allow this API in FTL mode!
  get parentInjector(): Injector { return <Injector>unimplemented(); }

  destroyInternal() {
    let view = this._firstView;
    while (view) {
      view.destroyInternal();
      view = view.next;
    }
  }

  clear(): void {
    let view = this._firstView;
    while (view) {
      detachView(view);
      view.destroyInternal();
      view = view.next;
    }
    this._firstView = null;
    this._lastView = null;
    this._length = 0;
  }

  get(index: number): any {
    var result = this._firstView;
    while (index > 0 && result) {
      result = result.next;
      index--;
    }
    return result;
  }

  get length(): number { return this._length; };

  createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, index?: number): any {
    const view = templateRef.createEmbeddedView(context);
    return this.insert(view, index);
  }

  createComponent<C>(
      componentFactory: ComponentFactory<C>, index?: number, injector?: Injector,
      projectableNodes?: any[][]): ComponentRef<C> {
    // TODO(tbosch): implement this!
    return unimplemented();
  }

  insert(viewRef: ViewRef, index?: number): any {
    const view: FtlEmbeddedView<any> = <any>viewRef;
    let insertBeforeNode: any;
    if (this._length === 0) {
      this._firstView = this._lastView = view;
      insertBeforeNode = this._anchor;
      view.prev = null;
      view.next = null;
    } else if (index >= this._length) {
      view.prev = this._lastView;
      view.next = null;
      this._lastView.next = view;
      this._lastView = view;
      insertBeforeNode = this._anchor;
    } else {
      // TODO(tbosch): implement this!
      unimplemented();
    }
    attachViewBefore(view, insertBeforeNode);
    this._length++;
  }

  detach(index?: number): any {
    let view: FtlEmbeddedView<any>;
    if (this._length === 1) {
      view = this._firstView;
      this._firstView = this._lastView = null;
    } else if (index >= this._length) {
      view = this._lastView;
      this._lastView = view.prev;
      view.prev = null;
      this._lastView.next = null;
    } else {
      // TODO(tbosch): implement this!
      unimplemented();
    }
    this._length--;
    detachView(view);
    return view;
  }

  move(viewRef: ViewRef, currentIndex: number): ViewRef {
    // TODO(tbosch): implement this!
    return unimplemented();
  }

  indexOf(viewRef: ViewRef): number {
    // TODO(tbosch): implement this!
    return unimplemented();
  }

  remove(index?: number): void {
    var view: FtlView<any> = <any>this.detach(index);
    view.destroyInternal();
  }
}

function attachViewBefore(view: FtlEmbeddedView<any>, node: any) {
  const parent = node.parentNode;
  view.visitRootNodes(insertBefore, {parent: parent, refNode: node});
}

function insertBefore(node: any, ctx: {parent: any, refNode: any}) {
  ctx.parent.insertBefore(node, ctx.refNode);
}

function detachView(view: FtlEmbeddedView<any>) {
  view.visitRootNodes(remove, null);
}

function remove(node: any, ctx: any) {
  node.remove();
}

export function createElementAndAppend(parent: any, name: string) {
  const el = document.createElement(name);
  parent.appendChild(el);
  return el;
}

export function createTextAndAppend(parent: any) {
  const txt = document.createTextNode('');
  parent.appendChild(txt);
  return txt;
}

export function createAnchorAndAppend(parent: any) {
  const txt = document.createComment('');
  parent.appendChild(txt);
  return txt;
}