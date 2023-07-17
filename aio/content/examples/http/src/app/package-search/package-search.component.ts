import { Component, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { NpmPackageInfo, PackageSearchService } from './package-search.service';

@Component({
  selector: 'app-package-search',
  templateUrl: './package-search.component.html',
  styles: ['input { margin-bottom: .5rem; }'],
  providers: [ PackageSearchService ]
})
export class PackageSearchComponent implements OnInit {
  // #docregion debounce
  withRefresh = false;
  packages$!: Observable<NpmPackageInfo[]>;
  private searchText$ = new Subject<string>();

  search(packageName: string) {
    this.searchText$.next(packageName);
  }

  ngOnInit() {
    this.packages$ = this.searchText$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(packageName =>
        this.searchService.search(packageName, this.withRefresh))
    );
  }

  constructor(private searchService: PackageSearchService) { }

  // #enddocregion debounce

  toggleRefresh() { this.withRefresh = ! this.withRefresh; }

  // #docregion getValue
  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
  // #enddocregion getValue
}
