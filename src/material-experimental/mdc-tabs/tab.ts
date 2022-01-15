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
  ViewEncapsulation,
  TemplateRef,
  ContentChild,
} from '@angular/core';
import {MatTab as BaseMatTab, MAT_TAB} from '@angular/material/tabs';
import {MatTabContent} from './tab-content';
import {MatTabLabel} from './tab-label';

@Component({
  selector: 'mat-tab',

  // Note that usually we'd go through a bit more trouble and set up another class so that
  // the inlined template of `MatTab` isn't duplicated, however the template is small enough
  // that creating the extra class will generate more code than just duplicating the template.
  templateUrl: 'tab.html',
  inputs: ['disabled'],
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'matTab',
  providers: [{provide: MAT_TAB, useExisting: MatTab}],
})
export class MatTab extends BaseMatTab {
  /**
   * Template provided in the tab content that will be used if present, used to enable lazy-loading
   */
  @ContentChild(MatTabContent, {read: TemplateRef, static: true})
  override _explicitContent: TemplateRef<any>;

  /** Content for the tab label given by `<ng-template mat-tab-label>`. */
  @ContentChild(MatTabLabel)
  override get templateLabel(): MatTabLabel {
    return this._templateLabel;
  }
  override set templateLabel(value: MatTabLabel) {
    this._setTemplateLabelInput(value);
  }
}
