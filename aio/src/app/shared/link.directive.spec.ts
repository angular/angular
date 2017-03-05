import { async, inject, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { LocationService } from 'app/shared/location.service';
import { MockLocationService } from 'testing/location.service';
import { LinkDirective } from './link.directive';

describe('LinkDirective', () => {

  @Component({
    template: '<a href="{{ url }}">Test Link</a>'
  })
  class TestComponent {
    url: string;
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        LinkDirective,
        TestComponent
      ],
      providers: [
        { provide: LocationService, useFactory: () => new MockLocationService('initial/url') }
      ]
    })
    .compileComponents();
  }));

  it('should attach to all anchor elements', () => {
    const fixture = TestBed.createComponent(TestComponent);
    const directiveElement = fixture.debugElement.query(By.directive(LinkDirective));
    expect(directiveElement.name).toEqual('a');
  });

  it('should bind a property to the "href" attribute', () => {
    const fixture = TestBed.createComponent(TestComponent);
    const directiveElement = fixture.debugElement.query(By.directive(LinkDirective));

    fixture.componentInstance.url = 'test/url';
    fixture.detectChanges();
    expect(directiveElement.properties['href']).toEqual('test/url');
  });

  it('should set the "target" attribute to "_blank" if the href is absolute, otherwise "_self"', () => {
    const fixture = TestBed.createComponent(TestComponent);
    const directiveElement = fixture.debugElement.query(By.directive(LinkDirective));

    fixture.componentInstance.url = 'http://test/url';
    fixture.detectChanges();
    expect(directiveElement.properties['target']).toEqual('_blank');

    fixture.componentInstance.url = 'https://test/url';
    fixture.detectChanges();
    expect(directiveElement.properties['target']).toEqual('_blank');

    fixture.componentInstance.url = 'ftp://test/url';
    fixture.detectChanges();
    expect(directiveElement.properties['target']).toEqual('_blank');

    fixture.componentInstance.url = '//test/url';
    fixture.detectChanges();
    expect(directiveElement.properties['target']).toEqual('_blank');

    fixture.componentInstance.url = 'test/url';
    fixture.detectChanges();
    expect(directiveElement.properties['target']).toEqual('_self');

    fixture.componentInstance.url = '/test/url';
    fixture.detectChanges();
    expect(directiveElement.properties['target']).toEqual('_self');
  });

  it('should intercept clicks for local urls and call `location.go()`', inject([LocationService], (location: LocationService) => {
    const fixture = TestBed.createComponent(TestComponent);
    const directiveElement = fixture.debugElement.query(By.directive(LinkDirective));
    fixture.componentInstance.url = 'some/local/url';
    fixture.detectChanges();
    location.go = jasmine.createSpy('Location.go');
    directiveElement.triggerEventHandler('click', null);
    expect(location.go).toHaveBeenCalledWith('some/local/url');
  }));

  it('should not intercept clicks for absolute urls', inject([LocationService], (location: LocationService) => {
    const fixture = TestBed.createComponent(TestComponent);
    const directiveElement = fixture.debugElement.query(By.directive(LinkDirective));
    fixture.componentInstance.url = 'https://some/absolute/url';
    fixture.detectChanges();
    location.go = jasmine.createSpy('Location.go');
    directiveElement.triggerEventHandler('click', null);
    expect(location.go).not.toHaveBeenCalled();
  }));
});
