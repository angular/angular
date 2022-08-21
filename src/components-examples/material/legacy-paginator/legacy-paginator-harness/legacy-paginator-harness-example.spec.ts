import {ComponentFixture, TestBed} from '@angular/core/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatLegacyPaginatorHarness} from '@angular/material/legacy-paginator/testing';
import {HarnessLoader} from '@angular/cdk/testing';
import {MatLegacyPaginatorModule} from '@angular/material/legacy-paginator';
import {LegacyPaginatorHarnessExample} from './legacy-paginator-harness-example';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('LegacyPaginatorHarnessExample', () => {
  let fixture: ComponentFixture<LegacyPaginatorHarnessExample>;
  let loader: HarnessLoader;
  let instance: LegacyPaginatorHarnessExample;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatLegacyPaginatorModule, NoopAnimationsModule],
      declarations: [LegacyPaginatorHarnessExample],
    }).compileComponents();
    fixture = TestBed.createComponent(LegacyPaginatorHarnessExample);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    instance = fixture.componentInstance;
  });

  it('should load all paginator harnesses', async () => {
    const paginators = await loader.getAllHarnesses(MatLegacyPaginatorHarness);
    expect(paginators.length).toBe(1);
  });

  it('should be able to navigate between pages', async () => {
    const paginator = await loader.getHarness(MatLegacyPaginatorHarness);

    expect(instance.pageIndex).toBe(0);
    await paginator.goToNextPage();
    expect(instance.pageIndex).toBe(1);
    await paginator.goToPreviousPage();
    expect(instance.pageIndex).toBe(0);
  });

  it('should be able to go to the last page', async () => {
    const paginator = await loader.getHarness(MatLegacyPaginatorHarness);

    expect(instance.pageIndex).toBe(0);
    await paginator.goToLastPage();
    expect(instance.pageIndex).toBe(49);
  });

  it('should be able to set the page size', async () => {
    const paginator = await loader.getHarness(MatLegacyPaginatorHarness);

    expect(instance.pageSize).toBe(10);
    await paginator.setPageSize(25);
    expect(instance.pageSize).toBe(25);
  });
});
