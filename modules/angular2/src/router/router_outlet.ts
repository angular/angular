import {Promise, PromiseWrapper} from 'angular2/src/core/facade/async';
import {StringMapWrapper} from 'angular2/src/core/facade/collection';
import {isBlank, isPresent, Type} from 'angular2/src/core/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/core/facade/exceptions';

import {Directive, Attribute} from 'angular2/src/core/metadata';
import {DynamicComponentLoader, ComponentRef, ElementRef} from 'angular2/src/core/linker';
import {Injector, bind, Dependency} from 'angular2/src/core/di';

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
export abstract class RouterOutlet {
  name: string = null;

  /**
   * Called by the Router to instantiate a new component during the commit phase of a navigation.
   * This method in turn is responsible for calling the `onActivate` hook of its child.
   */
  abstract activate(nextInstruction: ComponentInstruction): Promise<any>;

  /**
   * Called by the {@link Router} during the commit phase of a navigation when an outlet
   * reuses a component between different routes.
   * This method in turn is responsible for calling the `onReuse` hook of its child.
   */
  abstract reuse(nextInstruction: ComponentInstruction): Promise<any>;

  /**
   * Called by the {@link Router} when an outlet reuses a component across navigations.
   * This method in turn is responsible for calling the `onReuse` hook of its child.
   */
  abstract deactivate(nextInstruction: ComponentInstruction): Promise<any>;

  /**
   * Called by the {@link Router} during recognition phase of a navigation.
   *
   * If this resolves to `false`, the given navigation is cancelled.
   *
   * This method delegates to the child component's `canDeactivate` hook if it exists,
   * and otherwise resolves to true.
   */
  abstract canDeactivate(nextInstruction: ComponentInstruction): Promise<boolean>;

  /**
   * Called by the {@link Router} during recognition phase of a navigation.
   *
   * If the new child component has a different Type than the existing child component,
   * this will resolve to `false`. You can't reuse an old component when the new component
   * is of a different Type.
   *
   * Otherwise, this method delegates to the child component's `canReuse` hook if it exists,
   * or resolves to true if the hook is not present.
   */
  abstract canReuse(nextInstruction: ComponentInstruction): Promise<boolean>;
}

@Directive({selector: 'router-outlet'})
export class RouterOutlet_ extends RouterOutlet {
  private _componentRef: ComponentRef = null;
  private _currentInstruction: ComponentInstruction = null;

  constructor(private _elementRef: ElementRef, private _loader: DynamicComponentLoader,
              private _parentRouter: routerMod.Router, @Attribute('name') nameAttr: string) {
    super();
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
