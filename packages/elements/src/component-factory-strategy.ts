/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, ChangeDetectorRef, ComponentFactory, ComponentFactoryResolver, ComponentRef, EventEmitter, Injector, NgZone, OnChanges, SimpleChange, SimpleChanges, Type} from '@angular/core';
import {merge, Observable, ReplaySubject} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';

import {NgElementStrategy, NgElementStrategyEvent, NgElementStrategyFactory} from './element-strategy';
import {extractProjectableNodes} from './extract-projectable-nodes';
import {isFunction, scheduler, strictEquals} from './utils';

/** Time in milliseconds to wait before destroying the component ref when disconnected. */
const DESTROY_DELAY = 10;

/**
 * Factory that creates new ComponentNgElementStrategy instance. Gets the component factory with the
 * constructor's injector's factory resolver and passes that factory to each strategy.
 */
export class ComponentNgElementStrategyFactory implements NgElementStrategyFactory {
  componentFactory: ComponentFactory<any>;

  constructor(component: Type<any>, injector: Injector) {
    this.componentFactory =
        injector.get(ComponentFactoryResolver).resolveComponentFactory(component);
  }

  create(injector: Injector) {
    return new ComponentNgElementStrategy(this.componentFactory, injector);
  }
}

/**
 * Creates and destroys a component ref using a component factory and handles change detection
 * in response to input changes.
 */
export class ComponentNgElementStrategy implements NgElementStrategy {
  // Subject of `NgElementStrategyEvent` observables corresponding to the component's outputs.
  private eventEmitters = new ReplaySubject<Observable<NgElementStrategyEvent>[]>(1);

  /** Merged stream of the component's output events. */
  readonly events = this.eventEmitters.pipe(switchMap(emitters => merge(...emitters)));

  /** Reference to the component that was created on connect. */
  private componentRef: ComponentRef<any>|null = null;

  /** Reference to the component view's `ChangeDetectorRef`. */
  private viewChangeDetectorRef: ChangeDetectorRef|null = null;

  /**
   * Changes that have been made to component inputs since the last change detection run.
   * (NOTE: These are only recorded if the component implements the `OnChanges` interface.)
   */
  private inputChanges: SimpleChanges|null = null;

  /** Whether changes have been made to component inputs since the last change detection run. */
  private hasInputChanges = false;

  /** Whether the created component implements the `OnChanges` interface. */
  private implementsOnChanges = false;

  /** Whether a change detection has been scheduled to run on the component. */
  private scheduledChangeDetectionFn: (() => void)|null = null;

  /** Callback function that when called will cancel a scheduled destruction on the component. */
  private scheduledDestroyFn: (() => void)|null = null;

  /** Initial input values that were set before the component was created. */
  private readonly initialInputValues = new Map<string, any>();

  /**
   * Set of component inputs that have not yet changed, i.e. for which `recordInputChange()` has not
   * fired.
   * (This helps detect the first change of an input, even if it is explicitly set to `undefined`.)
   */
  private readonly unchangedInputs: Set<string>;

  /** Service for setting zone context. */
  private readonly ngZone: NgZone;

  /** The zone the element was created in or `null` if Zone.js is not loaded. */
  private readonly elementZone: Zone|null;


  constructor(private componentFactory: ComponentFactory<any>, private injector: Injector) {
    this.unchangedInputs =
        new Set<string>(this.componentFactory.inputs.map(({propName}) => propName));
    this.ngZone = this.injector.get<NgZone>(NgZone);
    this.elementZone = (typeof Zone === 'undefined') ? null : this.ngZone.run(() => Zone.current);
  }

  /**
   * Initializes a new component if one has not yet been created and cancels any scheduled
   * destruction.
   */
  connect(element: HTMLElement) {
    this.runInZone(() => {
      // If the element is marked to be destroyed, cancel the task since the component was
      // reconnected
      if (this.scheduledDestroyFn !== null) {
        this.scheduledDestroyFn();
        this.scheduledDestroyFn = null;
        return;
      }

      if (this.componentRef === null) {
        this.initializeComponent(element);
      }
    });
  }

  /**
   * Schedules the component to be destroyed after some small delay in case the element is just
   * being moved across the DOM.
   */
  disconnect() {
    this.runInZone(() => {
      // Return if there is no componentRef or the component is already scheduled for destruction
      if (this.componentRef === null || this.scheduledDestroyFn !== null) {
        return;
      }

      // Schedule the component to be destroyed after a small timeout in case it is being
      // moved elsewhere in the DOM
      this.scheduledDestroyFn = scheduler.schedule(() => {
        if (this.componentRef !== null) {
          this.componentRef.destroy();
          this.componentRef = null;
          this.viewChangeDetectorRef = null;
        }
      }, DESTROY_DELAY);
    });
  }

  /**
   * Returns the component property value. If the component has not yet been created, the value is
   * retrieved from the cached initialization values.
   */
  getInputValue(property: string): any {
    return this.runInZone(() => {
      if (this.componentRef === null) {
        return this.initialInputValues.get(property);
      }

      return this.componentRef.instance[property];
    });
  }

