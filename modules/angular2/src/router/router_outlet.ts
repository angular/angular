import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {isBlank, isPresent} from 'angular2/src/facade/lang';

import {Directive, Attribute} from 'angular2/src/core/annotations/decorators';
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
 */
@Directive({
  selector: 'router-outlet'
})
export class RouterOutlet {
  private _childRouter: routerMod.Router;
  private _componentRef: ComponentRef;
  private _elementRef: ElementRef;
  private _currentInstruction: Instruction;

  constructor(elementRef: ElementRef, private _loader: DynamicComponentLoader,
              private _parentRouter: routerMod.Router, private _injector: Injector,
              @Attribute('name') nameAttr: string) {
    // TODO: reintroduce with new // sibling routes
    // if (isBlank(nameAttr)) {
    //  nameAttr = 'default';
    //}

    this._elementRef = elementRef;

    this._childRouter = null;
    this._componentRef = null;
    this._currentInstruction = null;
    this._parentRouter.registerOutlet(this);
  }

  /**
   * Given an instruction, update the contents of this outlet.
   */
  activate(instruction: Instruction): Promise<any> {
    // if we're able to reuse the component, we just have to pass along the instruction to the
    // component's router
    // so it can propagate changes to its children
    if ((instruction == this._currentInstruction || instruction.reuse) &&
        isPresent(this._childRouter)) {
      return this._childRouter.commit(instruction.child);
    }

    this._currentInstruction = instruction;
    this._childRouter = this._parentRouter.childRouter(instruction.component);
    var outletInjector = this._injector.resolveAndCreateChild([
      bind(RouteParams)
          .toValue(new RouteParams(instruction.params)),
      bind(routerMod.Router).toValue(this._childRouter)
    ]);

    return this.deactivate()
        .then((_) => this._loader.loadNextToExistingLocation(instruction.component,
                                                             this._elementRef, outletInjector))
        .then((componentRef) => {
          this._componentRef = componentRef;
          return this._childRouter.commit(instruction.child);
        });
  }


  deactivate(): Promise<any> {
    return (isPresent(this._childRouter) ? this._childRouter.deactivate() :
                                           PromiseWrapper.resolve(true))
        .then((_) => {
          if (isPresent(this._componentRef)) {
            this._componentRef.dispose();
            this._componentRef = null;
          }
        });
  }

  canDeactivate(instruction: Instruction): Promise<boolean> {
    // TODO: how to get ahold of the component instance here?
    return PromiseWrapper.resolve(true);
  }
}
