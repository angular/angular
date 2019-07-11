import {TestBed, ComponentFixture, inject} from '@angular/core/testing';
import {Component, DebugElement, Type, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatGridList, MatGridListModule} from './index';
import {MatGridTile, MatGridTileText} from './grid-tile';
import {Directionality} from '@angular/cdk/bidi';
import {Platform} from '@angular/cdk/platform';


describe('MatGridList', () => {
  let disableComputedStyleTests = false;

  function createComponent<T>(componentType: Type<T>): ComponentFixture<T> {
    TestBed.configureTestingModule({
      imports: [MatGridListModule],
      declarations: [componentType],
    }).compileComponents();

    const fixture = TestBed.createComponent<T>(componentType);

    inject([Platform], (platform: Platform) => {
      // IE and Edge aren't consistent in the values that they return from `getComputedStyle`.
      // In some cases they return the computed values, and in others the passed-in ones. We use
      // this flag to disable the tests that depend on `getComputedStyle` in order to avoid flakes.
      // TODO: we can re-enable them when we start testing against the Chromium-based Edge.
      disableComputedStyleTests = platform.EDGE || platform.TRIDENT;
    })();

    return fixture;
  }

  afterEach(() => disableComputedStyleTests = false);

  it('should throw error if cols is not defined', () => {
    const fixture = createComponent(GridListWithoutCols);

    expect(() => fixture.detectChanges()).toThrowError(/must pass in number of columns/);
  });

  it('should throw error if rowHeight ratio is invalid', () => {
    expect(() => {
      const fixture = createComponent(GridListWithInvalidRowHeightRatio);
      fixture.detectChanges();
    }).toThrowError(/invalid ratio given for row-height/);
  });

  it('should throw error if tile colspan is wider than total cols', () => {
    const fixture = createComponent(GridListWithTooWideColspan);

    expect(() => fixture.detectChanges()).toThrowError(/tile with colspan 5 is wider than grid/);
  });

  it('should not throw when setting the `rowHeight` programmatically before init', () => {
    const fixture = createComponent(GridListWithUnspecifiedRowHeight);
    const gridList = fixture.debugElement.query(By.directive(MatGridList));

    expect(() => {
      // Set the row height twice so the tile styler is initialized.
      gridList.componentInstance.rowHeight = 12.3;
      gridList.componentInstance.rowHeight = 32.1;
      fixture.detectChanges();
    }).not.toThrow();
  });

  it('should preserve value when zero is set as row height', () => {
    const fixture = createComponent(GridListWithUnspecifiedRowHeight);
    const gridList = fixture.debugElement.query(By.directive(MatGridList)).componentInstance;

    gridList.rowHeight = 0;
    expect(gridList.rowHeight).toBe('0');
  });

  it('should set the columns to zero if a negative number is passed in', () => {
    const fixture = createComponent(GridListWithDynamicCols);
    fixture.detectChanges();

    expect(fixture.componentInstance.gridList.cols).toBe(2);

    expect(() => {
      fixture.componentInstance.cols = -2;
      fixture.detectChanges();
    }).not.toThrow();

    expect(fixture.componentInstance.gridList.cols).toBe(1);
  });

  it('should default to 1:1 row height if undefined ', () => {
    const fixture = createComponent(GridListWithUnspecifiedRowHeight);

    if (disableComputedStyleTests) {
      return;
    }

    fixture.detectChanges();
    const tile = fixture.debugElement.query(By.directive(MatGridTile));
    const inlineStyles = tile.nativeElement.style;

    // In ratio mode, heights are set using the padding-top property.
    expect(inlineStyles.paddingTop).toBeTruthy();
    expect(inlineStyles.height).toBeFalsy();
    expect(getDimension(tile, 'height')).toBe(200);
  });

  it('should use a ratio row height if passed in', () => {
    const fixture = createComponent(GirdListWithRowHeightRatio);

    if (disableComputedStyleTests) {
      return;
    }

    fixture.componentInstance.rowHeight = '4:1';
    fixture.detectChanges();

    const tile = fixture.debugElement.query(By.directive(MatGridTile));
    const inlineStyles = tile.nativeElement.style;

    expect(inlineStyles.paddingTop).toBeTruthy();
    expect(inlineStyles.height).toBeFalsy();
    expect(getDimension(tile, 'height')).toBe(100);

    fixture.componentInstance.rowHeight = '2:1';
    fixture.detectChanges();

    expect(inlineStyles.paddingTop).toBeTruthy();
    expect(inlineStyles.height).toBeFalsy();
    expect(getDimension(tile, 'height')).toBe(200);
  });

  it('should divide row height evenly in "fit" mode', () => {
    const fixture = createComponent(GridListWithFitRowHeightMode);

    if (disableComputedStyleTests) {
      return;
    }

    fixture.componentInstance.totalHeight = '300px';
    fixture.detectChanges();
    const tile = fixture.debugElement.query(By.directive(MatGridTile));

    // 149.5 * 2 = 299px + 1px gutter = 300px
    expect(getDimension(tile, 'height')).toBe(149.5);

    fixture.componentInstance.totalHeight = '200px';
    fixture.detectChanges();

    // 99.5 * 2 = 199px + 1px gutter = 200px
    expect(getDimension(tile, 'height')).toBe(99.5);
  });

  it('should use the fixed row height if passed in', () => {
    const fixture = createComponent(GridListWithFixedRowHeightMode);

    if (disableComputedStyleTests) {
      return;
    }

    fixture.componentInstance.rowHeight = '100px';
    fixture.detectChanges();

    const tile = fixture.debugElement.query(By.directive(MatGridTile));
    expect(getDimension(tile, 'height')).toBe(100);

    fixture.componentInstance.rowHeight = '200px';
    fixture.detectChanges();

    expect(getDimension(tile, 'height')).toBe(200);
  });

  it('should default to pixels if row height units are missing', () => {
    const fixture = createComponent(GridListWithUnitlessFixedRowHeight);

    if (disableComputedStyleTests) {
      return;
    }

    fixture.detectChanges();
    const tile = fixture.debugElement.query(By.directive(MatGridTile));
    expect(getDimension(tile, 'height')).toBe(100);
  });

  it('should default gutter size to 1px', () => {
    const fixture = createComponent(GridListWithUnspecifiedGutterSize);

    if (disableComputedStyleTests) {
      return;
    }

    fixture.detectChanges();
    const tiles = fixture.debugElement.queryAll(By.css('mat-grid-tile'));

    // check horizontal gutter
    expect(getDimension(tiles[0], 'width')).toBe(99.5);
    expect(getComputedLeft(tiles[1])).toBe(100.5);

    // check vertical gutter
    expect(getDimension(tiles[0], 'height')).toBe(100);
    expect(getDimension(tiles[2], 'top')).toBe(101);
  });

  it('should be able to set the gutter size to zero', () => {
    const fixture = createComponent(GridListWithUnspecifiedGutterSize);
    const gridList = fixture.debugElement.query(By.directive(MatGridList));

    if (disableComputedStyleTests) {
      return;
    }

    gridList.componentInstance.gutterSize = 0;
    fixture.detectChanges();

    const tiles = fixture.debugElement.queryAll(By.css('mat-grid-tile'));

    // check horizontal gutter
    expect(getDimension(tiles[0], 'width')).toBe(100);
    expect(getComputedLeft(tiles[1])).toBe(100);

    // check vertical gutter
    expect(getDimension(tiles[0], 'height')).toBe(100);
    expect(getDimension(tiles[2], 'top')).toBe(100);
  });

  it('should lay out the tiles correctly for a nested grid list', () => {
    const fixture = createComponent(NestedGridList);

    if (disableComputedStyleTests) {
      return;
    }

    fixture.detectChanges();
    const innerTiles = fixture.debugElement.queryAll(
        By.css('mat-grid-tile mat-grid-list mat-grid-tile'));

    expect(getDimension(innerTiles[0], 'top')).toBe(0);
    expect(getDimension(innerTiles[1], 'top')).toBe(101);
    expect(getDimension(innerTiles[2], 'top')).toBe(202);
  });

  it('should set the gutter size if passed', () => {
    const fixture = createComponent(GridListWithGutterSize);

    if (disableComputedStyleTests) {
      return;
    }

    fixture.detectChanges();
    const tiles = fixture.debugElement.queryAll(By.css('mat-grid-tile'));

    // check horizontal gutter
    expect(getDimension(tiles[0], 'width')).toBe(99);
    expect(getComputedLeft(tiles[1])).toBe(101);

    // check vertical gutter
    expect(getDimension(tiles[0], 'height')).toBe(100);
    expect(getDimension(tiles[2], 'top')).toBe(102);
  });

  it('should use pixels if gutter units are missing', () => {
    const fixture = createComponent(GridListWithUnitlessGutterSize);

    if (disableComputedStyleTests) {
      return;
    }

    fixture.detectChanges();
    const tiles = fixture.debugElement.queryAll(By.css('mat-grid-tile'));

    // check horizontal gutter
    expect(getDimension(tiles[0], 'width')).toBe(99);
    expect(getComputedLeft(tiles[1])).toBe(101);

    // check vertical gutter
    expect(getDimension(tiles[0], 'height')).toBe(100);
    expect(getDimension(tiles[2], 'top')).toBe(102);
  });

  it('should allow alternate units for the gutter size', () => {
    const fixture = createComponent(GridListWithUnspecifiedGutterSize);
    const gridList = fixture.debugElement.query(By.directive(MatGridList));

    if (disableComputedStyleTests) {
      return;
    }

    gridList.componentInstance.gutterSize = '10%';
    fixture.detectChanges();

    const tiles = fixture.debugElement.queryAll(By.css('mat-grid-tile'));

    expect(getDimension(tiles[0], 'width')).toBe(90);
    expect(getComputedLeft(tiles[1])).toBe(110);
  });

  it('should set the correct list height in ratio mode', () => {
    const fixture = createComponent(GridListWithRatioHeightAndMulipleRows);

    if (disableComputedStyleTests) {
      return;
    }

    fixture.detectChanges();
    const list = fixture.debugElement.query(By.directive(MatGridList));
    const inlineStyles = list.nativeElement.style;

    expect(inlineStyles.paddingBottom).toBeTruthy();
    expect(inlineStyles.height).toBeFalsy();
    expect(getDimension(list, 'height')).toBe(201);
  });

  it('should set the correct list height in fixed mode', () => {
    const fixture = createComponent(GridListWithFixRowHeightAndMultipleRows);

    if (disableComputedStyleTests) {
      return;
    }

    fixture.detectChanges();
    const list = fixture.debugElement.query(By.directive(MatGridList));
    expect(getDimension(list, 'height')).toBe(201);
  });

  it('should allow adjustment of tile colspan', () => {
    const fixture = createComponent(GridListWithColspanBinding);

    if (disableComputedStyleTests) {
      return;
    }

    fixture.componentInstance.colspan = 2;
    fixture.detectChanges();

    const tile = fixture.debugElement.query(By.directive(MatGridTile));
    expect(getDimension(tile, 'width')).toBe(199.5);

    fixture.componentInstance.colspan = 3;
    fixture.detectChanges();
    expect(getDimension(tile, 'width')).toBe(299.75);
  });

  it('should allow adjustment of tile rowspan', () => {
    const fixture = createComponent(GridListWithRowspanBinding);

    if (disableComputedStyleTests) {
      return;
    }

    fixture.componentInstance.rowspan = 2;
    fixture.detectChanges();

    const tile = fixture.debugElement.query(By.directive(MatGridTile));
    expect(getDimension(tile, 'height')).toBe(201);

    fixture.componentInstance.rowspan = 3;
    fixture.detectChanges();
    expect(getDimension(tile, 'height')).toBe(302);
  });

  it('should lay out tiles correctly for a complex layout', () => {
    const fixture = createComponent(GridListWithComplexLayout);

    if (disableComputedStyleTests) {
      return;
    }

    fixture.componentInstance.tiles = [
      {cols: 3, rows: 1},
      {cols: 1, rows: 2},
      {cols: 1, rows: 1},
      {cols: 2, rows: 1}
    ];

    fixture.detectChanges();
    const tiles = fixture.debugElement.queryAll(By.css('mat-grid-tile'));

    expect(getDimension(tiles[0], 'width')).toBe(299.75);
    expect(getDimension(tiles[0], 'height')).toBe(100);
    expect(getComputedLeft(tiles[0])).toBe(0);
    expect(getDimension(tiles[0], 'top')).toBe(0);

    expect(getDimension(tiles[1], 'width')).toBe(99.25);
    expect(getDimension(tiles[1], 'height')).toBe(201);
    expect(getComputedLeft(tiles[1])).toBe(300.75);
    expect(getDimension(tiles[1], 'top')).toBe(0);

    expect(getDimension(tiles[2], 'width')).toBe(99.25);
    expect(getDimension(tiles[2], 'height')).toBe(100);
    expect(getComputedLeft(tiles[2])).toBe(0);
    expect(getDimension(tiles[2], 'top')).toBe(101);

    expect(getDimension(tiles[3], 'width')).toBe(199.5);
    expect(getDimension(tiles[3], 'height')).toBe(100);
    expect(getComputedLeft(tiles[3])).toBe(100.25);
    expect(getDimension(tiles[3], 'top')).toBe(101);
  });

  it('should lay out tiles correctly', () => {
    const fixture = createComponent(GridListWithLayout);

    if (disableComputedStyleTests) {
      return;
    }

    fixture.detectChanges();
    const tiles = fixture.debugElement.queryAll(By.css('mat-grid-tile'));

    expect(getDimension(tiles[0], 'width')).toBe(40);
    expect(getDimension(tiles[0], 'height')).toBe(40);
    expect(getComputedLeft(tiles[0])).toBe(0);
    expect(getDimension(tiles[0], 'top')).toBe(0);

    expect(getDimension(tiles[1], 'width')).toBe(20);
    expect(getDimension(tiles[1], 'height')).toBe(20);
    expect(getComputedLeft(tiles[1])).toBe(40);
    expect(getDimension(tiles[1], 'top')).toBe(0);

    expect(getDimension(tiles[2], 'width')).toBe(40);
    expect(getDimension(tiles[2], 'height')).toBe(40);
    expect(getComputedLeft(tiles[2])).toBe(60);
    expect(getDimension(tiles[2], 'top')).toBe(0);

    expect(getDimension(tiles[3], 'width')).toBe(40);
    expect(getDimension(tiles[3], 'height')).toBe(40);
    expect(getComputedLeft(tiles[3])).toBe(0);
    expect(getDimension(tiles[3], 'top')).toBe(40);

    expect(getDimension(tiles[4], 'width')).toBe(40);
    expect(getDimension(tiles[4], 'height')).toBe(40);
    expect(getComputedLeft(tiles[4])).toBe(40);
    expect(getDimension(tiles[4], 'top')).toBe(40);
  });

  it('should lay out tiles correctly when single cell to be placed at the beginning',
        () => {
    const fixture = createComponent(GridListWithSingleCellAtBeginning);

    if (disableComputedStyleTests) {
      return;
    }

    fixture.detectChanges();
    const tiles = fixture.debugElement.queryAll(By.css('mat-grid-tile'));

    expect(getDimension(tiles[0], 'width')).toBe(40);
    expect(getDimension(tiles[0], 'height')).toBe(40);
    expect(getComputedLeft(tiles[0])).toBe(0);
    expect(getDimension(tiles[0], 'top')).toBe(0);

    expect(getDimension(tiles[1], 'width')).toBe(20);
    expect(getDimension(tiles[1], 'height')).toBe(40);
    expect(getComputedLeft(tiles[1])).toBe(40);
    expect(getDimension(tiles[1], 'top')).toBe(0);

    expect(getDimension(tiles[2], 'width')).toBe(40);
    expect(getDimension(tiles[2], 'height')).toBe(40);
    expect(getComputedLeft(tiles[2])).toBe(60);
    expect(getDimension(tiles[2], 'top')).toBe(0);

    expect(getDimension(tiles[3], 'height')).toBe(20);
    expect(getComputedLeft(tiles[3])).toBe(0);
    expect(getDimension(tiles[3], 'top')).toBe(40);
  });

  it('should add not add any classes to footers without lines', () => {
    const fixture = createComponent(GridListWithFootersWithoutLines);
    fixture.detectChanges();

    const footer = fixture.debugElement.query(By.directive(MatGridTileText));
    expect(footer.nativeElement.classList.contains('mat-2-line')).toBe(false);
  });

  it('should add class to footers with two lines', () => {
    const fixture = createComponent(GridListWithFooterContainingTwoLines);
    fixture.detectChanges();

    const footer = fixture.debugElement.query(By.directive(MatGridTileText));
    expect(footer.nativeElement.classList.contains('mat-2-line')).toBe(true);
  });

  it('should not use calc() that evaluates to 0', () => {
    const fixture = createComponent(GirdListWithRowHeightRatio);

    fixture.componentInstance.rowHeight = '4:1';
    fixture.detectChanges();

    const firstTile = fixture.debugElement.query(By.directive(MatGridTile)).nativeElement;

    expect(firstTile.style.marginTop).toBe('0px');
    expect(firstTile.style.left).toBe('0px');
  });

  it('should reset the old styles when switching to a new tile styler', () => {
    const fixture = createComponent(GirdListWithRowHeightRatio);

    if (disableComputedStyleTests) {
      return;
    }

    fixture.componentInstance.rowHeight = '4:1';
    fixture.detectChanges();

    const list = fixture.debugElement.query(By.directive(MatGridList));
    const tile = fixture.debugElement.query(By.directive(MatGridTile));
    const listInlineStyles = list.nativeElement.style;
    const tileInlineStyles = tile.nativeElement.style;

    expect(getDimension(tile, 'height')).toBe(100);
    expect(tileInlineStyles.paddingTop).toBeTruthy();
    expect(tileInlineStyles.height).toBeFalsy();

    expect(getDimension(list, 'height')).toBe(100);
    expect(listInlineStyles.paddingBottom).toBeTruthy();
    expect(listInlineStyles.height).toBeFalsy();

    fixture.componentInstance.rowHeight = '400px';
    fixture.detectChanges();

    expect(tileInlineStyles.paddingTop).toBeFalsy('Expected tile padding to be reset.');
    expect(listInlineStyles.paddingBottom).toBeFalsy('Expected list padding to be reset.');

    expect(getDimension(tile, 'top')).toBe(0);
    expect(getDimension(tile, 'height')).toBe(400);
  });

  it('should ensure that all tiles are inside the grid when there are no matching gaps', () => {
    const fixture = createComponent(GridListWithoutMatchingGap);
    const tiles = fixture.debugElement.queryAll(By.css('mat-grid-tile'));

    fixture.detectChanges();
    expect(tiles.every(tile => getComputedLeft(tile) >= 0))
        .toBe(true, 'Expected none of the tiles to have a negative `left`');
  });

  it('should default to LTR if empty directionality is given', () => {
    const fixture = createComponent(GridListWithEmptyDirectionality);
    const tile: HTMLElement = fixture.debugElement.query(By.css('mat-grid-tile')).nativeElement;
    fixture.detectChanges();

    expect(tile.style.left).toBe('0px');
    expect(tile.style.right).toBe('');
  });

  it('should set `right` styles for RTL', () => {
    const fixture = createComponent(GridListWithRtl);
    const tile: HTMLElement = fixture.debugElement.query(By.css('mat-grid-tile')).nativeElement;
    fixture.detectChanges();

    expect(tile.style.left).toBe('');
    expect(tile.style.right).toBe('0px');
  });

  it('should lay out the tiles if they are not direct descendants of the list', () => {
    const fixture = createComponent(GridListWithIndirectTileDescendants);

    if (disableComputedStyleTests) {
      return;
    }

    fixture.detectChanges();
    const tile = fixture.debugElement.query(By.directive(MatGridTile));
    const inlineStyles = tile.nativeElement.style;

    expect(inlineStyles.paddingTop).toBeTruthy();
    expect(inlineStyles.height).toBeFalsy();
    expect(getDimension(tile, 'height')).toBe(200);
  });

  it('should throw if an invalid value is set as the `rowHeight`', () => {
    const fixture = createComponent(GridListWithUnspecifiedRowHeight);
    const gridList = fixture.debugElement.query(By.directive(MatGridList));

    expect(() => {
      // Note the semicolon at the end which will be an invalid value on some browsers (see #13252).
      gridList.componentInstance.rowHeight = '350px;';
      fixture.detectChanges();
    }).toThrowError(/^Invalid value/);
  });

});

