// #docplaster
// #docregion
import {Component, OnInit} from '@angular/core';

import {Hero} from '../hero';
// #docregion hero-service-import
import {HeroService} from '../hero.service';
// #enddocregion hero-service-import
import {MessageService} from '../message.service';
import {HeroDetailComponent} from '../hero-detail/hero-detail.component';
import {NgFor} from '@angular/common';

@Component({
  selector: 'app-heroes',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css'],
  standalone: true,
  imports: [NgFor, HeroDetailComponent],
})
export class HeroesComponent implements OnInit {
  selectedHero?: Hero;

  // #docregion heroes
  heroes: Hero[] = [];
  // #enddocregion heroes

  constructor(
    private heroService: HeroService,
    private messageService: MessageService,
  ) {}

  // #docregion ng-on-init
  ngOnInit(): void {
    this.getHeroes();
  }
  // #enddocregion ng-on-init

  onSelect(hero: Hero): void {
    this.selectedHero = hero;
    this.messageService.add(`HeroesComponent: Selected hero id=${hero.id}`);
  }

  // #docregion getHeroes
  getHeroes(): void {
    this.heroService.getHeroes().subscribe((heroes) => (this.heroes = heroes));
  }
  // #enddocregion getHeroes
}
