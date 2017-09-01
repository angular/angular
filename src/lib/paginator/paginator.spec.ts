import {async, ComponentFixture, TestBed, inject} from '@angular/core/testing';
import {MdPaginatorModule} from './index';
import {MdPaginator, PageEvent} from './paginator';
import {Component, ViewChild} from '@angular/core';
import {MdPaginatorIntl} from './paginator-intl';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {dispatchMouseEvent} from '@angular/cdk/testing';


describe('MdPaginator', () => {
  let fixture: ComponentFixture<MdPaginatorApp>;
  let component: MdPaginatorApp;
  let paginator: MdPaginator;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MdPaginatorModule,
        NoopAnimationsModule,
      ],
      declarations: [
        MdPaginatorApp,
        MdPaginatorWithoutPageSizeApp,
        MdPaginatorWithoutOptionsApp,
        MdPaginatorWithoutInputsApp,
      ],
      providers: [MdPaginatorIntl]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MdPaginatorApp);
    component = fixture.componentInstance;
    paginator = component.mdPaginator;

    fixture.detectChanges();
  });

  describe('with the default internationalization provider', () => {
    it('should show the right range text', () => {
      const rangeElement = fixture.nativeElement.querySelector('.mat-paginator-range-label');

      // View second page of list of 100, each page contains 10 items.
      component.length = 100;
      component.pageSize = 10;
      component.pageIndex = 1;
      fixture.detectChanges();
      expect(rangeElement.innerText).toBe('11 - 20 of 100');

      // View third page of list of 200, each page contains 20 items.
      component.length = 200;
      component.pageSize = 20;
      component.pageIndex = 2;
      fixture.detectChanges();
      expect(rangeElement.innerText).toBe('41 - 60 of 200');

      // View first page of list of 0, each page contains 5 items.
      component.length = 0;
      component.pageSize = 5;
      component.pageIndex = 2;
      fixture.detectChanges();
      expect(rangeElement.innerText).toBe('0 of 0');

      // View third page of list of 12, each page contains 5 items.
      component.length = 12;
      component.pageSize = 5;
      component.pageIndex = 2;
      fixture.detectChanges();
      expect(rangeElement.innerText).toBe('11 - 12 of 12');

      // View third page of list of 10, each page contains 5 items.
      component.length = 10;
      component.pageSize = 5;
      component.pageIndex = 2;
      fixture.detectChanges();
      expect(rangeElement.innerText).toBe('11 - 15 of 10');

      // View third page of list of -5, each page contains 5 items.
      component.length = -5;
      component.pageSize = 5;
      component.pageIndex = 2;
      fixture.detectChanges();
      expect(rangeElement.innerText).toBe('11 - 15 of 0');
    });

    it('should show right aria-labels for select and buttons', () => {
      const select = fixture.nativeElement.querySelector('.mat-select');
      expect(select.getAttribute('aria-label')).toBe('Items per page:');

      expect(getPreviousButton(fixture).getAttribute('aria-label')).toBe('Previous page');
      expect(getNextButton(fixture).getAttribute('aria-label')).toBe('Next page');
    });

    it('should re-render when the i18n labels change',
      inject([MdPaginatorIntl], (intl: MdPaginatorIntl) => {
        const label = fixture.nativeElement.querySelector('.mat-paginator-page-size-label');

        intl.itemsPerPageLabel = '1337 items per page';
        intl.changes.next();
        fixture.detectChanges();

        expect(label.textContent).toBe('1337 items per page');
      }));
  });

  describe('when navigating with the navigation buttons', () => {
    it('should be able to go to the next page', () => {
      expect(paginator.pageIndex).toBe(0);

      dispatchMouseEvent(getNextButton(fixture), 'click');

      expect(paginator.pageIndex).toBe(1);
      expect(component.latestPageEvent ? component.latestPageEvent.pageIndex : null).toBe(1);
    });

    it('should be able to go to the previous page', () => {
      paginator.pageIndex = 1;
      fixture.detectChanges();
      expect(paginator.pageIndex).toBe(1);

      dispatchMouseEvent(getPreviousButton(fixture), 'click');

      expect(paginator.pageIndex).toBe(0);
      expect(component.latestPageEvent ? component.latestPageEvent.pageIndex : null).toBe(0);
    });

    it('should disable navigating to the next page if at first page', () => {
      component.goToLastPage();
      fixture.detectChanges();
      expect(paginator.pageIndex).toBe(10);
      expect(paginator.hasNextPage()).toBe(false);

      component.latestPageEvent = null;
      dispatchMouseEvent(getNextButton(fixture), 'click');

      expect(component.latestPageEvent).toBe(null);
      expect(paginator.pageIndex).toBe(10);
    });

    it('should disable navigating to the previous page if at first page', () => {
      expect(paginator.pageIndex).toBe(0);
      expect(paginator.hasPreviousPage()).toBe(false);

      component.latestPageEvent = null;
      dispatchMouseEvent(getPreviousButton(fixture), 'click');

      expect(component.latestPageEvent).toBe(null);
      expect(paginator.pageIndex).toBe(0);
    });
  });

  it('should mark for check when inputs are changed directly', () => {
    const rangeElement = fixture.nativeElement.querySelector('.mat-paginator-range-label');

    expect(rangeElement.innerText).toBe('1 - 10 of 100');

    paginator.length = 99;
    fixture.detectChanges();
    expect(rangeElement.innerText).toBe('1 - 10 of 99');

    paginator.pageSize = 6;
    fixture.detectChanges();
    expect(rangeElement.innerText).toBe('1 - 6 of 99');

    paginator.pageIndex = 1;
    fixture.detectChanges();
    expect(rangeElement.innerText).toBe('7 - 12 of 99');

    // Having one option and the same page size should remove the select menu
    expect(fixture.nativeElement.querySelector('.mat-select')).not.toBeNull();
    paginator.pageSize = 10;
    paginator.pageSizeOptions = [10];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.mat-select')).toBeNull();
  });

  it('should default the page size options to the page size if no options provided', () => {
    const withoutOptionsAppFixture = TestBed.createComponent(MdPaginatorWithoutOptionsApp);
    withoutOptionsAppFixture.detectChanges();

    expect(withoutOptionsAppFixture.componentInstance.mdPaginator._displayedPageSizeOptions)
        .toEqual([10]);
  });

  it('should default the page size to the first page size option if not provided', () => {
    const withoutPageSizeAppFixture = TestBed.createComponent(MdPaginatorWithoutPageSizeApp);
    withoutPageSizeAppFixture.detectChanges();

    expect(withoutPageSizeAppFixture.componentInstance.mdPaginator.pageSize).toEqual(10);
  });

  it('should show a sorted list of page size options including the current page size', () => {
    expect(paginator._displayedPageSizeOptions).toEqual([5, 10, 25, 100]);

    component.pageSize = 30;
    fixture.detectChanges();
    expect(paginator.pageSizeOptions).toEqual([5, 10, 25, 100]);
    expect(paginator._displayedPageSizeOptions).toEqual([5, 10, 25, 30, 100]);

    component.pageSizeOptions = [100, 25, 10, 5];
    fixture.detectChanges();
    expect(paginator._displayedPageSizeOptions).toEqual([5, 10, 25, 30, 100]);
  });

  it('should be able to change the page size while keeping the first item present', () => {
    // Start on the third page of a list of 100 with a page size of 10.
    component.pageIndex = 4;
    component.pageSize = 10;
    component.length = 100;
    fixture.detectChanges();

    // The first item of the page should be item with index 40
    let firstPageItemIndex: number | null = paginator.pageIndex * paginator.pageSize;
    expect(firstPageItemIndex).toBe(40);

    // The first item on the page is now 25. Change the page size to 25 so that we should now be
    // on the second page where the top item is index 25.
    paginator._changePageSize(25);
    let paginationEvent = component.latestPageEvent;
    firstPageItemIndex = paginationEvent ?
        paginationEvent.pageIndex * paginationEvent.pageSize : null;
    expect(firstPageItemIndex).toBe(25);
    expect(paginationEvent ? paginationEvent.pageIndex : null).toBe(1);

    // The first item on the page is still 25. Change the page size to 8 so that we should now be
    // on the fourth page where the top item is index 24.
    paginator._changePageSize(8);
    paginationEvent = component.latestPageEvent;
    firstPageItemIndex = paginationEvent ?
        paginationEvent.pageIndex * paginationEvent.pageSize : null;
    expect(firstPageItemIndex).toBe(24);
    expect(paginationEvent ? paginationEvent.pageIndex : null).toBe(3);

    // The first item on the page is 24. Change the page size to 16 so that we should now be
    // on the first page where the top item is index 0.
    paginator._changePageSize(25);
    paginationEvent = component.latestPageEvent;
    firstPageItemIndex = paginationEvent ?
        paginationEvent.pageIndex * paginationEvent.pageSize : null;
    expect(firstPageItemIndex).toBe(0);
    expect(paginationEvent ? paginationEvent.pageIndex : null).toBe(0);
  });

  it('should show a select only if there are multiple options', () => {
    expect(paginator._displayedPageSizeOptions).toEqual([5, 10, 25, 100]);
    expect(fixture.nativeElement.querySelector('.mat-select')).not.toBeNull();

    // Remove options so that the paginator only uses the current page size (10) as an option.
    // Should no longer show the select component since there is only one option.
    component.pageSizeOptions = [];
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.mat-select')).toBeNull();
  });
});

