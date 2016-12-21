import {MdGridTile} from './grid-tile';
import {TileCoordinator} from './tile-coordinator';
import {MdGridListBadRatioError} from './grid-list-errors';

/**
 * Sets the style properties for an individual tile, given the position calculated by the
 * Tile Coordinator.
 * @docs-private
 */
export class TileStyler {
  _gutterSize: string;
  _rows: number = 0;
  _rowspan: number = 0;
  _cols: number;
  _direction: string;

  /**
   * Adds grid-list layout info once it is available. Cannot be processed in the constructor
   * because these properties haven't been calculated by that point.
   *
   * @param gutterSize Size of the grid's gutter.
   * @param tracker Instance of the TileCoordinator.
   * @param cols Amount of columns in the grid.
   * @param direction Layout direction of the grid.
   */
  init(gutterSize: string, tracker: TileCoordinator, cols: number, direction: string): void {
    this._gutterSize = normalizeUnits(gutterSize);
    this._rows = tracker.rowCount;
    this._rowspan = tracker.rowspan;
    this._cols = cols;
    this._direction = direction;
  }

  /**
   * Computes the amount of space a single 1x1 tile would take up (width or height).
   * Used as a basis for other calculations.
   * @param sizePercent Percent of the total grid-list space that one 1x1 tile would take up.
   * @param gutterFraction Fraction of the gutter size taken up by one 1x1 tile.
   * @return The size of a 1x1 tile as an expression that can be evaluated via CSS calc().
   */
  getBaseTileSize(sizePercent: number, gutterFraction: number): string {
    // Take the base size percent (as would be if evenly dividing the size between cells),
    // and then subtracting the size of one gutter. However, since there are no gutters on the
    // edges, each tile only uses a fraction (gutterShare = numGutters / numCells) of the gutter
    // size. (Imagine having one gutter per tile, and then breaking up the extra gutter on the
    // edge evenly among the cells).
    return `(${sizePercent}% - ( ${this._gutterSize} * ${gutterFraction} ))`;
  }


  /**
   * Gets The horizontal or vertical position of a tile, e.g., the 'top' or 'left' property value.
   * @param offset Number of tiles that have already been rendered in the row/column.
   * @param baseSize Base size of a 1x1 tile (as computed in getBaseTileSize).
   * @return Position of the tile as a CSS calc() expression.
   */
  getTilePosition(baseSize: string, offset: number): string {
    // The position comes the size of a 1x1 tile plus gutter for each previous tile in the
    // row/column (offset).
    return calc(`(${baseSize} + ${this._gutterSize}) * ${offset}`);
  }


  /**
   * Gets the actual size of a tile, e.g., width or height, taking rowspan or colspan into account.
   * @param baseSize Base size of a 1x1 tile (as computed in getBaseTileSize).
   * @param span The tile's rowspan or colspan.
   * @return Size of the tile as a CSS calc() expression.
   */
  getTileSize(baseSize: string, span: number): string {
    return `(${baseSize} * ${span}) + (${span - 1} * ${this._gutterSize})`;
  }


  /**
   * Sets the style properties to be applied to a tile for the given row and column index.
   * @param tile Tile to which to apply the styling.
   * @param rowIndex Index of the tile's row.
   * @param colIndex Index of the tile's column.
   */
  setStyle(tile: MdGridTile, rowIndex: number, colIndex: number): void {
    // Percent of the available horizontal space that one column takes up.
    let percentWidthPerTile = 100 / this._cols;

    // Fraction of the vertical gutter size that each column takes up.
    // For example, if there are 5 columns, each column uses 4/5 = 0.8 times the gutter width.
    let gutterWidthFractionPerTile = (this._cols - 1) / this._cols;

    this.setColStyles(tile, colIndex, percentWidthPerTile, gutterWidthFractionPerTile);
    this.setRowStyles(tile, rowIndex, percentWidthPerTile, gutterWidthFractionPerTile);
  }

  /** Sets the horizontal placement of the tile in the list. */
  setColStyles(tile: MdGridTile, colIndex: number, percentWidth: number,
               gutterWidth: number) {
    // Base horizontal size of a column.
    let baseTileWidth = this.getBaseTileSize(percentWidth, gutterWidth);

    // The width and horizontal position of each tile is always calculated the same way, but the
    // height and vertical position depends on the rowMode.
    let side = this._direction === 'ltr' ? 'left' : 'right';
    tile._setStyle(side, this.getTilePosition(baseTileWidth, colIndex));
    tile._setStyle('width', calc(this.getTileSize(baseTileWidth, tile.colspan)));
  }

  /**
   * Calculates the total size taken up by gutters across one axis of a list.
   */
  getGutterSpan(): string {
    return `${this._gutterSize} * (${this._rowspan} - 1)`;
  }

