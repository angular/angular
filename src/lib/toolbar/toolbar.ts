/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import {CanColor, mixinColor} from '@angular/material/core';


@Directive({
  selector: 'mat-toolbar-row',
  host: {'class': 'mat-toolbar-row'},
})
export class MatToolbarRow {}

// Boilerplate for applying mixins to MatToolbar.
/** @docs-private */
export class MatToolbarBase {
  constructor(public _renderer: Renderer2, public _elementRef: ElementRef) {}
}
export const _MatToolbarMixinBase = mixinColor(MatToolbarBase);


@Component({
  moduleId: module.id,
  selector: 'mat-toolbar',
  templateUrl: 'toolbar.html',
  styleUrls: ['toolbar.css'],
  inputs: ['color'],
  host: {
    'class': 'mat-toolbar',
    'role': 'toolbar'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MatToolbar extends _MatToolbarMixinBase implements CanColor {

  constructor(renderer: Renderer2, elementRef: ElementRef) {
    super(renderer, elementRef);
  }

}
