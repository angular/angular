/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  DoCheck,
  ElementRef,
  EventEmitter,
  Injector,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';

import {ɵangular1, ɵconstants, ɵupgradeHelper, ɵutil} from '../common';

const NOT_SUPPORTED: any = 'NOT_SUPPORTED';
const INITIAL_VALUE = {
  __UNINITIALIZED__: true,
};

class Bindings {
  twoWayBoundProperties: string[] = [];
  twoWayBoundLastValues: any[] = [];

  expressionBoundProperties: string[] = [];

  propertyToOutputMap: {[propName: string]: string} = {};
}

/**
 * @description
 *
 * A helper class that allows an AngularJS component to be used from Angular.
 *
 * *Part of the [upgrade/static](api?query=upgrade%2Fstatic)
 * library for hybrid upgrade apps that support AOT compilation.*
 *
 * This helper class should be used as a base class for creating Angular directives
 * that wrap AngularJS components that need to be "upgraded".
 *
 * @usageNotes
 * ### Examples
 *
 * Let's assume that you have an AngularJS component called `ng1Hero` that needs
 * to be made available in Angular templates.
 *
 * {@example upgrade/static/ts/full/module.ts region="ng1-hero"}
 *
 * We must create a `Directive` that will make this AngularJS component
 * available inside Angular templates.
 *
 * {@example upgrade/static/ts/full/module.ts region="ng1-hero-wrapper"}
 *
 * In this example you can see that we must derive from the `UpgradeComponent`
 * base class but also provide an {@link Directive `@Directive`} decorator. This is
 * because the AOT compiler requires that this information is statically available at
 * compile time.
 *
 * Note that we must do the following:
 * * specify the directive's selector (`ng1-hero`)
 * * specify all inputs and outputs that the AngularJS component expects
 * * derive from `UpgradeComponent`
 * * call the base class from the constructor, passing
 *   * the AngularJS name of the component (`ng1Hero`)
 *   * the `ElementRef` and `Injector` for the component wrapper
 *
 * @publicApi
 * @extensible
 */
@Directive()
export class UpgradeComponent implements OnInit, OnChanges, DoCheck, OnDestroy {
  private helper: ɵupgradeHelper.UpgradeHelper;

  private $element: ɵangular1.IAugmentedJQuery;
  private $componentScope: ɵangular1.IScope;

  private directive: ɵangular1.IDirective;
  private bindings: Bindings;

  private controllerInstance?: ɵupgradeHelper.IControllerInstance;
  private bindingDestination?: ɵupgradeHelper.IBindingDestination;

  // We will be instantiating the controller in the `ngOnInit` hook, when the
  // first `ngOnChanges` will have been already triggered. We store the
  // `SimpleChanges` and "play them back" later.
  private pendingChanges: SimpleChanges | null = null;

  private unregisterDoCheckWatcher?: Function;

  /**
   * Create a new `UpgradeComponent` instance. You should not normally need to do this.
   * Instead you should derive a new class from this one and call the super constructor
   * from the base class.
   *
   * {@example upgrade/static/ts/full/module.ts region="ng1-hero-wrapper" }
   *
   * * The `name` parameter should be the name of the AngularJS directive.
   * * The `elementRef` and `injector` parameters should be acquired from Angular by dependency
   *   injection into the base class constructor.
   */
  constructor(name: string, elementRef: ElementRef, injector: Injector) {
    this.helper = new ɵupgradeHelper.UpgradeHelper(injector, name, elementRef);

    this.$element = this.helper.$element;

    this.directive = this.helper.directive;
    this.bindings = this.initializeBindings(this.directive, name);

    // We ask for the AngularJS scope from the Angular injector, since
    // we will put the new component scope onto the new injector for each component
    const $parentScope = injector.get(ɵconstants.$SCOPE);
    // QUESTION 1: Should we create an isolated scope if the scope is only true?
    // QUESTION 2: Should we make the scope accessible through `$element.scope()/isolateScope()`?
    this.$componentScope = $parentScope.$new(!!this.directive.scope);

    this.initializeOutputs();
  }

