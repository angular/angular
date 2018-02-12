/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef, ComponentFactory, ComponentRef, EventEmitter, Injector, NgZone, OnChanges, SimpleChange, SimpleChanges} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';

import {extractProjectableNodes} from './extract-projectable-nodes';
import {createCustomEvent, getComponentName, isFunction, scheduler, strictEquals, throwError} from './utils';

export type NgElementWithProps<T, P> = NgElement<T>& {[property in keyof P]: P[property]};

export interface NgElement<T> extends HTMLElement {
  ngElement: NgElement<T>|null;
  componentRef: ComponentRef<T>|null;

  attributeChangedCallback(
      attrName: string, oldValue: string|null, newValue: string, namespace?: string): void;
  connectedCallback(): void;
  detach(): void;
  detectChanges(): void;
  disconnectedCallback(): void;
  getHost(): HTMLElement;
  markDirty(): void;
}

/**
 * Represents an `NgElement` input.
 * Similar to a `ComponentFactory` input (`{propName: string, templateName: string}`),
 * except that `attrName` is derived by kebab-casing `templateName`.
 */
export interface NgElementInput {
  propName: string;
  attrName: string;
}

/**
 * Represents an `NgElement` output.
 * Similar to a `ComponentFactory` output (`{propName: string, templateName: string}`),
 * except that `templateName` is renamed to `eventName`.
 */
export interface NgElementOutput {
  propName: string;
  eventName: string;
}

/**
 * An enum of possible lifecycle phases for `NgElement`s.
 */
const enum NgElementLifecyclePhase {
  // The element has been instantiated, but not connected.
  // (The associated component has not been created yet.)
  unconnected = 'unconnected',
  // The element has been instantiated and connected.
  // (The associated component has been created.)
  connected = 'connected',
  // The element has been instantiated, connected and then disconnected.
  // (The associated component has been created and then destroyed.)
  disconnected = 'disconnected',
}

interface NgElementConnected<T> extends NgElementImpl<T> {
  ngElement: NgElementConnected<T>;
  componentRef: ComponentRef<T>;
}

export abstract class NgElementImpl<T> extends HTMLElement implements NgElement<T> {
  private static DESTROY_DELAY = 10;
  ngElement: NgElement<T>|null = null;
  componentRef: ComponentRef<T>|null = null;
  onConnected = new EventEmitter<void>();
  onDisconnected = new EventEmitter<void>();

  private applicationRef = this.injector.get<ApplicationRef>(ApplicationRef);
  private ngZone = this.injector.get<NgZone>(NgZone);

  private host = this as HTMLElement;
  private readonly componentName = getComponentName(this.componentFactory.componentType);
  private readonly initialInputValues = new Map<string, any>();
  private readonly uninitializedInputs = new Set<string>();
  private readonly outputSubscriptions = new Map<string, Subscription>();
  private inputChanges: SimpleChanges|null = null;
  private implementsOnChanges = false;
  private changeDetectionScheduled = false;
  private lifecyclePhase: NgElementLifecyclePhase = NgElementLifecyclePhase.unconnected;
  private cancelDestruction: (() => void)|null = null;

  constructor(
      private injector: Injector, private componentFactory: ComponentFactory<T>,
      private readonly inputs: NgElementInput[], private readonly outputs: NgElementOutput[]) {
    super();
  }

  attributeChangedCallback(
      attrName: string, oldValue: string|null, newValue: string, namespace?: string): void {
    const input = this.inputs.find(input => input.attrName === attrName) !;

    if (input) {
      this.setInputValue(input.propName, newValue);
    } else {
      throwError(
          `Calling 'attributeChangedCallback()' with unknown attribute '${attrName}' ` +
          `on component '${this.componentName}' is not allowed.`);
    }
  }

  connectedCallback(ignoreUpgraded = false): void {
    this.assertNotInPhase(NgElementLifecyclePhase.disconnected, 'connectedCallback');

    if (this.cancelDestruction !== null) {
      this.cancelDestruction();
      this.cancelDestruction = null;
    }

    if (this.lifecyclePhase === NgElementLifecyclePhase.connected) {
      return;
    }

    const host = this.host as NgElement<T>;

    if (host.ngElement) {
      if (ignoreUpgraded) {
        return;
      }

      const existingNgElement = (host as NgElementConnected<T>).ngElement;
      const existingComponentName = getComponentName(existingNgElement.componentRef.componentType);

      throwError(
          `Upgrading '${this.host.nodeName}' element to component '${this.componentName}' is not allowed, ` +
          `because the element is already upgraded to component '${existingComponentName}'.`);
    }

    this.ngZone.run(() => {
      this.lifecyclePhase = NgElementLifecyclePhase.connected;

      const childInjector = Injector.create([], this.injector);
      const projectableNodes =
          extractProjectableNodes(this.host, this.componentFactory.ngContentSelectors);
      this.componentRef = this.componentFactory.create(childInjector, projectableNodes, this.host);
      this.implementsOnChanges =
          isFunction((this.componentRef.instance as any as OnChanges).ngOnChanges);

      this.initializeInputs();
      this.initializeOutputs();
      this.detectChanges();

      this.applicationRef.attachView(this.componentRef.hostView);

      // Ensure `ngElement` is set on the host too (even for manually upgraded elements)
      // in order to be able to detect that the element has been been upgraded.
      this.ngElement = host.ngElement = this;

      this.onConnected.emit();
    });
  }

  detach(): void { this.disconnectedCallback(); }

