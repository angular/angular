import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {isBlank, isPresent} from 'angular2/src/facade/lang';

import {Directive, Attribute} from 'angular2/src/core/annotations/decorators';
import {DynamicComponentLoader, ComponentRef, ElementRef} from 'angular2/core';
import {Injector, bind, Dependency, undefinedValue} from 'angular2/di';

import * as routerMod from './router';
import {Instruction, RouteParams} from './instruction';
import * as hookMod from './lifecycle_annotations';
import {hasLifecycleHook} from './route_lifecycle_reflector';

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
  childRouter: routerMod.Router = null;

  private _componentRef: ComponentRef = null;
  private _currentInstruction: Instruction = null;

  constructor(private _elementRef: ElementRef, private _loader: DynamicComponentLoader,
              private _parentRouter: routerMod.Router, @Attribute('name') nameAttr: string) {
    // TODO: reintroduce with new // sibling routes
    // if (isBlank(nameAttr)) {
    //  nameAttr = 'default';
    //}
    this._parentRouter.registerOutlet(this);
  }

  /**
   * Given an instruction, update the contents of this outlet.
   */
  commit(instruction: Instruction): Promise<any> {
    var next;
    if (instruction.reuse) {
      next = this._reuse(instruction);
    } else {
      next = this.deactivate(instruction).then((_) => this._activate(instruction));
    }
    return next.then((_) => this._commitChild(instruction));
  }

  private _commitChild(instruction: Instruction): Promise<any> {
    if (isPresent(this.childRouter)) {
      return this.childRouter.commit(instruction.child);
    } else {
      return PromiseWrapper.resolve(true);
    }
  }

  private _activate(instruction: Instruction): Promise<any> {
    var previousInstruction = this._currentInstruction;
    this._currentInstruction = instruction;
    this.childRouter = this._parentRouter.childRouter(instruction.component);

    var bindings = Injector.resolve([
      bind(RouteParams)
          .toValue(new RouteParams(instruction.params())),
      bind(routerMod.Router).toValue(this.childRouter)
    ]);
    return this._loader.loadNextToLocation(instruction.component, this._elementRef, bindings)
        .then((componentRef) => {
          this._componentRef = componentRef;
          if (hasLifecycleHook(hookMod.onActivate, instruction.component)) {
            return this._componentRef.instance.onActivate(instruction, previousInstruction);
          }
        });
  }


  /**
   * Called by Router during recognition phase
   */
  canDeactivate(nextInstruction: Instruction): Promise<boolean> {
    if (isBlank(this._currentInstruction)) {
      return PromiseWrapper.resolve(true);
    }
    if (hasLifecycleHook(hookMod.canDeactivate, this._currentInstruction.component)) {
      return PromiseWrapper.resolve(
          this._componentRef.instance.canDeactivate(nextInstruction, this._currentInstruction));
    }
    return PromiseWrapper.resolve(true);
  }


  /**
   * Called by Router during recognition phase
   */
  canReuse(nextInstruction: Instruction): Promise<boolean> {
    var result;
    if (isBlank(this._currentInstruction) ||
        this._currentInstruction.component != nextInstruction.component) {
      result = false;
    } else if (hasLifecycleHook(hookMod.canReuse, this._currentInstruction.component)) {
      result = this._componentRef.instance.canReuse(nextInstruction, this._currentInstruction);
    } else {
      result = nextInstruction == this._currentInstruction ||
               StringMapWrapper.equals(nextInstruction.params(), this._currentInstruction.params());
    }
    return PromiseWrapper.resolve(result);
  }


  private _reuse(instruction): Promise<any> {
    var previousInstruction = this._currentInstruction;
    this._currentInstruction = instruction;
    return PromiseWrapper.resolve(
        hasLifecycleHook(hookMod.onReuse, this._currentInstruction.component) ?
            this._componentRef.instance.onReuse(instruction, previousInstruction) :
            true);
  }



  deactivate(nextInstruction: Instruction): Promise<any> {
    return (isPresent(this.childRouter) ?
                this.childRouter.deactivate(isPresent(nextInstruction) ? nextInstruction.child :
                                                                         null) :
                PromiseWrapper.resolve(true))
        .then((_) => {
          if (isPresent(this._componentRef) && isPresent(this._currentInstruction) &&
              hasLifecycleHook(hookMod.onDeactivate, this._currentInstruction.component)) {
            return this._componentRef.instance.onDeactivate(nextInstruction,
                                                            this._currentInstruction);
          }
        })
        .then((_) => {
          if (isPresent(this._componentRef)) {
            this._componentRef.dispose();
            this._componentRef = null;
          }
        });
  }
}