/** Gets the computed dimension of a DebugElement in pixels. */
function getDimension(el: DebugElement, dimension: 'width' | 'height' | 'top' | 'left'): number {
  const nativeElement: HTMLElement = el.nativeElement;

  switch (dimension) {
    // Note that we use direct measurements, rather than the computed style, because
    // `getComputedStyle` can be inconsistent between browser and can cause flakes.
    case 'width': return nativeElement.getBoundingClientRect().width;
    case 'height': return nativeElement.getBoundingClientRect().height;
    case 'top': return nativeElement.offsetTop;
    case 'left': return nativeElement.offsetLeft;
    default: throw Error(`Unknown dimension ${dimension}.`);
  }
}

/** Gets the `left` position of an element. */
function getComputedLeft(element: DebugElement): number {
  // While the other properties in this test use `getComputedStyle`, we use `getBoundingClientRect`
  // for left because iOS Safari doesn't support using `getComputedStyle` to get the calculated
  // `left` value when using CSS `calc`. We subtract the `left` of the document body because
  // browsers, by default, add a margin to the body (typically 8px).
  const elementRect = element.nativeElement.getBoundingClientRect();
  const bodyRect = document.body.getBoundingClientRect();

  return elementRect.left - bodyRect.left;
}


@Component({template: '<mat-grid-list></mat-grid-list>'})
class GridListWithoutCols { }

