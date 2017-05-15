import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { ApiListComponent } from './api-list.component';
import { ApiItem, ApiSection, ApiService } from './api.service';
import { LocationService } from 'app/shared/location.service';

describe('ApiListComponent', () => {
  let component: ApiListComponent;
  let fixture: ComponentFixture<ApiListComponent>;
  let sections: ApiSection[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ ApiListComponent ],
      providers: [
        { provide: ApiService, useClass: TestApiService },
        { provide: LocationService, useClass: TestLocationService }
      ]
    });

    fixture = TestBed.createComponent(ApiListComponent);
    component = fixture.componentInstance;
    sections = getApiSections();
  });

  it('should be creatable', () => {
    expect(component).toBeDefined();
  });

  /**
   * Expectation Utility: Assert that filteredSections has the expected result for this test
   * @param itemTest - return true if the item passes the match test
   *
   * Subscibes to `filteredSections` and performs expectation within subscription callback.
   */
  function expectFilteredResult(label: string, itemTest: (item: ApiItem) => boolean) {
    component.filteredSections.subscribe(filtered => {
      let badItem: ApiItem;
      expect(filtered.length).toBeGreaterThan(0, 'expected something');
      expect(filtered.every(section => section.items.every(
        item => {
          const ok = item.show === itemTest(item);
          if (!ok) { badItem = item; }
          return ok;
        }
      ))).toBe(true, `${label} fail: ${JSON.stringify(badItem, null, 2)}`);
    });
  }

  describe('#filteredSections', () => {

    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should return all complete sections when no criteria', () => {
      let filtered: ApiSection[];
      component.filteredSections.subscribe(f => filtered = f);
      expect(filtered).toEqual(sections);
    });

    it('item.show should be true for all queried items', () => {
      component.setQuery('class');
      expectFilteredResult('query: class', item => /class/.test(item.name));
    });

    it('item.show should be true for every item in section when query matches section name', () => {
      component.setQuery('core');
      component.filteredSections.subscribe(filtered => {
        expect(filtered.length).toBe(1, 'only one section');
        expect(filtered[0].name).toBe('core');
        expect(filtered[0].items.every(item => item.show)).toBe(true, 'all core items shown');
      });
    });

    it('item.show should be true for items with selected status', () => {
      component.setStatus({name: 'stable', title: 'Stable'});
      expectFilteredResult('status: stable', item => item.stability === 'stable');
    });

    it('item.show should be true for items with "security-risk" status when selected', () => {
      component.setStatus({name: 'security-risk', title: 'Security Risk'});
      expectFilteredResult('status: security-risk', item => item.securityRisk);
    });

    it('item.show should be true for items of selected type', () => {
      component.setType({name: 'class', title: 'Class'});
      expectFilteredResult('type: class', item => item.docType === 'class');
    });

    it('should have no sections and no items when no match', () => {
      component.setQuery('fizbuzz');
      component.filteredSections.subscribe(filtered => {
        expect(filtered.length).toBe(0, 'expected no sections');
      });
    });
  });

  describe('initial critera from location', () => {
    let locationService: TestLocationService;

    beforeEach(() => {
      locationService = <any> fixture.componentRef.injector.get(LocationService);
    });

    function expectOneItem(name: string, section: string, type: string, stability: string) {
      fixture.detectChanges();

      component.filteredSections.subscribe(filtered => {
        expect(filtered.length).toBe(1, 'sections');
        expect(filtered[0].name).toBe(section, 'section name');
        const items = filtered[0].items.filter(item => item.show);
        expect(items.length).toBe(1, 'items');

        const item = items[0];
        const badItem = 'Wrong item: ' + JSON.stringify(item, null, 2);

        expect(item.docType).toBe(type, badItem);
        expect(item.stability).toBe(stability, badItem);
        expect(item.name).toBe(name, badItem);
      });
    }

    it('should filter as expected for ?query', () => {
      locationService.query = {query: '_3'};
      expectOneItem('class_3', 'core', 'class', 'experimental');
    });

    it('should filter as expected for ?status', () => {
      locationService.query = {status: 'deprecated'};
      expectOneItem('function_1', 'core', 'function', 'deprecated');
    });

    it('should filter as expected when status is security-risk', () => {
      locationService.query = {status: 'security-risk'};
      fixture.detectChanges();
      expectFilteredResult('security-risk', item => item.securityRisk);
    });

    it('should filter as expected for ?type', () => {
      locationService.query = {type: 'pipe'};
      expectOneItem('pipe_1', 'common', 'pipe', 'stable');
    });

    it('should filter as expected for ?query&status&type', () => {
      locationService.query = {
        query: 's_1',
        status: 'experimental',
        type: 'class'
      };
      fixture.detectChanges();
      expectOneItem('class_1', 'common', 'class', 'experimental');
    });

    it('should ignore case for ?query&status&type', () => {
      locationService.query = {
        query: 'S_1',
        status: 'ExperiMental',
        type: 'CLASS'
      };
      fixture.detectChanges();
      expectOneItem('class_1', 'common', 'class', 'experimental');
    });
  });

  describe('location path after criteria change', () => {
    let locationService: TestLocationService;

    beforeEach(() => {
      locationService = <any> fixture.componentRef.injector.get(LocationService);
    });

    it('should have query', () => {
      component.setQuery('foo');

      // `setSearch` 2nd param is a query/search params object
      const search = locationService.setSearch.calls.mostRecent().args[1];
      expect(search.query).toBe('foo');
    });

    it('should keep last of multiple query settings (in lowercase)', () => {
      component.setQuery('foo');
      component.setQuery('fooBar');

      const search = locationService.setSearch.calls.mostRecent().args[1];
      expect(search.query).toBe('foobar');
    });

    it('should have query, status, and type', () => {
      component.setQuery('foo');
      component.setStatus({name: 'stable', title: 'Stable'});
      component.setType({name: 'class', title: 'Class'});

      const search = locationService.setSearch.calls.mostRecent().args[1];
      expect(search.query).toBe('foo');
      expect(search.status).toBe('stable');
      expect(search.type).toBe('class');
    });
  });
});

