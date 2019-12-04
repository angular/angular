import {
  BaseHarnessFilters,
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate
} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component, Type} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDividerHarness} from '@angular/material/divider/testing';
import {MatListModule} from '@angular/material/list';
import {MatActionListHarness, MatActionListItemHarness} from './action-list-harness';
import {MatListHarness, MatListItemHarness} from './list-harness';
import {MatListHarnessBase} from './list-harness-base';
import {BaseListItemHarnessFilters} from './list-harness-filters';
import {MatListItemHarnessBase, MatSubheaderHarness} from './list-item-harness-base';
import {MatNavListHarness, MatNavListItemHarness} from './nav-list-harness';
import {MatListOptionHarness, MatSelectionListHarness} from './selection-list-harness';

/** Tests that apply to all types of mat-list. */
function runBaseListFunctionalityTests<
    L extends MatListHarnessBase<
        ComponentHarnessConstructor<I> & {with: (x?: any) => HarnessPredicate<I>},
        I,
        BaseListItemHarnessFilters
    >,
    I extends MatListItemHarnessBase,
>(
    testComponent: Type<{}>,
    listModule: typeof MatListModule,
    listHarness: ComponentHarnessConstructor<L> & {
      with: (config?: BaseHarnessFilters) => HarnessPredicate<L>
    },
    listItemHarnessBase: typeof MatListItemHarnessBase,
    subheaderHarness: typeof MatSubheaderHarness,
    dividerHarness: typeof MatDividerHarness) {
  describe('base list functionality', () => {
    let simpleListHarness: L;
    let emptyListHarness: L;
    let fixture: ComponentFixture<{}>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [listModule],
        declarations: [testComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(testComponent);
      fixture.detectChanges();
      const loader = TestbedHarnessEnvironment.loader(fixture);
      simpleListHarness =
          await loader.getHarness(listHarness.with({selector: '.test-base-list-functionality'}));
      emptyListHarness = await loader.getHarness(listHarness.with({selector: '.test-empty'}));
    });

    it('should get all items', async () => {
      const items = await simpleListHarness.getItems();
      expect(await Promise.all(items.map(i => i.getText())))
          .toEqual(['Item 1', 'Item 2', 'Item 3']);
    });

    it('should get all items matching text', async () => {
      const items = await simpleListHarness.getItems({text: /[13]/});
      expect(await Promise.all(items.map(i => i.getText()))).toEqual(['Item 1', 'Item 3']);
    });

    it('should get all items of empty list', async () => {
      expect((await emptyListHarness.getItems()).length).toBe(0);
    });

    it('should get items by subheader', async () => {
      const sections = await simpleListHarness.getItemsGroupedBySubheader();
      expect(sections.length).toBe(3);
      expect(sections[0].heading).toBeUndefined();
      expect(await Promise.all(sections[0].items.map(i => i.getText()))).toEqual(['Item 1']);
      expect(sections[1].heading).toBe('Section 1');
      expect(await Promise.all(sections[1].items.map(i => i.getText())))
          .toEqual(['Item 2', 'Item 3']);
      expect(sections[2].heading).toBe('Section 2');
      expect(sections[2].items.length).toEqual(0);
    });

    it('should get items by subheader for an empty list', async () => {
      const sections = await emptyListHarness.getItemsGroupedBySubheader();
      expect(sections.length).toBe(1);
      expect(sections[0].heading).toBeUndefined();
      expect(sections[0].items.length).toBe(0);
    });

    it('should get items grouped by divider', async () => {
      const sections = await simpleListHarness.getItemsGroupedByDividers();
      expect(sections.length).toBe(3);
      expect(await Promise.all(sections[0].map(i => i.getText()))).toEqual(['Item 1']);
      expect(await Promise.all(sections[1].map(i => i.getText()))).toEqual(['Item 2', 'Item 3']);
      expect(sections[2].length).toBe(0);
    });

    it('should get items grouped by divider for an empty list', async () => {
      const sections = await emptyListHarness.getItemsGroupedByDividers();
      expect(sections.length).toBe(1);
      expect(sections[0].length).toBe(0);
    });

    it('should get all items, subheaders, and dividers', async () => {
      const itemsSubheadersAndDividers =
          await simpleListHarness.getItemsWithSubheadersAndDividers();
      expect(itemsSubheadersAndDividers.length).toBe(7);
      expect(itemsSubheadersAndDividers[0] instanceof listItemHarnessBase).toBe(true);
      expect(await (itemsSubheadersAndDividers[0] as MatListItemHarnessBase).getText())
          .toBe('Item 1');
      expect(itemsSubheadersAndDividers[1] instanceof subheaderHarness).toBe(true);
      expect(await (itemsSubheadersAndDividers[1] as MatSubheaderHarness).getText())
          .toBe('Section 1');
      expect(itemsSubheadersAndDividers[2] instanceof dividerHarness).toBe(true);
      expect(itemsSubheadersAndDividers[3] instanceof listItemHarnessBase).toBe(true);
      expect(await (itemsSubheadersAndDividers[3] as MatListItemHarnessBase).getText())
          .toBe('Item 2');
      expect(itemsSubheadersAndDividers[4] instanceof listItemHarnessBase).toBe(true);
      expect(await (itemsSubheadersAndDividers[4] as MatListItemHarnessBase).getText())
          .toBe('Item 3');
      expect(itemsSubheadersAndDividers[5] instanceof subheaderHarness).toBe(true);
      expect(await (itemsSubheadersAndDividers[5] as MatSubheaderHarness).getText())
          .toBe('Section 2');
      expect(itemsSubheadersAndDividers[6] instanceof dividerHarness).toBe(true);
    });

    it('should get all items, subheaders, and dividers excluding some harness types', async () => {
      const items = await simpleListHarness.getItemsWithSubheadersAndDividers(
          {subheader: false, divider: false});
      const subheaders = await simpleListHarness.getItemsWithSubheadersAndDividers(
          {item: false, divider: false});
      const dividers = await simpleListHarness.getItemsWithSubheadersAndDividers(
          {item: false, subheader: false});
      expect(await Promise.all(items.map(i => i.getText())))
          .toEqual(['Item 1', 'Item 2', 'Item 3']);
      expect(await Promise.all(subheaders.map(s => s.getText())))
          .toEqual(['Section 1', 'Section 2']);
      expect(await Promise.all(dividers.map(d => d.getOrientation())))
          .toEqual(['horizontal', 'horizontal']);
    });

    it('should get all items, subheaders, and dividers with filters', async () => {
      const itemsSubheadersAndDividers = await simpleListHarness.getItemsWithSubheadersAndDividers({
        item: {text: /1/},
        subheader: {text: /2/}
      });
      expect(itemsSubheadersAndDividers.length).toBe(4);
      expect(itemsSubheadersAndDividers[0] instanceof listItemHarnessBase).toBe(true);
      expect(await (itemsSubheadersAndDividers[0] as MatListItemHarnessBase).getText())
          .toBe('Item 1');
      expect(itemsSubheadersAndDividers[1] instanceof dividerHarness).toBe(true);
      expect(itemsSubheadersAndDividers[2] instanceof subheaderHarness).toBe(true);
      expect(await (itemsSubheadersAndDividers[2] as MatSubheaderHarness).getText())
          .toBe('Section 2');
      expect(itemsSubheadersAndDividers[3] instanceof dividerHarness).toBe(true);
    });

    it('should get list item text and lines', async () => {
      const items = await simpleListHarness.getItems();
      expect(items.length).toBe(3);
      expect(await items[0].getText()).toBe('Item 1');
      expect(await items[0].getLinesText()).toEqual(['Item', '1']);
      expect(await items[1].getText()).toBe('Item 2');
      expect(await items[1].getLinesText()).toEqual([]);
      expect(await items[2].getText()).toBe('Item 3');
      expect(await items[2].getLinesText()).toEqual([]);
    });

    it('should check list item icons and avatars', async () => {
      const items = await simpleListHarness.getItems();
      expect(items.length).toBe(3);
      expect(await items[0].hasIcon()).toBe(true);
      expect(await items[0].hasAvatar()).toBe(true);
      expect(await items[1].hasIcon()).toBe(false);
      expect(await items[1].hasAvatar()).toBe(false);
      expect(await items[2].hasIcon()).toBe(false);
      expect(await items[2].hasAvatar()).toBe(false);
    });

    it('should get harness loader for list item content', async () => {
      const items = await simpleListHarness.getItems();
      expect(items.length).toBe(3);
      const item2Loader = await items[1].getHarnessLoaderForContent();
      expect(await item2Loader.getHarness(TestItemContentHarness)).not.toBeNull();
    });
  });
}


