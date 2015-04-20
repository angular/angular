import {Component, View, onAllChangesDone, Parent} from 'angular2/angular2';
import {onDestroy, onChange} from 'angular2/src/core/annotations/annotations';
import {ListWrapper} from 'angular2/src/facade/collection';
import {isPresent, isString, NumberWrapper, stringify} from 'angular2/src/facade/lang';
import {PropertySetter} from 'angular2/src/core/annotations/di';

// TODO(jelbourn): Set appropriate aria attributes for grid list elements.

@Component({
  selector: 'md-grid-list',
  properties: {
    'cols': 'cols',
    'gutterSize': 'gutter-size'
  },
  lifecycle: [onChange]
})
@View({
  templateUrl: 'angular2_material/src/components/grid_list/grid_list.html'
})
export class MdGridList {
  /** List of tiles that are being rendered. */
  tiles: List<MdGridTile>;

  /** Number of columns being rendered. Can be either string or number */
  cols;

  /** Mode used to determine row heights. See RowHeightMode. */
  rowHeightMode: string;

  /** Fixed row height, as given by the user. Only used for 'fixed' mode. */
  fixedRowHeight: number;

  /** Ratio width:height given by user to determine row height. Only used for 'ratio' mode.*/
  rowHeightRatio: number;

  /** The amount of space between tiles. This will be something like '5px' or '2em'. */
  gutterSize: string;

  /** List used to track the amount of space available. */
  spaceTracker: List<number>;

  constructor() {
    this.tiles = [];
  }

  onAllChangesDone() {
  }

  onChange(_) {
    if (!isPresent(this.spaceTracker)) {
      if (isString(this.cols)) {
        this.cols = NumberWrapper.parseIntAutoRadix(this.cols);
      }
      this.spaceTracker = ListWrapper.createFixedSize(this.cols);
      ListWrapper.fill(this.spaceTracker, 0);
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
   * Change handler invoked when bindings are resolved or when bindings have changed.
   * Performs a layout.
   */
  performLayout() {
    //console.log('laying out!');
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
    return `${sizePercent}% - ( ${this.gutterSize} * ${gutterFraction} )`;
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


  getTileStyle(tile: MdGridTile, rowIndex: number, colIndex: number): TileStyle {
    // Percent of the available horizontal space that one column takes up.
    var percentWidthPerTile = this.cols / 100;

    // Fraction of the gutter size that each column takes up.
    // For example, if there are 5 columns, each column uses 4/5 = 0.8 times the gutter width.
    var gutterWidthFractionPerTile = (this.cols - 1) / this.cols;

    // Base horizontal size of a column.
    var baseTileWidth = getBaseTileSize(percentWidthPerTile, gutterWidthFractionPerTile);

    // The width and horizontal position of each tile is always calculated the same way, but the
    // height and vertical position depends on the rowMode.
    var tileStyle = new TileStyle();
    tileStyle.left = getTilePosition(baseTileWidth, colIndex);
    tileStyle.width = getTileSize(baseTileWidth, tile.colspan);

    // TODO: make cases enums when we support enums
    switch (this.rowHeightMode) {
      case 'fixed':
        // In fixed mode, simply use the given row height.
        tileStyle.top = getTilePosition(stringify(this.fixedRowHeight), rowIndex);
        tileStyle.height = getTileSize(stringify(this.fixedRowHeight), tile.rowspan);
        break;

      case 'ratio':
        var percentHeightPerTile = percentWidthPerTile / this.rowHeightRatio;
        let baseTileHeight = getBaseTileSize(percentHeightPerTile, gutterWidthFractionPerTile);

        // Use paddingTop and marginTop to maintain the given aspect ratio, as
        // a percentage-based value for these properties is applied to the *width* of the
        // containing block. See http://www.w3.org/TR/CSS2/box.html#margin-properties
        tileStyle.marginTop = getTilePosition(baseTileHeight, rowIndex);
        tileStyle.paddingTop = getTileSize(baseTileHeight, tile.rowspan);
        break;

      case 'fit':
        break;
    }

    return tileStyle;
  }
}

@Component({
  selector: 'md-grid-tile',
  properties: {
    'rowspan': 'rowspan',
    'colspan': 'colspan'
  },
  lifecycle: [onDestroy, onChange]
})
@View({
  template: `<figure><content></content></figure>`
})
export class MdGridTile {
  gridList: MdGridList;
  rowspan: number;
  colspan: number;
  heightSetter;
  widthSetter;
  topSetter;
  leftSetter;
  marginTopSetter;
  paddingTopSetter;

  isRegisteredWithGridList: boolean;

  constructor(
      @Parent() gridList: MdGridList,
      @PropertySetter('style.height') heightSetter: Function,
      @PropertySetter('style.width') widthSetter: Function,
      @PropertySetter('style.top') topSetter: Function,
      @PropertySetter('style.left') leftSetter: Function,
      @PropertySetter('style.marginTop') marginTopSetter: Function,
      @PropertySetter('style.paddingTop') paddingTopSetter: Function,
      @PropertySetter('role') roleSetter: Function
      ) {
    this.gridList = gridList;
    this.heightSetter = heightSetter;
    this.widthSetter = widthSetter;
    this.topSetter = topSetter;
    this.leftSetter = leftSetter;
    this.marginTopSetter = marginTopSetter;
    this.paddingTopSetter = paddingTopSetter;
    roleSetter('listitem');

    // Tiles default to 1x1, but rowspan and colspan can be changed via binding.
    this.rowspan = 1;
    this.colspan = 1;

    // DEBUG
    heightSetter(`${gridList.tiles.length * 100}px`);
  }

  /**
   * Change handler invoked when bindings are resolved or when bindings have changed.
   * Notifies grid-list that a re-layout is required.
   */
  onChange(_) {
    //console.log(`grid-tile on-change ${this.gridList.tiles.indexOf(this)}`);
    if (!this.isRegisteredWithGridList) {
      this.gridList.addTile(this);
      this.isRegisteredWithGridList = true;
    } else {
      this.gridList.performLayout();
    }
  }

  /**
   * Destructor function. Deregisters this tile from the containing grid-list.
   */
  onDestroy() {
    this.gridList.removeTile(this);
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
