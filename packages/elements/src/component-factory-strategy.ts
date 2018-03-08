/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, ComponentFactory, ComponentFactoryResolver, ComponentRef, EventEmitter, Injector, OnChanges, SimpleChange, SimpleChanges, Type} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {merge} from 'rxjs/observable/merge';
import {map} from 'rxjs/operator/map';

import {NgElementStrategy, NgElementStrategyEvent, NgElementStrategyFactory} from './element-strategy';
import {extractProjectableNodes} from './extract-projectable-nodes';
import {isFunction, scheduler, strictEquals} from './utils';

/** Time in milliseconds to wait before destroying the component ref when disconnected. */
const DESTROY_DELAY = 10;

/**
 * @description Defines a default configuration for transforming an Angular component
 * to a custom element.
 * 
 * In the default configuration:
 *  - Inputs set on the factory are converted to observed attributes for the element, 
 * with the property names transformed to dash-separated lowercase.
 *  - All inputs are set as proxy properties on the element.
 *  - The underlying strategy uses the component factory and injector to create new components.
 * @param componentFactory The factory for the component to be converted to a custom element. 
 * @param injector The component's dependency injector.
 * @return A configuration object for a custom element created from the component.
 * @experimental
 */
export class ComponentNgElementStrategyFactory implements NgElementStrategyFactory {
  componentFactory: ComponentFactory<any>;

  constructor(private component: Type<any>, private injector: Injector) {
    this.componentFactory =
        injector.get(ComponentFactoryResolver).resolveComponentFactory(component);
  }

  create(injector: Injector) {
    return new ComponentNgElementStrategy(this.componentFactory, injector);
  }
}

/**
 * Defines a custom-element strategy that creates and destroys a component ref
 * using a component factory, and handles change detection in response to input changes.
 *
 * @experimental
 */
export class ComponentNgElementStrategy implements NgElementStrategy {
  /** Merged stream of the component's output events. */
  events: Observable<NgElementStrategyEvent>;

  /** Reference to the component that was created on connect. */
  private componentRef: ComponentRef<any>|null;

  /** Changes that have been made to the component ref since the last time onChanges was called. */
  private inputChanges: SimpleChanges|null = null;

  /** Whether the created component implements the onChanges function. */
  private implementsOnChanges = false;

  /** Whether a change detection has been scheduled to run on the component. */
  private scheduledChangeDetectionFn: (() => void)|null = null;

  /** Callback function that when called will cancel a scheduled destruction on the component. */
  private scheduledDestroyFn: (() => void)|null = null;

  /** Initial input values that were set before the component was created. */
  private readonly initialInputValues = new Map<string, any>();

  /** Set of inputs that were not initially set when the component was created. */
  private readonly uninitializedInputs = new Set<string>();

  /**
   * Initializes a strategy instance.
   */
  constructor(private componentFactory: ComponentFactory<any>, private injector: Injector) {}

  /**
   * Initializes a new custom-element component if one has not yet been created and cancels any scheduled
   * destruction.
   * @param element The custom element to initialize.
   */
  connect(element: HTMLElement) {
    // If the element is marked to be destroyed, cancel the task since the component was reconnected
    if (this.scheduledDestroyFn !== null) {
      this.scheduledDestroyFn();
      this.scheduledDestroyFn = null;
      return;
    }

    if (!this.componentRef) {
      this.initializeComponent(element);
    }
  }

  /**
   * Schedules this component to be destroyed (after a small delay in case the element is just
   * being moved across the DOM).
   */
  disconnect() {
    // Return if there is no componentRef or the component is already scheduled for destruction
    if (!this.componentRef || this.scheduledDestroyFn !== null) {
      return;
    }

    // Schedule the component to be destroyed after a small timeout in case it is being
    // moved elsewhere in the DOM
    this.scheduledDestroyFn = scheduler.schedule(() => {
      if (this.componentRef) {
        this.componentRef !.destroy();
        this.componentRef = null;
      }
    }, DESTROY_DELAY);
  }

  /**
   * Retrieves a data value from a component. If the component has not yet been created, the value is
   * retrieved from the cached initialization values.
   * @param property The property name.
   * @returns The property value.
   */
  getInputValue(property: string): any {
    if (!this.componentRef) {
      return this.initialInputValues.get(property);
    }

    return (this.componentRef.instance as any)[property];
  }

