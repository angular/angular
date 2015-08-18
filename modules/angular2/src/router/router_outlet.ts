import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {StringMapWrapper} from 'angular2/src/facade/collection';
import {isBlank, isPresent} from 'angular2/src/facade/lang';

import {Directive, Attribute} from '../core/metadata';
import {DynamicComponentLoader, ComponentRef, ElementRef} from 'angular2/core';
import {Injector, bind, Dependency, UNDEFINED} from 'angular2/di';

import * as routerMod from './router';
import {Instruction, ComponentInstruction, RouteParams, RouteData} from './instruction';
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
  name: string = null;

  private _componentRef: ComponentRef = null;
  private _currentInstruction: ComponentInstruction = null;

  constructor(private _elementRef: ElementRef, private _loader: DynamicComponentLoader,
              private _parentRouter: routerMod.Router, @Attribute('name') nameAttr: string) {
    if (isPresent(nameAttr)) {
      this.name = nameAttr;
    }
    this._parentRouter.registerOutlet(this);
  }

  /**
   * Given an instruction, update the contents of this outlet.
   */
  commit(instruction: Instruction): Promise<any> {
    instruction = this._getInstruction(instruction);
    var componentInstruction = instruction.component;
    if (isBlank(componentInstruction)) {
      return PromiseWrapper.resolve(true);
    }
    var next;
    if (componentInstruction.reuse) {
      next = this._reuse(componentInstruction);
    } else {
      next = this.deactivate(instruction).then((_) => this._activate(componentInstruction));
    }
    return next.then((_) => this._commitChild(instruction));
  }

  private _getInstruction(instruction: Instruction): Instruction {
    if (isPresent(this.name)) {
      return instruction.auxInstruction[this.name];
    } else {
      return instruction;
    }
  }

  private _commitChild(instruction: Instruction): Promise<any> {
    if (isPresent(this.childRouter)) {
      return this.childRouter.commit(instruction.child);
    } else {
      return PromiseWrapper.resolve(true);
    }
  }

  private _activate(instruction: ComponentInstruction): Promise<any> {
    var previousInstruction = this._currentInstruction;
    this._currentInstruction = instruction;
    var componentType = instruction.componentType;
    this.childRouter = this._parentRouter.childRouter(componentType);

    var bindings = Injector.resolve([
      bind(RouteData)
          .toValue(instruction.routeData()),
      bind(RouteParams).toValue(new RouteParams(instruction.params)),
      bind(routerMod.Router).toValue(this.childRouter)
    ]);
    return this._loader.loadNextToLocation(componentType, this._elementRef, bindings)
        .then((componentRef) => {
          this._componentRef = componentRef;
          if (hasLifecycleHook(hookMod.onActivate, componentType)) {
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
    var outletInstruction = this._getInstruction(nextInstruction);
    if (hasLifecycleHook(hookMod.canDeactivate, this._currentInstruction.componentType)) {
      return PromiseWrapper.resolve(this._componentRef.instance.canDeactivate(
          isPresent(outletInstruction) ? outletInstruction.component : null,
          this._currentInstruction));
    }
    return PromiseWrapper.resolve(true);
  }


  /**
   * Called by Router during recognition phase
   */
  canReuse(nextInstruction: Instruction): Promise<boolean> {
    var result;

    var outletInstruction = this._getInstruction(nextInstruction);
    var componentInstruction = outletInstruction.component;

    if (isBlank(this._currentInstruction) ||
        this._currentInstruction.componentType != componentInstruction.componentType) {
      result = false;
    } else if (hasLifecycleHook(hookMod.canReuse, this._currentInstruction.componentType)) {
      result = this._componentRef.instance.canReuse(componentInstruction, this._currentInstruction);
    } else {
      result =
          componentInstruction == this._currentInstruction ||
          (isPresent(componentInstruction.params) && isPresent(this._currentInstruction.params) &&
           StringMapWrapper.equals(componentInstruction.params, this._currentInstruction.params));
    }
    return PromiseWrapper.resolve(result).then((result) => {
      // TODO: this is a hack
      componentInstruction.reuse = result;
      return result;
    });
  }


  private _reuse(instruction: ComponentInstruction): Promise<any> {
    var previousInstruction = this._currentInstruction;
    this._currentInstruction = instruction;
    return PromiseWrapper.resolve(
        hasLifecycleHook(hookMod.onReuse, this._currentInstruction.componentType) ?
            this._componentRef.instance.onReuse(instruction, previousInstruction) :
            true);
  }



  deactivate(nextInstruction: Instruction): Promise<any> {
    var outletInstruction = this._getInstruction(nextInstruction);
    var componentInstruction = isPresent(outletInstruction) ? outletInstruction.component : null;
    return (isPresent(this.childRouter) ?
                this.childRouter.deactivate(isPresent(outletInstruction) ? outletInstruction.child :
                                                                           null) :
                PromiseWrapper.resolve(true))
        .then((_) => {
          if (isPresent(this._componentRef) && isPresent(this._currentInstruction) &&
              hasLifecycleHook(hookMod.onDeactivate, this._currentInstruction.componentType)) {
            return this._componentRef.instance.onDeactivate(componentInstruction,
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
