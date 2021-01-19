// #docplaster
// #docregion
import { Component, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import {
   debounceTime, distinctUntilChanged, switchMap
 } from 'rxjs/operators';

import { Hero } from '../hero';
import { HeroService } from '../hero.service';

@Component({
  selector: 'app-hero-search',
  templateUrl: './hero-search.component.html',
  styleUrls: [ './hero-search.component.css' ]
})
export class HeroSearchComponent implements OnInit {
  // #docregion heroes-stream
  heroes$: Observable<Hero[]>;
  // #enddocregion heroes-stream
  // #docregion searchTerms
  private searchTerms = new Subject<string>();
  // #enddocregion searchTerms

  constructor(private heroService: HeroService) {}
  // #docregion searchTerms

  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }
  // #enddocregion searchTerms

  ngOnInit(): void {
    // #docregion search
    this.heroes$ = this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      // ignore new term if same as previous term
      distinctUntilChanged(),

      // switch to new search observable each time the term changes
      switchMap((term: string) => this.heroService.searchHeroes(term)),
    );
    // #enddocregion search
  }
}
