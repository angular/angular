import {
  BaseHarnessFilters,
  ComponentHarness,
  ComponentHarnessConstructor,
  HarnessPredicate,
  parallel,
} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component, Type} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDividerHarness} from '@angular/material/divider/testing';
import {MatLegacyListModule} from '@angular/material/legacy-list';
import {MatLegacyActionListHarness, MatLegacyActionListItemHarness} from './action-list-harness';
import {MatLegacyListHarness, MatLegacyListItemHarness} from './list-harness';
import {MatLegacyListHarnessBase} from './list-harness-base';
import {LegacyBaseListItemHarnessFilters} from './list-harness-filters';
import {
  MatLegacyListItemHarnessBase,
  MatLegacyListItemSection,
  MatLegacySubheaderHarness,
} from './list-item-harness-base';
import {MatLegacyNavListHarness, MatLegacyNavListItemHarness} from './nav-list-harness';
import {MatLegacyListOptionHarness, MatLegacySelectionListHarness} from './selection-list-harness';

/** Tests that apply to all types of mat-list. */
function runBaseListFunctionalityTests<
  L extends MatLegacyListHarnessBase<
    ComponentHarnessConstructor<I> & {with: (x?: any) => HarnessPredicate<I>},
    I,
    LegacyBaseListItemHarnessFilters
  >,
  I extends MatLegacyListItemHarnessBase,
  F extends {disableThirdItem: boolean},
>(
  testComponent: Type<F>,
  listModule: typeof MatLegacyListModule,
  listHarness: ComponentHarnessConstructor<L> & {
    with: (config?: BaseHarnessFilters) => HarnessPredicate<L>;
  },
  listItemHarnessBase: typeof MatLegacyListItemHarnessBase,
  subheaderHarness: typeof MatLegacySubheaderHarness,
  dividerHarness: typeof MatDividerHarness,
  selectors: {content: string},
) {
  describe('base list functionality', () => {
    let simpleListHarness: L;
    let emptyListHarness: L;
    let fixture: ComponentFixture<F>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [listModule],
        declarations: [testComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(testComponent);
      fixture.detectChanges();
      const loader = TestbedHarnessEnvironment.loader(fixture);
      simpleListHarness = await loader.getHarness(
        listHarness.with({selector: '.test-base-list-functionality'}),
      );
      emptyListHarness = await loader.getHarness(listHarness.with({selector: '.test-empty'}));
    });

    it('should get all items', async () => {
      const items = await simpleListHarness.getItems();
      expect(await parallel(() => items.map(i => i.getText()))).toEqual([
        'Item 1',
        'Item 2',
        'Item 3',
      ]);
    });

    it('should get all items matching text', async () => {
      const items = await simpleListHarness.getItems({text: /[13]/});
      expect(await parallel(() => items.map(i => i.getText()))).toEqual(['Item 1', 'Item 3']);
    });

    it('should get all items of empty list', async () => {
      expect((await emptyListHarness.getItems()).length).toBe(0);
    });

    it('should get items by subheader', async () => {
      const sections = await simpleListHarness.getItemsGroupedBySubheader();
      expect(sections.length).toBe(3);
      expect(sections[0].heading).toBeUndefined();
      expect(await parallel(() => sections[0].items.map(i => i.getText()))).toEqual(['Item 1']);
      expect(sections[1].heading).toBe('Section 1');
      expect(await parallel(() => sections[1].items.map(i => i.getText()))).toEqual([
        'Item 2',
        'Item 3',
      ]);
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
      expect(await parallel(() => sections[0].map(i => i.getText()))).toEqual(['Item 1']);
      expect(await parallel(() => sections[1].map(i => i.getText()))).toEqual(['Item 2', 'Item 3']);
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
      expect(await (itemsSubheadersAndDividers[0] as MatLegacyListItemHarnessBase).getText()).toBe(
        'Item 1',
      );
      expect(itemsSubheadersAndDividers[1] instanceof subheaderHarness).toBe(true);
      expect(await (itemsSubheadersAndDividers[1] as MatLegacySubheaderHarness).getText()).toBe(
        'Section 1',
      );
      expect(itemsSubheadersAndDividers[2] instanceof dividerHarness).toBe(true);
      expect(itemsSubheadersAndDividers[3] instanceof listItemHarnessBase).toBe(true);
      expect(await (itemsSubheadersAndDividers[3] as MatLegacyListItemHarnessBase).getText()).toBe(
        'Item 2',
      );
      expect(itemsSubheadersAndDividers[4] instanceof listItemHarnessBase).toBe(true);
      expect(await (itemsSubheadersAndDividers[4] as MatLegacyListItemHarnessBase).getText()).toBe(
        'Item 3',
      );
      expect(itemsSubheadersAndDividers[5] instanceof subheaderHarness).toBe(true);
      expect(await (itemsSubheadersAndDividers[5] as MatLegacySubheaderHarness).getText()).toBe(
        'Section 2',
      );
      expect(itemsSubheadersAndDividers[6] instanceof dividerHarness).toBe(true);
    });

    it('should get all items, subheaders, and dividers excluding some harness types', async () => {
      const items = await simpleListHarness.getItemsWithSubheadersAndDividers({
        subheader: false,
        divider: false,
      });
      const subheaders = await simpleListHarness.getItemsWithSubheadersAndDividers({
        item: false,
        divider: false,
      });
      const dividers = await simpleListHarness.getItemsWithSubheadersAndDividers({
        item: false,
        subheader: false,
      });
      expect(await parallel(() => items.map(i => i.getText()))).toEqual([
        'Item 1',
        'Item 2',
        'Item 3',
      ]);
      expect(await parallel(() => subheaders.map(s => s.getText()))).toEqual([
        'Section 1',
        'Section 2',
      ]);
      expect(await parallel(() => dividers.map(d => d.getOrientation()))).toEqual([
        'horizontal',
        'horizontal',
      ]);
    });

    it('should get all items, subheaders, and dividers with filters', async () => {
      const itemsSubheadersAndDividers = await simpleListHarness.getItemsWithSubheadersAndDividers({
        item: {text: /1/},
        subheader: {text: /2/},
      });
      expect(itemsSubheadersAndDividers.length).toBe(4);
      expect(itemsSubheadersAndDividers[0] instanceof listItemHarnessBase).toBe(true);
      expect(await (itemsSubheadersAndDividers[0] as MatLegacyListItemHarnessBase).getText()).toBe(
        'Item 1',
      );
      expect(itemsSubheadersAndDividers[1] instanceof dividerHarness).toBe(true);
      expect(itemsSubheadersAndDividers[2] instanceof subheaderHarness).toBe(true);
      expect(await (itemsSubheadersAndDividers[2] as MatLegacySubheaderHarness).getText()).toBe(
        'Section 2',
      );
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
      const childHarness = await items[1].getHarness(TestItemContentHarness);
      expect(childHarness).not.toBeNull();
    });

    it('should be able to get content harness loader of list item', async () => {
      const items = await simpleListHarness.getItems();
      expect(items.length).toBe(3);
      const loader = await items[1].getChildLoader(selectors.content as MatLegacyListItemSection);
      await expectAsync(loader.getHarness(TestItemContentHarness)).toBeResolved();
    });

    it('should check disabled state of items', async () => {
      fixture.componentInstance.disableThirdItem = true;
      const items = await simpleListHarness.getItems();
      expect(items.length).toBe(3);
      expect(await items[0].isDisabled()).toBe(false);
      expect(await items[2].isDisabled()).toBe(true);
    });
  });
}

