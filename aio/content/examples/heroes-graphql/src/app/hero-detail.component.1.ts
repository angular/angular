// #docregion
import { Component, OnInit }      from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location }               from '@angular/common';

import { Apollo, ApolloQueryObservable } from 'apollo-angular';
import { ISubscription } from 'rxjs/Subscription';
import gql from 'graphql-tag';

import { Hero }        from './hero';

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

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const heroId = params['id'];

      // #docregion graphql-query-new-field
      this.heroObservable = this.apollo.watchQuery({
        query: gql`
          query Hero($heroId: Int!) {
            hero(heroId: $heroId) {
              id
              name
              age
            }
          }
        `,
        variables: { heroId: heroId }
      });
      // #enddocregion graphql-query-new-field

      this.heroSubscription = this.heroObservable.subscribe(({data}) => {
        this.hero = Object.assign({}, data.hero);
      });
    });
  }

  // #docregion save
  save(): void {
  }
  // #enddocregion save

  goBack(): void {
    this.location.back();
  }
}
