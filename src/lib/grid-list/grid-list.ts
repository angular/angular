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
  AfterContentChecked,
  OnInit,
  Input,
  ContentChildren,
  QueryList,
  Renderer2,
  ElementRef,
  Optional,
  ChangeDetectionStrategy,
} from '@angular/core';
import {MatGridTile} from './grid-tile';
import {TileCoordinator} from './tile-coordinator';
import {TileStyler, FitTileStyler, RatioTileStyler, FixedTileStyler} from './tile-styler';
import {Directionality} from '@angular/cdk/bidi';
import {
  coerceToString,
  coerceToNumber,
} from './grid-list-measure';


// TODO(kara): Conditional (responsive) column count / row size.
// TODO(kara): Re-layout on window resize / media change (debounced).
// TODO(kara): gridTileHeader and gridTileFooter.

const MAT_FIT_MODE = 'fit';

@Component({
  moduleId: module.id,
  selector: 'mat-grid-list',
  templateUrl: 'grid-list.html',
  styleUrls: ['grid-list.css'],
  host: {
    'class': 'mat-grid-list',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MatGridList implements OnInit, AfterContentChecked {
  /** Number of columns being rendered. */
  private _cols: number;

  /**
   * Row height value passed in by user. This can be one of three types:
   * - Number value (ex: "100px"):  sets a fixed row height to that value
   * - Ratio value (ex: "4:3"): sets the row height based on width:height ratio
   * - "Fit" mode (ex: "fit"): sets the row height to total height divided by number of rows
   */
  private _rowHeight: string;

  /** The amount of space between tiles. This will be something like '5px' or '2em'. */
  private _gutter: string = '1px';

  /** Sets position and size styles for a tile */
  private _tileStyler: TileStyler;

  /** Query list of tiles that are being rendered. */
  @ContentChildren(MatGridTile) _tiles: QueryList<MatGridTile>;

  constructor(
      private _renderer: Renderer2,
      private _element: ElementRef,
      @Optional() private _dir: Directionality) {}

  /** Amount of columns in the grid list. */
  @Input()
  get cols() { return this._cols; }
  set cols(value: any) { this._cols = coerceToNumber(value); }

  /** Size of the grid list's gutter in pixels. */
  @Input()
  get gutterSize() { return this._gutter; }
  set gutterSize(value: any) { this._gutter = coerceToString(value); }

  /** Set internal representation of row height from the user-provided value. */
  @Input()
  set rowHeight(value: string | number) {
    const newValue = coerceToString(value);

    if (newValue !== this._rowHeight) {
      this._rowHeight = newValue;
      this._setTileStyler(this._rowHeight);
    }
  }

  ngOnInit() {
    this._checkCols();
    this._checkRowHeight();
  }

  /**
   * The layout calculation is fairly cheap if nothing changes, so there's little cost
   * to run it frequently.
   */
  ngAfterContentChecked() {
    this._layoutTiles();
  }

  /** Throw a friendly error if cols property is missing */
  private _checkCols() {
    if (!this.cols) {
      throw Error(`mat-grid-list: must pass in number of columns. ` +
                  `Example: <mat-grid-list cols="3">`);
    }
  }

  /** Default to equal width:height if rowHeight property is missing */
  private _checkRowHeight(): void {
    if (!this._rowHeight) {
      this._setTileStyler('1:1');
    }
  }

  /** Creates correct Tile Styler subtype based on rowHeight passed in by user */
  private _setTileStyler(rowHeight: string): void {
    if (this._tileStyler) {
      this._tileStyler.reset(this);
    }

    if (rowHeight === MAT_FIT_MODE) {
      this._tileStyler = new FitTileStyler();
    } else if (rowHeight && rowHeight.indexOf(':') > -1) {
      this._tileStyler = new RatioTileStyler(rowHeight);
    } else {
      this._tileStyler = new FixedTileStyler(rowHeight);
    }
  }

  /** Computes and applies the size and position for all children grid tiles. */
  private _layoutTiles(): void {
    const tracker = new TileCoordinator(this.cols, this._tiles);
    const direction = this._dir ? this._dir.value : 'ltr';
    this._tileStyler.init(this.gutterSize, tracker, this.cols, direction);

    this._tiles.forEach((tile, index) => {
      const pos = tracker.positions[index];
      this._tileStyler.setStyle(tile, pos.row, pos.col);
    });

    this._setListStyle(this._tileStyler.getComputedHeight());
  }

  /** Sets style on the main grid-list element, given the style name and value. */
  _setListStyle(style: [string, string | null] | null): void {
    if (style) {
      this._renderer.setStyle(this._element.nativeElement, style[0], style[1]);
    }
  }
}
