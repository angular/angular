/*
* API List & Filter Component
*
* A page that displays a formatted list of the public Angular API entities.
* Clicking on a list item triggers navigation to the corresponding API entity document.
* Can add/remove API entity links based on filter settings.
*/

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { combineLatest } from 'rxjs/observable/combineLatest';

import { LocationService } from 'app/shared/location.service';
import { ApiItem, ApiSection, ApiService } from './api.service';

interface MenuItem {
  name: string;
  title: string;
}

class SearchCriteria {
  query? = '';
  status? = 'all';
  type? = 'all';
}

@Component({
  selector: 'aio-api-list',
  templateUrl: './api-list.component.html'
})
export class ApiListComponent implements OnInit {

  filteredSections: Observable<ApiSection[]>;

  showStatusMenu = false;
  showTypeMenu = false;

  private criteriaSubject = new ReplaySubject<SearchCriteria>(1);
  private searchCriteria = new SearchCriteria();

  status: MenuItem;
  type: MenuItem;

  // API types
  types: MenuItem[] = [
    { name: 'all', title: 'All' },
    { name: 'directive', title: 'Directive' },
    { name: 'pipe', title: 'Pipe'},
    { name: 'decorator', title: 'Decorator' },
    { name: 'class', title: 'Class' },
    { name: 'interface', title: 'Interface' },
    { name: 'function', title: 'Function' },
    { name: 'enum', title: 'Enum' },
    { name: 'type-alias', title: 'Type Alias' },
    { name: 'const', title: 'Const'}
  ];

  statuses: MenuItem[] = [
    { name: 'all', title: 'All' },
    { name: 'stable', title: 'Stable' },
    { name: 'deprecated', title: 'Deprecated' },
    { name: 'experimental', title: 'Experimental' },
    { name: 'security-risk', title: 'Security Risk' }
  ];

  @ViewChild('filter') queryEl: ElementRef;

  constructor(
    private apiService: ApiService,
    private locationService: LocationService) { }

  ngOnInit() {

    this.filteredSections = combineLatest(
      this.apiService.sections,
      this.criteriaSubject,
      (sections, criteria) => {
        return sections.filter(section => this.filterSection(section, criteria));
      }
    );

    this.initializeSearchCriteria();
  }

  // Todo: may need to debounce as the original did
  // although there shouldn't be any perf consequences if we don't
  setQuery(query: string) {
    this.setSearchCriteria({query: (query || '').toLowerCase().trim() });
  }

  setStatus(status: MenuItem) {
    this.toggleStatusMenu();
    this.status = status;
    this.setSearchCriteria({status: status.name});
  }

  setType(type: MenuItem) {
    this.toggleTypeMenu();
    this.type = type;
    this.setSearchCriteria({type: type.name});
  }

  toggleStatusMenu() {
    this.showStatusMenu = !this.showStatusMenu;
  }

  toggleTypeMenu() {
    this.showTypeMenu = !this.showTypeMenu;
  }

  //////// Private //////////

  private filterSection(section: ApiSection, { query, status, type }: SearchCriteria) {
    let showSection = false;

    section.items.forEach(item => {
      item.show =  matchesType() && matchesStatus() && matchesQuery();

      // show section if any of its items will be shown
      showSection = showSection || item.show;

      function matchesQuery() {
        return !query ||
          section.name.indexOf(query) !== -1 ||
          item.name.indexOf(query) !== -1;
      }

      function matchesStatus() {
        return status === 'all' ||
          status === item.stability ||
          (status === 'security-risk' && item.securityRisk);
      };

      function matchesType() {
        return type === 'all' || type === item.docType;
      }
    });

    return showSection;

  }

  // Get initial search criteria from URL search params
  private initializeSearchCriteria() {
    const {query, status, type} = this.locationService.search();

    const q = (query || '').toLowerCase();
    // Hack: can't bind to query because input cursor always forced to end-of-line.
    this.queryEl.nativeElement.value = q;

    this.status = this.statuses.find(x => x.name === status) || this.statuses[0];
    this.type = this.types.find(x => x.name === type) || this.types[0];

    this.searchCriteria = {
      query: q,
      status: this.status.name,
      type: this.type.name
    };

    this.criteriaSubject.next(this.searchCriteria);
  }

  private setLocationSearch() {
    const {query, status, type} = this.searchCriteria;
    const params = {
      query:  query ? query : undefined,
      status: status !== 'all' ? status : undefined,
      type:   type   !== 'all' ? type   : undefined
    };

    this.locationService.setSearch('API Search', params);
  }

  private setSearchCriteria(criteria: SearchCriteria) {
    this.criteriaSubject.next(Object.assign(this.searchCriteria, criteria));
    this.setLocationSearch();
  }
}