  detectChanges(): void {
    if (this.lifecyclePhase === NgElementLifecyclePhase.disconnected) {
      return;
    }

    this.assertNotInPhase(NgElementLifecyclePhase.unconnected, 'detectChanges');

    this.ngZone.run(() => {
      this.changeDetectionScheduled = false;

      this.callNgOnChanges();
      this.componentRef !.changeDetectorRef.detectChanges();
    });
  }

  disconnectedCallback(): void {
    if (this.lifecyclePhase === NgElementLifecyclePhase.disconnected ||
        this.cancelDestruction !== null) {
      return;
    }

    this.assertNotInPhase(NgElementLifecyclePhase.unconnected, 'disconnectedCallback');

    const doDestroy = () => this.ngZone.run(() => this.destroy());
    this.cancelDestruction = scheduler.schedule(doDestroy, NgElementImpl.DESTROY_DELAY);
  }

  getHost(): HTMLElement { return this.host; }

  getInputValue(propName: string): any {
    this.assertNotInPhase(NgElementLifecyclePhase.disconnected, 'getInputValue');

    if (this.lifecyclePhase === NgElementLifecyclePhase.unconnected) {
      return this.initialInputValues.get(propName);
    }

    return (this.componentRef !.instance as any)[propName];
  }

  markDirty(): void {
    if (!this.changeDetectionScheduled) {
      this.changeDetectionScheduled = true;
      scheduler.scheduleBeforeRender(() => this.detectChanges());
    }
  }

  setHost(host: HTMLElement): void {
    this.assertNotInPhase(NgElementLifecyclePhase.connected, 'setHost');
    this.assertNotInPhase(NgElementLifecyclePhase.disconnected, 'setHost');

    this.host = host;
  }

  setInputValue(propName: string, newValue: any): void {
    this.assertNotInPhase(NgElementLifecyclePhase.disconnected, 'setInputValue');

    if (this.lifecyclePhase === NgElementLifecyclePhase.unconnected) {
      this.initialInputValues.set(propName, newValue);
      return;
    }

    if (!strictEquals(newValue, this.getInputValue(propName))) {
      this.recordInputChange(propName, newValue);
      (this.componentRef !.instance as any)[propName] = newValue;
      this.markDirty();
    }
  }

  private assertNotInPhase(phase: NgElementLifecyclePhase, caller: keyof this): void {
    if (this.lifecyclePhase === phase) {
      throwError(
          `Calling '${caller}()' on ${phase} component '${this.componentName}' is not allowed.`);
    }
  }

  private callNgOnChanges(): void {
    if (this.implementsOnChanges && this.inputChanges !== null) {
      const inputChanges = this.inputChanges;
      this.inputChanges = null;
      (this.componentRef !.instance as any as OnChanges).ngOnChanges(inputChanges);
    }
  }

  private destroy() {
    this.componentRef !.destroy();
    this.outputs.forEach(output => this.unsubscribeFromOutput(output));

    this.ngElement = (this.host as NgElement<any>).ngElement = null;
    this.host.innerHTML = '';

    this.lifecyclePhase = NgElementLifecyclePhase.disconnected;
    this.onDisconnected.emit();
  }

  private dispatchCustomEvent(eventName: string, value: any): void {
    const event = createCustomEvent(this.host.ownerDocument, eventName, value);

    this.dispatchEvent(event);

    if (this.host !== this) {
      this.host.dispatchEvent(event);
    }
  }

  private initializeInputs(): void {
    this.inputs.forEach(({propName, attrName}) => {
      let initialValue;

      if (this.initialInputValues.has(propName)) {
        // The property has already been set (prior to initialization).
        // Update the component instance.
        initialValue = this.initialInputValues.get(propName);
      } else if (this.host.hasAttribute(attrName)) {
        // A matching attribute exists.
        // Update the component instance.
        initialValue = this.host.getAttribute(attrName);
      } else {
        // The property does not have an initial value.
        this.uninitializedInputs.add(propName);
      }

      if (!this.uninitializedInputs.has(propName)) {
        // The property does have an initial value.
        // Forward it to the component instance.
        this.setInputValue(propName, initialValue);
      }
    });

    this.initialInputValues.clear();
  }

  private initializeOutputs(): void {
    this.outputs.forEach(output => this.subscribeToOutput(output));
  }

  private recordInputChange(propName: string, currentValue: any): void {
    if (!this.implementsOnChanges) {
      // The component does not implement `OnChanges`. Ignore the change.
      return;
    }

    if (this.inputChanges === null) {
      this.inputChanges = {};
    }

    const pendingChange = this.inputChanges[propName];

    if (pendingChange) {
      pendingChange.currentValue = currentValue;
      return;
    }

    const isFirstChange = this.uninitializedInputs.has(propName);
    const previousValue = isFirstChange ? undefined : this.getInputValue(propName);
    this.inputChanges[propName] = new SimpleChange(previousValue, currentValue, isFirstChange);

    if (isFirstChange) {
      this.uninitializedInputs.delete(propName);
    }
  }

  private subscribeToOutput(output: NgElementOutput): void {
    const {propName, eventName} = output;
    const emitter = (this.componentRef !.instance as any)[output.propName] as EventEmitter<any>;

    if (!emitter) {
      throwError(`Missing emitter '${propName}' on component '${this.componentName}'.`);
    }

    this.unsubscribeFromOutput(output);

    const subscription =
        emitter.subscribe((value: any) => this.dispatchCustomEvent(eventName, value));
    this.outputSubscriptions.set(propName, subscription);
  }

  private unsubscribeFromOutput({propName}: NgElementOutput): void {
    if (!this.outputSubscriptions.has(propName)) {
      return;
    }

    const subscription = this.outputSubscriptions.get(propName) !;

    this.outputSubscriptions.delete(propName);
    subscription.unsubscribe();
  }
}
