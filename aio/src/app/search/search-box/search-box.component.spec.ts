import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SearchBoxComponent } from './search-box.component';
import { MockSearchService } from 'testing/search.service';
import { LocationService } from 'app/shared/location.service';
import { MockLocationService } from 'testing/location.service';

@Component({
  template: '<aio-search-box (search)="doSearch($event)"></aio-search-box>'
})
class HostComponent {
  doSearch = jasmine.createSpy('doSearch');
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
      expect(host.doSearch).toHaveBeenCalledWith('initial search');
      expect(component.searchBox.nativeElement.value).toEqual('initial search');
    }));
  });

  describe('on keyup', () => {
    it('should trigger the search event', () => {
      const input = fixture.debugElement.query(By.css('input'));
      input.triggerEventHandler('keyup', { target: { value: 'some query' } });
      expect(host.doSearch).toHaveBeenCalledWith('some query');
    });
  });

  describe('on focus', () => {
    it('should trigger the search event', () => {
      const input = fixture.debugElement.query(By.css('input'));
      input.triggerEventHandler('focus', { target: { value: 'some query' } });
      expect(host.doSearch).toHaveBeenCalledWith('some query');
    });
  });

  describe('on click', () => {
    it('should trigger the search event', () => {
      const input = fixture.debugElement.query(By.css('input'));
      input.triggerEventHandler('click', { target: { value: 'some query'}});
      expect(host.doSearch).toHaveBeenCalledWith('some query');
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
