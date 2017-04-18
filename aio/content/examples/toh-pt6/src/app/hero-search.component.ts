// #docplaster
// #docregion
import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';

// #docregion rxjs-imports
import { Observable }        from 'rxjs/Observable';
import { Subject }           from 'rxjs/Subject';

// Observable class extensions
import 'rxjs/add/observable/of';

// Observable operators
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
// #enddocregion rxjs-imports

import { HeroSearchService } from './hero-search.service';
import { Hero } from './hero';

@Component({
  selector: 'hero-search',
  templateUrl: './hero-search.component.html',
  styleUrls: [ './hero-search.component.css' ],
  providers: [HeroSearchService]
})
export class HeroSearchComponent implements OnInit {
  // #docregion search
  heroes: Observable<Hero[]>;
  // #enddocregion search
  // #docregion searchTerms
  private searchTerms = new Subject<string>();
  // #enddocregion searchTerms

  constructor(
    private heroSearchService: HeroSearchService,
    private router: Router) {}
  // #docregion searchTerms

  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }
  // #enddocregion searchTerms
  // #docregion search

  ngOnInit(): void {
    this.heroes = this.searchTerms
      .debounceTime(300)        // wait 300ms after each keystroke before considering the term
      .distinctUntilChanged()   // ignore if next search term is same as previous
      .switchMap(term => term   // switch to new observable each time the term changes
        // return the http search observable
        ? this.heroSearchService.search(term)
        // or the observable of empty heroes if there was no search term
        : Observable.of<Hero[]>([]))
      .catch(error => {
        // TODO: add real error handling
        console.log(error);
        return Observable.of<Hero[]>([]);
      });
  }
  // #enddocregion search

  gotoDetail(hero: Hero): void {
    let link = ['/detail', hero.id];
    this.router.navigate(link);
  }
}