/**
 * Function that can be used to run the shared tests for either the non-MDC or MDC based list
 * harness.
 */
export function runHarnessTests(
    listModule: typeof MatListModule,
    listHarness: typeof MatListHarness,
    actionListHarness: typeof MatActionListHarness,
    navListHarness: typeof MatNavListHarness,
    selectionListHarness: typeof MatSelectionListHarness,
    listItemHarnessBase: typeof MatListItemHarnessBase,
    subheaderHarness: typeof MatSubheaderHarness,
    dividerHarness: typeof MatDividerHarness) {
  describe('MatListHarness', () => {
    runBaseListFunctionalityTests<MatListHarness, MatListItemHarness>(
        ListHarnessTest, listModule, listHarness, listItemHarnessBase, subheaderHarness,
        dividerHarness);
  });

  describe('MatActionListHarness', () => {
    runBaseListFunctionalityTests<MatActionListHarness, MatActionListItemHarness>(
        ActionListHarnessTest, listModule, actionListHarness, listItemHarnessBase, subheaderHarness,
        dividerHarness);

    describe('additional functionality', () => {
      let harness: MatActionListHarness;
      let fixture: ComponentFixture<ActionListHarnessTest>;

      beforeEach(async () => {
        await TestBed.configureTestingModule({
          imports: [listModule],
          declarations: [ActionListHarnessTest],
        }).compileComponents();

        fixture = TestBed.createComponent(ActionListHarnessTest);
        fixture.detectChanges();
        const loader = TestbedHarnessEnvironment.loader(fixture);
        harness = await loader.getHarness(
            actionListHarness.with({selector: '.test-base-list-functionality'}));
      });

      it('should click items', async () => {
        const items = await harness.getItems();
        expect(items.length).toBe(3);
        await items[0].click();
        expect(fixture.componentInstance.lastClicked).toBe('Item 1');
        await items[1].click();
        expect(fixture.componentInstance.lastClicked).toBe('Item 2');
        await items[2].click();
        expect(fixture.componentInstance.lastClicked).toBe('Item 3');
      });
    });
  });

  describe('MatNavListHarness', () => {
    runBaseListFunctionalityTests<MatNavListHarness, MatNavListItemHarness>(
        NavListHarnessTest, listModule, navListHarness, listItemHarnessBase, subheaderHarness,
        dividerHarness);

    describe('additional functionality', () => {
      let harness: MatNavListHarness;
      let fixture: ComponentFixture<NavListHarnessTest>;

      beforeEach(async () => {
        await TestBed.configureTestingModule({
          imports: [listModule],
          declarations: [NavListHarnessTest],
        }).compileComponents();

        fixture = TestBed.createComponent(NavListHarnessTest);
        fixture.detectChanges();
        const loader = TestbedHarnessEnvironment.loader(fixture);
        harness = await loader.getHarness(
            navListHarness.with({selector: '.test-base-list-functionality'}));
      });

      it('should click items', async () => {
        const items = await harness.getItems();
        expect(items.length).toBe(3);
        await items[0].click();
        expect(fixture.componentInstance.lastClicked).toBe('Item 1');
        await items[1].click();
        expect(fixture.componentInstance.lastClicked).toBe('Item 2');
        await items[2].click();
        expect(fixture.componentInstance.lastClicked).toBe('Item 3');
      });

      it('should get href', async () => {
        const items = await harness.getItems();
        expect(await Promise.all(items.map(i => i.getHref()))).toEqual([null, '', '/somestuff']);
      });

      it('should get item harness by href', async () => {
        const items = await harness.getItems({href: /stuff/});
        expect(items.length).toBe(1);
        expect(await items[0].getHref()).toBe('/somestuff');
      });
    });
  });

  describe('MatSelectionListHarness', () => {
    runBaseListFunctionalityTests<MatSelectionListHarness, MatListOptionHarness>(
        SelectionListHarnessTest, listModule, selectionListHarness, listItemHarnessBase,
        subheaderHarness, dividerHarness);

    describe('additional functionality', () => {
      let harness: MatSelectionListHarness;
      let emptyHarness: MatSelectionListHarness;
      let fixture: ComponentFixture<SelectionListHarnessTest>;

      beforeEach(async () => {
        await TestBed.configureTestingModule({
          imports: [listModule],
          declarations: [SelectionListHarnessTest],
        }).compileComponents();

        fixture = TestBed.createComponent(SelectionListHarnessTest);
        fixture.detectChanges();
        const loader = TestbedHarnessEnvironment.loader(fixture);
        harness = await loader.getHarness(
            selectionListHarness.with({selector: '.test-base-list-functionality'}));
        emptyHarness =
            await loader.getHarness(selectionListHarness.with({selector: '.test-empty'}));
      });

      it('should check disabled state of list', async () => {
        expect(await harness.isDisabled()).toBe(false);
        expect(await emptyHarness.isDisabled()).toBe(true);
      });

      it('should get all selected options', async () => {
        expect((await harness.getItems({selected: true})).length).toBe(0);
        const items = await harness.getItems();
        await Promise.all(items.map(item => item.select()));
        expect((await harness.getItems({selected: true})).length).toBe(3);
      });

      it('should check multiple options', async () => {
        expect((await harness.getItems({selected: true})).length).toBe(0);
        await harness.selectItems({text: /1/}, {text: /3/});
        const selected = await harness.getItems({selected: true});
        expect(await Promise.all(selected.map(item => item.getText())))
            .toEqual(['Item 1', 'Item 3']);
      });

      it('should uncheck multiple options', async () => {
        await harness.selectItems();
        expect((await harness.getItems({selected: true})).length).toBe(3);
        await harness.deselectItems({text: /1/}, {text: /3/});
        const selected = await harness.getItems({selected: true});
        expect(await Promise.all(selected.map(item => item.getText()))).toEqual(['Item 2']);
      });

      it('should get option checkbox position', async () => {
        const items = await harness.getItems();
        expect(items.length).toBe(3);
        expect(await items[0].getCheckboxPosition()).toBe('before');
        expect(await items[1].getCheckboxPosition()).toBe('after');
      });

      it('should toggle option selection', async () => {
        const items = await harness.getItems();
        expect(items.length).toBe(3);
        expect(await items[0].isSelected()).toBe(false);
        await items[0].toggle();
        expect(await items[0].isSelected()).toBe(true);
        await items[0].toggle();
        expect(await items[0].isSelected()).toBe(false);
      });

      it('should check single option', async () => {
        const items = await harness.getItems();
        expect(items.length).toBe(3);
        expect(await items[0].isSelected()).toBe(false);
        await items[0].select();
        expect(await items[0].isSelected()).toBe(true);
        await items[0].select();
        expect(await items[0].isSelected()).toBe(true);
      });

      it('should uncheck single option', async () => {
        const items = await harness.getItems();
        expect(items.length).toBe(3);
        await items[0].select();
        expect(await items[0].isSelected()).toBe(true);
        await items[0].deselect();
        expect(await items[0].isSelected()).toBe(false);
        await items[0].deselect();
        expect(await items[0].isSelected()).toBe(false);
      });

      it('should check disabled state of options', async () => {
        fixture.componentInstance.disableItem3 = true;
        const items = await harness.getItems();
        expect(items.length).toBe(3);
        expect(await items[0].isDisabled()).toBe(false);
        expect(await items[2].isDisabled()).toBe(true);
      });
    });
  });
}

