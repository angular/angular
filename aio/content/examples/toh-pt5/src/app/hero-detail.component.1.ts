// Imports in comments cause problems when the app is executed
// (some error about 'traceur' missing). Hence this separate file
// is solely for containing the transitory state of the imports.

// #docregion added-imports
// Keep the Input import for now, you'll remove it later:
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params }   from '@angular/router';
import { Location }                 from '@angular/common';

import { HeroService } from './hero.service';
// #enddocregion added-imports

// Bogus code below this point. It is only here to make lint happy.
import { Hero } from './hero';

@Component({})
export class HeroDetailComponent implements OnInit {
  @Input() hero: Hero;
  bogus: Params;

  constructor(
    private heroService: HeroService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit() {}
}
