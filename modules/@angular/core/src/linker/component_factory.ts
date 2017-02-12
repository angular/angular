/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef} from '../change_detection/change_detection';
import {Injector} from '../di/injector';
import {Type} from '../type';

import {ElementRef} from './element_ref';
import {AppView} from './view';
import {ViewRef} from './view_ref';
import {ViewUtils} from './view_utils';



/**
 * Represents an instance of a Component created via a {@link ComponentFactory}.
 *
 * `ComponentRef` provides access to the Component Instance as well other objects related to this
 * Component Instance and allows you to destroy the Component Instance via the {@link #destroy}
 * method.
 * @stable
 */
export abstract class ComponentRef<C> {
  /**
   * Location of the Host Element of this Component Instance.
   */
  abstract get location(): ElementRef;

  /**
   * The injector on which the component instance exists.
   */
  abstract get injector(): Injector;

  /**
   * The instance of the Component.
   */
  abstract get instance(): C;

  /**
   * The {@link ViewRef} of the Host View of this Component instance.
   */
  abstract get hostView(): ViewRef;

  /**
   * The {@link ChangeDetectorRef} of the Component instance.
   */
  abstract get changeDetectorRef(): ChangeDetectorRef;

  /**
   * The component type.
   */
  abstract get componentType(): Type<any>;

  /**
   * Destroys the component instance and all of the data structures associated with it.
   */
  abstract destroy(): void;

  /**
   * Allows to register a callback that will be called when the component is destroyed.
   */
  abstract onDestroy(callback: Function): void;
}

/**
 * workaround https://github.com/angular/tsickle/issues/350
 * @suppress {checkTypes}
 */
export class ComponentRef_<C> extends ComponentRef<C> {
  constructor(
      private _index: number, private _parentView: AppView<any>, private _nativeElement: any,
      private _component: C) {
    super();
  }
  get location(): ElementRef { return new ElementRef(this._nativeElement); }
  get injector(): Injector { return this._parentView.injector(this._index); }
  get instance(): C { return this._component; };
  get hostView(): ViewRef { return this._parentView.ref; };
  get changeDetectorRef(): ChangeDetectorRef { return this._parentView.ref; };
  get componentType(): Type<any> { return <any>this._component.constructor; }

  destroy(): void { this._parentView.detachAndDestroy(); }
  onDestroy(callback: Function): void { this.hostView.onDestroy(callback); }
}

/**
 * @stable
 */
export class ComponentFactory<C> {
  /** @internal */
  _viewClass: Type<AppView<any>>;
  constructor(
      public selector: string, _viewClass: Type<AppView<any>>, public componentType: Type<any>) {
    this._viewClass = _viewClass;
  }

  /**
   * Creates a new component.
   */
  create(
      injector: Injector, projectableNodes: any[][] = null,
      rootSelectorOrNode: string|any = null): ComponentRef<C> {
    const vu: ViewUtils = injector.get(ViewUtils);
    if (!projectableNodes) {
      projectableNodes = [];
    }
    const hostView: AppView<any> = new this._viewClass(vu, null, null, null);
    return hostView.createHostView(rootSelectorOrNode, injector, projectableNodes);
  }
}
