import { Injector } from '@angular/core';

import { of } from 'rxjs';

import { ResourceListComponent } from './resource-list.component';
import { ResourceService } from './resource.service';
import { LocationService } from 'app/shared/location.service';
import { Category } from './resource.model';

// Testing the component class behaviors, independent of its template
// Let e2e tests verify how it displays.
describe('ResourceListComponent', () => {

  let component: ResourceListComponent;
  let injector: Injector;
  let resourceService: TestResourceService;
  let locationService: TestLocationService;
  let categories: Category[];

  beforeEach(() => {
    injector = Injector.create({
      providers: [
        {provide: ResourceListComponent, deps: [ResourceService, LocationService] },
        {provide: ResourceService, useClass: TestResourceService, deps: [] },
        {provide: LocationService, useClass: TestLocationService, deps: [] }
      ]
    });

    locationService = injector.get(LocationService) as unknown as TestLocationService;
    resourceService = injector.get(ResourceService) as unknown as TestResourceService;
    categories = resourceService.testCategories;
  });

  it('should select the first category when no query string', () => {
    component = getComponent();
    expect(component.selectedCategory).toBe(categories[0]);
  });

  it('should select the first category when query string w/o "category" property', () => {
    locationService.searchResult = { foo: 'development' };
    component = getComponent();
    expect(component.selectedCategory).toBe(categories[0]);
  });

  it('should select the first category when query category not found', () => {
    locationService.searchResult = { category: 'foo' };
    component = getComponent();
    expect(component.selectedCategory).toBe(categories[0]);
  });

  it('should select the education category when query category is "education"', () => {
    locationService.searchResult = { category: 'education' };
    component = getComponent();
    expect(component.selectedCategory).toBe(categories[1]);
  });

  it('should select the education category when query category is "EDUCATION" (case insensitive)', () => {
    locationService.searchResult = { category: 'EDUCATION' };
    component = getComponent();
    expect(component.selectedCategory).toBe(categories[1]);
  });

  it('should set the query to the "education" category when user selects "education"', () => {
    component = getComponent();
    component.selectCategory('education');
    expect(locationService.searchResult.category).toBe('education');
  });

  it('should set the query to the first category when user selects unknown name', () => {
    component = getComponent();
    component.selectCategory('education'); // a legit group that isn't the first

    component.selectCategory('foo'); // not a legit group name
    expect(locationService.searchResult.category).toBe('development');
  });

  //// Test Helpers ////
  function  getComponent(): ResourceListComponent {
    const comp = injector.get(ResourceListComponent);
    comp.ngOnInit();
    return comp;
  }

  class TestResourceService {
    testCategories = getTestData();
    categories = of(this.testCategories);
  }

  interface SearchResult { [index: string]: string; }

  class TestLocationService {
    searchResult: SearchResult = {};
    search = jasmine.createSpy('search').and.callFake(() => this.searchResult);
    setSearch = jasmine.createSpy('setSearch')
      .and.callFake((_label: string, result: SearchResult) => {
        this.searchResult = result;
      });
  }

  function getTestData(): Category[] {
    return [
      // Not interested in the sub-categories data in these tests
      {
        id: 'development',
        title: 'Development',
        order: 0,
        subCategories: []
      },
      {
        id: 'education',
        title: 'Education',
        order: 1,
        subCategories: []
      },
    ];
  }
});
