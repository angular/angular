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
import {MatListModule} from '@angular/material/list';
import {MatActionListHarness, MatActionListItemHarness} from './action-list-harness';
import {MatListHarness, MatListItemHarness} from './list-harness';
import {
  MatListItemHarnessBase,
  MatListItemSection,
  MatSubheaderHarness,
} from './list-item-harness-base';
import {MatNavListHarness, MatNavListItemHarness} from './nav-list-harness';
import {MatListOptionHarness, MatSelectionListHarness} from './selection-list-harness';
import {MatListHarnessBase} from './list-harness-base';
import {BaseListItemHarnessFilters} from './list-harness-filters';

/** Tests that apply to all types of the MDC-based mat-list. */
function runBaseListFunctionalityTests<
  L extends MatListHarnessBase<
    ComponentHarnessConstructor<I> & {with: (x?: any) => HarnessPredicate<I>},
    I,
    BaseListItemHarnessFilters
  >,
  I extends MatListItemHarnessBase,
  F extends {disableThirdItem: boolean},
>(
  testComponentFn: () => Type<F>,
  listHarness: ComponentHarnessConstructor<L> & {
    with: (config?: BaseHarnessFilters) => HarnessPredicate<L>;
  },
  listItemHarnessBase: ComponentHarnessConstructor<I>,
) {
  describe('base list functionality', () => {
    let simpleListHarness: L;
    let emptyListHarness: L;
    let fixture: ComponentFixture<F>;

    beforeEach(async () => {
      const testComponent = testComponentFn();
      await TestBed.configureTestingModule({
        imports: [MatListModule],
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
      expect(await parallel(() => items.map(i => i.getFullText()))).toEqual([
        'Item 1',
        'Item 2',
        'Item 3',
        jasmine.stringMatching(/^Title/),
        jasmine.stringMatching(/^Item 5/),
      ]);
    });

    it('should get all items matching full text (deprecated filter)', async () => {
      const items = await simpleListHarness.getItems({text: /[13]/});
      expect(await parallel(() => items.map(i => i.getText()))).toEqual(['Item 1', 'Item 3']);
    });

    it('should get all items matching full text', async () => {
      const items = await simpleListHarness.getItems({fullText: /[13]/});
      expect(await parallel(() => items.map(i => i.getFullText()))).toEqual(['Item 1', 'Item 3']);
    });

    it('should get all items matching title', async () => {
      const items = await simpleListHarness.getItems({title: 'Title'});
      expect(await parallel(() => items.map(i => i.getTitle()))).toEqual(['Title']);
    });

    it('should get all items matching secondary text', async () => {
      const items = await simpleListHarness.getItems({secondaryText: 'Secondary Text'});
      expect(await parallel(() => items.map(i => i.getSecondaryText()))).toEqual([
        'Secondary Text',
      ]);
      const itemsWithoutSecondaryText = await simpleListHarness.getItems({secondaryText: null});
      expect(await parallel(() => itemsWithoutSecondaryText.map(i => i.getFullText()))).toEqual([
        'Item 2',
        'Item 3',
      ]);
    });

    it('should get all items matching tertiary text', async () => {
      const items = await simpleListHarness.getItems({tertiaryText: 'Tertiary Text'});
      expect(await parallel(() => items.map(i => i.getTertiaryText()))).toEqual(['Tertiary Text']);
      const itemsWithoutTertiaryText = await simpleListHarness.getItems({tertiaryText: null});
      expect(await parallel(() => itemsWithoutTertiaryText.map(i => i.getFullText()))).toEqual([
        'Item 1',
        'Item 2',
        'Item 3',
        'TitleText that will wrap into the third line.',
      ]);
    });

    it('should get all items of empty list', async () => {
      expect((await emptyListHarness.getItems()).length).toBe(0);
    });

    it('should get items by subheader', async () => {
      const sections = await simpleListHarness.getItemsGroupedBySubheader();
      expect(sections.length).toBe(4);
      expect(sections[0].heading).toBeUndefined();
      expect(await parallel(() => sections[0].items.map(i => i.getFullText()))).toEqual(['Item 1']);
      expect(sections[1].heading).toBe('Section 1');
      expect(await parallel(() => sections[1].items.map(i => i.getFullText()))).toEqual([
        'Item 2',
        'Item 3',
      ]);
      expect(sections[2].heading).toBe('Section 2');
      expect(await parallel(() => sections[2].items.map(i => i.getFullText()))).toEqual([
        jasmine.stringMatching(/^Title/),
        jasmine.stringMatching(/^Item 5/),
      ]);
      expect(sections[3].heading).toBe('Section 3');
      expect(sections[3].items.length).toBe(0);
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
      expect(await parallel(() => sections[0].map(i => i.getFullText()))).toEqual(['Item 1']);
      expect(await parallel(() => sections[1].map(i => i.getFullText()))).toEqual([
        'Item 2',
        'Item 3',
      ]);
      expect(sections[2].length).toBe(2);
    });

    it('should get items grouped by divider for an empty list', async () => {
      const sections = await emptyListHarness.getItemsGroupedByDividers();
      expect(sections.length).toBe(1);
      expect(sections[0].length).toBe(0);
    });

    it('should get all items, subheaders, and dividers', async () => {
      const itemsSubheadersAndDividers =
        await simpleListHarness.getItemsWithSubheadersAndDividers();
      expect(itemsSubheadersAndDividers.length).toBe(10);
      expect(itemsSubheadersAndDividers[0] instanceof listItemHarnessBase).toBe(true);
      expect(await (itemsSubheadersAndDividers[0] as MatListItemHarnessBase).getFullText()).toBe(
        'Item 1',
      );
      expect(itemsSubheadersAndDividers[1] instanceof MatSubheaderHarness).toBe(true);
      expect(await (itemsSubheadersAndDividers[1] as MatSubheaderHarness).getText()).toBe(
        'Section 1',
      );
      expect(itemsSubheadersAndDividers[2] instanceof MatDividerHarness).toBe(true);
      expect(itemsSubheadersAndDividers[3] instanceof listItemHarnessBase).toBe(true);
      expect(await (itemsSubheadersAndDividers[3] as MatListItemHarnessBase).getFullText()).toBe(
        'Item 2',
      );
      expect(itemsSubheadersAndDividers[4] instanceof listItemHarnessBase).toBe(true);
      expect(await (itemsSubheadersAndDividers[4] as MatListItemHarnessBase).getFullText()).toBe(
        'Item 3',
      );
      expect(itemsSubheadersAndDividers[5] instanceof MatSubheaderHarness).toBe(true);
      expect(await (itemsSubheadersAndDividers[5] as MatSubheaderHarness).getText()).toBe(
        'Section 2',
      );
      expect(itemsSubheadersAndDividers[6] instanceof MatDividerHarness).toBe(true);
      expect(await (itemsSubheadersAndDividers[9] as MatSubheaderHarness).getText()).toBe(
        'Section 3',
      );
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
      expect(await parallel(() => items.map(i => i.getFullText()))).toEqual([
        'Item 1',
        'Item 2',
        'Item 3',
        'TitleText that will wrap into the third line.',
        'Item 5Secondary TextTertiary Text',
      ]);
      expect(await parallel(() => subheaders.map(s => s.getText()))).toEqual([
        'Section 1',
        'Section 2',
        'Section 3',
      ]);
      expect(await parallel(() => dividers.map(d => d.getOrientation()))).toEqual([
        'horizontal',
        'horizontal',
      ]);
    });

    it('should get all items, subheaders, and dividers with filters', async () => {
      const itemsSubheadersAndDividers = await simpleListHarness.getItemsWithSubheadersAndDividers({
        item: {fullText: /1/},
        subheader: {text: /2/},
      });
      expect(itemsSubheadersAndDividers.length).toBe(4);
      expect(itemsSubheadersAndDividers[0] instanceof listItemHarnessBase).toBe(true);
      expect(await (itemsSubheadersAndDividers[0] as MatListItemHarnessBase).getFullText()).toBe(
        'Item 1',
      );
      expect(itemsSubheadersAndDividers[1] instanceof MatDividerHarness).toBe(true);
      expect(itemsSubheadersAndDividers[2] instanceof MatSubheaderHarness).toBe(true);
      expect(await (itemsSubheadersAndDividers[2] as MatSubheaderHarness).getText()).toBe(
        'Section 2',
      );
      expect(itemsSubheadersAndDividers[3] instanceof MatDividerHarness).toBe(true);
    });

    it('should get list item text, title, secondary and tertiary text', async () => {
      const items = await simpleListHarness.getItems();
      expect(items.length).toBe(5);
      expect(await items[0].getFullText()).toBe('Item 1');
      expect(await items[0].getTitle()).toBe('Item');
      expect(await items[0].getSecondaryText()).toBe('1');
      expect(await items[0].getTertiaryText()).toBe(null);

      expect(await items[1].getFullText()).toBe('Item 2');
      expect(await items[1].getTitle()).toBe('Item 2');
      expect(await items[1].getSecondaryText()).toBe(null);
      expect(await items[1].getTertiaryText()).toBe(null);

      expect(await items[2].getFullText()).toBe('Item 3');
      expect(await items[2].getTitle()).toBe('Item 3');
      expect(await items[2].getSecondaryText()).toBe(null);
      expect(await items[2].getTertiaryText()).toBe(null);

      expect(await items[3].getFullText()).toBe('TitleText that will wrap into the third line.');
      expect(await items[3].getTitle()).toBe('Title');
      expect(await items[3].getSecondaryText()).toBe('Text that will wrap into the third line.');
      expect(await items[3].getTertiaryText()).toBe(null);

      expect(await items[4].getFullText()).toBe('Item 5Secondary TextTertiary Text');
      expect(await items[4].getTitle()).toBe('Item 5');
      expect(await items[4].getSecondaryText()).toBe('Secondary Text');
      expect(await items[4].getTertiaryText()).toBe('Tertiary Text');
    });

    it('should check list item icons and avatars', async () => {
      const items = await simpleListHarness.getItems();
      expect(items.length).toBe(5);
      expect(await items[0].hasIcon()).toBe(true);
      expect(await items[0].hasAvatar()).toBe(true);
      expect(await items[1].hasIcon()).toBe(false);
      expect(await items[1].hasAvatar()).toBe(false);
      expect(await items[2].hasIcon()).toBe(false);
      expect(await items[2].hasAvatar()).toBe(false);
      expect(await items[3].hasIcon()).toBe(false);
      expect(await items[3].hasAvatar()).toBe(false);
      expect(await items[4].hasIcon()).toBe(false);
      expect(await items[4].hasAvatar()).toBe(false);
    });

    it('should get harness loader for list item content', async () => {
      const items = await simpleListHarness.getItems();
      expect(items.length).toBe(5);
      const childHarness = await items[1].getHarness(TestItemContentHarness);
      expect(childHarness).not.toBeNull();
    });

    it('should be able to get content harness loader of list item', async () => {
      const items = await simpleListHarness.getItems();
      expect(items.length).toBe(5);
      const loader = await items[1].getChildLoader(MatListItemSection.CONTENT);
      await expectAsync(loader.getHarness(TestItemContentHarness)).toBeResolved();
    });

    it('should check disabled state of items', async () => {
      fixture.componentInstance.disableThirdItem = true;
      const items = await simpleListHarness.getItems();
      expect(items.length).toBe(5);
      expect(await items[0].isDisabled()).toBe(false);
      expect(await items[2].isDisabled()).toBe(true);
    });
  });
}

describe('MatListHarness', () => {
  runBaseListFunctionalityTests(() => ListHarnessTest, MatListHarness, MatListItemHarness);
});

describe('MatActionListHarness', () => {
  runBaseListFunctionalityTests(
    () => ActionListHarnessTest,
    MatActionListHarness,
    MatActionListItemHarness,
  );

  describe('additional functionality', () => {
    let harness: MatActionListHarness;
    let fixture: ComponentFixture<ActionListHarnessTest>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatListModule],
        declarations: [ActionListHarnessTest],
      }).compileComponents();

      fixture = TestBed.createComponent(ActionListHarnessTest);
      fixture.detectChanges();
      const loader = TestbedHarnessEnvironment.loader(fixture);
      harness = await loader.getHarness(
        MatActionListHarness.with({selector: '.test-base-list-functionality'}),
      );
    });

    it('should click items', async () => {
      const items = await harness.getItems();
      expect(items.length).toBe(5);
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
  runBaseListFunctionalityTests(() => NavListHarnessTest, MatNavListHarness, MatNavListItemHarness);

  describe('additional functionality', () => {
    let harness: MatNavListHarness;
    let fixture: ComponentFixture<NavListHarnessTest>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatListModule],
        declarations: [NavListHarnessTest],
      }).compileComponents();

      fixture = TestBed.createComponent(NavListHarnessTest);
      fixture.detectChanges();
      const loader = TestbedHarnessEnvironment.loader(fixture);
      harness = await loader.getHarness(
        MatNavListHarness.with({selector: '.test-base-list-functionality'}),
      );
    });

    it('should click items', async () => {
      const items = await harness.getItems();
      expect(items.length).toBe(5);
      await items[0].click();
      expect(fixture.componentInstance.lastClicked).toBe('Item 1');
      await items[1].click();
      expect(fixture.componentInstance.lastClicked).toBe('Item 2');
      await items[2].click();
      expect(fixture.componentInstance.lastClicked).toBe('Item 3');
    });

    it('should get href', async () => {
      const items = await harness.getItems();
      expect(await parallel(() => items.map(i => i.getHref()))).toEqual([
        null,
        '',
        '/somestuff',
        null,
        null,
      ]);
    });

    it('should get item harness by href', async () => {
      const items = await harness.getItems({href: /stuff/});
      expect(items.length).toBe(1);
      expect(await items[0].getHref()).toBe('/somestuff');
    });

    it('should get activated state', async () => {
      const items = await harness.getItems();
      const activated = await parallel(() => items.map(item => item.isActivated()));
      expect(activated).toEqual([false, true, false, false, false]);
    });

    it('should get item harness by activated state', async () => {
      const activatedItems = await harness.getItems({activated: true});
      const activatedItemsText = await parallel(() =>
        activatedItems.map(item => item.getFullText()),
      );
      expect(activatedItemsText).toEqual(['Item 2']);
    });
  });
});

