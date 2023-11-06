// TODO: Feature Componetized like HeroCenter
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { HeroService } from '../hero.service';
import { Hero } from '../hero';

@Component({
  selector: 'app-hero-list',
  templateUrl: './hero-list.component.1.html',
  styleUrls: ['./hero-list.component.css']
})
export class HeroListComponent implements OnInit {
  heroes$!: Observable<Hero[]>;

  constructor(
    private service: HeroService
  ) {}

  ngOnInit() {
    this.heroes$ = this.service.getHeroes();
  }
}