  /**
   * Sets the input value for a component property. 
   * If the component has not yet been created, the value is
   * cached and set when the component is created.
   * @param property The property name.
   * @param value The new value.
   * @returns Nothing.
   */
  setInputValue(property: string, value: any): void {
    if (strictEquals(value, this.getInputValue(property))) {
      return;
    }

    if (!this.componentRef) {
      this.initialInputValues.set(property, value);
      return;
    }

    this.recordInputChange(property, value);
    (this.componentRef.instance as any)[property] = value;
    this.scheduleDetectChanges();
  }

    /**
   * Creates a new component using the component factory with the provided element host, and
   * sets up its initial inputs, listens for outputs changes, and runs an initial change detection.
   * 
   * @param element The custom element to initialize.
   * 
   */
  protected initializeComponent(element: HTMLElement) {
    const childInjector = Injector.create({providers: [], parent: this.injector});
    const projectableNodes =
        extractProjectableNodes(element, this.componentFactory.ngContentSelectors);
    this.componentRef = this.componentFactory.create(childInjector, projectableNodes, element);

    this.implementsOnChanges =
        isFunction((this.componentRef.instance as any as OnChanges).ngOnChanges);

    this.initializeInputs();
    this.initializeOutputs();

    this.detectChanges();

    const applicationRef = this.injector.get<ApplicationRef>(ApplicationRef);
    applicationRef.attachView(this.componentRef.hostView);
  }

  /** Sets any stored initial inputs on the component's properties. */
  protected initializeInputs(): void {
    this.componentFactory.inputs.forEach(({propName}) => {
      const initialValue = this.initialInputValues.get(propName);
      if (initialValue) {
        this.setInputValue(propName, initialValue);
      } else {
        // Keep track of inputs that were not initialized in case we need to know this for
        // calling ngOnChanges with SimpleChanges
        this.uninitializedInputs.add(propName);
      }
    });

    this.initialInputValues.clear();
  }

  /** Sets up listeners for the component's outputs so that the events stream emits the events. */
  protected initializeOutputs(): void {
    const eventEmitters = this.componentFactory.outputs.map(({propName, templateName}) => {
      const emitter = (this.componentRef !.instance as any)[propName] as EventEmitter<any>;
      return map.call(emitter, (value: any) => ({name: templateName, value}));
    });

    this.events = merge(...eventEmitters);
  }

  /** Calls ngOnChanges with all the inputs that have changed since the last call. */
  protected callNgOnChanges(): void {
    if (!this.implementsOnChanges || this.inputChanges === null) {
      return;
    }

    // Cache the changes and set inputChanges to null to capture any changes that might occur
    // during ngOnChanges.
    const inputChanges = this.inputChanges;
    this.inputChanges = null;
    (this.componentRef !.instance as any as OnChanges).ngOnChanges(inputChanges);
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
   * Records input changes so that the component receives
   * changes that have been made to the component since the last time 
   * the `onChanges` handler was called. 
   * 
   * @param property A property to record.
   * @param currentValue The value to record.
   */
  protected recordInputChange(property: string, currentValue: any): void {
    // Do not record the change if the component does not implement `OnChanges`.
    if (this.componentRef && !this.implementsOnChanges) {
      return;
    }

    if (this.inputChanges === null) {
      this.inputChanges = {};
    }

    // If there already is a change, modify the current value to match but leave the values for
    // previousValue and isFirstChange.
    const pendingChange = this.inputChanges[property];
    if (pendingChange) {
      pendingChange.currentValue = currentValue;
      return;
    }

    const isFirstChange = this.uninitializedInputs.has(property);
    this.uninitializedInputs.delete(property);

    const previousValue = isFirstChange ? undefined : this.getInputValue(property);
    this.inputChanges[property] = new SimpleChange(previousValue, currentValue, isFirstChange);
  }

  /** Runs change detection on the component. */
  protected detectChanges(): void {
    if (!this.componentRef) {
      return;
    }

    this.callNgOnChanges();
    this.componentRef !.changeDetectorRef.detectChanges();
  }
}
