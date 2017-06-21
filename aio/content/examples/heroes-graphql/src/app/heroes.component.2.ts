// #docregion
import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';

// #docregion import-apollo
import { Apollo } from 'apollo-angular';
// #enddocregion import-apollo
// #docregion import-graphql-tag
import gql from 'graphql-tag';
// #enddocregion import-graphql-tag
import { ApolloQueryResult } from 'apollo-client';
import { Hero }              from './hero';

@Component({
  selector: 'my-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: [ './heroes.component.css' ]
})
export class HeroesComponent implements OnInit {
  // #docregion this-heroes
  heroes: Hero[];
  selectedHero: Hero;
  // #enddocregion this-heroes

// #docregion inject-apollo
  constructor(
    private apollo: Apollo,
    private router: Router) { }
  // #enddocregion inject-apollo

  // #docregion query-heroes
  getHeroes(): void {
    this.apollo.watchQuery({
      query: gql`
        query allHeroes {
          heroes {
            id
            name
          }
        }
      `
    }).subscribe((queryResult: ApolloQueryResult<{ heroes: Hero[] }>) => {
      this.heroes = queryResult.data.heroes;
    });
    // #enddocregion query-heroes
  }

  // #docregion add
  add(name: string): void {
    name = name.trim();
    if (!name) { return; }

    // #docregion add-mutation
    this.apollo.mutate({
      mutation: gql`
        mutation addHero($heroName: String!) {
          addHero(heroName: $heroName) {
            id
            name
          }
        }
      `,
      variables: {
        heroName: name
      }
    }).subscribe((mutationResult: ApolloQueryResult<{ addHero: Hero }>) => {
      this.heroes.push({
        // #docregion access-mutation-result
        id: mutationResult.data.addHero.id,
        name: mutationResult.data.addHero.name
        // #enddocregion access-mutation-result
      });
    });
    // #enddocregion add-mutation
  }
  // #enddocregion add

  // #docregion delete
  delete(hero: Hero): void {

    this.apollo.mutate({
      mutation: gql`
        mutation deleteHero($id: Int!) {
          deleteHero(id: $id) {
            id
            name
          }
        }
      `,
      variables: {
        id: hero.id
      }
    }).subscribe((mutationResult: ApolloQueryResult<{ deleteHero: Hero }>) => {
      this.heroes = this.heroes.filter(h => h !== hero);
      if (this.selectedHero === hero) { this.selectedHero = null; }
    });
  }
  // #enddocregion delete

  ngOnInit(): void {
    this.getHeroes();
  }

  onSelect(hero: Hero): void {
    this.selectedHero = hero;
  }

  gotoDetail(): void {
    this.router.navigate(['/detail', this.selectedHero.id]);
  }
}
