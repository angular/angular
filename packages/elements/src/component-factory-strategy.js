/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  ApplicationRef,
  ComponentFactoryResolver,
  Injector,
  NgZone,
  ɵChangeDetectionScheduler as ChangeDetectionScheduler,
  ɵisViewDirty as isViewDirty,
  ɵmarkForRefresh as markForRefresh,
} from '@angular/core';
import {merge, Observable, ReplaySubject} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {extractProjectableNodes} from './extract-projectable-nodes';
import {scheduler} from './utils';
/** Time in milliseconds to wait before destroying the component ref when disconnected. */
const DESTROY_DELAY = 10;
/**
 * Factory that creates new ComponentNgElementStrategy instance. Gets the component factory with the
 * constructor's injector's factory resolver and passes that factory to each strategy.
 */
export class ComponentNgElementStrategyFactory {
  constructor(component, injector) {
    this.inputMap = new Map();
    this.componentFactory = injector
      .get(ComponentFactoryResolver)
      .resolveComponentFactory(component);
    for (const input of this.componentFactory.inputs) {
      this.inputMap.set(input.propName, input.templateName);
    }
  }
  create(injector) {
    return new ComponentNgElementStrategy(this.componentFactory, injector, this.inputMap);
  }
}
/**
 * Creates and destroys a component ref using a component factory and handles change detection
 * in response to input changes.
 */
export class ComponentNgElementStrategy {
  constructor(componentFactory, injector, inputMap) {
    this.componentFactory = componentFactory;
    this.injector = injector;
    this.inputMap = inputMap;
    // Subject of `NgElementStrategyEvent` observables corresponding to the component's outputs.
    this.eventEmitters = new ReplaySubject(1);
    /** Merged stream of the component's output events. */
    this.events = this.eventEmitters.pipe(switchMap((emitters) => merge(...emitters)));
    /** Reference to the component that was created on connect. */
    this.componentRef = null;
    /** Callback function that when called will cancel a scheduled destruction on the component. */
    this.scheduledDestroyFn = null;
    /** Initial input values that were set before the component was created. */
    this.initialInputValues = new Map();
    this.ngZone = this.injector.get(NgZone);
    this.appRef = this.injector.get(ApplicationRef);
    this.cdScheduler = injector.get(ChangeDetectionScheduler);
    this.elementZone = typeof Zone === 'undefined' ? null : this.ngZone.run(() => Zone.current);
  }
  /**
   * Initializes a new component if one has not yet been created and cancels any scheduled
   * destruction.
   */
  connect(element) {
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
        }
      }, DESTROY_DELAY);
    });
  }
  /**
   * Returns the component property value. If the component has not yet been created, the value is
   * retrieved from the cached initialization values.
   */
  getInputValue(property) {
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
  setInputValue(property, value) {
    if (this.componentRef === null) {
      this.initialInputValues.set(property, value);
      return;
    }
    this.runInZone(() => {
      this.componentRef.setInput(this.inputMap.get(property) ?? property, value);
      // `setInput` won't mark the view dirty if the input didn't change from its previous value.
      if (isViewDirty(this.componentRef.hostView)) {
        // `setInput` will have marked the view dirty already, but also mark it for refresh. This
        // guarantees the view will be checked even if the input is being set from within change
        // detection. This provides backwards compatibility, since we used to unconditionally
        // schedule change detection in addition to the current zone run.
        markForRefresh(this.componentRef.changeDetectorRef);
        // Notifying the scheduler with `NotificationSource.CustomElement` causes a `tick()` to be
        // scheduled unconditionally, even if the scheduler is otherwise disabled.
        this.cdScheduler.notify(6 /* NotificationSource.CustomElement */);
      }
    });
  }
  /**
   * Creates a new component through the component factory with the provided element host and
   * sets up its initial inputs, listens for outputs changes, and runs an initial change detection.
   */
  initializeComponent(element) {
    const childInjector = Injector.create({providers: [], parent: this.injector});
    const projectableNodes = extractProjectableNodes(
      element,
      this.componentFactory.ngContentSelectors,
    );
    this.componentRef = this.componentFactory.create(childInjector, projectableNodes, element);
    this.initializeInputs();
    this.initializeOutputs(this.componentRef);
    this.appRef.attachView(this.componentRef.hostView);
    this.componentRef.hostView.detectChanges();
  }
  /** Set any stored initial inputs on the component's properties. */
  initializeInputs() {
    for (const [propName, value] of this.initialInputValues) {
      this.setInputValue(propName, value);
    }
    this.initialInputValues.clear();
  }
  /** Sets up listeners for the component's outputs so that the events stream emits the events. */
  initializeOutputs(componentRef) {
    const eventEmitters = this.componentFactory.outputs.map(({propName, templateName}) => {
      const emitter = componentRef.instance[propName];
      return new Observable((observer) => {
        const sub = emitter.subscribe((value) => observer.next({name: templateName, value}));
        return () => sub.unsubscribe();
      });
    });
    this.eventEmitters.next(eventEmitters);
  }
  /** Runs in the angular zone, if present. */
  runInZone(fn) {
    return this.elementZone && Zone.current !== this.elementZone ? this.ngZone.run(fn) : fn();
  }
}
//# sourceMappingURL=component-factory-strategy.js.map
