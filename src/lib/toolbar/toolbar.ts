/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  isDevMode,
  QueryList,
  ViewEncapsulation
} from '@angular/core';
import {CanColor, mixinColor} from '@angular/material/core';
import {Platform} from '@angular/cdk/platform';

// Boilerplate for applying mixins to MatToolbar.
/** @docs-private */
export class MatToolbarBase {
  constructor(public _elementRef: ElementRef) {}
}
export const _MatToolbarMixinBase = mixinColor(MatToolbarBase);

@Directive({
  selector: 'mat-toolbar-row',
  exportAs: 'matToolbarRow',
  host: {'class': 'mat-toolbar-row'},
})
export class MatToolbarRow {}

@Component({
  moduleId: module.id,
  selector: 'mat-toolbar',
  exportAs: 'matToolbar',
  templateUrl: 'toolbar.html',
  styleUrls: ['toolbar.css'],
  inputs: ['color'],
  host: {
    'class': 'mat-toolbar',
    '[class.mat-toolbar-multiple-rows]': 'this._toolbarRows.length',
    '[class.mat-toolbar-single-row]': '!this._toolbarRows.length'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MatToolbar extends _MatToolbarMixinBase implements CanColor, AfterViewInit {

  /** Reference to all toolbar row elements that have been projected. */
  @ContentChildren(MatToolbarRow) _toolbarRows: QueryList<MatToolbarRow>;

  constructor(elementRef: ElementRef, private _platform: Platform) {
    super(elementRef);
  }

  ngAfterViewInit() {
    if (!isDevMode() || !this._platform.isBrowser) {
      return;
    }

    this._checkToolbarMixedModes();
    this._toolbarRows.changes.subscribe(() => this._checkToolbarMixedModes());
  }

  /**
   * Throws an exception when developers are attempting to combine the different toolbar row modes.
   */
  private _checkToolbarMixedModes() {
    if (!this._toolbarRows.length) {
      return;
    }

    // Check if there are any other DOM nodes that can display content but aren't inside of
    // a <mat-toolbar-row> element.
    const isCombinedUsage = [].slice.call(this._elementRef.nativeElement.childNodes)
      .filter(node => !(node.classList && node.classList.contains('mat-toolbar-row')))
      .filter(node => node.nodeType !== Node.COMMENT_NODE)
      .some(node => node.textContent.trim());

    if (isCombinedUsage) {
      throwToolbarMixedModesError();
    }
  }
}

/**
 * Throws an exception when attempting to combine the different toolbar row modes.
 * @docs-private
 */
export function throwToolbarMixedModesError() {
  throw Error('MatToolbar: Attempting to combine different toolbar modes. ' +
    'Either specify multiple `<mat-toolbar-row>` elements explicitly or just place content ' +
    'inside of a `<mat-toolbar>` for a single row.');
}
