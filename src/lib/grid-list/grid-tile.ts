/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  ViewEncapsulation,
  ElementRef,
  Input,
  Optional,
  ContentChildren,
  QueryList,
  AfterContentInit,
  Directive,
  ChangeDetectionStrategy,
  Inject,
} from '@angular/core';
import {MatLine, setLines} from '@angular/material/core';
import {coerceNumberProperty} from '@angular/cdk/coercion';
import {MAT_GRID_LIST, MatGridListBase} from './grid-list-base';

@Component({
  moduleId: module.id,
  selector: 'mat-grid-tile',
  exportAs: 'matGridTile',
  host: {
    'class': 'mat-grid-tile',
  },
  templateUrl: 'grid-tile.html',
  styleUrls: ['grid-list.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatGridTile {
  _rowspan: number = 1;
  _colspan: number = 1;

  constructor(
    private _element: ElementRef<HTMLElement>,
    @Optional() @Inject(MAT_GRID_LIST) public _gridList?: MatGridListBase) {}

  /** Amount of rows that the grid tile takes up. */
  @Input()
  get rowspan(): number { return this._rowspan; }
  set rowspan(value: number) { this._rowspan = Math.round(coerceNumberProperty(value)); }

  /** Amount of columns that the grid tile takes up. */
  @Input()
  get colspan(): number { return this._colspan; }
  set colspan(value: number) { this._colspan = Math.round(coerceNumberProperty(value)); }

  /**
   * Sets the style of the grid-tile element.  Needs to be set manually to avoid
   * "Changed after checked" errors that would occur with HostBinding.
   */
  _setStyle(property: string, value: any): void {
    (this._element.nativeElement.style as any)[property] = value;
  }
}

@Component({
  moduleId: module.id,
  selector: 'mat-grid-tile-header, mat-grid-tile-footer',
  templateUrl: 'grid-tile-text.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatGridTileText implements AfterContentInit {
  @ContentChildren(MatLine) _lines: QueryList<MatLine>;

  constructor(private _element: ElementRef<HTMLElement>) {}

  ngAfterContentInit() {
    setLines(this._lines, this._element);
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