describe('MatSelectionListHarness', () => {
  runBaseListFunctionalityTests(
    () => SelectionListHarnessTest,
    MatSelectionListHarness,
    MatListOptionHarness,
  );

  describe('additional functionality', () => {
    let harness: MatSelectionListHarness;
    let emptyHarness: MatSelectionListHarness;
    let fixture: ComponentFixture<SelectionListHarnessTest>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [MatListModule],
        declarations: [SelectionListHarnessTest],
      }).compileComponents();

      fixture = TestBed.createComponent(SelectionListHarnessTest);
      fixture.detectChanges();
      const loader = TestbedHarnessEnvironment.loader(fixture);
      harness = await loader.getHarness(
        MatSelectionListHarness.with({selector: '.test-base-list-functionality'}),
      );
      emptyHarness = await loader.getHarness(
        MatSelectionListHarness.with({selector: '.test-empty'}),
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
      expect((await harness.getItems({selected: true})).length).toBe(5);
    });

    it('should check multiple options', async () => {
      expect((await harness.getItems({selected: true})).length).toBe(0);
      await harness.selectItems({fullText: /1/}, {fullText: /3/});
      const selected = await harness.getItems({selected: true});
      expect(await parallel(() => selected.map(item => item.getFullText()))).toEqual([
        'Item 1',
        'Item 3',
      ]);
    });

    it('should uncheck multiple options', async () => {
      await harness.selectItems();
      expect((await harness.getItems({selected: true})).length).toBe(5);
      await harness.deselectItems({fullText: /1/}, {fullText: /3/});
      const selected = await harness.getItems({selected: true});
      expect(await parallel(() => selected.map(item => item.getFullText()))).toEqual([
        'Item 2',
        jasmine.stringMatching(/^Title/),
        jasmine.stringMatching(/^Item 5/),
      ]);
    });

    it('should get option checkbox position', async () => {
      const items = await harness.getItems();
      expect(items.length).toBe(5);
      expect(await items[0].getCheckboxPosition()).toBe('before');
      expect(await items[1].getCheckboxPosition()).toBe('after');
    });

    it('should toggle option selection', async () => {
      const items = await harness.getItems();
      expect(items.length).toBe(5);
      expect(await items[0].isSelected()).toBe(false);
      await items[0].toggle();
      expect(await items[0].isSelected()).toBe(true);
      await items[0].toggle();
      expect(await items[0].isSelected()).toBe(false);
    });

    it('should check single option', async () => {
      const items = await harness.getItems();
      expect(items.length).toBe(5);
      expect(await items[0].isSelected()).toBe(false);
      await items[0].select();
      expect(await items[0].isSelected()).toBe(true);
      await items[0].select();
      expect(await items[0].isSelected()).toBe(true);
    });

    it('should uncheck single option', async () => {
      const items = await harness.getItems();
      expect(items.length).toBe(5);
      await items[0].select();
      expect(await items[0].isSelected()).toBe(true);
      await items[0].deselect();
      expect(await items[0].isSelected()).toBe(false);
      await items[0].deselect();
      expect(await items[0].isSelected()).toBe(false);
    });
  });
});