/**
 * Function that can be used to run the shared tests for either the non-MDC or MDC based list
 * harness.
 */
export function runHarnessTests(
  listModule: typeof MatLegacyListModule,
  listHarness: typeof MatLegacyListHarness,
  actionListHarness: typeof MatLegacyActionListHarness,
  navListHarness: typeof MatLegacyNavListHarness,
  selectionListHarness: typeof MatLegacySelectionListHarness,
  listItemHarnessBase: typeof MatLegacyListItemHarnessBase,
  subheaderHarness: typeof MatLegacySubheaderHarness,
  dividerHarness: typeof MatDividerHarness,
  selectors: {content: string},
) {
  describe('MatListHarness', () => {
    runBaseListFunctionalityTests<MatLegacyListHarness, MatLegacyListItemHarness, ListHarnessTest>(
      ListHarnessTest,
      listModule,
      listHarness,
      listItemHarnessBase,
      subheaderHarness,
      dividerHarness,
      selectors,
    );
  });

  describe('MatActionListHarness', () => {
    runBaseListFunctionalityTests<
      MatLegacyActionListHarness,
      MatLegacyActionListItemHarness,
      ActionListHarnessTest
    >(
      ActionListHarnessTest,
      listModule,
      actionListHarness,
      listItemHarnessBase,
      subheaderHarness,
      dividerHarness,
      selectors,
    );

    describe('additional functionality', () => {
      let harness: MatLegacyActionListHarness;
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
          actionListHarness.with({selector: '.test-base-list-functionality'}),
        );
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
    runBaseListFunctionalityTests<
      MatLegacyNavListHarness,
      MatLegacyNavListItemHarness,
      NavListHarnessTest
    >(
      NavListHarnessTest,
      listModule,
      navListHarness,
      listItemHarnessBase,
      subheaderHarness,
      dividerHarness,
      selectors,
    );

    describe('additional functionality', () => {
      let harness: MatLegacyNavListHarness;
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
          navListHarness.with({selector: '.test-base-list-functionality'}),
        );
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
        expect(await parallel(() => items.map(i => i.getHref()))).toEqual([null, '', '/somestuff']);
      });

      it('should get item harness by href', async () => {
        const items = await harness.getItems({href: /stuff/});
        expect(items.length).toBe(1);
        expect(await items[0].getHref()).toBe('/somestuff');
      });
    });
  });

  describe('MatSelectionListHarness', () => {
    runBaseListFunctionalityTests<
      MatLegacySelectionListHarness,
      MatLegacyListOptionHarness,
      SelectionListHarnessTest
    >(
      SelectionListHarnessTest,
      listModule,
      selectionListHarness,
      listItemHarnessBase,
      subheaderHarness,
      dividerHarness,
      selectors,
    );

    describe('additional functionality', () => {
      let harness: MatLegacySelectionListHarness;
      let emptyHarness: MatLegacySelectionListHarness;
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
          selectionListHarness.with({selector: '.test-base-list-functionality'}),
        );
        emptyHarness = await loader.getHarness(
          selectionListHarness.with({selector: '.test-empty'}),
        );
      });

      it('should check disabled state of list', async () => {
        expect(await harness.isDisabled()).toBe(false);
        expect(await emptyHarness.isDisabled()).toBe(true);
      });

      it('should get all selected options', async () => {
        expect((await harness.getItems({selected: true})).length).toBe(0);
        const items = await harness.getItems();
        await parallel(() => items.map(item => item.select()));
        expect((await harness.getItems({selected: true})).length).toBe(3);
      });

      it('should check multiple options', async () => {
        expect((await harness.getItems({selected: true})).length).toBe(0);
        await harness.selectItems({text: /1/}, {text: /3/});
        const selected = await harness.getItems({selected: true});
        expect(await parallel(() => selected.map(item => item.getText()))).toEqual([
          'Item 1',
          'Item 3',
        ]);
      });

      it('should uncheck multiple options', async () => {
        await harness.selectItems();
        expect((await harness.getItems({selected: true})).length).toBe(3);
        await harness.deselectItems({text: /1/}, {text: /3/});
        const selected = await harness.getItems({selected: true});
        expect(await parallel(() => selected.map(item => item.getText()))).toEqual(['Item 2']);
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
    });
  });
}