@Component({template: '<mat-grid-list cols="4" rowHeight="4:3:2"></mat-grid-list>'})
class GridListWithInvalidRowHeightRatio { }

@Component({template:
    '<mat-grid-list cols="4"><mat-grid-tile colspan="5"></mat-grid-tile></mat-grid-list>'})
class GridListWithTooWideColspan { }

@Component({template: '<mat-grid-list [cols]="cols"></mat-grid-list>'})
class GridListWithDynamicCols {
  @ViewChild(MatGridList, {static: false}) gridList: MatGridList;
  cols = 2;
}

@Component({template: `
    <div style="width:200px">
      <mat-grid-list cols="1">
        <mat-grid-tile></mat-grid-tile>
      </mat-grid-list>
    </div>`})
class GridListWithUnspecifiedRowHeight { }

@Component({template: `
    <div style="width:400px">
      <mat-grid-list cols="1" [rowHeight]="rowHeight">
        <mat-grid-tile></mat-grid-tile>
      </mat-grid-list>
    </div>`})
class GirdListWithRowHeightRatio {
  rowHeight: string;
}

@Component({template: `
    <mat-grid-list cols="1" rowHeight="fit" [style.height]="totalHeight">
      <mat-grid-tile></mat-grid-tile>
      <mat-grid-tile></mat-grid-tile>
    </mat-grid-list>`})
