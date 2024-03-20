// #docplaster
// #docregion
import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {Hero} from '../hero';
import {HeroService} from '../hero.service';

@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css']
})
export class HeroDetailComponent implements OnInit {
  hero$!: Observable<Hero>;

  constructor(private route: ActivatedRoute, private router: Router, private service: HeroService) {
  }


  ngOnInit() {
    this.hero$ = this.route.paramMap.pipe(
        switchMap((params: ParamMap) => this.service.getHero(params.get('id')!)));
  }

  // #docregion redirect
  gotoHeroes(hero: Hero) {
    const heroId = hero ? hero.id : null;
    // Pass along the hero id if available
    // so that the HeroList component can select that hero.
    // Include a junk 'foo' property for fun.
    this.router.navigate(['/superheroes', {id: heroId, foo: 'foo'}]);
  }
  // #enddocregion redirect
}