  /**
   * Calculates the total size taken up by tiles across one axis of a list.
   * @param tileHeight Height of the tile.
   */
  getTileSpan(tileHeight: string): string {
    return `${this._rowspan} * ${this.getTileSize(tileHeight, 1)}`;
  }

  /**
   * Sets the vertical placement of the tile in the list.
   * This method will be implemented by each type of TileStyler.
   * @docs-private
   */
  setRowStyles(tile: MdGridTile, rowIndex: number, percentWidth: number, gutterWidth: number) {}

  /**
   * Calculates the computed height and returns the correct style property to set.
   * This method will be implemented by each type of TileStyler.
   * @docs-private
   */
  getComputedHeight(): [string, string] { return null; }
}


/**
 * This type of styler is instantiated when the user passes in a fixed row height.
 * Example <md-grid-list cols="3" rowHeight="100px">
 * @docs-private
 */
export class FixedTileStyler extends TileStyler {

  constructor(public fixedRowHeight: string) { super(); }

  init(gutterSize: string, tracker: TileCoordinator, cols: number, direction: string) {
    super.init(gutterSize, tracker, cols, direction);
    this.fixedRowHeight = normalizeUnits(this.fixedRowHeight);
  }

  setRowStyles(tile: MdGridTile, rowIndex: number, percentWidth: number,
               gutterWidth: number): void {
    tile._setStyle('top', this.getTilePosition(this.fixedRowHeight, rowIndex));
    tile._setStyle('height', calc(this.getTileSize(this.fixedRowHeight, tile.rowspan)));
  }

  getComputedHeight(): [string, string] {
    return [
      'height', calc(`${this.getTileSpan(this.fixedRowHeight)} + ${this.getGutterSpan()}`)
    ];
  }
}


/**
 * This type of styler is instantiated when the user passes in a width:height ratio
 * for the row height.  Example <md-grid-list cols="3" rowHeight="3:1">
 * @docs-private
 */
export class RatioTileStyler extends TileStyler {

  /** Ratio width:height given by user to determine row height.*/
  rowHeightRatio: number;
  baseTileHeight: string;

  constructor(value: string) {
    super();
    this._parseRatio(value);
  }

  setRowStyles(tile: MdGridTile, rowIndex: number, percentWidth: number,
               gutterWidth: number): void {
    let percentHeightPerTile = percentWidth / this.rowHeightRatio;
    this.baseTileHeight = this.getBaseTileSize(percentHeightPerTile, gutterWidth);

    // Use paddingTop and marginTop to maintain the given aspect ratio, as
    // a percentage-based value for these properties is applied versus the *width* of the
    // containing block. See http://www.w3.org/TR/CSS2/box.html#margin-properties
    tile._setStyle('marginTop', this.getTilePosition(this.baseTileHeight, rowIndex));
    tile._setStyle('paddingTop', calc(this.getTileSize(this.baseTileHeight, tile.rowspan)));
  }

  getComputedHeight(): [string, string] {
    return [
      'paddingBottom', calc(`${this.getTileSpan(this.baseTileHeight)} + ${this.getGutterSpan()}`)
    ];
  }

  private _parseRatio(value: string): void {
    let ratioParts = value.split(':');

    if (ratioParts.length !== 2) {
      throw new MdGridListBadRatioError(value);
    }

    this.rowHeightRatio = parseFloat(ratioParts[0]) / parseFloat(ratioParts[1]);
  }
}

/**
 * This type of styler is instantiated when the user selects a "fit" row height mode.
 * In other words, the row height will reflect the total height of the container divided
 * by the number of rows.  Example <md-grid-list cols="3" rowHeight="fit">
 *
 * @docs-private
 */
export class FitTileStyler extends TileStyler {

  setRowStyles(tile: MdGridTile, rowIndex: number, percentWidth: number,
               gutterWidth: number): void {
    // Percent of the available vertical space that one row takes up.
    let percentHeightPerTile = 100 / this._rowspan;

    // Fraction of the horizontal gutter size that each column takes up.
    let gutterHeightPerTile = (this._rows - 1) / this._rows;

    // Base vertical size of a column.
    let baseTileHeight = this.getBaseTileSize(percentHeightPerTile, gutterHeightPerTile);

    tile._setStyle('top', this.getTilePosition(baseTileHeight, rowIndex));
    tile._setStyle('height', calc(this.getTileSize(baseTileHeight, tile.rowspan)));
  }
}


/** Wraps a CSS string in a calc function */
function calc(exp: string): string { return `calc(${exp})`; }


/** Appends pixels to a CSS string if no units are given. */
function normalizeUnits(value: string): string {
  return (value.match(/px|em|rem/)) ? value : value + 'px';
}