class GridListWithFitRowHeightMode {
  totalHeight: string;
}

@Component({template: `
    <mat-grid-list cols="4" [rowHeight]="rowHeight">
      <mat-grid-tile></mat-grid-tile>
    </mat-grid-list>`})
class GridListWithFixedRowHeightMode {
  rowHeight: string;
}

@Component({template: `
    <mat-grid-list cols="4" rowHeight="100">
      <mat-grid-tile></mat-grid-tile>
    </mat-grid-list>`})
class GridListWithUnitlessFixedRowHeight {
  rowHeight: string;
}

@Component({template: `
    <div style="width:200px">
      <mat-grid-list cols="2" rowHeight="100px">
        <mat-grid-tile></mat-grid-tile>
        <mat-grid-tile></mat-grid-tile>
        <mat-grid-tile></mat-grid-tile>
      </mat-grid-list>
    </div>`})
class GridListWithUnspecifiedGutterSize { }

@Component({template: `
    <div style="width:200px">
      <mat-grid-list cols="2" gutterSize="2px" rowHeight="100px">
        <mat-grid-tile></mat-grid-tile>
        <mat-grid-tile></mat-grid-tile>
        <mat-grid-tile></mat-grid-tile>
      </mat-grid-list>
    </div>`})
class GridListWithGutterSize { }

