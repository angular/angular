import {PromiseWrapper} from 'angular2/src/facade/async';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {isBlank, isPresent} from 'angular2/src/facade/lang';

import {
  Directive,
  Attribute,
  DynamicComponentLoader,
  ComponentRef,
  ElementRef,
  Injector,
  provide,
  Dependency,
  OnDestroy
} from 'angular2/core';

import * as routerMod from '../router';
import {ComponentInstruction, RouteParams, RouteData} from '../instruction';
import * as hookMod from '../lifecycle/lifecycle_annotations';
import {hasLifecycleHook} from '../lifecycle/route_lifecycle_reflector';
import {OnActivate, CanReuse, OnReuse, OnDeactivate, CanDeactivate} from '../interfaces';

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
export class RouterOutlet implements OnDestroy {
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
   * This method in turn is responsible for calling the `routerOnActivate` hook of its child.
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
          if (hasLifecycleHook(hookMod.routerOnActivate, componentType)) {
            return (<OnActivate>this._componentRef.instance)
                .routerOnActivate(nextInstruction, previousInstruction);
          }
        });
  }

  /**
   * Called by the {@link Router} during the commit phase of a navigation when an outlet
   * reuses a component between different routes.
   * This method in turn is responsible for calling the `routerOnReuse` hook of its child.
   */
  reuse(nextInstruction: ComponentInstruction): Promise<any> {
    var previousInstruction = this._currentInstruction;
    this._currentInstruction = nextInstruction;

    // it's possible the component is removed before it can be reactivated (if nested withing
    // another dynamically loaded component, for instance). In that case, we simply activate
    // a new one.
    if (isBlank(this._componentRef)) {
      return this.activate(nextInstruction);
    }
    return PromiseWrapper.resolve(
        hasLifecycleHook(hookMod.routerOnReuse, this._currentInstruction.componentType) ?
            (<OnReuse>this._componentRef.instance)
                .routerOnReuse(nextInstruction, previousInstruction) :
            true);
  }

  /**
   * Called by the {@link Router} when an outlet disposes of a component's contents.
   * This method in turn is responsible for calling the `routerOnDeactivate` hook of its child.
   */
  deactivate(nextInstruction: ComponentInstruction): Promise<any> {
    var next = _resolveToTrue;
    if (isPresent(this._componentRef) && isPresent(this._currentInstruction) &&
        hasLifecycleHook(hookMod.routerOnDeactivate, this._currentInstruction.componentType)) {
      next = <Promise<boolean>>PromiseWrapper.resolve(
          (<OnDeactivate>this._componentRef.instance)
              .routerOnDeactivate(nextInstruction, this._currentInstruction));
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
   * This method delegates to the child component's `routerCanDeactivate` hook if it exists,
   * and otherwise resolves to true.
   */
  routerCanDeactivate(nextInstruction: ComponentInstruction): Promise<boolean> {
    if (isBlank(this._currentInstruction)) {
      return _resolveToTrue;
    }
    if (hasLifecycleHook(hookMod.routerCanDeactivate, this._currentInstruction.componentType)) {
      return <Promise<boolean>>PromiseWrapper.resolve(
          (<CanDeactivate>this._componentRef.instance)
              .routerCanDeactivate(nextInstruction, this._currentInstruction));
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
   * Otherwise, this method delegates to the child component's `routerCanReuse` hook if it exists,
   * or resolves to true if the hook is not present.
   */
  routerCanReuse(nextInstruction: ComponentInstruction): Promise<boolean> {
    var result;

    if (isBlank(this._currentInstruction) ||
        this._currentInstruction.componentType != nextInstruction.componentType) {
      result = false;
    } else if (hasLifecycleHook(hookMod.routerCanReuse, this._currentInstruction.componentType)) {
      result = (<CanReuse>this._componentRef.instance)
                   .routerCanReuse(nextInstruction, this._currentInstruction);
    } else {
      result = nextInstruction == this._currentInstruction ||
               (isPresent(nextInstruction.params) && isPresent(this._currentInstruction.params) &&
                StringMapWrapper.equals(nextInstruction.params, this._currentInstruction.params));
    }
    return <Promise<boolean>>PromiseWrapper.resolve(result);
  }

  ngOnDestroy(): void { this._parentRouter.unregisterPrimaryOutlet(this); }
}
