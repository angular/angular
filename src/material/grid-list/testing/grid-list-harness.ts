/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ComponentHarness, HarnessPredicate, parallel} from '@angular/cdk/testing';
import {ɵTileCoordinator as TileCoordinator} from '@angular/material/grid-list';
import {GridListHarnessFilters, GridTileHarnessFilters} from './grid-list-harness-filters';
import {MatGridTileHarness} from './grid-tile-harness';

/** Harness for interacting with a standard `MatGridList` in tests. */
export class MatGridListHarness extends ComponentHarness {
  /** The selector for the host element of a `MatGridList` instance. */
  static hostSelector = '.mat-grid-list';

  /**
   * Gets a `HarnessPredicate` that can be used to search for a `MatGridListHarness`
   * that meets certain criteria.
   * @param options Options for filtering which dialog instances are considered a match.
   * @return a `HarnessPredicate` configured with the given options.
   */
  static with(options: GridListHarnessFilters = {}): HarnessPredicate<MatGridListHarness> {
    return new HarnessPredicate(MatGridListHarness, options);
  }

  /**
   * Tile coordinator that is used by the "MatGridList" for computing
   * positions of tiles. We leverage the coordinator to provide an API
   * for retrieving tiles based on visual tile positions.
   */
  private _tileCoordinator = new TileCoordinator();

  /** Gets all tiles of the grid-list. */
  async getTiles(filters: GridTileHarnessFilters = {}): Promise<MatGridTileHarness[]> {
    return await this.locatorForAll(MatGridTileHarness.with(filters))();
  }

  /** Gets the amount of columns of the grid-list. */
  async getColumns(): Promise<number> {
    return Number(await (await this.host()).getAttribute('cols'));
  }

  /**
   * Gets a tile of the grid-list that is located at the given location.
   * @param row Zero-based row index.
   * @param column Zero-based column index.
   */
  async getTileAtPosition({
    row,
    column,
  }: {
    row: number;
    column: number;
  }): Promise<MatGridTileHarness> {
    const [tileHarnesses, columns] = await parallel(() => [this.getTiles(), this.getColumns()]);
    const tileSpans = tileHarnesses.map(t => parallel(() => [t.getColspan(), t.getRowspan()]));
    const tiles = (await parallel(() => tileSpans)).map(([colspan, rowspan]) => ({
      colspan,
      rowspan,
    }));
    // Update the tile coordinator to reflect the current column amount and
    // rendered tiles. We update upon every call of this method since we do not
    // know if tiles have been added, removed or updated (in terms of rowspan/colspan).
    this._tileCoordinator.update(columns, tiles);
    // The tile coordinator respects the colspan and rowspan for calculating the positions
    // of tiles, but it does not create multiple position entries if a tile spans over multiple
    // columns or rows. We want to provide an API where developers can retrieve a tile based on
    // any position that lies within the visual tile boundaries. For example: If a tile spans
    // over two columns, then the same tile should be returned for either column indices.
    for (let i = 0; i < this._tileCoordinator.positions.length; i++) {
      const position = this._tileCoordinator.positions[i];
      const {rowspan, colspan} = tiles[i];
      // Return the tile harness if the given position visually resolves to the tile.
      if (
        column >= position.col &&
        column <= position.col + colspan - 1 &&
        row >= position.row &&
        row <= position.row + rowspan - 1
      ) {
        return tileHarnesses[i];
      }
    }
    throw Error('Could not find tile at given position.');
  }
}
