// #docplaster
// #docregion
import {Component, HostBinding, OnInit} from '@angular/core';
import {trigger, transition, animate, style, query, stagger} from '@angular/animations';
import {HEROES} from './mock-heroes';
import {Hero} from './hero';

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
        query('.hero', [
          style({opacity: 0, transform: 'translateY(-100px)'}),
          stagger(30, [
            animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({opacity: 1, transform: 'none'})),
          ]),
        ]),
      ]),
    ]),
    // #enddocregion page-animations
    // #docregion increment
    // #docregion filter-animations
    trigger('filterAnimation', [
      transition(':enter, * => 0, * => -1', []),
      transition(':increment', [
        query(
          ':enter',
          [
            style({opacity: 0, width: 0}),
            stagger(50, [animate('300ms ease-out', style({opacity: 1, width: '*'}))]),
          ],
          {optional: true},
        ),
      ]),
      transition(':decrement', [
        query(':leave', [stagger(50, [animate('300ms ease-out', style({opacity: 0, width: 0}))])]),
      ]),
    ]),
    // #enddocregion  increment
  ],
})
export class HeroListPageComponent implements OnInit {
  // #enddocregion filter-animations
  @HostBinding('@pageAnimations')
  public animatePage = true;

  // #docregion filter-animations
  heroesTotal = -1;

  get heroes() {
    return this._heroes;
  }
  private _heroes: Hero[] = [];

  ngOnInit() {
    this._heroes = HEROES;
  }

  updateCriteria(criteria: string) {
    criteria = criteria ? criteria.trim() : '';

    this._heroes = HEROES.filter((hero) =>
      hero.name.toLowerCase().includes(criteria.toLowerCase()),
    );
    const newTotal = this.heroes.length;

    if (this.heroesTotal !== newTotal) {
      this.heroesTotal = newTotal;
    } else if (!criteria) {
      this.heroesTotal = -1;
    }
  }
}
// #enddocregion filter-animations
