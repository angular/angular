import {Component, inject, OnInit} from '@angular/core';
import {NgFor} from '@angular/common';
import {RouterLink} from '@angular/router';

import {Hero} from '../hero';
import {HeroSearchComponent} from '../hero-search/hero-search.component';
import {HeroService} from '../hero.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [RouterLink, HeroSearchComponent],
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  heroes: Hero[] = [];

  private heroService = inject(HeroService);

  constructor() {
    this.getHeroes();
  }

  getHeroes(): void {
    this.heroService.getHeroes().subscribe((heroes) => (this.heroes = heroes.slice(1, 5)));
  }
}
