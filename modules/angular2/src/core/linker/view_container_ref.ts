import {ListWrapper} from 'angular2/src/facade/collection';
import {unimplemented} from 'angular2/src/facade/exceptions';
import {Injector, Injector_, ProtoInjector} from 'angular2/src/core/di/injector';
import {ResolvedProvider} from 'angular2/src/core/di/provider';
import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {wtfCreateScope, wtfLeave, WtfScopeFn} from '../profile/profile';

import {AppElement} from './element';

import {ElementRef, ElementRef_} from './element_ref';
import {TemplateRef, TemplateRef_} from './template_ref';
import {
  EmbeddedViewRef,
  HostViewRef,
  HostViewFactoryRef,
  HostViewFactoryRef_,
  ViewRef,
  ViewRef_
} from './view_ref';
import {AppView} from './view';

/**
 * Represents a container where one or more Views can be attached.
 *
 * The container can contain two kinds of Views. Host Views, created by instantiating a
 * {@link Component} via {@link #createHostView}, and Embedded Views, created by instantiating an
 * {@link TemplateRef Embedded Template} via {@link #createEmbeddedView}.
 *
 * The location of the View Container within the containing View is specified by the Anchor
 * `element`. Each View Container can have only one Anchor Element and each Anchor Element can only
 * have a single View Container.
 *
 * Root elements of Views attached to this container become siblings of the Anchor Element in
 * the Rendered View.
 *
 * To access a `ViewContainerRef` of an Element, you can either place a {@link Directive} injected
 * with `ViewContainerRef` on the Element, or you obtain it via
 * {@link AppViewManager#getViewContainer}.
 *
 * <!-- TODO(i): we are also considering ElementRef#viewContainer api -->
 */
export abstract class ViewContainerRef {
  /**
   * Anchor element that specifies the location of this container in the containing View.
   * <!-- TODO: rename to anchorElement -->
   */
  get element(): ElementRef { return <ElementRef>unimplemented(); }

  /**
   * Destroys all Views in this container.
   */
  abstract clear(): void;

  /**
   * Returns the {@link ViewRef} for the View located in this container at the specified index.
   */
  abstract get(index: number): ViewRef;

  /**
   * Returns the number of Views currently attached to this container.
   */
  get length(): number { return <number>unimplemented(); };

  /**
   * Instantiates an Embedded View based on the {@link TemplateRef `templateRef`} and inserts it
   * into this container at the specified `index`.
   *
   * If `index` is not specified, the new View will be inserted as the last View in the container.
   *
   * Returns the {@link ViewRef} for the newly created View.
   */
  abstract createEmbeddedView(templateRef: TemplateRef, index?: number): EmbeddedViewRef;

  /**
   * Instantiates a single {@link Component} and inserts its Host View into this container at the
   * specified `index`.
   *
   * The component is instantiated using its {@link ProtoViewRef `protoView`} which can be
   * obtained via {@link Compiler#compileInHost}.
   *
   * If `index` is not specified, the new View will be inserted as the last View in the container.
   *
   * You can optionally specify `dynamicallyCreatedProviders`, which configure the {@link Injector}
   * that will be created for the Host View.
   *
   * Returns the {@link HostViewRef} of the Host View created for the newly instantiated Component.
   */
  abstract createHostView(hostViewFactoryRef: HostViewFactoryRef, index?: number,
                          dynamicallyCreatedProviders?: ResolvedProvider[],
                          projectableNodes?: any[][]): HostViewRef;

  /**
   * Inserts a View identified by a {@link ViewRef} into the container at the specified `index`.
   *
   * If `index` is not specified, the new View will be inserted as the last View in the container.
   *
   * Returns the inserted {@link ViewRef}.
   */
  abstract insert(viewRef: ViewRef, index?: number): ViewRef;

  /**
   * Returns the index of the View, specified via {@link ViewRef}, within the current container or
   * `-1` if this container doesn't contain the View.
   */
  abstract indexOf(viewRef: ViewRef): number;

