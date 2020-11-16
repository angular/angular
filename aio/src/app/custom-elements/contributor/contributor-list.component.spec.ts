import { Injector } from '@angular/core';

import { of } from 'rxjs';

import { ContributorGroup } from './contributors.model';
import { ContributorListComponent } from './contributor-list.component';
import { ContributorService } from './contributor.service';
import { LocationService } from 'app/shared/location.service';

// Testing the component class behaviors, independent of its template
// Let e2e tests verify how it displays.
describe('ContributorListComponent', () => {

  let component: ContributorListComponent;
  let injector: Injector;
  let contributorService: TestContributorService;
  let locationService: TestLocationService;
  let contributorGroups: ContributorGroup[];

  beforeEach(() => {
    injector = Injector.create({
      providers: [
        {provide: ContributorListComponent, deps: [ContributorService, LocationService] },
        {provide: ContributorService, useClass: TestContributorService, deps: [] },
        {provide: LocationService, useClass: TestLocationService, deps: [] }
      ]
    });

    locationService = injector.get(LocationService) as unknown as TestLocationService;
    contributorService = injector.get(ContributorService) as unknown as TestContributorService;
    contributorGroups = contributorService.testContributors;
  });

  it('should select the first group when no query string', () => {
    component = getComponent();
    expect(component.selectedGroup).toBe(contributorGroups[0]);
  });

  it('should select the first group when query string w/o "group" property', () => {
    locationService.searchResult = { foo: 'GDE' };
    component = getComponent();
    expect(component.selectedGroup).toBe(contributorGroups[0]);
  });

  it('should select the first group when query group not found', () => {
    locationService.searchResult = { group: 'foo' };
    component = getComponent();
    expect(component.selectedGroup).toBe(contributorGroups[0]);
  });

  it('should select the GDE group when query group is "GDE"', () => {
    locationService.searchResult = { group: 'GDE' };
    component = getComponent();
    expect(component.selectedGroup).toBe(contributorGroups[1]);
  });

  it('should select the GDE group when query group is "gde" (case insensitive)', () => {
    locationService.searchResult = { group: 'gde' };
    component = getComponent();
    expect(component.selectedGroup).toBe(contributorGroups[1]);
  });

  it('should set the query to the "GDE" group when user selects "GDE"', () => {
    component = getComponent();
    component.selectGroup('GDE');
    expect(locationService.searchResult.group).toBe('GDE');
  });

  it('should set the query to the first group when user selects unknown name', () => {
    component = getComponent();
    component.selectGroup('GDE'); // a legit group that isn't the first

    component.selectGroup('foo'); // not a legit group name
    expect(locationService.searchResult.group).toBe('Angular');
  });

  //// Test Helpers ////
  function  getComponent(): ContributorListComponent {
    const comp = injector.get(ContributorListComponent);
    comp.ngOnInit();
    return comp;
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

  class TestContributorService {
    testContributors = getTestData();
    contributors = of(this.testContributors);
  }

  function getTestData(): ContributorGroup[] {
    return [
      // Not interested in the contributors data in these tests
      { name: 'Angular', order: 0, contributors: [] },
      { name: 'GDE', order: 1, contributors: [] },
    ];
  }
});
