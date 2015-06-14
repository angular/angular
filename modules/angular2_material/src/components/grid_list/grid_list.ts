import {Component, View, Parent, onDestroy, onChange, onAllChangesDone} from 'angular2/angular2';

import {ListWrapper} from 'angular2/src/facade/collection';
import {
  StringWrapper,
  isPresent,
  isString,
  NumberWrapper,
  RegExpWrapper
} from 'angular2/src/facade/lang';
import {Math} from 'angular2/src/facade/math';

// TODO(jelbourn): Set appropriate aria attributes for grid list elements.
// TODO(jelbourn): Animations.
// TODO(jelbourn): Conditional (responsive) column count / row size.
// TODO(jelbourn): Re-layout on window resize / media change (debounced).
// TODO(jelbourn): gridTileHeader and gridTileFooter.
// TODO(jelbourn): rowHeightMode enum (after TS conversion).

@Component({
  selector: 'md-grid-list',
  properties: ['cols', 'rowHeight', 'gutterSize'],
  lifecycle: [onAllChangesDone]
})
@View({templateUrl: 'angular2_material/src/components/grid_list/grid_list.html'})
export class MdGridList {
  /** List of tiles that are being rendered. */
  tiles: List<MdGridTile>;

  /** Number of columns being rendered. */
  _cols: number;

  /** Number of rows being rendered (computed). */
  rows: number;

  /** Mode used to determine row heights. See RowHeightMode. */
  rowHeightMode: string;

  /** Fixed row height, as given by the user. Only used for 'fixed' mode. */
  fixedRowHeight: string;

  /** Ratio width:height given by user to determine row height. Only used for 'ratio' mode.*/
  rowHeightRatio: number;

  /** The amount of space between tiles. This will be something like '5px' or '2em'. */
  gutterSize: string;

  constructor() {
    this.tiles = [];
    this.rows = 0;
  }

  set cols(value) {
    this._cols = isString(value) ? NumberWrapper.parseInt(value, 10) : value;
  }

  get cols() {
    return this._cols;
  }

  /** Set internal representation of row height from the user-provided value. */
  set rowHeight(value) {
    if (value === 'fit') {
      this.rowHeightMode = 'fit';
    } else if (StringWrapper.contains(value, ':')) {
      var ratioParts = StringWrapper.split(value, RegExpWrapper.create(':'));
      if (ratioParts.length !== 2) {
        throw `md-grid-list: invalid ratio given for row-height: "${value}"`;
      }

      this.rowHeightMode = 'ratio';
      this.rowHeightRatio =
          NumberWrapper.parseFloat(ratioParts[0]) / NumberWrapper.parseFloat(ratioParts[1]);
    } else {
      this.rowHeightMode = 'fixed';
      this.fixedRowHeight = value;
    }
  }

  onAllChangesDone() {
    this.layoutTiles();
  }

  /** Computes and applies the size and position for all children grid tiles. */
  layoutTiles() {
    var tracker = new TileCoordinator(this.cols, this.tiles);
    this.rows = tracker.rowCount;

    for (var i = 0; i < this.tiles.length; i++) {
      var pos = tracker.positions[i];
      var tile = this.tiles[i];
      var style = this.getTileStyle(tile, pos.row, pos.col);

      tile.styleWidth = style.width;
      tile.styleHeight = style.height;
      tile.styleTop = style.top;
      tile.styleLeft = style.left;
      tile.styleMarginTop = style.marginTop;
      tile.stylePaddingTop = style.paddingTop;
    }
  }

  /**
   * Adds a tile to the grid-list.
   * @param tile
   */
  addTile(tile: MdGridTile) {
    ListWrapper.push(this.tiles, tile);
  }

  /**
   * Removes a tile from the grid-list.
   * @param tile
   */
  removeTile(tile: MdGridTile) {
    ListWrapper.remove(this.tiles, tile);
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
    // edges, each tile only uses a fration (gutterShare = numGutters / numCells) of the gutter
    // size. (Imagine having one gutter per tile, and then breaking up the extra gutter on the
    // edge evenly among the cells).
    return `(${sizePercent}% - ( ${this.gutterSize} * ${gutterFraction} ))`;
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
    return `calc( (${baseSize} + ${this.gutterSize}) * ${offset} )`;
  }


  /**
   * Gets the actual size of a tile, e.g., width or height, taking rowspan or colspan into account.
   * @param baseSize Base size of a 1x1 tile (as computed in getBaseTileSize).
   * @param span The tile's rowspan or colspan.
   * @return Size of the tile as a CSS calc() expression.
   */
  getTileSize(baseSize: string, span: number): string {
    return `calc( (${baseSize} * ${span}) + (${span - 1} * ${this.gutterSize}) )`;
  }