function getPreviousButton(fixture: ComponentFixture<any>) {
  return fixture.nativeElement.querySelector('.mat-paginator-navigation-previous');
}

function getNextButton(fixture: ComponentFixture<any>) {
  return fixture.nativeElement.querySelector('.mat-paginator-navigation-next');
}

@Component({
  template: `
    <md-paginator [pageIndex]="pageIndex"
                  [pageSize]="pageSize"
                  [pageSizeOptions]="pageSizeOptions"
                  [length]="length"
                  (page)="latestPageEvent = $event">
    </md-paginator>
  `,
})
class MdPaginatorApp {
  pageIndex = 0;
  pageSize = 10;
  pageSizeOptions = [5, 10, 25, 100];
  length = 100;

  latestPageEvent: PageEvent | null;

  @ViewChild(MdPaginator) mdPaginator: MdPaginator;

  goToLastPage() {
    this.pageIndex = Math.ceil(this.length / this.pageSize);
  }
}

@Component({
  template: `
    <md-paginator></md-paginator>
  `,
})
class MdPaginatorWithoutInputsApp {
  @ViewChild(MdPaginator) mdPaginator: MdPaginator;
}

@Component({
  template: `
    <md-paginator [pageSizeOptions]="[10, 20, 30]"></md-paginator>
  `,
})
class MdPaginatorWithoutPageSizeApp {
  @ViewChild(MdPaginator) mdPaginator: MdPaginator;
}

@Component({
  template: `
    <md-paginator [pageSize]="10"></md-paginator>
  `,
})
class MdPaginatorWithoutOptionsApp {
  @ViewChild(MdPaginator) mdPaginator: MdPaginator;
}
