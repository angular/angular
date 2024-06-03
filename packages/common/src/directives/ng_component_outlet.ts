/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ComponentRef,
  createNgModule,
  Directive,
  DoCheck,
  EnvironmentInjector,
  Injector,
  Input,
  NgModuleRef,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  Type,
  ViewContainerRef,
  outputBinding,
  Binding,
} from '@angular/core';

/**
 * Instantiates a {@link /api/core/Component Component} type and inserts its Host View into the current View.
 * `NgComponentOutlet` provides a declarative approach for dynamic component creation.
 *
 * `NgComponentOutlet` requires a component type, if a falsy value is set the view will clear and
 * any existing component will be destroyed.
 *
 * @usageNotes
 *
 * ### Fine tune control
 *
 * You can control the component creation process by using the following optional attributes:
 *
 * * `ngComponentOutletInputs`: Optional component inputs object, which will be bind to the
 * component.
 * * `ngComponentOutletOutputs`: Optional component inputs object, which will be bind to the
 * component. Changing the outputs will recreate the component as it uses an underlying `outputBinding`.
 *
 * * `ngComponentOutletInjector`: Optional custom {@link Injector} that will be used as parent for
 * the Component. Defaults to the injector of the current view container.
 *
 * * `ngComponentOutletEnvironmentInjector`: Optional custom {@link EnvironmentInjector} which will
 * provide the component's environment.
 *
 * * `ngComponentOutletContent`: Optional list of projectable nodes to insert into the content
 * section of the component, if it exists.
 *
 * * `ngComponentOutletNgModule`: Optional NgModule class reference to allow loading another
 * module dynamically, then loading a component from that module.
 *
 *
 * ### Syntax
 *
 * Simple
 * ```html
 * <ng-container *ngComponentOutlet="componentTypeExpression"></ng-container>
 * ```
 *
 * With inputs
 * ```html
 * <ng-container *ngComponentOutlet="componentTypeExpression;
 *                                   inputs: inputsExpression;">
 * </ng-container>
 * ```
 *
 * Customized injector/content
 * ```html
 * <ng-container *ngComponentOutlet="componentTypeExpression;
 *                                   injector: injectorExpression;
 *                                   content: contentNodesExpression;">
 * </ng-container>
 * ```
 *
 * Customized NgModule reference
 * ```html
 * <ng-container *ngComponentOutlet="componentTypeExpression;
 *                                   ngModule: ngModuleClass;">
 * </ng-container>
 * ```
 *
 * ### A simple example
 *
 * {@example common/ngComponentOutlet/ts/module.ts region='SimpleExample'}
 *
 * A more complete example with additional options:
 *
 * {@example common/ngComponentOutlet/ts/module.ts region='CompleteExample'}
 *
 * @publicApi
 * @ngModule CommonModule
 */
@Directive({
  selector: '[ngComponentOutlet]',
  exportAs: 'ngComponentOutlet',
})
export class NgComponentOutlet<T = any> implements OnChanges, DoCheck, OnDestroy {
  // TODO(crisbeto): this should be `Type<T>`, but doing so broke a few
  // targets in a TGP so we need to do it in a major version.
  /** Component that should be rendered in the outlet. */
  @Input() ngComponentOutlet: Type<any> | null = null;

  @Input() ngComponentOutletInputs?: Record<string, unknown>;
  @Input() ngComponentOutletOutputs?: Record<string, (...args: any[]) => unknown>;
  @Input() ngComponentOutletInjector?: Injector;
  @Input() ngComponentOutletEnvironmentInjector?: EnvironmentInjector;
  @Input() ngComponentOutletContent?: any[][];

  @Input() ngComponentOutletNgModule?: Type<any>;

  private _componentRef: ComponentRef<T> | undefined;
  private _moduleRef: NgModuleRef<any> | undefined;

  /**
   * A helper data structure that allows us to track inputs that were part of the
   * ngComponentOutletInputs expression. Tracking inputs is necessary for proper removal of ones
   * that are no longer referenced.
   */
  private _inputsUsed = new Map<string, boolean>();
  private _outputsUsed = new Set<string>();

  /**
   * Gets the instance of the currently-rendered component.
   * Will be null if no component has been rendered.
   */
  get componentInstance(): T | null {
    return this._componentRef?.instance ?? null;
  }

