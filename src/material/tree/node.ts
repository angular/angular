/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  CDK_TREE_NODE_OUTLET_NODE,
  CdkNestedTreeNode,
  CdkTree,
  CdkTreeNode,
  CdkTreeNodeDef,
} from '@angular/cdk/tree';
import {
  AfterContentInit,
  Attribute,
  Directive,
  DoCheck,
  ElementRef,
  Input,
  IterableDiffers,
  OnDestroy, OnInit,
} from '@angular/core';
import {
  CanDisable,
  CanDisableCtor,
  HasTabIndex,
  HasTabIndexCtor,
  mixinDisabled,
  mixinTabIndex,
} from '@angular/material/core';
import {BooleanInput, coerceBooleanProperty, NumberInput} from '@angular/cdk/coercion';

const _MatTreeNodeMixinBase: HasTabIndexCtor & CanDisableCtor & typeof CdkTreeNode =
    mixinTabIndex(mixinDisabled(CdkTreeNode));

/**
 * Wrapper for the CdkTree node with Material design styles.
 */
@Directive({
  selector: 'mat-tree-node',
  exportAs: 'matTreeNode',
  inputs: ['role', 'disabled', 'tabIndex'],
  providers: [{provide: CdkTreeNode, useExisting: MatTreeNode}]
})
export class MatTreeNode<T> extends _MatTreeNodeMixinBase<T>
    implements CanDisable, DoCheck, HasTabIndex, OnInit, OnDestroy {


  constructor(protected _elementRef: ElementRef<HTMLElement>,
              protected _tree: CdkTree<T>,
              @Attribute('tabindex') tabIndex: string) {
    super(_elementRef, _tree);

    this.tabIndex = Number(tabIndex) || 0;
    // The classes are directly added here instead of in the host property because classes on
    // the host property are not inherited with View Engine. It is not set as a @HostBinding because
    // it is not set by the time it's children nodes try to read the class from it.
    // TODO: move to host after View Engine deprecation
    this._elementRef.nativeElement.classList.add('mat-tree-node');
  }

  // This is a workaround for https://github.com/angular/angular/issues/23091
  // In aot mode, the lifecycle hooks from parent class are not called.
  ngOnInit() {
    super.ngOnInit();
  }

  ngDoCheck() {
    super.ngDoCheck();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_tabIndex: NumberInput;
}

/**
 * Wrapper for the CdkTree node definition with Material design styles.
 */
@Directive({
  selector: '[matTreeNodeDef]',
  inputs: [
    'when: matTreeNodeDefWhen'
  ],
  providers: [{provide: CdkTreeNodeDef, useExisting: MatTreeNodeDef}]
})
export class MatTreeNodeDef<T> extends CdkTreeNodeDef<T> {
  @Input('matTreeNode') data: T;
}

/**
 * Wrapper for the CdkTree nested node with Material design styles.
 */
@Directive({
  selector: 'mat-nested-tree-node',
  exportAs: 'matNestedTreeNode',
  inputs: ['role', 'disabled', 'tabIndex'],
  providers: [
    {provide: CdkNestedTreeNode, useExisting: MatNestedTreeNode},
    {provide: CdkTreeNode, useExisting: MatNestedTreeNode},
    {provide: CDK_TREE_NODE_OUTLET_NODE, useExisting: MatNestedTreeNode}
  ]
})
export class MatNestedTreeNode<T> extends CdkNestedTreeNode<T> implements AfterContentInit, DoCheck,
  OnDestroy, OnInit {
  @Input('matNestedTreeNode') node: T;

  /** Whether the node is disabled. */
  @Input()
  get disabled() { return this._disabled; }
  set disabled(value: any) { this._disabled = coerceBooleanProperty(value); }
  private _disabled = false;

  /** Tabindex for the node. */
  @Input()
  get tabIndex(): number { return this.disabled ? -1 : this._tabIndex; }
  set tabIndex(value: number) {
    // If the specified tabIndex value is null or undefined, fall back to the default value.
    this._tabIndex = value != null ? value : 0;
  }
  private _tabIndex: number;

  constructor(protected _elementRef: ElementRef<HTMLElement>,
              protected _tree: CdkTree<T>,
              protected _differs: IterableDiffers,
              @Attribute('tabindex') tabIndex: string) {
    super(_elementRef, _tree, _differs);
    this.tabIndex = Number(tabIndex) || 0;
    // The classes are directly added here instead of in the host property because classes on
    // the host property are not inherited with View Engine. It is not set as a @HostBinding because
    // it is not set by the time it's children nodes try to read the class from it.
    // TODO: move to host after View Engine deprecation
    this._elementRef.nativeElement.classList.add('mat-nested-tree-node');
  }

  // This is a workaround for https://github.com/angular/angular/issues/23091
  // In aot mode, the lifecycle hooks from parent class are not called.
  // TODO(tinayuangao): Remove when the angular issue #23091 is fixed
  ngOnInit() {
    super.ngOnInit();
  }

  ngDoCheck() {
    super.ngDoCheck();
  }

  ngAfterContentInit() {
    super.ngAfterContentInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  static ngAcceptInputType_disabled: BooleanInput;
}
