import {
  Component,
  ViewEncapsulation,
  AfterContentChecked,
  OnInit,
  Input,
  ContentChildren,
  QueryList,
  Renderer,
  ElementRef
} from '@angular/core';
import {MdGridTile} from './grid-tile';
import {TileCoordinator} from './tile-coordinator';
import {
    TileStyler,
    FitTileStyler,
    RatioTileStyler,
    FixedTileStyler
} from './tile-styler';
import {MdGridListColsError} from './grid-list-errors';
import {Dir} from '../../core/rtl/dir';

// TODO(kara): Conditional (responsive) column count / row size.
// TODO(kara): Re-layout on window resize / media change (debounced).
// TODO(kara): gridTileHeader and gridTileFooter.

const MD_FIT_MODE = 'fit';

@Component({
  selector: 'md-grid-list',
  host: { 'role': 'list' },
  templateUrl: './components/grid-list/grid-list.html',
  styleUrls: ['./components/grid-list/grid-list.css'],
  encapsulation: ViewEncapsulation.None,
})
export class MdGridList implements OnInit, AfterContentChecked {
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
  @ContentChildren(MdGridTile) private _tiles: QueryList<MdGridTile>;

  constructor(
      private _renderer: Renderer,
      private _element: ElementRef,
      private _dir: Dir) {}

  @Input()
  get cols() {
    return this._cols;
  }

  set cols(value: any) {
    this._cols = coerceToNumber(value);
  }

  @Input('gutterSize')
  get gutterSize() {
    return this._gutter;
  }

  set gutterSize(value: any) {
    this._gutter = coerceToString(value);
  }

  /** Set internal representation of row height from the user-provided value. */
  @Input()
  set rowHeight(value: string | number) {
    this._rowHeight = coerceToString(value);
    this._setTileStyler();
  }

  /** @internal */
  ngOnInit() {
    this._checkCols();
    this._checkRowHeight();
  }

  /**
   * The layout calculation is fairly cheap if nothing changes, so there's little cost
   * to run it frequently.
   * @internal
   */
  ngAfterContentChecked() {
    this._layoutTiles();
  }

  /** Throw a friendly error if cols property is missing */
  private _checkCols() {
    if (!this.cols) {
      throw new MdGridListColsError();
    }
  }

  /** Default to equal width:height if rowHeight property is missing */
  private _checkRowHeight(): void {
    if (!this._rowHeight) {
      this._tileStyler = new RatioTileStyler('1:1');
    }
  }

  /** Creates correct Tile Styler subtype based on rowHeight passed in by user */
  private _setTileStyler(): void {
    if (this._rowHeight === MD_FIT_MODE) {
      this._tileStyler = new FitTileStyler();
    } else if (this._rowHeight && this._rowHeight.match(/:/g)) {
      this._tileStyler = new RatioTileStyler(this._rowHeight);
    } else {
      this._tileStyler = new FixedTileStyler(this._rowHeight);
    }
  }

  /** Computes and applies the size and position for all children grid tiles. */
  private _layoutTiles(): void {
    let tiles = this._tiles.toArray();
    let tracker = new TileCoordinator(this.cols, tiles);
    this._tileStyler.init(this.gutterSize, tracker, this.cols, this._dir);

    for (let i = 0; i < tiles.length; i++) {
      let pos = tracker.positions[i];
      let tile = tiles[i];
      this._tileStyler.setStyle(tile, pos.row, pos.col);
    }
    this.setListStyle(this._tileStyler.getComputedHeight());
  }

  /**
   * Sets style on the main grid-list element, given the style name and value.
   * @internal
   */
  setListStyle(style: [string, string]): void {
    if (style) {
      this._renderer.setElementStyle(this._element.nativeElement, style[0], style[1]);
    }
  }
}

/**
 * Converts values into strings. Falsy values become empty strings.
 * @internal
 */
export function coerceToString(value: string | number): string {
  return `${value || ''}`;
}

/**
 * Converts a value that might be a string into a number.
 * @internal
 */
export function coerceToNumber(value: string | number): number {
  return typeof value === 'string' ? parseInt(value, 10) : value;
}

export const MD_GRID_LIST_DIRECTIVES: any[] = [MdGridList, MdGridTile];