  constructor(private _viewContainerRef: ViewContainerRef) {}

  private _needToReCreateNgModuleInstance(changes: SimpleChanges): boolean {
    // Note: square brackets property accessor is safe for Closure compiler optimizations (the
    // `changes` argument of the `ngOnChanges` lifecycle hook retains the names of the fields that
    // were changed).
    return changes['ngComponentOutletNgModule'] !== undefined;
  }

  private _needToReCreateComponentInstance(changes: SimpleChanges): boolean {
    // Note: square brackets property accessor is safe for Closure compiler optimizations (the
    // `changes` argument of the `ngOnChanges` lifecycle hook retains the names of the fields that
    // were changed).
    return (
      changes['ngComponentOutlet'] !== undefined ||
      changes['ngComponentOutletContent'] !== undefined ||
      changes['ngComponentOutletInjector'] !== undefined ||
      changes['ngComponentOutletEnvironmentInjector'] !== undefined ||
      changes['ngComponentOutletOutputs'] !== undefined ||
      this._needToReCreateNgModuleInstance(changes)
    );
  }

  /** @docs-private */
  ngOnChanges(changes: SimpleChanges) {
    if (this._needToReCreateComponentInstance(changes)) {
      this._viewContainerRef.clear();
      this._inputsUsed.clear();
      this._outputsUsed.clear();
      this._componentRef = undefined;

      if (this.ngComponentOutlet) {
        const injector = this.ngComponentOutletInjector || this._viewContainerRef.parentInjector;

        if (this._needToReCreateNgModuleInstance(changes)) {
          this._moduleRef?.destroy();

          if (this.ngComponentOutletNgModule) {
            this._moduleRef = createNgModule(
              this.ngComponentOutletNgModule,
              getParentInjector(injector),
            );
          } else {
            this._moduleRef = undefined;
          }
        }

        this._componentRef = this._viewContainerRef.createComponent(this.ngComponentOutlet, {
          injector,
          ngModuleRef: this._moduleRef,
          projectableNodes: this.ngComponentOutletContent,
          environmentInjector: this.ngComponentOutletEnvironmentInjector,
          bindings: outputsToBindings(this.ngComponentOutletOutputs),
        });
      }
    }
  }

  /** @docs-private */
  ngDoCheck() {
    if (this._componentRef) {
      if (this.ngComponentOutletInputs) {
        for (const inputName of Object.keys(this.ngComponentOutletInputs)) {
          this._inputsUsed.set(inputName, true);
        }
      }
      this._applyInputStateDiff(this._componentRef);

      if (ngDevMode && this.ngComponentOutletOutputs) {
        if (!areSetsEqual(this._outputsUsed, new Set(Object.keys(this.ngComponentOutletOutputs)))) {
          // TODO: Create & Log a Runtime warning
          console.warn('The output object has been mutated, which is not supported.');
        }

        for (const outputName of Object.keys(this.ngComponentOutletOutputs)) {
          this._outputsUsed.add(outputName);
        }
      }
    }
  }

  /** @docs-private */
  ngOnDestroy() {
    this._moduleRef?.destroy();
  }

  private _applyInputStateDiff(componentRef: ComponentRef<unknown>) {
    for (const [inputName, touched] of this._inputsUsed) {
      if (!touched) {
        // The input that was previously active no longer exists and needs to be set to undefined.
        componentRef.setInput(inputName, undefined);
        this._inputsUsed.delete(inputName);
      } else {
        // Since touched is true, it can be asserted that the inputs object is not empty.
        componentRef.setInput(inputName, this.ngComponentOutletInputs![inputName]);
        this._inputsUsed.set(inputName, false);
      }
    }
  }
}

// Helper function that returns an Injector instance of a parent NgModule.
function getParentInjector(injector: Injector): Injector {
  const parentNgModule = injector.get(NgModuleRef);
  return parentNgModule.injector;
}

function outputsToBindings<T>(
  outputs: Record<string, (...args: any[]) => unknown> = {},
): Binding[] {
  return Object.entries(outputs).map(([outputName, callback]) =>
    outputBinding(outputName, callback),
  );
}

function areSetsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;

  for (const val of a) {
    if (!b.has(val)) return false;
  }
  return true;
}