  /** Gets the style properties to be applied to a tile for the given row and column index. */
  getTileStyle(tile: MdGridTile, rowIndex: number, colIndex: number): TileStyle {
    // Percent of the available horizontal space that one column takes up.
    var percentWidthPerTile = 100 / this.cols;

    // Fraction of the vertical gutter size that each column takes up.
    // For example, if there are 5 columns, each column uses 4/5 = 0.8 times the gutter width.
    var gutterWidthFractionPerTile = (this.cols - 1) / this.cols;

    // Base horizontal size of a column.
    var baseTileWidth = this.getBaseTileSize(percentWidthPerTile, gutterWidthFractionPerTile);

    // The width and horizontal position of each tile is always calculated the same way, but the
    // height and vertical position depends on the rowMode.
    var tileStyle = new TileStyle();
    tileStyle.left = this.getTilePosition(baseTileWidth, colIndex);
    tileStyle.width = this.getTileSize(baseTileWidth, tile.colspan);

    // TODO: make cases enums when we support enums
    switch (this.rowHeightMode) {
      case 'fixed':
        // In fixed mode, simply use the given row height.
        tileStyle.top = this.getTilePosition(this.fixedRowHeight, rowIndex);
        tileStyle.height = this.getTileSize(this.fixedRowHeight, tile.rowspan);
        break;

      case 'ratio':
        var percentHeightPerTile = percentWidthPerTile / this.rowHeightRatio;
        var baseTileHeight = this.getBaseTileSize(percentHeightPerTile, gutterWidthFractionPerTile);

        // Use paddingTop and marginTop to maintain the given aspect ratio, as
        // a percentage-based value for these properties is applied versus the *width* of the
        // containing block. See http://www.w3.org/TR/CSS2/box.html#margin-properties
        tileStyle.marginTop = this.getTilePosition(baseTileHeight, rowIndex);
        tileStyle.paddingTop = this.getTileSize(baseTileHeight, tile.rowspan);
        break;

      case 'fit':
        // Percent of the available vertical space that one row takes up.
        var percentHeightPerTile = 100 / this.cols;

        // Fraction of the horizontal gutter size that each column takes up.
        var gutterHeightFractionPerTile = (this.rows - 1) / this.rows;

        // Base vertical size of a column.
        var baseTileHeight =
            this.getBaseTileSize(percentHeightPerTile, gutterHeightFractionPerTile);

        tileStyle.top = this.getTilePosition(baseTileHeight, rowIndex);
        tileStyle.height = this.getTileSize(baseTileHeight, tile.rowspan);

        break;
    }

    return tileStyle;
  }
}

@Component({
  selector: 'md-grid-tile',
  properties: ['rowspan', 'colspan'],
  host: {
    '[style.height]': 'styleHeight',
    '[style.width]': 'styleWidth',
    '[style.top]': 'styleTop',
    '[style.left]': 'styleLeft',
    '[style.marginTop]': 'styleMarginTop',
    '[style.paddingTop]': 'stylePaddingTop',
    '[role]': '"listitem"'
  },
  lifecycle: [onDestroy, onChange]
})
@View({templateUrl: 'angular2_material/src/components/grid_list/grid_tile.html'})
export class MdGridTile {
  gridList: MdGridList;
  _rowspan: number;
  _colspan: number;

  styleHeight: string;
  styleWidth: string;
  styleTop: string;
  styleLeft: string;
  styleMarginTop: string;
  stylePaddingTop: string;

  isRegisteredWithGridList: boolean;

  constructor(@Parent() gridList: MdGridList) {
    this.gridList = gridList;

    // Tiles default to 1x1, but rowspan and colspan can be changed via binding.
    this.rowspan = 1;
    this.colspan = 1;
  }

  set rowspan(value) {
    this._rowspan = isString(value) ? NumberWrapper.parseInt(value, 10) : value;
  }

  get rowspan() {
    return this._rowspan;
  }

  set colspan(value) {
    this._colspan = isString(value) ? NumberWrapper.parseInt(value, 10) : value;
  }

  get colspan() {
    return this._colspan;
  }

  /**
   * Change handler invoked when bindings are resolved or when bindings have changed.
   * Notifies grid-list that a re-layout is required.
   */
  onChange(_) {
    if (!this.isRegisteredWithGridList) {
      this.gridList.addTile(this);
      this.isRegisteredWithGridList = true;
    }
  }