@Component({template: `
    <div style="width:200px">
      <mat-grid-list cols="2" gutterSize="2" rowHeight="100px">
        <mat-grid-tile></mat-grid-tile>
        <mat-grid-tile></mat-grid-tile>
        <mat-grid-tile></mat-grid-tile>
      </mat-grid-list>
    </div>`})
class GridListWithUnitlessGutterSize { }

@Component({template: `
    <div style="width:400px">
      <mat-grid-list cols="1" rowHeight="4:1">
        <mat-grid-tile></mat-grid-tile>
        <mat-grid-tile></mat-grid-tile>
      </mat-grid-list>
    </div>`})
class GridListWithRatioHeightAndMulipleRows { }

@Component({template: `
    <mat-grid-list cols="1" rowHeight="100px">
      <mat-grid-tile></mat-grid-tile>
      <mat-grid-tile></mat-grid-tile>
    </mat-grid-list>`})
class GridListWithFixRowHeightAndMultipleRows { }

@Component({template: `
    <div style="width:400px">
      <mat-grid-list cols="4">
        <mat-grid-tile [colspan]="colspan"></mat-grid-tile>
      </mat-grid-list>
    </div>`})
class GridListWithColspanBinding {
  colspan: number;
}

@Component({template: `
    <mat-grid-list cols="1" rowHeight="100px">
      <mat-grid-tile [rowspan]="rowspan"></mat-grid-tile>
    </mat-grid-list>`})
