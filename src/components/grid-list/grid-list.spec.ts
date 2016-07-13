import {inject, async} from '@angular/core/testing';
import {TestComponentBuilder} from '@angular/compiler/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';

import {MD_GRID_LIST_DIRECTIVES, MdGridList} from './grid-list';
import {MdGridTile, MdGridTileText} from './grid-tile';

describe('MdGridList', () => {
  let builder: TestComponentBuilder;

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));

  it('should throw error if cols is not defined', async(() => {
    var template = `<md-grid-list></md-grid-list>`;
      builder.overrideTemplate(TestGridList, template).createAsync(TestGridList).then(fixture => {
        expect(() => {
          fixture.detectChanges();
        }).toThrowError(/must pass in number of columns/);
      });
  }));

  it('should throw error if rowHeight ratio is invalid', async(() => {
    var template = `<md-grid-list cols="4" rowHeight="4:3:2"></md-grid-list>`;

    builder.overrideTemplate(TestGridList, template).createAsync(TestGridList).then(fixture => {
      expect(() => {
        fixture.detectChanges();
      }).toThrowError(/invalid ratio given for row-height/);
    });
  }));

  it('should throw error if tile colspan is wider than total cols', async(() => {
    var template = `
      <md-grid-list cols="4">
        <md-grid-tile colspan="5"></md-grid-tile>
      </md-grid-list>`;

    builder.overrideTemplate(TestGridList, template).createAsync(TestGridList).then(fixture => {
      expect(() => {
        fixture.detectChanges();
      }).toThrowError(/tile with colspan 5 is wider than grid/);
    });
  }));

  it('should default to 1:1 row height if undefined ', async(() => {
    var template = `
      <div style="width:200px">
        <md-grid-list cols="1">
          <md-grid-tile></md-grid-tile>
        </md-grid-list>
      </div>`;

    builder.overrideTemplate(TestGridList, template).createAsync(TestGridList).then(fixture => {
      fixture.detectChanges();
      let tile = fixture.debugElement.query(By.directive(MdGridTile));

      // in ratio mode, heights are set using the padding-top property
      expect(getProp(tile, 'padding-top')).toBe('200px');
    });
  }));

  it('should use a ratio row height if passed in', async(() => {
    var template = `
      <div style="width:400px">
        <md-grid-list cols="1" [rowHeight]="height">
          <md-grid-tile></md-grid-tile>
        </md-grid-list>
      </div>`;

    builder.overrideTemplate(TestGridList, template).createAsync(TestGridList).then(fixture => {
      fixture.componentInstance.height = '4:1';
      fixture.detectChanges();

      let tile = fixture.debugElement.query(By.directive(MdGridTile));
      expect(getProp(tile, 'padding-top')).toBe('100px');

      fixture.componentInstance.height = '2:1';
      fixture.detectChanges();

      expect(getProp(tile, 'padding-top')).toBe('200px');
    });
  }));

  it('should divide row height evenly in "fit" mode', async(() => {
    var template = `
      <md-grid-list cols="1" rowHeight="fit" [style.height]="height">
        <md-grid-tile></md-grid-tile>
        <md-grid-tile></md-grid-tile>
      </md-grid-list>`;

    builder.overrideTemplate(TestGridList, template).createAsync(TestGridList).then(fixture => {
      fixture.componentInstance.height = '300px';
      fixture.detectChanges();
      let tile = fixture.debugElement.query(By.directive(MdGridTile));

      // 149.5 * 2 = 299px + 1px gutter = 300px
      expect(getProp(tile, 'height')).toBe('149.5px');

      fixture.componentInstance.height = '200px';
      fixture.detectChanges();

      // 99.5 * 2 = 199px + 1px gutter = 200px
      expect(getProp(tile, 'height')).toBe('99.5px');
    });
  }));

  it('should use the fixed row height if passed in', async(() => {
    var template = `
      <md-grid-list cols="4" [rowHeight]="height">
        <md-grid-tile></md-grid-tile>
      </md-grid-list>`;

    builder.overrideTemplate(TestGridList, template).createAsync(TestGridList).then(fixture => {
      fixture.componentInstance.height = '100px';
      fixture.detectChanges();

      let tile = fixture.debugElement.query(By.directive(MdGridTile));
      expect(getProp(tile, 'height')).toBe('100px');

      fixture.componentInstance.height = '200px';
      fixture.detectChanges();

      expect(getProp(tile, 'height')).toBe('200px');
    });
  }));

  it('should default to pixels if row height units are missing', async(() => {
    var template = `
      <md-grid-list cols="4" rowHeight="100">
        <md-grid-tile></md-grid-tile>
      </md-grid-list>`;

    builder.overrideTemplate(TestGridList, template).createAsync(TestGridList).then(fixture => {
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        let tile = fixture.debugElement.query(By.directive(MdGridTile));
        expect(getProp(tile, 'height')).toBe('100px');
      });
    });
  }));

  it('should default gutter size to 1px', async(() => {
    var template = `
      <div style="width:200px">
        <md-grid-list cols="2" rowHeight="100px">
          <md-grid-tile></md-grid-tile>
          <md-grid-tile></md-grid-tile>
          <md-grid-tile></md-grid-tile>
        </md-grid-list>
      </div>`;

    builder.overrideTemplate(TestGridList, template).createAsync(TestGridList).then(fixture => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        let tiles = fixture.debugElement.queryAll(By.css('md-grid-tile'));

        // check horizontal gutter
        expect(getProp(tiles[0], 'width')).toBe('99.5px');
        expect(getComputedLeft(tiles[1])).toBe(100.5);

        // check vertical gutter
        expect(getProp(tiles[0], 'height')).toBe('100px');
        expect(getProp(tiles[2], 'top')).toBe('101px');
      });
    });
  }));

  it('should set the gutter size if passed', async(() => {
    var template = `
      <div style="width:200px">
        <md-grid-list cols="2" gutterSize="2px" rowHeight="100px">
          <md-grid-tile></md-grid-tile>
          <md-grid-tile></md-grid-tile>
          <md-grid-tile></md-grid-tile>
        </md-grid-list>
      </div>`;

    builder.overrideTemplate(TestGridList, template).createAsync(TestGridList).then(fixture => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        let tiles = fixture.debugElement.queryAll(By.css('md-grid-tile'));

        // check horizontal gutter
        expect(getProp(tiles[0], 'width')).toBe('99px');
        expect(getComputedLeft(tiles[1])).toBe(101);

        // check vertical gutter
        expect(getProp(tiles[0], 'height')).toBe('100px');
        expect(getProp(tiles[2], 'top')).toBe('102px');
      });
    });
  }));

  it('should use pixels if gutter units are missing', async(() => {
    var template = `
      <div style="width:200px">
        <md-grid-list cols="2" gutterSize="2" rowHeight="100px">
          <md-grid-tile></md-grid-tile>
          <md-grid-tile></md-grid-tile>
          <md-grid-tile></md-grid-tile>
        </md-grid-list>
      </div>`;

    builder.overrideTemplate(TestGridList, template).createAsync(TestGridList).then(fixture => {
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        let tiles = fixture.debugElement.queryAll(By.css('md-grid-tile'));

        // check horizontal gutter
        expect(getProp(tiles[0], 'width')).toBe('99px');
        expect(getComputedLeft(tiles[1])).toBe(101);

        // check vertical gutter
        expect(getProp(tiles[0], 'height')).toBe('100px');
        expect(getProp(tiles[2], 'top')).toBe('102px');
      });
    });
  }));

  it('should set the correct list height in ratio mode', async(() => {
    var template = `
      <div style="width:400px">
        <md-grid-list cols="1" rowHeight="4:1">
          <md-grid-tile></md-grid-tile>
          <md-grid-tile></md-grid-tile>
        </md-grid-list>
      </div>
    `;

    builder.overrideTemplate(TestGridList, template).createAsync(TestGridList).then(fixture => {
      fixture.detectChanges();
      let list = fixture.debugElement.query(By.directive(MdGridList));
      expect(getProp(list, 'padding-bottom')).toBe('201px');
    });
  }));

  it('should set the correct list height in fixed mode', async(() => {
    var template = `
      <md-grid-list cols="1" rowHeight="100px">
        <md-grid-tile></md-grid-tile>
        <md-grid-tile></md-grid-tile>
      </md-grid-list>`;

    builder.overrideTemplate(TestGridList, template).createAsync(TestGridList).then(fixture => {
      fixture.detectChanges();
      let list = fixture.debugElement.query(By.directive(MdGridList));
      expect(getProp(list, 'height')).toBe('201px');
    });
  }));

  it('should allow adjustment of tile colspan', async(() => {
    var template = `
      <div style="width:400px">
        <md-grid-list cols="4">
          <md-grid-tile [colspan]="colspan"></md-grid-tile>
        </md-grid-list>
      </div>`;

    builder.overrideTemplate(TestGridList, template).createAsync(TestGridList).then(fixture => {
      fixture.componentInstance.colspan = 2;
      fixture.detectChanges();

      let tile = fixture.debugElement.query(By.directive(MdGridTile));
      expect(getProp(tile, 'width')).toBe('199.5px');

      fixture.componentInstance.colspan = 3;
      fixture.detectChanges();
      expect(getProp(tile, 'width')).toBe('299.75px');
    });
  }));

  it('should allow adjustment of tile rowspan', async(() => {
    var template = `
      <md-grid-list cols="1" rowHeight="100px">
        <md-grid-tile [rowspan]="rowspan"></md-grid-tile>
      </md-grid-list>`;

    builder.overrideTemplate(TestGridList, template).createAsync(TestGridList).then(fixture => {
      fixture.componentInstance.rowspan = 2;
      fixture.detectChanges();

      let tile = fixture.debugElement.query(By.directive(MdGridTile));
      expect(getProp(tile, 'height')).toBe('201px');

      fixture.componentInstance.rowspan = 3;
      fixture.detectChanges();
      expect(getProp(tile, 'height')).toBe('302px');
    });
  }));

  it('should lay out tiles correctly for a complex layout', async(() => {
    var template = `
      <div style="width:400px">
        <md-grid-list cols="4" rowHeight="100px">
          <md-grid-tile *ngFor="let tile of tiles" [colspan]="tile.cols" [rowspan]="tile.rows"
                        [style.background]="tile.color">
            {{tile.text}}
          </md-grid-tile>
        </md-grid-list>
      </div>`;

    builder.overrideTemplate(TestGridList, template).createAsync(TestGridList).then(fixture => {
      fixture.componentInstance.tiles = [
        {cols: 3, rows: 1},
        {cols: 1, rows: 2},
        {cols: 1, rows: 1},
        {cols: 2, rows: 1}
      ];

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        let tiles = fixture.debugElement.queryAll(By.css('md-grid-tile'));

        expect(getProp(tiles[0], 'width')).toBe('299.75px');
        expect(getProp(tiles[0], 'height')).toBe('100px');
        expect(getComputedLeft(tiles[0])).toBe(0);
        expect(getProp(tiles[0], 'top')).toBe('0px');

        expect(getProp(tiles[1], 'width')).toBe('99.25px');
        expect(getProp(tiles[1], 'height')).toBe('201px');
        expect(getComputedLeft(tiles[1])).toBe(300.75);
        expect(getProp(tiles[1], 'top')).toBe('0px');

        expect(getProp(tiles[2], 'width')).toBe('99.25px');
        expect(getProp(tiles[2], 'height')).toBe('100px');
        expect(getComputedLeft(tiles[2])).toBe(0);
        expect(getProp(tiles[2], 'top')).toBe('101px');

        expect(getProp(tiles[3], 'width')).toBe('199.5px');
        expect(getProp(tiles[3], 'height')).toBe('100px');
        expect(getComputedLeft(tiles[3])).toBe(100.25);
        expect(getProp(tiles[3], 'top')).toBe('101px');
      });
    });
  }));

  it('should add not add any classes to footers without lines', async(() => {
    var template = `
      <md-grid-list cols="1">
        <md-grid-tile>
          <md-grid-tile-footer>
            I'm a footer!
          </md-grid-tile-footer>
        </md-grid-tile>
      </md-grid-list>`;

    builder.overrideTemplate(TestGridList, template).createAsync(TestGridList).then(fixture => {
      fixture.detectChanges();

      let footer = fixture.debugElement.query(By.directive(MdGridTileText));
      expect(footer.nativeElement.classList.contains('md-2-line')).toBe(false);
    });
  }));

  it('should add class to footers with two lines', async(() => {
    var template = `
      <md-grid-list cols="1">
        <md-grid-tile>
          <md-grid-tile-footer>
            <h3 md-line>First line</h3>
            <span md-line>Second line</span>
          </md-grid-tile-footer>
        </md-grid-tile>
      </md-grid-list>`;

    builder.overrideTemplate(TestGridList, template).createAsync(TestGridList).then(fixture => {
      fixture.detectChanges();

      let footer = fixture.debugElement.query(By.directive(MdGridTileText));
      expect(footer.nativeElement.classList.contains('md-2-line')).toBe(true);
    });
  }));

});

@Component({
  selector: 'test-grid-list',
  template: ``,
  directives: [MD_GRID_LIST_DIRECTIVES]
})
class TestGridList {
  tiles: any[];
  height: string | number;
  colspan: number;
  rowspan: number;
}

function getProp(el: DebugElement, prop: string): string {
  return getComputedStyle(el.nativeElement).getPropertyValue(prop);
}

/** Gets the `left` position of an element. */
function getComputedLeft(element: DebugElement): number {
  // While the other properties in this test use `getComputedStyle`, we use `getBoundingClientRect`
  // for left because iOS Safari doesn't support using `getComputedStyle` to get the calculated
  // `left` balue when using CSS `calc`. We subtract the `left` of the document body because
  // browsers, by default, add a margin to the body (typically 8px).
  let elementRect = element.nativeElement.getBoundingClientRect();
  let bodyRect = document.body.getBoundingClientRect();

  return elementRect.left - bodyRect.left;
}
