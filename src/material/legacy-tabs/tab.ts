/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import {
  _MatTabBase,
  MAT_TAB,
  MatTabLabel,
  MAT_TAB_LABEL,
  MAT_TAB_CONTENT,
} from '@angular/material/tabs';

/**
 * @deprecated Use `MatTab` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@Component({
  selector: 'mat-tab',
  templateUrl: 'tab.html',
  inputs: ['disabled'],
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'matTab',
  providers: [{provide: MAT_TAB, useExisting: MatLegacyTab}],
})
export class MatLegacyTab extends _MatTabBase {
  /** Content for the tab label given by `<ng-template mat-tab-label>`. */
  @ContentChild(MAT_TAB_LABEL)
  get templateLabel(): MatTabLabel {
    return this._templateLabel;
  }
  set templateLabel(value: MatTabLabel) {
    this._setTemplateLabelInput(value);
  }

  /**
   * Template provided in the tab content that will be used if present, used to enable lazy-loading
   */
  @ContentChild(MAT_TAB_CONTENT, {read: TemplateRef, static: true})
  override _explicitContent: TemplateRef<any>;
}