@Component({
  template: `
      <mat-list class="test-base-list-functionality">
        <mat-list-item>
          <div matLine>Item </div>
          <div matLine>1</div>
          <svg matListIcon></svg>
          <svg matListAvatar></svg>
        </mat-list-item>
        <div matSubheader>Section 1</div>
        <mat-divider></mat-divider>
        <a mat-list-item>
          <span class="test-item-content">Item 2</span>
        </a>
        <button mat-list-item>Item 3</button>
        <div matSubheader>Section 2</div>
        <mat-divider></mat-divider>
      </mat-list>

      <mat-list class="test-empty"></mat-list>
  `
})
class ListHarnessTest {}

@Component({
  template: `
      <mat-action-list class="test-base-list-functionality">
        <mat-list-item (click)="lastClicked = 'Item 1'">
          <div matLine>Item </div>
          <div matLine>1</div>
          <svg matListIcon></svg>
          <svg matListAvatar></svg>
        </mat-list-item>
        <div matSubheader>Section 1</div>
        <mat-divider></mat-divider>
        <a mat-list-item (click)="lastClicked = 'Item 2'">
          <span class="test-item-content">Item 2</span>
        </a>
        <button mat-list-item (click)="lastClicked = 'Item 3'">Item 3</button>
        <div matSubheader>Section 2</div>
        <mat-divider></mat-divider>
      </mat-action-list>

      <mat-action-list class="test-empty"></mat-action-list>
  `
})
class ActionListHarnessTest {
  lastClicked: string;
}

