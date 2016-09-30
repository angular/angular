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
import {AppElement} from './element';
import {ElementRef} from './element_ref';
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
  constructor(private _hostElement: AppElement, private _componentType: Type<any>) { super(); }
  get location(): ElementRef { return this._hostElement.elementRef; }
  get injector(): Injector { return this._hostElement.injector; }
  get instance(): C { return this._hostElement.component; };
  get hostView(): ViewRef { return this._hostElement.parentView.ref; };
  get changeDetectorRef(): ChangeDetectorRef { return this._hostElement.parentView.ref; };
  get componentType(): Type<any> { return this._componentType; }

  destroy(): void { this._hostElement.parentView.destroy(); }
  onDestroy(callback: Function): void { this.hostView.onDestroy(callback); }
}

/**
 * @experimental
 */
const EMPTY_CONTEXT = new Object();

/**
 * @stable
 */
export class ComponentFactory<C> {
  constructor(
      public selector: string, private _viewFactory: Function, private _componentType: Type<any>) {}

  get componentType(): Type<any> { return this._componentType; }

  /**
   * Creates a new component.
   */
  create(
      injector: Injector, projectableNodes: any[][] = null,
      rootSelectorOrNode: string|any = null): ComponentRef<C> {
    var vu: ViewUtils = injector.get(ViewUtils);
    if (!projectableNodes) {
      projectableNodes = [];
    }
    // Note: Host views don't need a declarationAppElement!
    var hostView = this._viewFactory(vu, injector, null);
    var hostElement = hostView.create(EMPTY_CONTEXT, projectableNodes, rootSelectorOrNode);
    return new ComponentRef_<C>(hostElement, this._componentType);
  }
}
