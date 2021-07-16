import {TestBed, ComponentFixture} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatSortHarness} from '@angular/material/sort/testing';
import {HarnessLoader, parallel} from '@angular/cdk/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import {MatSortModule} from '@angular/material/sort';
import {SortHarnessExample} from './sort-harness-example';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('SortHarnessExample', () => {
  let fixture: ComponentFixture<SortHarnessExample>;
  let loader: HarnessLoader;

  beforeAll(() => {
    TestBed.initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
      teardown: {destroyAfterEach: true}
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatSortModule, NoopAnimationsModule],
      declarations: [SortHarnessExample]
    }).compileComponents();
    fixture = TestBed.createComponent(SortHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should load harness for mat-sort', async () => {
    const sorts = await loader.getAllHarnesses(MatSortHarness);
    expect(sorts.length).toBe(1);
  });

  it('should be able to filter headers by their sorted state', async () => {
    const sort = await loader.getHarness(MatSortHarness);
    let headers = await sort.getSortHeaders({sortDirection: ''});
    expect(headers.length).toBe(5);

    await headers[0].click();

    headers = await sort.getSortHeaders({sortDirection: 'asc'});

    expect(headers.length).toBe(1);
  });

  it('should be able to get the label of a header', async () => {
    const sort = await loader.getHarness(MatSortHarness);
    const headers = await sort.getSortHeaders();
    const labels = await parallel(() => headers.map(header => header.getLabel()));
    expect(labels).toEqual(['Dessert', 'Calories', 'Fat', 'Carbs', 'Protein']);
  });

  it('should get the disabled state of a header', async () => {
    const sort = await loader.getHarness(MatSortHarness);
    const thirdHeader = (await sort.getSortHeaders())[2];

    expect(await thirdHeader.isDisabled()).toBe(false);

    fixture.componentInstance.disableThirdHeader = true;
    fixture.detectChanges();

    expect(await thirdHeader.isDisabled()).toBe(true);
  });

  it('should get the sorted direction of a header', async () => {
    const sort = await loader.getHarness(MatSortHarness);
    const secondHeader = (await sort.getSortHeaders())[1];

    expect(await secondHeader.getSortDirection()).toBe('');

    await secondHeader.click();
    expect(await secondHeader.getSortDirection()).toBe('asc');

    await secondHeader.click();
    expect(await secondHeader.getSortDirection()).toBe('desc');
  });
});
