// #docregion
import { Component, OnInit }      from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location }               from '@angular/common';

import { Apollo, ApolloQueryObservable } from 'apollo-angular';
import { ISubscription } from 'rxjs/Subscription';
import gql from 'graphql-tag';

import { Hero }        from './hero';
import { ApolloQueryResult } from 'apollo-client';

@Component({
  selector: 'my-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: [ './hero-detail.component.css' ]
})
export class HeroDetailComponent implements OnInit {
  hero: Hero;

  private heroSubscription: ISubscription;
  private heroObservable: ApolloQueryObservable<any>;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private apollo: Apollo
  ) {}

  // #docregion service-fetch-by-id
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const heroId = params['id'];

      // #docregion graphql-query
      this.heroObservable = this.apollo.watchQuery({
        query: gql`
          query Hero($heroId: Int!) {
            hero(heroId: $heroId) {
              id
              name
            }
          }
        `,
        variables: { heroId: heroId }
      });

      this.heroSubscription = this.heroObservable.subscribe(({data}) => {
        this.hero = Object.assign({}, data.hero);
      });
      // #enddocregion graphql-query
    });
  }
  // #enddocregion service-fetch-by-id

  // #docregion save
  save(): void {

    this.apollo.mutate({
      mutation: gql`
        mutation updateHero($id: Int!, $name: String!) {
          updateHero(id: $id, name: $name) {
            id
            name
          }
        }
      `,
      variables: {
        id: this.hero.id,
        name: this.hero.name
      }
    }).subscribe((mutationResult: ApolloQueryResult<{ updateHero: Hero }>) => {
      this.goBack();
    });
  }
  // #enddocregion save

  goBack(): void {
    this.location.back();
  }
}
