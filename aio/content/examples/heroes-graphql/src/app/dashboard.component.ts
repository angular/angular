// #docregion , search
import { Component, OnInit } from '@angular/core';

// #docregion import-apollo
import { Apollo } from 'apollo-angular';
// #enddocregion import-apollo
// #docregion import-graphql-tag
import gql from 'graphql-tag';
// #enddocregion import-graphql-tag
import { ApolloQueryResult } from 'apollo-client';
import { Hero }              from './hero';

@Component({
  selector: 'my-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.css' ]
})
// #enddocregion search
export class DashboardComponent implements OnInit {
  // #docregion this-heroes
  heroes: Hero[];
  // #enddocregion this-heroes
  // #docregion inject-apollo
  constructor(private apollo: Apollo) { }
  // #enddocregion inject-apollo

  // #docregion query-heroes
  ngOnInit(): void {
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
      this.heroes = queryResult.data.heroes.slice(1, 5);
    });
  }
  // #enddocregion query-heroes
}
// #enddocregion
