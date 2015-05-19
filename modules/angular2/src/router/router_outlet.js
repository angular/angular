import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {isBlank, isPresent} from 'angular2/src/facade/lang';

import {Directive} from 'angular2/src/core/annotations_impl/annotations';
import {Attribute} from 'angular2/src/core/annotations_impl/di';
import {DynamicComponentLoader, ComponentRef, ElementRef} from 'angular2/core';
import {Injector, bind} from 'angular2/di';

import * as routerMod from './router';
import {Instruction, RouteParams} from './instruction'


/**
 * A router outlet is a placeholder that Angular dynamically fills based on the application's route.
 *
 * ## Use
 *
 * ```
 * <router-outlet></router-outlet>
 * ```
 *
 * Route outlets can also optionally have a name:
 *
 * ```
 * <router-outlet name="side"></router-outlet>
 * <router-outlet name="main"></router-outlet>
 * ```
 *
 */
@Directive({
  selector: 'router-outlet'
})
export class RouterOutlet {
  _injector:Injector;
  _parentRouter:routerMod.Router;
  _childRouter:routerMod.Router;
  _loader:DynamicComponentLoader;
  _componentRef:ComponentRef;
  _elementRef:ElementRef;
  _currentInstruction:Instruction;

  constructor(elementRef:ElementRef, loader:DynamicComponentLoader, router:routerMod.Router, injector:Injector, @Attribute('name') nameAttr:String) {
    if (isBlank(nameAttr)) {
      nameAttr = 'default';
    }
    this._loader = loader;
    this._parentRouter = router;
    this._elementRef = elementRef;
    this._injector = injector;

    this._childRouter = null;
    this._componentRef = null;
    this._currentInstruction = null;
    this._parentRouter.registerOutlet(this, nameAttr);
  }

  /**
   * Given an instruction, update the contents of this viewport.
   */
  activate(instruction:Instruction): Promise {
    // if we're able to reuse the component, we just have to pass along the instruction to the component's router
    // so it can propagate changes to its children
    if ((instruction == this._currentInstruction) || instruction.reuse && isPresent(this._childRouter)) {
      return this._childRouter.commit(instruction);
    }

    this._currentInstruction = instruction;
    this._childRouter = this._parentRouter.childRouter(instruction.component);
    var outletInjector = this._injector.resolveAndCreateChild([
      bind(RouteParams).toValue(new RouteParams(instruction.params)),
      bind(routerMod.Router).toValue(this._childRouter)
    ]);

    if (isPresent(this._componentRef)) {
      this._componentRef.dispose();
    }

    return this._loader.loadNextToExistingLocation(instruction.component, this._elementRef, outletInjector).then((componentRef) => {
      this._componentRef = componentRef;
      return this._childRouter.commit(instruction);
    });
  }

  deactivate():Promise {
    return (isPresent(this._childRouter) ? this._childRouter.deactivate() : PromiseWrapper.resolve(true))
        .then((_) =>this._componentRef.dispose());
  }

  canDeactivate(instruction:Instruction): Promise<boolean> {
    // TODO: how to get ahold of the component instance here?
    return PromiseWrapper.resolve(true);
  }
}
