import { ReflectiveInjector } from '@angular/core';
import { PlatformLocation } from '@angular/common';

import { of } from 'rxjs';

import { ResourceListComponent } from './resource-list.component';
import { ResourceService } from './resource.service';

import { Category } from './resource.model';

// Testing the component class behaviors, independent of its template
// Let e2e tests verify how it displays.
describe('ResourceListComponent', () => {

  let injector: ReflectiveInjector;
  let location: TestPlatformLocation;

  beforeEach(() => {
    injector = ReflectiveInjector.resolveAndCreate([
      ResourceListComponent,
      {provide: PlatformLocation, useClass: TestPlatformLocation },
      {provide: ResourceService, useClass: TestResourceService }
    ]);

    location = injector.get(PlatformLocation);
  });

  it('should set the location w/o leading slashes', () => {
    location.pathname = '////resources';
    const component = getComponent();
    expect(component.location).toBe('resources');
  });

  it('href(id) should return the expected href', () => {
    location.pathname = '////resources';
    const component = getComponent();
    expect(component.href({id: 'foo'})).toBe('resources#foo');
  });

  it('should set scroll position to zero when no target element', () => {
    const component = getComponent();
    component.onScroll(undefined);
    expect(component.scrollPos).toBe(0);
  });

  it('should set scroll position to element.scrollTop when that is defined', () => {
    const component = getComponent();
    component.onScroll({scrollTop: 42});
    expect(component.scrollPos).toBe(42);
  });

  it('should set scroll position to element.body.scrollTop when that is defined', () => {
    const component = getComponent();
    component.onScroll({body: {scrollTop: 42}});
    expect(component.scrollPos).toBe(42);
  });

  it('should set scroll position to 0 when no target.body.scrollTop defined', () => {
    const component = getComponent();
    component.onScroll({body: {}});
    expect(component.scrollPos).toBe(0);
  });

  //// Test Helpers ////
  function  getComponent(): ResourceListComponent { return injector.get(ResourceListComponent); }

  class TestPlatformLocation {
    pathname = 'resources';
  }

  class TestResourceService {
    categories = of(getTestData);
  }

  function getTestData(): Category[] {
    return []; // Not interested in the data in these tests
  }
});