class GridListWithRowspanBinding {
  rowspan: number;
}

@Component({template: `
    <div style="width:400px">
      <mat-grid-list cols="4" rowHeight="100px">
        <mat-grid-tile *ngFor="let tile of tiles" [colspan]="tile.cols" [rowspan]="tile.rows"
                      [style.background]="tile.color">
          {{tile.text}}
        </mat-grid-tile>
      </mat-grid-list>
    </div>`})
class GridListWithComplexLayout {
  tiles: any[];
}

@Component({template: `
  <div style="width:100px">
    <mat-grid-list [cols]="10" gutterSize="0px" rowHeight="10px">
      <mat-grid-tile [colspan]="4" [rowspan]="4"></mat-grid-tile>
      <mat-grid-tile [colspan]="2" [rowspan]="2"></mat-grid-tile>
      <mat-grid-tile [colspan]="4" [rowspan]="4"></mat-grid-tile>
      <mat-grid-tile [colspan]="4" [rowspan]="4"></mat-grid-tile>
      <mat-grid-tile [colspan]="4" [rowspan]="4"></mat-grid-tile>
    </mat-grid-list>
  </div>`})
class GridListWithLayout {}

@Component({template: `
  <div style="width:100px">
    <mat-grid-list [cols]="10" gutterSize="0px" rowHeight="10px">
      <mat-grid-tile [colspan]="4" [rowspan]="4"></mat-grid-tile>
      <mat-grid-tile [colspan]="2" [rowspan]="4"></mat-grid-tile>
      <mat-grid-tile [colspan]="4" [rowspan]="4"></mat-grid-tile>
      <mat-grid-tile [colspan]="1" [rowspan]="2"></mat-grid-tile>
    </mat-grid-list>
  </div>`})
