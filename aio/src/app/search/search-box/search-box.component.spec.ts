import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, inject, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SearchBoxComponent } from './search-box.component';
import { LocationService } from 'app/shared/location.service';
import { MockLocationService } from 'testing/location.service';

@Component({
  template: '<aio-search-box (onSearch)="searchHandler($event)" (onFocus)="focusHandler($event)"></aio-search-box>'
})
class HostComponent {
  searchHandler = jasmine.createSpy('searchHandler');
  focusHandler = jasmine.createSpy('focusHandler');
}

describe('SearchBoxComponent', () => {
  let component: SearchBoxComponent;
  let host: HostComponent;
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchBoxComponent, HostComponent ],
      providers: [
        { provide: LocationService, useFactory: () => new MockLocationService('') }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    component = fixture.debugElement.query(By.directive(SearchBoxComponent)).componentInstance;
    fixture.detectChanges();
  });

  describe('initialisation', () => {
    it('should get the current search query from the location service',
          fakeAsync(inject([LocationService], (location: MockLocationService) => {
      location.search.and.returnValue({ search: 'initial search' });
      component.ngOnInit();
      expect(location.search).toHaveBeenCalled();
      tick(300);
      expect(host.searchHandler).toHaveBeenCalledWith('initial search');
      expect(component.searchBox.nativeElement.value).toEqual('initial search');
    })));
  });

  describe('onSearch', () => {
    it('should debounce by 300ms', fakeAsync(() => {
      component.doSearch();
      expect(host.searchHandler).not.toHaveBeenCalled();
      tick(300);
      expect(host.searchHandler).toHaveBeenCalled();
    }));

    it('should pass through the value of the input box', fakeAsync(() => {
      const input = fixture.debugElement.query(By.css('input'));
      input.nativeElement.value = 'some query (input)';
      component.doSearch();
      tick(300);
      expect(host.searchHandler).toHaveBeenCalledWith('some query (input)');
    }));

    it('should only send events if the search value has changed', fakeAsync(() => {
      const input = fixture.debugElement.query(By.css('input'));

      input.nativeElement.value = 'some query';
      component.doSearch();
      tick(300);
      expect(host.searchHandler).toHaveBeenCalledTimes(1);

      component.doSearch();
      tick(300);
      expect(host.searchHandler).toHaveBeenCalledTimes(1);

      input.nativeElement.value = 'some other query';
      component.doSearch();
      tick(300);
      expect(host.searchHandler).toHaveBeenCalledTimes(2);
    }));
  });

  describe('on input', () => {
    it('should trigger a search', () => {
      const input = fixture.debugElement.query(By.css('input'));
      spyOn(component, 'doSearch');
      input.triggerEventHandler('input', { });
      expect(component.doSearch).toHaveBeenCalled();
    });
  });

  describe('on keyup', () => {
    it('should trigger a search', () => {
      const input = fixture.debugElement.query(By.css('input'));
      spyOn(component, 'doSearch');
      input.triggerEventHandler('keyup', { });
      expect(component.doSearch).toHaveBeenCalled();
    });
  });

  describe('on focus', () => {
    it('should trigger the onFocus event', () => {
      const input = fixture.debugElement.query(By.css('input'));
      input.nativeElement.value = 'some query (focus)';
      input.triggerEventHandler('focus', { });
      expect(host.focusHandler).toHaveBeenCalledWith('some query (focus)');
    });
  });

  describe('on click', () => {
    it('should trigger a search', () => {
      const input = fixture.debugElement.query(By.css('input'));
      spyOn(component, 'doSearch');
      input.triggerEventHandler('click', { });
      expect(component.doSearch).toHaveBeenCalled();
    });
  });

  describe('focus', () => {
    it('should set the focus to the input box', () => {
      const input = fixture.debugElement.query(By.css('input'));
      component.focus();
      expect(document.activeElement).toBe(input.nativeElement);
    });
  });
});
