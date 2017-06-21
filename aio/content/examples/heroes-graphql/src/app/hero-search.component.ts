// #docplaster
// #docregion
import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';

// #docregion rxjs-imports
import { Subject }           from 'rxjs/Subject';

// Observable class extensions
import 'rxjs/add/observable/of';

// Observable operators
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
// #enddocregion rxjs-imports

import { Hero } from './hero';

import { Apollo, ApolloQueryObservable } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'hero-search',
  templateUrl: './hero-search.component.html',
  styleUrls: [ './hero-search.component.css' ]
})
export class HeroSearchComponent implements OnInit {
  // #docregion search
  heroes: ApolloQueryObservable<any>;
  // #enddocregion search
  // #docregion searchTerms
  private searchTerms = new Subject<string>();
  // #enddocregion searchTerms

  constructor(
    private apollo: Apollo,
    private router: Router) {}
  // #docregion searchTerms

  // Push a search term into the observable stream.
  search(term: string): void {
    this.searchTerms.next(term);
  }
  // #enddocregion searchTerms
  // #docregion search

  ngOnInit(): void {

    this.heroes = this.apollo.watchQuery({
      query: gql`
        query searchHeroes ($search: String) {
          heroes (search: $search) {
            id
            name
          }
        }`,
      variables: {
        search: this.searchTerms
          .debounceTime(300)        // wait 300ms after each keystroke before considering the term
          .distinctUntilChanged()   // ignore if next search term is same as previous
      }
    });
  }
  // #enddocregion search

  gotoDetail(hero: Hero): void {
    let link = ['/detail', hero.id];
    this.router.navigate(link);
  }
}
