import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatGridListModule} from '@angular/material/grid-list';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatGridListHarness} from './grid-list-harness';
import {MatGridTileHarness} from './grid-tile-harness';

/** Shared tests to run on both the original and MDC-based grid-list. */
export function runHarnessTests(
  gridListModule: typeof MatGridListModule,
  gridListHarness: typeof MatGridListHarness,
  gridTileHarness: typeof MatGridTileHarness,
) {
  let fixture: ComponentFixture<GridListHarnessTest>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [gridListModule, NoopAnimationsModule],
      declarations: [GridListHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(GridListHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  });

  it('should be able to load grid-list harnesses', async () => {
    const harnesses = await loader.getAllHarnesses(gridListHarness);
    expect(harnesses.length).toBe(2);
  });

  it('should be able to load grid-tile harnesses', async () => {
    const harnesses = await loader.getAllHarnesses(gridTileHarness);
    expect(harnesses.length).toBe(8);
  });

  it('should be able to load grid-tile harness by header text', async () => {
    const harnesses = await loader.getAllHarnesses(gridTileHarness.with({headerText: /Tile 3/}));
    expect(harnesses.length).toBe(1);
    expect(await harnesses[0].getFooterText()).toBe('Tile 3 footer');
  });

  it('should be able to load grid-tile harness by footer text', async () => {
    const harnesses = await loader.getAllHarnesses(
      gridTileHarness.with({footerText: 'Tile 3 footer'}),
    );
    expect(harnesses.length).toBe(1);
    expect(await harnesses[0].getHeaderText()).toBe('Tile 3');
  });

  it('should be able to get all tiles of a grid-list', async () => {
    const gridList = await loader.getHarness(gridListHarness.with({selector: '#second'}));
    const tiles = await gridList.getTiles();
    expect(tiles.length).toBe(4);
  });

  it('should be able to get tiles of grid-list with filters', async () => {
    const gridList = await loader.getHarness(gridListHarness.with({selector: '#second'}));
    const tiles = await gridList.getTiles({headerText: /Tile [34]/});
    expect(tiles.length).toBe(2);
  });

  it('should be able to get amount of columns of grid-list', async () => {
    const gridLists = await loader.getAllHarnesses(gridListHarness);
    expect(await gridLists[0].getColumns()).toBe(4);
    expect(await gridLists[1].getColumns()).toBe(2);
    fixture.componentInstance.columns = 3;
    expect(await gridLists[0].getColumns()).toBe(3);
  });

  it('should be able to get tile by position', async () => {
    const gridList = await loader.getHarness(gridListHarness);
    const tiles = await parallel(() => [
      gridList.getTileAtPosition({row: 0, column: 0}),
      gridList.getTileAtPosition({row: 0, column: 1}),
      gridList.getTileAtPosition({row: 1, column: 0}),
    ]);
    expect(await tiles[0].getHeaderText()).toBe('One');
    expect(await tiles[1].getHeaderText()).toBe('Two');
    expect(await tiles[2].getHeaderText()).toBe('Four (second row)');
  });

  it('should be able to get tile by position with respect to tile span', async () => {
    const gridList = await loader.getHarness(gridListHarness);
    const tiles = await parallel(() => [
      gridList.getTileAtPosition({row: 0, column: 2}),
      gridList.getTileAtPosition({row: 0, column: 3}),
    ]);
    expect(await tiles[0].getHeaderText()).toBe('Three');
    expect(await tiles[1].getHeaderText()).toBe('Three');
    await expectAsync(gridList.getTileAtPosition({row: 2, column: 0})).toBeRejectedWithError(
      /Could not find tile/,
    );

    // Update the fourth tile to span over two rows. The previous position
    // should now be valid and the fourth tile should be returned.
    fixture.componentInstance.tile4Rowspan = 2;
    const foundTile = await gridList.getTileAtPosition({row: 2, column: 0});
    expect(await foundTile.getHeaderText()).toBe('Four (second and third row)');
  });

  it('should be able to check whether tile has header', async () => {
    const tiles = await loader.getAllHarnesses(gridTileHarness);
    expect(await tiles[0].hasHeader()).toBe(true);
    expect(await tiles[4].hasHeader()).toBe(false);
    expect(await (await tiles[4].host()).text()).toBe('Tile 1 (no header, no footer)');
  });

  it('should be able to check whether tile has footer', async () => {
    const tiles = await loader.getAllHarnesses(gridTileHarness);
    expect(await tiles[0].hasFooter()).toBe(false);
    expect(await tiles[6].hasFooter()).toBe(true);
    expect(await tiles[6].getFooterText()).toBe('Tile 3 footer');
  });

  it('should be able to check whether tile has avatar', async () => {
    const tiles = await loader.getAllHarnesses(gridTileHarness);
    expect(await tiles[0].hasAvatar()).toBe(false);
    expect(await tiles[1].hasAvatar()).toBe(true);
  });

  it('should be able to get rowspan of tile', async () => {
    const tiles = await loader.getAllHarnesses(gridTileHarness);
    expect(await tiles[0].getRowspan()).toBe(1);
    expect(await tiles[3].getRowspan()).toBe(1);
    fixture.componentInstance.tile4Rowspan = 10;
    expect(await tiles[3].getRowspan()).toBe(10);
  });

  it('should be able to get colspan of tile', async () => {
    const tiles = await loader.getAllHarnesses(gridTileHarness);
    expect(await tiles[0].getColspan()).toBe(1);
    expect(await tiles[2].getColspan()).toBe(2);
  });

  it('should be able to get header text of tile', async () => {
    const tiles = await loader.getAllHarnesses(gridTileHarness);
    expect(await tiles[0].getHeaderText()).toBe('One');
    fixture.componentInstance.firstTileText = 'updated';
    expect(await tiles[0].getHeaderText()).toBe('updated');
  });

  it('should be able to get footer text of tile', async () => {
    const tiles = await loader.getAllHarnesses(gridTileHarness);
    expect(await tiles[0].getFooterText()).toBe(null);
    fixture.componentInstance.showFooter = true;
    expect(await tiles[0].getFooterText()).toBe('Footer');
  });
}