  /**
   * Sets the input value for the property. If the component has not yet been created, the value is
   * cached and set when the component is created.
   */
  setInputValue(property: string, value: any): void {
    this.runInZone(() => {
      if (this.componentRef === null) {
        this.initialInputValues.set(property, value);
        return;
      }

      // Ignore the value if it is strictly equal to the current value, except if it is `undefined`
      // and this is the first change to the value (because an explicit `undefined` _is_ strictly
      // equal to not having a value set at all, but we still need to record this as a change).
      if (strictEquals(value, this.getInputValue(property)) &&
          !((value === undefined) && this.unchangedInputs.has(property))) {
        return;
      }

      // Record the changed value and update internal state to reflect the fact that this input has
      // changed.
      this.recordInputChange(property, value);
      this.unchangedInputs.delete(property);
      this.hasInputChanges = true;

      // Update the component instance and schedule change detection.
      this.componentRef.instance[property] = value;
      this.scheduleDetectChanges();
    });
  }

  /**
   * Creates a new component through the component factory with the provided element host and
   * sets up its initial inputs, listens for outputs changes, and runs an initial change detection.
   */
  protected initializeComponent(element: HTMLElement) {
    const childInjector = Injector.create({providers: [], parent: this.injector});
    const projectableNodes =
        extractProjectableNodes(element, this.componentFactory.ngContentSelectors);
    this.componentRef = this.componentFactory.create(childInjector, projectableNodes, element);
    this.viewChangeDetectorRef = this.componentRef.injector.get(ChangeDetectorRef);

    this.implementsOnChanges = isFunction((this.componentRef.instance as OnChanges).ngOnChanges);

    this.initializeInputs();
    this.initializeOutputs(this.componentRef);

    this.detectChanges();

    const applicationRef = this.injector.get<ApplicationRef>(ApplicationRef);
    applicationRef.attachView(this.componentRef.hostView);
  }

  /** Set any stored initial inputs on the component's properties. */
  protected initializeInputs(): void {
    this.componentFactory.inputs.forEach(({propName}) => {
      if (this.initialInputValues.has(propName)) {
        // Call `setInputValue()` now that the component has been instantiated to update its
        // properties and fire `ngOnChanges()`.
        this.setInputValue(propName, this.initialInputValues.get(propName));
      }
    });

    this.initialInputValues.clear();
  }

  /** Sets up listeners for the component's outputs so that the events stream emits the events. */
  protected initializeOutputs(componentRef: ComponentRef<any>): void {
    const eventEmitters: Observable<NgElementStrategyEvent>[] =
        this.componentFactory.outputs.map(({propName, templateName}) => {
          const emitter: EventEmitter<any> = componentRef.instance[propName];
          return emitter.pipe(map(value => ({name: templateName, value})));
        });

    this.eventEmitters.next(eventEmitters);
  }

  /** Calls ngOnChanges with all the inputs that have changed since the last call. */
  protected callNgOnChanges(componentRef: ComponentRef<any>): void {
    if (!this.implementsOnChanges || this.inputChanges === null) {
      return;
    }

    // Cache the changes and set inputChanges to null to capture any changes that might occur
    // during ngOnChanges.
    const inputChanges = this.inputChanges;
    this.inputChanges = null;
    (componentRef.instance as OnChanges).ngOnChanges(inputChanges);
  }

  /**
   * Marks the component view for check, if necessary.
   * (NOTE: This is required when the `ChangeDetectionStrategy` is set to `OnPush`.)
   */
  protected markViewForCheck(viewChangeDetectorRef: ChangeDetectorRef): void {
    if (this.hasInputChanges) {
      this.hasInputChanges = false;
      viewChangeDetectorRef.markForCheck();
    }
  }

  /**
   * Schedules change detection to run on the component.
   * Ignores subsequent calls if already scheduled.
   */
  protected scheduleDetectChanges(): void {
    if (this.scheduledChangeDetectionFn) {
      return;
    }

    this.scheduledChangeDetectionFn = scheduler.scheduleBeforeRender(() => {
      this.scheduledChangeDetectionFn = null;
      this.detectChanges();
    });
  }

  /**
   * Records input changes so that the component receives SimpleChanges in its onChanges function.
   */
  protected recordInputChange(property: string, currentValue: any): void {
    // Do not record the change if the component does not implement `OnChanges`.
    if (!this.implementsOnChanges) {
      return;
    }

    if (this.inputChanges === null) {
      this.inputChanges = {};
    }

    // If there already is a change, modify the current value to match but leave the values for
    // `previousValue` and `isFirstChange`.
    const pendingChange = this.inputChanges[property];
    if (pendingChange) {
      pendingChange.currentValue = currentValue;
      return;
    }

    const isFirstChange = this.unchangedInputs.has(property);
    const previousValue = isFirstChange ? undefined : this.getInputValue(property);
    this.inputChanges[property] = new SimpleChange(previousValue, currentValue, isFirstChange);
  }

  /** Runs change detection on the component. */
  protected detectChanges(): void {
    if (this.componentRef === null) {
      return;
    }

    this.callNgOnChanges(this.componentRef);
    this.markViewForCheck(this.viewChangeDetectorRef!);
    this.componentRef.changeDetectorRef.detectChanges();
  }

  /** Runs in the angular zone, if present. */
  private runInZone(fn: () => unknown) {
    return (this.elementZone && Zone.current !== this.elementZone) ? this.ngZone.run(fn) : fn();
  }
}
