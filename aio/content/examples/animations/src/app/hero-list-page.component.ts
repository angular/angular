// tslint:disable: variable-name
// #docplaster
// #docregion
import { Component, HostBinding, OnInit } from '@angular/core';
import { trigger, transition, animate, style, query, stagger } from '@angular/animations';
import { HEROES } from './mock-heroes';

// #docregion filter-animations
@Component({
// #enddocregion filter-animations
  selector: 'app-hero-list-page',
  templateUrl: 'hero-list-page.component.html',
  styleUrls: ['hero-list-page.component.css'],
// #docregion page-animations, filter-animations
  animations: [
// #enddocregion filter-animations
    trigger('pageAnimations', [
      transition(':enter', [
        query('.hero, form', [
          style({opacity: 0, transform: 'translateY(-100px)'}),
          stagger(-30, [
            animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'none' }))
          ])
        ])
      ])
    ]),
// #enddocregion page-animations
// #docregion increment
// #docregion filter-animations
    trigger('filterAnimation', [
      transition(':enter, * => 0, * => -1', []),
      transition(':increment', [
        query(':enter', [
          style({ opacity: 0, width: '0px' }),
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 1, width: '*' })),
          ]),
        ], { optional: true })
      ]),
      transition(':decrement', [
        query(':leave', [
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 0, width: '0px' })),
          ]),
        ])
      ]),
    ]),
 // #enddocregion  increment
// #docregion page-animations
  ]
})
export class HeroListPageComponent implements OnInit {
// #enddocregion filter-animations
  @HostBinding('@pageAnimations')
  public animatePage = true;

// #docregion filter-animations
  heroTotal = -1;
// #enddocregion filter-animations
  get heroes() { return this._heroes; }
  private _heroes = [];

  ngOnInit() {
    this._heroes = HEROES;
  }

  updateCriteria(criteria: string) {
    criteria = criteria ? criteria.trim() : '';

    this._heroes = HEROES.filter(hero => hero.name.toLowerCase().includes(criteria.toLowerCase()));
    const newTotal = this.heroes.length;

    if (this.heroTotal !== newTotal) {
      this.heroTotal = newTotal;
    } else if (!criteria) {
      this.heroTotal = -1;
    }
  }
// #docregion filter-animations
}
// #enddocregion filter-animations
