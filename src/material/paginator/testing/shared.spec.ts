import {HarnessLoader} from '@angular/cdk/testing';
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {Component} from '@angular/core';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {MatPaginatorHarness} from './paginator-harness';

/** Shared tests to run on both the original and MDC-based paginator. */
export function runHarnessTests(
  paginatorModule: typeof MatPaginatorModule,
  paginatorHarness: typeof MatPaginatorHarness,
) {
  let fixture: ComponentFixture<PaginatorHarnessTest>;
  let loader: HarnessLoader;
  let instance: PaginatorHarnessTest;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [paginatorModule, NoopAnimationsModule],
      declarations: [PaginatorHarnessTest],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginatorHarnessTest);
    fixture.detectChanges();
    loader = TestbedHarnessEnvironment.loader(fixture);
    instance = fixture.componentInstance;
  });

  it('should load all paginator harnesses', async () => {
    const paginators = await loader.getAllHarnesses(paginatorHarness);
    expect(paginators.length).toBe(1);
  });

  it('should be able to go to the next page', async () => {
    const paginator = await loader.getHarness(paginatorHarness);

    expect(instance.pageIndex).toBe(0);
    await paginator.goToNextPage();
    expect(instance.pageIndex).toBe(1);
  });

  it('should be able to go to the previous page', async () => {
    const paginator = await loader.getHarness(paginatorHarness);

    instance.pageIndex = 5;
    fixture.detectChanges();

    await paginator.goToPreviousPage();
    expect(instance.pageIndex).toBe(4);
  });

  it('should be able to go to the first page', async () => {
    const paginator = await loader.getHarness(paginatorHarness);

    instance.pageIndex = 5;
    fixture.detectChanges();

    await paginator.goToFirstPage();
    expect(instance.pageIndex).toBe(0);
  });

  it('should be able to go to the last page', async () => {
    const paginator = await loader.getHarness(paginatorHarness);

    expect(instance.pageIndex).toBe(0);
    await paginator.goToLastPage();
    expect(instance.pageIndex).toBe(49);
  });

  it('should be able to set the page size', async () => {
    const paginator = await loader.getHarness(paginatorHarness);

    expect(instance.pageSize).toBe(10);
    await paginator.setPageSize(25);
    expect(instance.pageSize).toBe(25);
  });

  it('should be able to get the page size', async () => {
    const paginator = await loader.getHarness(paginatorHarness);
    expect(await paginator.getPageSize()).toBe(10);
  });

  it('should be able to get the range label', async () => {
    const paginator = await loader.getHarness(paginatorHarness);
    expect(await paginator.getRangeLabel()).toBe('1 – 10 of 500');
  });

  it('should throw an error if the first page button is not available', async () => {
    const paginator = await loader.getHarness(paginatorHarness);

    instance.showFirstLastButtons = false;
    fixture.detectChanges();

    await expectAsync(paginator.goToFirstPage()).toBeRejectedWithError(
      /Could not find first page button inside paginator/,
    );
  });

  it('should throw an error if the last page button is not available', async () => {
    const paginator = await loader.getHarness(paginatorHarness);

    instance.showFirstLastButtons = false;
    fixture.detectChanges();

    await expectAsync(paginator.goToLastPage()).toBeRejectedWithError(
      /Could not find last page button inside paginator/,
    );
  });

  it('should throw an error if the page size selector is not available', async () => {
    const paginator = await loader.getHarness(paginatorHarness);

    instance.pageSizeOptions = [];
    fixture.detectChanges();

    await expectAsync(paginator.setPageSize(10)).toBeRejectedWithError(
      /Cannot find page size selector in paginator/,
    );
  });
}

@Component({
  template: `
    <mat-paginator
      (page)="handlePageEvent($event)"
      [length]="length"
      [pageSize]="pageSize"
      [showFirstLastButtons]="showFirstLastButtons"
      [pageSizeOptions]="pageSizeOptions"
      [pageIndex]="pageIndex">
    </mat-paginator>
  `,
})
class PaginatorHarnessTest {
  length = 500;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25];
  showFirstLastButtons = true;

  handlePageEvent(event: PageEvent) {
    this.length = event.length;
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }
}
