// #docregion
import { Component, Input, OnInit } from '@angular/core';

import { HeroCacheService } from './hero-cache.service';
import { FormsModule, NgModel } from '@angular/forms';

// #docregion component
@Component({
  standalone: true,
  selector: 'app-hero-bio',
  // #docregion template
  template: `
    <h4>{{hero.name}}</h4>
    <ng-content></ng-content>
    <textarea cols="25" [(ngModel)]="hero.description"></textarea>`,
  // #enddocregion template
  providers: [HeroCacheService],
  imports: [FormsModule]
})

export class HeroBioComponent implements OnInit  {
  @Input() heroId = 0;

  constructor(private heroCache: HeroCacheService) { }

  ngOnInit() { this.heroCache.fetchCachedHero(this.heroId); }

  get hero() { return this.heroCache.hero; }
}
// #enddocregion component
