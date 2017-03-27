/* tslint:disable use-input-property-decorator use-output-property-decorator */
// #docplaster
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Hero } from './hero';

// #docregion input-output-2
@Component({
// #enddocregion input-output-2
  selector: 'hero-detail',
  // #docregion input-output-2
  inputs: ['hero'],
  outputs: ['deleteRequest'],
  // #enddocregion input-output-2
  styles: ['button {margin-left: 8px} div {margin: 8px 0} img {height:24px}'],
  // #docregion template-1
  template: `
  <div>
    <img src="{{heroImageUrl}}">
    <span [style.text-decoration]="lineThrough">
      {{prefix}} {{hero?.name}}
    </span>
    <button (click)="delete()">Delete</button>
  </div>`
  // #enddocregion template-1
// #docregion input-output-2
})
// #enddocregion input-output-2
export class HeroDetailComponent {
  hero: Hero = new Hero(-1, '', 'Zzzzzzzz'); // default sleeping hero
  // heroImageUrl = 'http://www.wpclipart.com/cartoon/people/hero/hero_silhoutte_T.png';
  // Public Domain terms of use: http://www.wpclipart.com/terms.html
  heroImageUrl = 'images/hero.png';
  lineThrough = '';
  @Input() prefix = '';

  // #docregion deleteRequest
  // This component make a request but it can't actually delete a hero.
  deleteRequest = new EventEmitter<Hero>();

  delete() {
    this.deleteRequest.emit(this.hero);
    // #enddocregion deleteRequest
    this.lineThrough = this.lineThrough ? '' : 'line-through';
    // #docregion deleteRequest
  }
  // #enddocregion deleteRequest
}

@Component({
  selector: 'big-hero-detail',
  template: `
  <div class="detail">
    <img src="{{heroImageUrl}}">
    <div><b>{{hero?.name}}</b></div>
    <div>Name: {{hero?.name}}</div>
    <div>Emotion: {{hero?.emotion}}</div>
    <div>Birthdate: {{hero?.birthdate | date:'longDate'}}</div>
    <div>Web: <a href="{{hero?.url}}" target="_blank">{{hero?.url}}</a></div>
    <div>Rate/hr: {{hero?.rate | currency:'EUR'}}</div>
    <br clear="all">
    <button (click)="delete()">Delete</button>
  </div>
  `,
  styles: [`
    .detail { border: 1px solid black; padding: 4px; max-width: 450px; }
    img     { float: left; margin-right: 8px; height: 100px; }
  `]
})
export class BigHeroDetailComponent extends HeroDetailComponent {

  // #docregion input-output-1
  @Input()  hero: Hero;
  @Output() deleteRequest = new EventEmitter<Hero>();
  // #enddocregion input-output-1

  delete() {
    this.deleteRequest.emit(this.hero);
  }
}
