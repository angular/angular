import {Promise, PromiseWrapper} from 'angular2/src/core/facade/async';
import {StringMapWrapper} from 'angular2/src/core/facade/collection';
import {isBlank, isPresent, BaseException} from 'angular2/src/core/facade/lang';

import {Directive, Attribute} from '../core/metadata';
import {DynamicComponentLoader, ComponentRef, ElementRef} from 'angular2/core';
import {Injector, bind, Dependency, UNDEFINED} from 'angular2/di';

import * as routerMod from './router';
import {ComponentInstruction, RouteParams} from './instruction';
import {ROUTE_DATA} from './route_data';
import * as hookMod from './lifecycle_annotations';
import {hasLifecycleHook} from './route_lifecycle_reflector';

let _resolveToTrue = PromiseWrapper.resolve(true);

/**
 * A router outlet is a placeholder that Angular dynamically fills based on the application's route.
 *
 * ## Use
 *
 * ```
 * <router-outlet></router-outlet>
 * ```
 */
@Directive({selector: 'router-outlet'})
export class RouterOutlet {
  name: string = null;

  private _componentRef: ComponentRef = null;
  private _currentInstruction: ComponentInstruction = null;

  constructor(private _elementRef: ElementRef, private _loader: DynamicComponentLoader,
              private _parentRouter: routerMod.Router, @Attribute('name') nameAttr: string) {
    if (isPresent(nameAttr)) {
      this.name = nameAttr;
      this._parentRouter.registerAuxOutlet(this);
    } else {
      this._parentRouter.registerPrimaryOutlet(this);
    }
  }

  activate(nextInstruction: ComponentInstruction): Promise<any> {
    var previousInstruction = this._currentInstruction;
    this._currentInstruction = nextInstruction;
    var componentType = nextInstruction.componentType;
    var childRouter = this._parentRouter.childRouter(componentType);

    var bindings = Injector.resolve([
      bind(ROUTE_DATA)
          .toValue(nextInstruction.routeData()),
      bind(RouteParams).toValue(new RouteParams(nextInstruction.params)),
      bind(routerMod.Router).toValue(childRouter)
    ]);
    return this._loader.loadNextToLocation(componentType, this._elementRef, bindings)
        .then((componentRef) => {
          this._componentRef = componentRef;
          if (hasLifecycleHook(hookMod.onActivate, componentType)) {
            return this._componentRef.instance.onActivate(nextInstruction, previousInstruction);
          }
        });
  }

  reuse(nextInstruction: ComponentInstruction): Promise<any> {
    var previousInstruction = this._currentInstruction;
    this._currentInstruction = nextInstruction;

    if (isBlank(this._componentRef)) {
      throw new BaseException(`Cannot reuse an outlet that does not contain a component.`);
    }
    return PromiseWrapper.resolve(
        hasLifecycleHook(hookMod.onReuse, this._currentInstruction.componentType) ?
            this._componentRef.instance.onReuse(nextInstruction, previousInstruction) :
            true);
  }

  deactivate(nextInstruction: ComponentInstruction): Promise<any> {
    var next = _resolveToTrue;
    if (isPresent(this._componentRef) && isPresent(this._currentInstruction) &&
        hasLifecycleHook(hookMod.onDeactivate, this._currentInstruction.componentType)) {
      next = PromiseWrapper.resolve(
          this._componentRef.instance.onDeactivate(nextInstruction, this._currentInstruction));
    }
    return next.then((_) => {
      if (isPresent(this._componentRef)) {
        this._componentRef.dispose();
        this._componentRef = null;
      }
    });
  }

  /**
   * Called by Router during recognition phase
   */
  canDeactivate(nextInstruction: ComponentInstruction): Promise<boolean> {
    if (isBlank(this._currentInstruction)) {
      return _resolveToTrue;
    }
    if (hasLifecycleHook(hookMod.canDeactivate, this._currentInstruction.componentType)) {
      return PromiseWrapper.resolve(
          this._componentRef.instance.canDeactivate(nextInstruction, this._currentInstruction));
    }
    return _resolveToTrue;
  }


  /**
   * Called by Router during recognition phase
   */
  canReuse(nextInstruction: ComponentInstruction): Promise<boolean> {
    var result;

    if (isBlank(this._currentInstruction) ||
        this._currentInstruction.componentType != nextInstruction.componentType) {
      result = false;
    } else if (hasLifecycleHook(hookMod.canReuse, this._currentInstruction.componentType)) {
      result = this._componentRef.instance.canReuse(nextInstruction, this._currentInstruction);
    } else {
      result = nextInstruction == this._currentInstruction ||
               (isPresent(nextInstruction.params) && isPresent(this._currentInstruction.params) &&
                StringMapWrapper.equals(nextInstruction.params, this._currentInstruction.params));
    }
    return PromiseWrapper.resolve(result);
  }
}