@Component({
  template: `
    <mat-grid-list [cols]="columns">
      <mat-grid-tile>
        <mat-grid-tile-header>{{firstTileText}}</mat-grid-tile-header>
        <mat-grid-tile-footer *ngIf="showFooter">Footer</mat-grid-tile-footer>
      </mat-grid-tile>
      <mat-grid-tile>
        <mat-grid-tile-header>Two</mat-grid-tile-header>
        <div matGridAvatar class="css-rendered-avatar"></div>
      </mat-grid-tile>
      <mat-grid-tile colspan="2">
        <mat-grid-tile-header>Three</mat-grid-tile-header>
      </mat-grid-tile>
      <mat-grid-tile [rowspan]="tile4Rowspan">
        <mat-grid-tile-header>
          Four (second {{tile4Rowspan === 2 ? 'and third ' : ''}}row)
        </mat-grid-tile-header>
      </mat-grid-tile>
    </mat-grid-list>

    <mat-grid-list id="second" cols="2" rowHeight="100px">
      <mat-grid-tile>Tile 1 (no header, no footer)</mat-grid-tile>
      <mat-grid-tile>
        <mat-grid-tile-header>Tile 2</mat-grid-tile-header>
      </mat-grid-tile>
      <mat-grid-tile colspan="2">
        <mat-grid-tile-header>Tile 3</mat-grid-tile-header>
        <mat-grid-tile-footer>Tile 3 footer</mat-grid-tile-footer>
      </mat-grid-tile>
      <mat-grid-tile>
        <mat-grid-tile-header>Tile 4</mat-grid-tile-header>
      </mat-grid-tile>
    </mat-grid-list>
  `,
})
class GridListHarnessTest {
  firstTileText = 'One';
  showFooter = false;
  columns = 4;
  tile4Rowspan = 1;
}