@Component({
  template: `
      <mat-nav-list class="test-base-list-functionality">
        <a mat-list-item (click)="onClick($event, 'Item 1')">
          <div matLine>Item </div>
          <div matLine>1</div>
          <svg matListIcon></svg>
          <svg matListAvatar></svg>
        </a>
        <div matSubheader>Section 1</div>
        <mat-divider></mat-divider>
        <a mat-list-item href (click)="onClick($event, 'Item 2')">
          <span class="test-item-content">Item 2</span>
        </a>
        <a mat-list-item href="/somestuff" (click)="onClick($event, 'Item 3')">Item 3</a>
        <div matSubheader>Section 2</div>
        <mat-divider></mat-divider>
      </mat-nav-list>

      <mat-nav-list class="test-empty"></mat-nav-list>
  `
})
class NavListHarnessTest {
  lastClicked: string;

  onClick(event: Event, value: string) {
    event.preventDefault();
    this.lastClicked = value;
  }
}

@Component({
  template: `
    <mat-selection-list class="test-base-list-functionality">
      <mat-list-option checkboxPosition="before">
        <div matLine>Item </div>
        <div matLine>1</div>
        <svg matListIcon></svg>
        <svg matListAvatar></svg>
      </mat-list-option>
      <div matSubheader>Section 1</div>
      <mat-divider></mat-divider>
      <mat-list-option>
        <span class="test-item-content">Item 2</span>
      </mat-list-option>
      <mat-list-option [disabled]="disableItem3">Item 3</mat-list-option>
      <div matSubheader>Section 2</div>
      <mat-divider></mat-divider>
    </mat-selection-list>

    <mat-selection-list class="test-empty" disabled></mat-selection-list>
  `
})
class SelectionListHarnessTest {
  disableItem3 = false;
}

class TestItemContentHarness extends ComponentHarness {
  static hostSelector = '.test-item-content';
}
