/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TemplatePortal} from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  InjectionToken,
  Inject,
  Optional,
} from '@angular/core';
import {CanDisable, mixinDisabled} from '@angular/material/core';
import {Subject} from 'rxjs';
import {MAT_TAB_CONTENT} from './tab-content';
import {MAT_TAB_LABEL, MatTabLabel, MAT_TAB} from './tab-label';

// Boilerplate for applying mixins to MatTab.
/** @docs-private */
const _MatTabBase = mixinDisabled(class {});

/**
 * Used to provide a tab group to a tab without causing a circular dependency.
 * @docs-private
 */
export const MAT_TAB_GROUP = new InjectionToken<any>('MAT_TAB_GROUP');

@Component({
  selector: 'mat-tab',
  templateUrl: 'tab.html',
  inputs: ['disabled'],
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'matTab',
  providers: [{provide: MAT_TAB, useExisting: MatTab}],
})
export class MatTab extends _MatTabBase implements OnInit, CanDisable, OnChanges, OnDestroy {
  /** Content for the tab label given by `<ng-template mat-tab-label>`. */
  @ContentChild(MAT_TAB_LABEL)
  get templateLabel(): MatTabLabel {
    return this._templateLabel;
  }
  set templateLabel(value: MatTabLabel) {
    this._setTemplateLabelInput(value);
  }
  protected _templateLabel: MatTabLabel;

  /**
   * Template provided in the tab content that will be used if present, used to enable lazy-loading
   */
  @ContentChild(MAT_TAB_CONTENT, {read: TemplateRef, static: true})
  _explicitContent: TemplateRef<any>;

  /** Template inside the MatTab view that contains an `<ng-content>`. */
  @ViewChild(TemplateRef, {static: true}) _implicitContent: TemplateRef<any>;

  /** Plain text label for the tab, used when there is no template label. */
  @Input('label') textLabel: string = '';

  /** Aria label for the tab. */
  @Input('aria-label') ariaLabel: string;

  /**
   * Reference to the element that the tab is labelled by.
   * Will be cleared if `aria-label` is set at the same time.
   */
  @Input('aria-labelledby') ariaLabelledby: string;

  /**
   * Classes to be passed to the tab label inside the mat-tab-header container.
   * Supports string and string array values, same as `ngClass`.
   */
  @Input() labelClass: string | string[];

  /**
   * Classes to be passed to the tab mat-tab-body container.
   * Supports string and string array values, same as `ngClass`.
   */
  @Input() bodyClass: string | string[];

  /** Portal that will be the hosted content of the tab */
  private _contentPortal: TemplatePortal | null = null;

  /** @docs-private */
  get content(): TemplatePortal | null {
    return this._contentPortal;
  }

  /** Emits whenever the internal state of the tab changes. */
  readonly _stateChanges = new Subject<void>();

  /**
   * The relatively indexed position where 0 represents the center, negative is left, and positive
   * represents the right.
   */
  position: number | null = null;

  /**
   * The initial relatively index origin of the tab if it was created and selected after there
   * was already a selected tab. Provides context of what position the tab should originate from.
   */
  origin: number | null = null;

  /**
   * Whether the tab is currently active.
   */
  isActive = false;

  constructor(
    private _viewContainerRef: ViewContainerRef,
    @Inject(MAT_TAB_GROUP) @Optional() public _closestTabGroup: any,
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('textLabel') || changes.hasOwnProperty('disabled')) {
      this._stateChanges.next();
    }
  }

  ngOnDestroy(): void {
    this._stateChanges.complete();
  }

  ngOnInit(): void {
    this._contentPortal = new TemplatePortal(
      this._explicitContent || this._implicitContent,
      this._viewContainerRef,
    );
  }

  /**
   * This has been extracted to a util because of TS 4 and VE.
   * View Engine doesn't support property rename inheritance.
   * TS 4.0 doesn't allow properties to override accessors or vice-versa.
   * @docs-private
   */
  protected _setTemplateLabelInput(value: MatTabLabel | undefined) {
    // Only update the label if the query managed to find one. This works around an issue where a
    // user may have manually set `templateLabel` during creation mode, which would then get
    // clobbered by `undefined` when the query resolves. Also note that we check that the closest
    // tab matches the current one so that we don't pick up labels from nested tabs.
    if (value && value._closestTab === this) {
      this._templateLabel = value;
    }
  }
}
