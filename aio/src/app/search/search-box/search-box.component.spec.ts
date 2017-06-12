import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SearchBoxComponent } from './search-box.component';
import { MockSearchService } from 'testing/search.service';
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
    it('should get the current search query from the location service', inject([LocationService], (location: MockLocationService) => {
      location.search.and.returnValue({ search: 'initial search' });
      component.ngOnInit();
      expect(location.search).toHaveBeenCalled();
      expect(host.searchHandler).toHaveBeenCalledWith('initial search');
      expect(component.searchBox.nativeElement.value).toEqual('initial search');
    }));
  });

  describe('on input', () => {
    it('should trigger the onSearch event', () => {
      const input = fixture.debugElement.query(By.css('input'));
      input.nativeElement.value = 'some query (input)';
      input.triggerEventHandler('input', { });
      expect(host.searchHandler).toHaveBeenCalledWith('some query (input)');
    });
  });

  describe('on keyup', () => {
    it('should trigger the onSearch event', () => {
      const input = fixture.debugElement.query(By.css('input'));
      input.nativeElement.value = 'some query (keyup)';
      input.triggerEventHandler('keyup', { });
      expect(host.searchHandler).toHaveBeenCalledWith('some query (keyup)');
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
    it('should trigger the search event', () => {
      const input = fixture.debugElement.query(By.css('input'));
      input.nativeElement.value = 'some query (click)';
      input.triggerEventHandler('click', { });
      expect(host.searchHandler).toHaveBeenCalledWith('some query (click)');
    });
  });

  describe('event filtering', () => {
    it('should only send events if the search value has changed', () => {
      const input = fixture.debugElement.query(By.css('input'));

      input.nativeElement.value = 'some query';
      input.triggerEventHandler('input', { });
      expect(host.searchHandler).toHaveBeenCalledTimes(1);

      input.triggerEventHandler('input', { });
      expect(host.searchHandler).toHaveBeenCalledTimes(1);

      input.nativeElement.value = 'some other query';
      input.triggerEventHandler('input', { });
      expect(host.searchHandler).toHaveBeenCalledTimes(2);
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
