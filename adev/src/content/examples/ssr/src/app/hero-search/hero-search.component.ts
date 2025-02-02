import {Component, inject, OnInit} from '@angular/core';
import {AsyncPipe, NgFor} from '@angular/common';
import {RouterLink} from '@angular/router';

import {Observable, Subject} from 'rxjs';

import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';

import {Hero} from '../hero';
import {HeroService} from '../hero.service';

@Component({
  selector: 'app-hero-search',
  templateUrl: './hero-search.component.html',
  imports: [AsyncPipe, NgFor, RouterLink],
  styleUrls: ['./hero-search.component.css'],
})
export class HeroSearchComponent {
  private searchTerms = new Subject<string>();

  private heroService = inject(HeroService);

  heroes$: Observable<Hero[]> = this.searchTerms.pipe(
    // wait 300ms after each keystroke before considering the term
    debounceTime(300),

    // ignore new term if same as previous term
    distinctUntilChanged(),

    // switch to new search observable each time the term changes
    switchMap((term: string) => this.heroService.searchHeroes(term)),
  );

  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }
}
