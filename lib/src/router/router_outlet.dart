library angular2.src.router.router_outlet;

import "package:angular2/src/facade/async.dart" show Future, PromiseWrapper;
import "package:angular2/src/facade/collection.dart" show StringMapWrapper;
import "package:angular2/src/facade/lang.dart" show isBlank, isPresent;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "package:angular2/angular2.dart"
    show
        Directive,
        Attribute,
        DynamicComponentLoader,
        ComponentRef,
        ElementRef,
        Injector,
        provide,
        Dependency;
import "router.dart" as routerMod;
import "instruction.dart" show ComponentInstruction, RouteParams, RouteData;
import "lifecycle_annotations.dart" as hookMod;
import "route_lifecycle_reflector.dart" show hasLifecycleHook;

var _resolveToTrue = PromiseWrapper.resolve(true);

/**
 * A router outlet is a placeholder that Angular dynamically fills based on the application's route.
 *
 * ## Use
 *
 * ```
 * <router-outlet></router-outlet>
 * ```
 */
@Directive(selector: "router-outlet")
class RouterOutlet {
  ElementRef _elementRef;
  DynamicComponentLoader _loader;
  routerMod.Router _parentRouter;
  String name = null;
  ComponentRef _componentRef = null;
  ComponentInstruction _currentInstruction = null;
  RouterOutlet(this._elementRef, this._loader, this._parentRouter,
      @Attribute("name") String nameAttr) {
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
  Future<dynamic> activate(ComponentInstruction nextInstruction) {
    var previousInstruction = this._currentInstruction;
    this._currentInstruction = nextInstruction;
    var componentType = nextInstruction.componentType;
    var childRouter = this._parentRouter.childRouter(componentType);
    var providers = Injector.resolve([
      provide(RouteData, useValue: nextInstruction.routeData),
      provide(RouteParams, useValue: new RouteParams(nextInstruction.params)),
      provide(routerMod.Router, useValue: childRouter)
    ]);
    return this
        ._loader
        .loadNextToLocation(componentType, this._elementRef, providers)
        .then((componentRef) {
      this._componentRef = componentRef;
      if (hasLifecycleHook(hookMod.onActivate, componentType)) {
        return this
            ._componentRef
            .instance
            .onActivate(nextInstruction, previousInstruction);
      }
    });
  }

  /**
   * Called by the [Router] during the commit phase of a navigation when an outlet
   * reuses a component between different routes.
   * This method in turn is responsible for calling the `onReuse` hook of its child.
   */
  Future<dynamic> reuse(ComponentInstruction nextInstruction) {
    var previousInstruction = this._currentInstruction;
    this._currentInstruction = nextInstruction;
    if (isBlank(this._componentRef)) {
      throw new BaseException(
          '''Cannot reuse an outlet that does not contain a component.''');
    }
    return PromiseWrapper.resolve(hasLifecycleHook(
            hookMod.onReuse, this._currentInstruction.componentType)
        ? this
            ._componentRef
            .instance
            .onReuse(nextInstruction, previousInstruction)
        : true);
  }

  /**
   * Called by the [Router] when an outlet disposes of a component's contents.
   * This method in turn is responsible for calling the `onDeactivate` hook of its child.
   */
  Future<dynamic> deactivate(ComponentInstruction nextInstruction) {
    var next = _resolveToTrue;
    if (isPresent(this._componentRef) &&
        isPresent(this._currentInstruction) &&
        hasLifecycleHook(
            hookMod.onDeactivate, this._currentInstruction.componentType)) {
      next = PromiseWrapper.resolve(this
          ._componentRef
          .instance
          .onDeactivate(nextInstruction, this._currentInstruction));
    }
    return next.then((_) {
      if (isPresent(this._componentRef)) {
        this._componentRef.dispose();
        this._componentRef = null;
      }
    });
  }

  /**
   * Called by the [Router] during recognition phase of a navigation.
   *
   * If this resolves to `false`, the given navigation is cancelled.
   *
   * This method delegates to the child component's `canDeactivate` hook if it exists,
   * and otherwise resolves to true.
   */
  Future<bool> canDeactivate(ComponentInstruction nextInstruction) {
    if (isBlank(this._currentInstruction)) {
      return _resolveToTrue;
    }
    if (hasLifecycleHook(
        hookMod.canDeactivate, this._currentInstruction.componentType)) {
      return PromiseWrapper.resolve(this
          ._componentRef
          .instance
          .canDeactivate(nextInstruction, this._currentInstruction));
    }
    return _resolveToTrue;
  }

  /**
   * Called by the [Router] during recognition phase of a navigation.
   *
   * If the new child component has a different Type than the existing child component,
   * this will resolve to `false`. You can't reuse an old component when the new component
   * is of a different Type.
   *
   * Otherwise, this method delegates to the child component's `canReuse` hook if it exists,
   * or resolves to true if the hook is not present.
   */
  Future<bool> canReuse(ComponentInstruction nextInstruction) {
    var result;
    if (isBlank(this._currentInstruction) ||
        this._currentInstruction.componentType !=
            nextInstruction.componentType) {
      result = false;
    } else if (hasLifecycleHook(
        hookMod.canReuse, this._currentInstruction.componentType)) {
      result = this
          ._componentRef
          .instance
          .canReuse(nextInstruction, this._currentInstruction);
    } else {
      result = nextInstruction == this._currentInstruction ||
          (isPresent(nextInstruction.params) &&
              isPresent(this._currentInstruction.params) &&
              StringMapWrapper.equals(
                  nextInstruction.params, this._currentInstruction.params));
    }
    return PromiseWrapper.resolve(result);
  }
}
