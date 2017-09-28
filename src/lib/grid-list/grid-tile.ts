/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  ViewEncapsulation,
  Renderer2,
  ElementRef,
  Input,
  ContentChildren,
  QueryList,
  AfterContentInit,
  Directive,
  ChangeDetectionStrategy,
} from '@angular/core';
import {MatLine, MatLineSetter} from '@angular/material/core';
import {coerceToNumber} from './grid-list-measure';

@Component({
  moduleId: module.id,
  selector: 'mat-grid-tile',
  host: {
    'class': 'mat-grid-tile',
  },
  templateUrl: 'grid-tile.html',
  styleUrls: ['grid-list.css'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatGridTile {
  _rowspan: number = 1;
  _colspan: number = 1;

  constructor(private _renderer: Renderer2, private _element: ElementRef) {}

  /** Amount of rows that the grid tile takes up. */
  @Input()
  get rowspan() { return this._rowspan; }
  set rowspan(value) { this._rowspan = coerceToNumber(value); }

  /** Amount of columns that the grid tile takes up. */
  @Input()
  get colspan() { return this._colspan; }
  set colspan(value) { this._colspan = coerceToNumber(value); }

  /**
   * Sets the style of the grid-tile element.  Needs to be set manually to avoid
   * "Changed after checked" errors that would occur with HostBinding.
   */
  _setStyle(property: string, value: any): void {
    this._renderer.setStyle(this._element.nativeElement, property, value);
  }
}

@Component({
  moduleId: module.id,
  selector: 'mat-grid-tile-header, mat-grid-tile-footer',
  templateUrl: 'grid-tile-text.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MatGridTileText implements AfterContentInit {
  /**
   *  Helper that watches the number of lines in a text area and sets
   * a class on the host element that matches the line count.
   */
  _lineSetter: MatLineSetter;
  @ContentChildren(MatLine) _lines: QueryList<MatLine>;

  constructor(private _renderer: Renderer2, private _element: ElementRef) {}

  ngAfterContentInit() {
    this._lineSetter = new MatLineSetter(this._lines, this._renderer, this._element);
  }
}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[mat-grid-avatar], [matGridAvatar]',
  host: {'class': 'mat-grid-avatar'}
})
export class MatGridAvatarCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'mat-grid-tile-header',
  host: {'class': 'mat-grid-tile-header'}
})
export class MatGridTileHeaderCssMatStyler {}

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: 'mat-grid-tile-footer',
  host: {'class': 'mat-grid-tile-footer'}
})
export class MatGridTileFooterCssMatStyler {}