////// Helpers ////////

class TestLocationService {
  query: {[index: string]: string } = {};
  setSearch = jasmine.createSpy('setSearch');
  search() { return this.query; }
}

class TestApiService {
  sectionsSubject = new BehaviorSubject(getApiSections());
  sections = this.sectionsSubject.asObservable();
}

// tslint:disable:quotemark
const apiSections: ApiSection[] = [
  {
    "name": "common",
    "title": "common",
    "items": [
      {
        "name": "class_1",
        "title": "Class 1",
        "path": "api/common/class_1",
        "docType": "class",
        "stability": "experimental",
        "securityRisk": false
      },
      {
        "name": "class_2",
        "title": "Class 2",
        "path": "api/common/class_2",
        "docType": "class",
        "stability": "stable",
        "securityRisk": false
      },
      {
        "name": "directive_1",
        "title": "Directive 1",
        "path": "api/common/directive_1",
        "docType": "directive",
        "stability": "stable",
        "securityRisk": true
      },
      {
        "name": "pipe_1",
        "title": "Pipe 1",
        "path": "api/common/pipe_1",
        "docType": "pipe",
        "stability": "stable",
        "securityRisk": true
      },
    ]
  },
  {
    "name": "core",
    "title": "core",
    "items": [
      {
        "name": "class_3",
        "title": "Class 3",
        "path": "api/core/class_3",
        "docType": "class",
        "stability": "experimental",
        "securityRisk": false
      },
      {
        "name": "function_1",
        "title": "Function 1",
        "path": "api/core/function 1",
        "docType": "function",
        "stability": "deprecated",
        "securityRisk": true
      },
      {
        "name": "const_1",
        "title": "Const 1",
        "path": "api/core/const_1",
        "docType": "const",
        "stability": "stable",
        "securityRisk": false
      }
    ]
  }
];

function getApiSections() { return apiSections; }