@Component({
  template: `
      <mat-list class="test-base-list-functionality">
        <mat-list-item>
          <div matLine>Item </div>
          <div matLine>1</div>
          <div matListIcon>icon</div>
          <div matListAvatar>Avatar</div>
        </mat-list-item>
        <div matSubheader>Section 1</div>
        <mat-divider></mat-divider>
        <a mat-list-item>
          <span class="test-item-content">Item 2</span>
        </a>
        <button mat-list-item [disabled]="disableThirdItem">Item 3</button>
        <div matSubheader>Section 2</div>
        <mat-divider></mat-divider>
      </mat-list>

      <mat-list class="test-empty"></mat-list>
  `,
})
class ListHarnessTest {
  disableThirdItem = false;
}

@Component({
  template: `
      <mat-action-list class="test-base-list-functionality">
        <mat-list-item (click)="lastClicked = 'Item 1'">
          <div matLine>Item </div>
          <div matLine>1</div>
          <div matListIcon>icon</div>
          <div matListAvatar>Avatar</div>
        </mat-list-item>
        <div matSubheader>Section 1</div>
        <mat-divider></mat-divider>
        <a mat-list-item (click)="lastClicked = 'Item 2'">
          <span class="test-item-content">Item 2</span>
        </a>
        <button
          mat-list-item
          [disabled]="disableThirdItem"
          (click)="lastClicked = 'Item 3'">Item 3</button>
        <div matSubheader>Section 2</div>
        <mat-divider></mat-divider>
      </mat-action-list>

      <mat-action-list class="test-empty"></mat-action-list>
  `,
})
class ActionListHarnessTest {
  lastClicked: string;
  disableThirdItem = false;
}

@Component({
  template: `
      <mat-nav-list class="test-base-list-functionality">
        <a mat-list-item (click)="onClick($event, 'Item 1')">
          <div matLine>Item </div>
          <div matLine>1</div>
          <div matListIcon>icon</div>
          <div matListAvatar>Avatar</div>
        </a>
        <div matSubheader>Section 1</div>
        <mat-divider></mat-divider>
        <a mat-list-item href (click)="onClick($event, 'Item 2')">
          <span class="test-item-content">Item 2</span>
        </a>
        <a
          mat-list-item
          href="/somestuff"
          (click)="onClick($event, 'Item 3')"
          [disabled]="disableThirdItem">Item 3</a>
        <div matSubheader>Section 2</div>
        <mat-divider></mat-divider>
      </mat-nav-list>

      <mat-nav-list class="test-empty"></mat-nav-list>
  `,
})
class NavListHarnessTest {
  lastClicked: string;
  disableThirdItem = false;

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
        <div matListIcon>icon</div>
        <div matListAvatar>Avatar</div>
      </mat-list-option>
      <div matSubheader>Section 1</div>
      <mat-divider></mat-divider>
      <mat-list-option>
        <span class="test-item-content">Item 2</span>
      </mat-list-option>
      <mat-list-option [disabled]="disableThirdItem">Item 3</mat-list-option>
      <div matSubheader>Section 2</div>
      <mat-divider></mat-divider>
    </mat-selection-list>

    <mat-selection-list class="test-empty" disabled></mat-selection-list>
  `,
})
class SelectionListHarnessTest {
  disableThirdItem = false;
}

class TestItemContentHarness extends ComponentHarness {
  static hostSelector = '.test-item-content';
}
