import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatListHarness} from '@angular/material/list/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {MatListModule} from '@angular/material/list';
import {ListHarnessExample} from './list-harness-example';

describe('ListHarnessExample', () => {
  let fixture: ComponentFixture<ListHarnessExample>;
  let loader: HarnessLoader;

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
      teardown: {destroyAfterEach: true}
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatListModule],
      declarations: [ListHarnessExample]
    }).compileComponents();
    fixture = TestBed.createComponent(ListHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should get all items', async () => {
    const list = await loader.getHarness(MatListHarness);
    const items = await list.getItems();
    expect(await parallel(() => items.map(i => i.getText())))
      .toEqual(['Item 1', 'Item 2', 'Item 3']);
  });

  it('should get all items matching text', async () => {
    const list = await loader.getHarness(MatListHarness);
    const items = await list.getItems({text: /[13]/});
    expect(await parallel(() => items.map(i => i.getText()))).toEqual(['Item 1', 'Item 3']);
  });

  it('should get items by subheader', async () => {
    const list = await loader.getHarness(MatListHarness);
    const sections = await list.getItemsGroupedBySubheader();
    expect(sections.length).toBe(3);
    expect(sections[0].heading).toBeUndefined();
    expect(await parallel(() => sections[0].items.map(i => i.getText()))).toEqual(['Item 1']);
    expect(sections[1].heading).toBe('Section 1');
    expect(await parallel(() => sections[1].items.map(i => i.getText())))
      .toEqual(['Item 2', 'Item 3']);
    expect(sections[2].heading).toBe('Section 2');
    expect(sections[2].items.length).toEqual(0);
  });

  it('should get list item text and lines', async () => {
    const list = await loader.getHarness(MatListHarness);
    const items = await list.getItems();
    expect(items.length).toBe(3);
    expect(await items[0].getText()).toBe('Item 1');
    expect(await items[0].getLinesText()).toEqual(['Item', '1']);
    expect(await items[1].getText()).toBe('Item 2');
    expect(await items[1].getLinesText()).toEqual([]);
    expect(await items[2].getText()).toBe('Item 3');
    expect(await items[2].getLinesText()).toEqual([]);
  });
});