@Component({
  template: `
      <mat-list class="test-base-list-functionality">
        <mat-list-item>
          <div matListItemTitle>Item </div>
          <div matListItemLine>1</div>
          <div matListItemIcon>icon</div>
          <div matListItemAvatar>Avatar</div>
        </mat-list-item>
        <div matSubheader>Section 1</div>
        <mat-divider></mat-divider>
        <a mat-list-item>
          <span class="test-item-content">Item 2</span>
        </a>
        <button mat-list-item [disabled]="disableThirdItem">Item 3</button>
        <div matSubheader>Section 2</div>
        <mat-divider></mat-divider>
        <mat-list-item lines="3">
          <span matListItemTitle>Title</span>
          <span>Text that will wrap into the third line.</span>
        </mat-list-item>
        <mat-list-item>
          <span matListItemTitle>Item 5</span>
          <span matListItemLine>Secondary Text</span>
          <span matListItemLine>Tertiary Text</span>
        </mat-list-item>
        <div matSubheader>Section 3</div>
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
          <div matListItemTitle>Item </div>
          <div matListItemLine>1</div>
          <div matListItemIcon>icon</div>
          <div matListItemAvatar>Avatar</div>
        </mat-list-item>
        <div matSubheader>Section 1</div>
        <mat-divider></mat-divider>
        <a mat-list-item (click)="lastClicked = 'Item 2'">
          <span class="test-item-content">Item 2</span>
        </a>
        <button
          mat-list-item
          (click)="lastClicked = 'Item 3'"
          [disabled]="disableThirdItem">Item 3</button>
        <div matSubheader>Section 2</div>
        <mat-divider></mat-divider>
        <button mat-list-item lines="3">
          <span matListItemTitle>Title</span>
          <span>Text that will wrap into the third line.</span>
        </button>
        <button mat-list-item>
          <span matListItemTitle>Item 5</span>
          <span matListItemLine>Secondary Text</span>
          <span matListItemLine>Tertiary Text</span>
        </button>
        <div matSubheader>Section 3</div>
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
          <div matListItemTitle>Item </div>
          <div matListItemLine>1</div>
          <div matListItemIcon>icon</div>
          <div matListItemAvatar>Avatar</div>
        </a>
        <div matSubheader>Section 1</div>
        <mat-divider></mat-divider>
        <a mat-list-item activated href (click)="onClick($event, 'Item 2')">
          <span class="test-item-content">Item 2</span>
        </a>
        <a
          mat-list-item
          href="/somestuff"
          (click)="onClick($event, 'Item 3')"
          [disabled]="disableThirdItem">Item 3</a>
        <div matSubheader>Section 2</div>
        <mat-divider></mat-divider>
        <a mat-list-item lines="3">
          <span matListItemTitle>Title</span>
          <span>Text that will wrap into the third line.</span>
        </a>
        <a mat-list-item>
          <span matListItemTitle>Item 5</span>
          <span matListItemLine>Secondary Text</span>
          <span matListItemLine>Tertiary Text</span>
        </a>
        <div matSubheader>Section 3</div>
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
        <div matListItemTitle>Item </div>
        <div matListItemLine>1</div>
        <div matListItemIcon>icon</div>
        <div matListItemAvatar>Avatar</div>
      </mat-list-option>
      <div matSubheader>Section 1</div>
      <mat-divider></mat-divider>
      <mat-list-option>
        <span class="test-item-content">Item 2</span>
      </mat-list-option>
      <mat-list-option [disabled]="disableThirdItem">Item 3</mat-list-option>
      <div matSubheader>Section 2</div>
      <mat-divider></mat-divider>
      <mat-list-option lines="3">
        <span matListItemTitle>Title</span>
        <span>Text that will wrap into the third line.</span>
      </mat-list-option>
      <mat-list-option>
        <span matListItemTitle>Item 5</span>
        <span matListItemLine>Secondary Text</span>
        <span matListItemLine>Tertiary Text</span>
      </mat-list-option>
      <div matSubheader>Section 3</div>
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
