/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef} from '../change_detection/change_detection';
import {Injector} from '../di/injector';
import {unimplemented} from '../facade/errors';
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
  get location(): ElementRef { return unimplemented(); }

  /**
   * The injector on which the component instance exists.
   */
  get injector(): Injector { return unimplemented(); }

  /**
   * The instance of the Component.
   */
  get instance(): C { return unimplemented(); };

  /**
   * The {@link ViewRef} of the Host View of this Component instance.
   */
  get hostView(): ViewRef { return unimplemented(); };

  /**
   * The {@link ChangeDetectorRef} of the Component instance.
   */
  get changeDetectorRef(): ChangeDetectorRef { return unimplemented(); }

  /**
   * The component type.
   */
  get componentType(): Type<any> { return unimplemented(); }

  /**
   * Destroys the component instance and all of the data structures associated with it.
   */
  abstract destroy(): void;

  /**
   * Allows to register a callback that will be called when the component is destroyed.
   */
  abstract onDestroy(callback: Function): void;
}

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
      public selector: string, _viewClass: Type<AppView<any>>, private _componentType: Type<any>) {
    this._viewClass = _viewClass;
  }

  get componentType(): Type<any> { return this._componentType; }

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