  /**
   * Destructor function. Deregisters this tile from the containing grid-list.
   */
  onDestroy() {
    this.gridList.removeTile(this);
  }
}


/**
 * Class for determining, from a list of tiles, the (row, col) position of each of those tiles
 * in the grid. This is necessary (rather than just rendering the tiles in normal document flow)
 * because the tiles can have a rowspan.
 *
 * The positioning algorithm greedily places each tile as soon as it encounters a gap in the grid
 * large enough to accomodate it so that the tiles still render in the same order in which they
 * are given.
 *
 * The basis of the algorithm is the use of an array to track the already placed tiles. Each
 * element of the array corresponds to a column, and the value indicates how many cells in that
 * column are already occupied; zero indicates an empty cell. Moving "down" to the next row
 * decrements each value in the tracking array (indicating that the column is one cell closer to
 * being free).
 */
class TileCoordinator {
  // Tracking array (see class description).
  tracker: List<int>;

  // Index at which the search for the next gap will start.
  columnIndex: int;

  // The current row index.
  rowIndex: int;

  // The computed (row, col) position of each tile (the output).
  positions: List<Position>;

  constructor(numColumns: number, tiles: List<MdGridTile>) {
    this.columnIndex = 0;
    this.rowIndex = 0;

    this.tracker = ListWrapper.createFixedSize(numColumns);
    ListWrapper.fill(this.tracker, 0);

    this.positions = ListWrapper.map(tiles, tile => this._trackTile(tile));
  }

  /** Gets the number of rows occupied by tiles. */
  get rowCount() {
    return this.rowIndex + 1;
  }

  _trackTile(tile: MdGridTile): Position {
    if (tile.colspan > this.tracker.length) {
      throw `Tile with colspan ${tile.colspan} is wider
          than grid with cols="${this.tracker.length}".`
    }

    // Start index is inclusive, end index is exclusive.
    var gapStartIndex = -1;
    var gapEndIndex = -1;

    // Look for a gap large enough to fit the given tile. Empty spaces are marked with a zero.
    do {
      // If we've reached the end of the row, go to the next row
      if (this.columnIndex + tile.colspan > this.tracker.length) {
        this._nextRow();
        continue;
      }

      gapStartIndex = ListWrapper.indexOf(this.tracker, 0, this.columnIndex);

      // If there are no more empty spaces in this row at all, move on to the next row.
      if (gapStartIndex == -1) {
        this._nextRow();
        continue;
      }

      gapEndIndex = this._findGapEndIndex(gapStartIndex);

      // If a gap large enough isn't found, we want to start looking immediately after the current
      // gap on the next iteration.
      this.columnIndex = gapStartIndex + 1;

      // Continue iterating until we find a gap wide enough for this tile.
    } while (gapEndIndex - gapStartIndex < tile.colspan);

    // We now have a space big enough for this tile, so place it.
    this._markTilePosition(gapStartIndex, tile);

    // The next time we look for a gap, the search will start at columnIndex, which should be
    // immediately after the tile that has just been placed.
    this.columnIndex = gapStartIndex + tile.colspan;

    return new Position(this.rowIndex, gapStartIndex);
  }

  /** Move "down" to the next row. */
  _nextRow() {
    this.columnIndex = 0;
    this.rowIndex++;

    // Decrement all spaces by one to reflect moving down one row.
    for (var i = 0; i < this.tracker.length; i++) {
      this.tracker[i] = Math.max(0, this.tracker[i] - 1);
    }
  }

  /**
   * Finds the end index (exclusive) of a gap given the index from which to start looking.
   * The gap ends when a non-zero value is found.
   */
  _findGapEndIndex(gapStartIndex: number): number {
    for (var i = gapStartIndex + 1; i < this.tracker.length; i++) {
      if (this.tracker[i] != 0) {
        return i;
      }
    }

    // The gap ends with the end of the row.
    return this.tracker.length;
  }

  /** Update the tile tracker to account for the given tile in the given space. */
  _markTilePosition(start, tile) {
    for (var i = 0; i < tile.colspan; i++) {
      this.tracker[start + i] = tile.rowspan;
    }
  }
}

/** Simple data structure for tile position (row, col). */
class Position {
  row: number;
  col: number;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }
}


/** Simple data structure for style values to be applied to a tile. */
class TileStyle {
  height: string;
  width: string;
  top: string;
  left: string;
  marginTop: string;
  paddingTop: string;
}