  /**
   * Destroys a View attached to this container at the specified `index`.
   *
   * If `index` is not specified, the last View in the container will be removed.
   */
  abstract remove(index?: number): void;

  /**
   * Use along with {@link #insert} to move a View within the current container.
   *
   * If the `index` param is omitted, the last {@link ViewRef} is detached.
   */
  abstract detach(index?: number): ViewRef;
}

export class ViewContainerRef_ implements ViewContainerRef {
  constructor(private _element: AppElement) {}

  get(index: number): EmbeddedViewRef { return this._element.nestedViews[index].ref; }
  get length(): number {
    var views = this._element.nestedViews;
    return isPresent(views) ? views.length : 0;
  }

  get element(): ElementRef { return this._element.ref; }

  /** @internal */
  _createEmbeddedViewInContainerScope: WtfScopeFn =
      wtfCreateScope('ViewContainerRef#createEmbeddedView()');

  // TODO(rado): profile and decide whether bounds checks should be added
  // to the methods below.
  createEmbeddedView(templateRef: TemplateRef, index: number = -1): EmbeddedViewRef {
    var s = this._createEmbeddedViewInContainerScope();
    if (index == -1) index = this.length;
    var templateRef_ = (<TemplateRef_>templateRef);
    var view: AppView<any> = templateRef_.createEmbeddedView();
    this._element.attachView(view, index);
    return wtfLeave(s, view.ref);
  }

  /** @internal */
  _createHostViewInContainerScope: WtfScopeFn = wtfCreateScope('ViewContainerRef#createHostView()');

  createHostView(hostViewFactoryRef: HostViewFactoryRef, index: number = -1,
                 dynamicallyCreatedProviders: ResolvedProvider[] = null,
                 projectableNodes: any[][] = null): HostViewRef {
    var s = this._createHostViewInContainerScope();
    if (index == -1) index = this.length;
    var contextEl = this._element;
    var contextInjector = this._element.parentInjector;

    var hostViewFactory = (<HostViewFactoryRef_>hostViewFactoryRef).internalHostViewFactory;

    var childInjector =
        isPresent(dynamicallyCreatedProviders) && dynamicallyCreatedProviders.length > 0 ?
            new Injector_(ProtoInjector.fromResolvedProviders(dynamicallyCreatedProviders),
                          contextInjector) :
            contextInjector;

    var view =
        hostViewFactory.viewFactory(contextEl.parentView.viewManager, childInjector, contextEl);
    view.create(projectableNodes, null);
    this._element.attachView(view, index);
    return wtfLeave(s, view.ref);
  }

  /** @internal */
  _insertScope = wtfCreateScope('ViewContainerRef#insert()');

  // TODO(i): refactor insert+remove into move
  insert(viewRef: ViewRef, index: number = -1): ViewRef {
    var s = this._insertScope();
    if (index == -1) index = this.length;
    var viewRef_ = <ViewRef_>viewRef;
    this._element.attachView(viewRef_.internalView, index);
    return wtfLeave(s, viewRef_);
  }

  indexOf(viewRef: ViewRef): number {
    return ListWrapper.indexOf(this._element.nestedViews, (<ViewRef_>viewRef).internalView);
  }

  /** @internal */
  _removeScope = wtfCreateScope('ViewContainerRef#remove()');

  // TODO(i): rename to destroy
  remove(index: number = -1): void {
    var s = this._removeScope();
    if (index == -1) index = this.length - 1;
    var view = this._element.detachView(index);
    view.destroy();
    // view is intentionally not returned to the client.
    wtfLeave(s);
  }

  /** @internal */
  _detachScope = wtfCreateScope('ViewContainerRef#detach()');

  // TODO(i): refactor insert+remove into move
  detach(index: number = -1): ViewRef {
    var s = this._detachScope();
    if (index == -1) index = this.length - 1;
    var view = this._element.detachView(index);
    return wtfLeave(s, view.ref);
  }

  clear() {
    for (var i = this.length - 1; i >= 0; i--) {
      this.remove(i);
    }
  }
}
