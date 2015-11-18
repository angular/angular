import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {isBlank, isPresent} from 'angular2/src/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';

import {
  Directive,
  Attribute,
  DynamicComponentLoader,
  ComponentRef,
  ElementRef,
  Injector,
  provide,
  Dependency
} from 'angular2/angular2';

import * as routerMod from './router';
import {ComponentInstruction, RouteParams, RouteData} from './instruction';
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

  /**
   * Called by the Router to instantiate a new component during the commit phase of a navigation.
   * This method in turn is responsible for calling the `onActivate` hook of its child.
   */
  activate(nextInstruction: ComponentInstruction): Promise<any> {
    var previousInstruction = this._currentInstruction;
    this._currentInstruction = nextInstruction;
    var componentType = nextInstruction.componentType;
    var childRouter = this._parentRouter.childRouter(componentType);

    var providers = Injector.resolve([
      provide(RouteData, {useValue: nextInstruction.routeData}),
      provide(RouteParams, {useValue: new RouteParams(nextInstruction.params)}),
      provide(routerMod.Router, {useValue: childRouter})
    ]);
    return this._loader.loadNextToLocation(componentType, this._elementRef, providers)
        .then((componentRef) => {
          this._componentRef = componentRef;
          if (hasLifecycleHook(hookMod.onActivate, componentType)) {
            return this._componentRef.instance.onActivate(nextInstruction, previousInstruction);
          }
        });
  }

  /**
   * Called by the {@link Router} during the commit phase of a navigation when an outlet
   * reuses a component between different routes.
   * This method in turn is responsible for calling the `onReuse` hook of its child.
   */
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

  /**
   * Called by the {@link Router} when an outlet disposes of a component's contents.
   * This method in turn is responsible for calling the `onDeactivate` hook of its child.
   */
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
   * Called by the {@link Router} during recognition phase of a navigation.
   *
   * If this resolves to `false`, the given navigation is cancelled.
   *
   * This method delegates to the child component's `canDeactivate` hook if it exists,
   * and otherwise resolves to true.
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
   * Called by the {@link Router} during recognition phase of a navigation.
   *
   * If the new child component has a different Type than the existing child component,
   * this will resolve to `false`. You can't reuse an old component when the new component
   * is of a different Type.
   *
   * Otherwise, this method delegates to the child component's `canReuse` hook if it exists,
   * or resolves to true if the hook is not present.
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
