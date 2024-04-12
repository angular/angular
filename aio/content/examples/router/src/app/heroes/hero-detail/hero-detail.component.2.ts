// Snapshot version
// #docregion
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

import { HeroService } from '../hero.service';
import { Hero } from '../hero';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css']
})
export class HeroDetailComponent implements OnInit  {
  hero$!: Observable<Hero>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: HeroService
  ) {}

  // #docregion snapshot
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.hero$ = this.service.getHero(id);
  }
  // #enddocregion snapshot

  gotoHeroes() {
    this.router.navigate(['/heroes']);
  }
}
