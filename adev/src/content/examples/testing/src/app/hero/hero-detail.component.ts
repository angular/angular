// #docplaster
import {Component, inject} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';

import {Hero} from '../model/hero';
import {sharedImports} from '../shared/shared';

import {HeroDetailService} from './hero-detail.service';

// #docregion prototype
@Component({
  selector: 'app-hero-detail',
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.css'],
  providers: [HeroDetailService],
  imports: [...sharedImports],
})
export class HeroDetailComponent {
  // #docregion inject
  private heroDetailService = inject(HeroDetailService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  // #enddocregion inject
  // #enddocregion prototype

  hero!: Hero;

  // #docregion ctor
  constructor() {
    // get hero when `id` param changes
    this.route.paramMap.subscribe((pmap) => this.getHero(pmap.get('id')));
  }
  // #enddocregion ctor

  private getHero(id: string | null): void {
    // when no id or id===0, create new blank hero
    if (!id) {
      this.hero = {id: 0, name: ''} as Hero;
      return;
    }

    this.heroDetailService.getHero(id).subscribe((hero) => {
      if (hero) {
        this.hero = hero;
      } else {
        this.gotoList(); // id not found; navigate to list
      }
    });
  }

  save(): void {
    this.heroDetailService.saveHero(this.hero).subscribe(() => this.gotoList());
  }

  cancel() {
    this.gotoList();
  }

  gotoList() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }
  // #docregion prototype
}
// #enddocregion prototype