  /** @docs-private */
  ngOnInit() {
    // Collect contents, insert and compile template
    const attachChildNodes: ɵangular1.ILinkFn | undefined = this.helper.prepareTransclusion();
    const linkFn = this.helper.compileTemplate();

    // Instantiate controller
    const controllerType = this.directive.controller;
    const bindToController = this.directive.bindToController;
    let controllerInstance = controllerType
      ? this.helper.buildController(controllerType, this.$componentScope)
      : undefined;
    let bindingDestination: ɵupgradeHelper.IBindingDestination;

    if (!bindToController) {
      bindingDestination = this.$componentScope;
    } else if (controllerType && controllerInstance) {
      bindingDestination = controllerInstance;
    } else {
      throw new Error(
        `Upgraded directive '${this.directive.name}' specifies 'bindToController' but no controller.`,
      );
    }
    this.controllerInstance = controllerInstance;
    this.bindingDestination = bindingDestination;

    // Set up outputs
    this.bindOutputs(bindingDestination);

    // Require other controllers
    const requiredControllers = this.helper.resolveAndBindRequiredControllers(controllerInstance);

    // Hook: $onChanges
    if (this.pendingChanges) {
      this.forwardChanges(this.pendingChanges, bindingDestination);
      this.pendingChanges = null;
    }

    // Hook: $onInit
    if (this.controllerInstance && ɵutil.isFunction(this.controllerInstance.$onInit)) {
      this.controllerInstance.$onInit();
    }

    // Hook: $doCheck
    if (controllerInstance && ɵutil.isFunction(controllerInstance.$doCheck)) {
      const callDoCheck = () => controllerInstance?.$doCheck?.();

      this.unregisterDoCheckWatcher = this.$componentScope.$parent.$watch(callDoCheck);
      callDoCheck();
    }

    // Linking
    const link = this.directive.link;
    const preLink = typeof link == 'object' && link.pre;
    const postLink = typeof link == 'object' ? link.post : link;
    const attrs: ɵangular1.IAttributes = NOT_SUPPORTED;
    const transcludeFn: ɵangular1.ITranscludeFunction = NOT_SUPPORTED;
    if (preLink) {
      preLink(this.$componentScope, this.$element, attrs, requiredControllers, transcludeFn);
    }

    linkFn(this.$componentScope, null!, {parentBoundTranscludeFn: attachChildNodes});

    if (postLink) {
      postLink(this.$componentScope, this.$element, attrs, requiredControllers, transcludeFn);
    }

    // Hook: $postLink
    if (this.controllerInstance && ɵutil.isFunction(this.controllerInstance.$postLink)) {
      this.controllerInstance.$postLink();
    }
  }

  /** @docs-private */
  ngOnChanges(changes: SimpleChanges) {
    if (!this.bindingDestination) {
      this.pendingChanges = changes;
    } else {
      this.forwardChanges(changes, this.bindingDestination);
    }
  }

  /** @docs-private */
  ngDoCheck() {
    const twoWayBoundProperties = this.bindings.twoWayBoundProperties;
    const twoWayBoundLastValues = this.bindings.twoWayBoundLastValues;
    const propertyToOutputMap = this.bindings.propertyToOutputMap;

    twoWayBoundProperties.forEach((propName, idx) => {
      const newValue = this.bindingDestination?.[propName];
      const oldValue = twoWayBoundLastValues[idx];

      if (!Object.is(newValue, oldValue)) {
        const outputName = propertyToOutputMap[propName];
        const eventEmitter: EventEmitter<any> = (this as any)[outputName];

        eventEmitter.emit(newValue);
        twoWayBoundLastValues[idx] = newValue;
      }
    });
  }

  /** @docs-private */
  ngOnDestroy() {
    if (ɵutil.isFunction(this.unregisterDoCheckWatcher)) {
      this.unregisterDoCheckWatcher();
    }
    this.helper.onDestroy(this.$componentScope, this.controllerInstance);
  }

  private initializeBindings(directive: ɵangular1.IDirective, name: string) {
    const btcIsObject = typeof directive.bindToController === 'object';
    if (btcIsObject && Object.keys(directive.scope!).length) {
      throw new Error(
        `Binding definitions on scope and controller at the same time is not supported.`,
      );
    }

    const context = btcIsObject ? directive.bindToController : directive.scope;
    const bindings = new Bindings();

    if (typeof context == 'object') {
      Object.keys(context).forEach((propName) => {
        const definition = context[propName];
        const bindingType = definition.charAt(0);

        // QUESTION: What about `=*`? Ignore? Throw? Support?

        switch (bindingType) {
          case '@':
          case '<':
            // We don't need to do anything special. They will be defined as inputs on the
            // upgraded component facade and the change propagation will be handled by
            // `ngOnChanges()`.
            break;
          case '=':
            bindings.twoWayBoundProperties.push(propName);
            bindings.twoWayBoundLastValues.push(INITIAL_VALUE);
            bindings.propertyToOutputMap[propName] = propName + 'Change';
            break;
          case '&':
            bindings.expressionBoundProperties.push(propName);
            bindings.propertyToOutputMap[propName] = propName;
            break;
          default:
            let json = JSON.stringify(context);
            throw new Error(
              `Unexpected mapping '${bindingType}' in '${json}' in '${name}' directive.`,
            );
        }
      });
    }

    return bindings;
  }

  private initializeOutputs() {
    // Initialize the outputs for `=` and `&` bindings
    this.bindings.twoWayBoundProperties
      .concat(this.bindings.expressionBoundProperties)
      .forEach((propName) => {
        const outputName = this.bindings.propertyToOutputMap[propName];
        (this as any)[outputName] = new EventEmitter();
      });
  }

  private bindOutputs(bindingDestination: ɵupgradeHelper.IBindingDestination) {
    // Bind `&` bindings to the corresponding outputs
    this.bindings.expressionBoundProperties.forEach((propName) => {
      const outputName = this.bindings.propertyToOutputMap[propName];
      const emitter: EventEmitter<any> = (this as any)[outputName];

      bindingDestination[propName] = (value: any) => emitter.emit(value);
    });
  }

  private forwardChanges(
    changes: SimpleChanges,
    bindingDestination: ɵupgradeHelper.IBindingDestination,
  ) {
    // Forward input changes to `bindingDestination`
    Object.keys(changes).forEach(
      (propName) => (bindingDestination[propName] = changes[propName].currentValue),
    );

    if (ɵutil.isFunction(bindingDestination.$onChanges)) {
      bindingDestination.$onChanges(changes);
    }
  }
}