class GridListWithSingleCellAtBeginning {}

@Component({template: `
    <mat-grid-list cols="1">
      <mat-grid-tile>
        <mat-grid-tile-footer>
          I'm a footer!
        </mat-grid-tile-footer>
      </mat-grid-tile>
    </mat-grid-list>`})
class GridListWithFootersWithoutLines { }

@Component({template: `
    <mat-grid-list cols="1">
      <mat-grid-tile>
        <mat-grid-tile-footer>
          <h3 mat-line>First line</h3>
          <span mat-line>Second line</span>
        </mat-grid-tile-footer>
      </mat-grid-tile>
    </mat-grid-list>`})
class GridListWithFooterContainingTwoLines { }

@Component({template: `
  <mat-grid-list cols="5">
    <mat-grid-tile [rowspan]="1" [colspan]="3">1</mat-grid-tile>
    <mat-grid-tile [rowspan]="2" [colspan]="2">2</mat-grid-tile>
    <mat-grid-tile [rowspan]="1" [colspan]="2">3</mat-grid-tile>
    <mat-grid-tile [rowspan]="2" [colspan]="2">4</mat-grid-tile>
  </mat-grid-list>
`})
class GridListWithoutMatchingGap { }

@Component({
  template: `<mat-grid-list cols="1"><mat-grid-tile>Hello</mat-grid-tile></mat-grid-list>`,
  providers: [{provide: Directionality, useValue: {}}]
})
class GridListWithEmptyDirectionality { }

@Component({
  template: `<mat-grid-list cols="1"><mat-grid-tile>Hello</mat-grid-tile></mat-grid-list>`,
  providers: [{provide: Directionality, useValue: {value: 'rtl'}}]
})
class GridListWithRtl { }

@Component({
  // Note the blank `ngSwitch` which we need in order to hit the bug that we're testing.
  template: `
    <div style="width:200px">
      <mat-grid-list cols="1">
        <ng-container [ngSwitch]="true">
          <mat-grid-tile></mat-grid-tile>
        </ng-container>
      </mat-grid-list>
    </div>
  `
})
class GridListWithIndirectTileDescendants {}


@Component({template: `
    <div style="width:200px">
      <mat-grid-list cols="2" rowHeight="100px">
        <mat-grid-tile></mat-grid-tile>
        <mat-grid-tile>
          <mat-grid-list cols="1" rowHeight="100px">
            <mat-grid-tile></mat-grid-tile>
            <mat-grid-tile></mat-grid-tile>
            <mat-grid-tile></mat-grid-tile>
          </mat-grid-list>
        </mat-grid-tile>
      </mat-grid-list>
    </div>`})
class NestedGridList { }
